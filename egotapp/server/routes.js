const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect((err) => err && console.log(err));


/**
 * GET /author/:type
 * Get the authors of the app
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const author = async function (req, res) {
    const name = 'Brendan Brett, Edoardo Palazzi, Eitan Jacob';
    if (req.params.type === 'name') {
        // res.send returns data back to the requester via an HTTP response
        res.send(`Created by ${name}`);
    } else {
        // we can also send back an HTTP status code to indicate an improper request
        res.status(400).send(`'${req.params.type}' is not a valid author type. Valid types are 'name' and 'pennkey'.`);
    }
}


/**
 * GET /egots
 * Get all EGOTS
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

/* TODO: Update query to return minimum year per award */

// TODO: This query can be optimized using the egot_winner table (though egot year is not currently stored there)
const egots = async function (req, res) {
    connection.query(`
        SELECT DISTINCT n.name, n.imdb_id, GREATEST(gn.year, en.year, onn.year, tn.year) as year
        FROM egot.nominee n
                 JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                 JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                 JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                 JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True
        GROUP BY n.imdb_id
        ORDER BY year;
    `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({})
        } else {
            res.json(data);
        }
    })
}


/**
 * Gets /egots/youngest_fastest
 * GET egots by youngest age and shortest time perido to designation.
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const egots_youngest_fastest = async function (req, res) {
    connection.query(`SELECT name,age,years_to_egot FROM egot_winner;
    `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({})
        } else {
            res.json(data);
        }
    })
}


/**
 * GET /nominee/:id
 * Gets a list of all award nominations for a nominee
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const nominee_detail = async function (req, res) {
    connection.query(`
        WITH nominations AS (SELECT e.nominee_id, e.year, e.category, e.winner, e.title, e.award_type as award
                             FROM egot.emmy_nomination e
                             UNION ALL
                             SELECT g.nominee_id, g.year, g.category, g.winner, g.title, 'Grammy' as award
                             FROM egot.grammy_nomination g
                             UNION ALL
                             SELECT o.nominee_id, o.year, o.category, o.winner, o.title, 'Oscar' as award
                             FROM egot.oscar_nomination o
                             UNION ALL
                             SELECT t.nominee_id, t.year, t.category, t.winner, t.title, 'Tony' as award
                             FROM egot.tony_nomination t)
        SELECT name,
               imdb_id,
               nominations.year,
               nominations.category,
               nominations.title,
               nominations.winner,
               award,
               (SELECT COUNT(nominations.winner)
                FROM nominations
                         JOIN nominee
                              ON nominee.id = nominations.nominee_id
                WHERE nominations.winner = 1
                  AND nominee.imdb_id = '${req.params.imdb_id}') as win_count
        FROM nominations
                 JOIN nominee ON nominee.id = nominations.nominee_id
        WHERE nominee.imdb_id = '${req.params.imdb_id}'
        ORDER BY nominations.year DESC;
    `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({})
        } else {
            res.json(data);
        }
    })
}


/**
 * GET /nominations/:award/:year
 * Gets a list of all nominations for a year
 * Aggregates individual nominees into one record
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const nominations = async function (req, res) {
    const award = req.params.award;
    const year = parseInt(req.params.year);
    const onlyWinners = req.query.onlyWinners === 'true';
    let table;
    let winnerCondition = '';

    // Define the winner condition based on whether 'onlyWinners' checkbox is checked
    if (onlyWinners) {
        winnerCondition = "AND t.winner = true";
    }
    switch (award) {
        case 'emmy':
            table = 'emmy_nomination'
            break;
        case 'grammy':
            table = 'grammy_nomination'
            break;
        case 'oscar':
            table = 'oscar_nomination'
            break;
        case 'tony':
            table = 'tony_nomination'
            break;
        default:
            table = null;
    }

    if (!table) {
        console.error('Invalid award')
        res.json({})
    } else {

        connection.query(`
            WITH nominations AS (SELECT t.nominee_id, t.year, t.category, t.winner, t.title
                                 FROM egot.${table} t
                                 WHERE t.year = '${year}' ${winnerCondition})
            SELECT GROUP_CONCAT(name SEPARATOR '; ')    AS name,
                   GROUP_CONCAT(imdb_id SEPARATOR '; ') AS imdb_id,
                   nominations.year,
                   nominations.category,
                   nominations.title,
                   nominations.winner
            FROM nominations
                     JOIN nominee ON nominee.id = nominations.nominee_id
            GROUP BY nominations.year, nominations.category, nominations.title, nominations.winner
            ORDER BY nominations.category, nominations.winner DESC;
        `, (err, data) => {
            if (err || data.length === 0) {
                console.log(err);
                res.json({})
            } else {
                res.json(data);
            }
        })
    }
}


const recent_nominees = async function (req,res) {

    const onlyWinners = req.query.onlyWinners === 'true';
    // let table
    let winnerCondition = ''; 

    if (onlyWinners) {
        winnerCondition = "WHERE winner = 'true'";
    }
    const year = parseInt(req.query.year);
    connection.query(`WITH all_winning_nominations AS (SELECT e.nominee_id, e.year
        FROM egot.emmy_nomination e
        ${winnerCondition}
        UNION ALL
        SELECT g.nominee_id, g.year
        FROM egot.grammy_nomination g
        ${winnerCondition}
        UNION ALL
        SELECT o.nominee_id, o.year
        FROM egot.oscar_nomination o
        ${winnerCondition}
        UNION ALL
        SELECT t.nominee_id, t.year
        FROM egot.tony_nomination t
        ${winnerCondition}
    )
SELECT n.name, COUNT(*) amount
FROM nominee n
JOIN all_winning_nominations ON n.id = all_winning_nominations.nominee_id
WHERE year >= '${year}' AND birth_year IS NOT NULL
GROUP BY n.name
ORDER BY amount DESC
LIMIT 5;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const losses_before_first_win = async function (req,res) {
    connection.query(`WITH winning_nominations AS (
        SELECT nominee_id,year
        FROM egot.emmy_nomination
        WHERE winner=TRUE
        UNION ALL
        SELECT nominee_id,year
        FROM egot.grammy_nomination
        WHERE winner=TRUE
        UNION ALL
        SELECT nominee_id,year
        FROM egot.oscar_nomination
        WHERE winner=TRUE
        UNION ALL
        SELECT nominee_id,year
        FROM egot.tony_nomination
        WHERE winner=TRUE
    ),
    first_win AS (
        SELECT nominee_id,MIN(year) AS first_win_year
        FROM winning_nominations
        GROUP BY nominee_id
    ),
    losing_nominations AS (
        SELECT nominee_id,year
        FROM egot.emmy_nomination
        WHERE winner=FALSE
        UNION ALL
        SELECT nominee_id,year
        FROM egot.grammy_nomination
        WHERE winner=FALSE
        UNION ALL
        SELECT nominee_id,year
        FROM egot.oscar_nomination
        WHERE winner=FALSE
        UNION ALL
        SELECT nominee_id,year
        FROM egot.tony_nomination
        WHERE winner=FALSE
    )
    SELECT name, COUNT(*) AS losses_before_first_win
    FROM nominee n
        JOIN first_win ON first_win.nominee_id=n.id
        JOIN losing_nominations ON n.id=losing_nominations.nominee_id
    WHERE year< first_win.first_win_year
    GROUP BY name
    ORDER BY losses_before_first_win DESC
    LIMIT 5;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const nominee_most_categories = async function (req,res) {

    const onlyWinners = req.query.onlyWinners === 'true';
    let winnerCondition = ''; 

    if (onlyWinners) {
        winnerCondition = "WHERE winner = 'true'";
    }
    connection.query(`WITH all_winning_nominations AS (
        SELECT e.nominee_id, category
         FROM egot.emmy_nomination e
          ${winnerCondition}
         UNION ALL
         SELECT g.nominee_id, category
         FROM egot.grammy_nomination g
         ${winnerCondition}
         UNION ALL
         SELECT o.nominee_id, category
         FROM egot.oscar_nomination o
         ${winnerCondition}
         UNION ALL
         SELECT t.nominee_id, category
         FROM egot.tony_nomination t
         ${winnerCondition}
    )
    SELECT name, COUNT(DISTINCT category) as amount
    FROM all_winning_nominations
        JOIN nominee ON all_winning_nominations.nominee_id = nominee.id
    GROUP BY name
    ORDER BY amount DESC
    LIMIT 5;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const nominee_longest_year_span = async function (req,res) {
    
    const onlyWinners = req.query.onlyWinners === 'true';
    let winnerCondition = ''; 

    if (onlyWinners) {
        winnerCondition = "WHERE winner = 'true'";
    }

    connection.query(`WITH all_winning_nominations AS (
        SELECT e.nominee_id, year
         FROM egot.emmy_nomination e
         ${winnerCondition}
         UNION ALL
         SELECT g.nominee_id, year
         FROM egot.grammy_nomination g
         ${winnerCondition}
         UNION ALL
         SELECT o.nominee_id, year
         FROM egot.oscar_nomination o
         ${winnerCondition}
         UNION ALL
         SELECT t.nominee_id, year
         FROM egot.tony_nomination t
         ${winnerCondition}
    ),
    max_min_years AS (
        SELECT nominee_id, MIN(YEAR) as min ,MAX(YEAR) as max
        FROM all_winning_nominations
        GROUP BY nominee_id
    )
    SELECT name, max-min AS years
    FROM nominee
        JOIN max_min_years ON max_min_years.nominee_id= nominee.id
    WHERE nominee.birth_year IS NOT NULL  ##### this rules out companies
    ORDER BY years DESC
    LIMIT 5;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const losses_with_no_win = async function (req,res) {
    connection.query(`WITH losing_nominations AS (
        SELECT nominee_id, COUNT(*) as nominations
        FROM egot.emmy_nomination
        WHERE winner=FALSE
        GROUP BY nominee_id
        UNION ALL
        SELECT nominee_id, COUNT(*) as nominations
        FROM egot.grammy_nomination
        WHERE winner=FALSE
        GROUP BY nominee_id
        UNION ALL
        SELECT nominee_id, COUNT(*) as nominations
        FROM egot.oscar_nomination
        WHERE winner=FALSE
        GROUP BY nominee_id
        UNION ALL
        SELECT nominee_id, COUNT(*) as nominations
        FROM egot.tony_nomination
        WHERE winner=FALSE
        GROUP BY nominee_id
    ),
    all_winning_nominations AS (
        SELECT e.nominee_id
         FROM egot.emmy_nomination e
         WHERE winner = TRUE
         UNION ALL
         SELECT g.nominee_id
         FROM egot.grammy_nomination g
         WHERE winner = TRUE
         UNION ALL
         SELECT o.nominee_id
         FROM egot.oscar_nomination o
         WHERE winner = TRUE
         UNION ALL
         SELECT t.nominee_id
         FROM egot.tony_nomination t
         WHERE winner = TRUE
    )
    SELECT DISTINCT name,losing_nominations.nominations AS amount
    FROM losing_nominations
        JOIN nominee ON losing_nominations.nominee_id = nominee.id
    WHERE nominee_id NOT IN (SELECT nominee_id FROM all_winning_nominations)
    ORDER BY losing_nominations.nominations DESC
    LIMIT 5;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const missing_one_award = async function (req,res) {
    connection.query(`WITH no_emmys AS (SELECT DISTINCT n.name, id
        FROM egot.nominee n
                 JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                 JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                 JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
no_grammys AS (SELECT DISTINCT n.name, id
          FROM egot.nominee n
                   JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                   JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                   JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
no_oscars AS (SELECT DISTINCT n.name, id
         FROM egot.nominee n
                  JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                  JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                  JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
no_tonys AS (SELECT DISTINCT n.name, id
        FROM egot.nominee n
                 JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                 JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                 JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True),
egot_winners AS (SELECT DISTINCT n.name,id
            FROM egot.nominee n
                     JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                     JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                     JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                     JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
all_missing_one AS (SELECT id ,name, 'Emmy' AS missing_award
FROM no_emmys
WHERE id NOT IN (SELECT id from egot_winners)
UNION
SELECT id ,name,'Grammy' AS missing_award
FROM no_grammys
WHERE id NOT IN (SELECT id from egot_winners)
UNION
SELECT id ,name, 'Oscar' AS missing_award
FROM no_oscars
WHERE id NOT IN (SELECT id from egot_winners)
UNION
SELECT id ,name, 'Tony' AS missing_award
FROM no_tonys
WHERE id NOT IN (SELECT id from egot_winners)),

all_winning_nominations AS (
SELECT e.nominee_id, year, award_type
FROM egot.emmy_nomination e
WHERE winner = TRUE
UNION ALL
SELECT g.nominee_id, year, 'Grammy' AS award_type
FROM egot.grammy_nomination g
WHERE winner = TRUE
UNION ALL
SELECT o.nominee_id, year, 'Oscar' AS award_type
FROM egot.oscar_nomination o
WHERE winner = TRUE
UNION ALL
SELECT t.nominee_id, year, 'Tony' AS award_type
FROM egot.tony_nomination t
WHERE winner = TRUE
),
first_win AS (
SELECT all_missing_one.name AS name, CONCAT(award_type,' (',MIN(year),')') as first_win, MIN(year) as year,missing_award
FROM all_missing_one
LEFT JOIN all_winning_nominations ON all_missing_one.id=all_winning_nominations.nominee_id
GROUP BY name, award_type
ORDER BY name,MIN(year)
)
SELECT name, missing_award, GROUP_CONCAT(first_win ORDER BY (year)) AS path
FROM first_win
GROUP BY name;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const hardest_categories = async function (req,res) {
    connection.query(`With all_categories AS (
        SELECT 'Grammy' AS award, category, nominee_id, MIN(DISTINCT year) as first_win
        FROM grammy_nomination
        WHERE winner=TRUE
        GROUP BY category, nominee_id
        UNION ALL
        SELECT 'Oscar' AS award,category, nominee_id, MIN(DISTINCT year) as first_win
        FROM oscar_nomination
        WHERE winner=TRUE
        GROUP BY category, nominee_id
        UNION ALL
        SELECT 'Tony' AS award,category, nominee_id, MIN(DISTINCT year) as first_win
        FROM tony_nomination
        WHERE winner=TRUE
        GROUP BY category, nominee_id
        UNION ALL
        SELECT award_type,category, nominee_id, MIN(DISTINCT year) as first_win
        FROM emmy_nomination
        WHERE winner=TRUE
        GROUP BY category, nominee_id
    ),
    previous_losses AS (
        SELECT all_categories.award,first_win,all_categories.nominee_id,all_categories.category, COUNT(*) as previous_losses
        FROM grammy_nomination
            JOIN all_categories ON grammy_nomination.nominee_id = all_categories.nominee_id
                                AND grammy_nomination.category = all_categories.category
        WHERE winner=FALSE AND year < first_win
        GROUP BY all_categories.category,all_categories.nominee_id
        UNION ALL
        SELECT all_categories.award,first_win,all_categories.nominee_id,all_categories.category, COUNT(*) as previous_losses
        FROM oscar_nomination
            JOIN all_categories ON oscar_nomination.nominee_id = all_categories.nominee_id
                                AND oscar_nomination.category = all_categories.category
        WHERE winner=FALSE AND year < first_win
        GROUP BY all_categories.category,all_categories.nominee_id
        UNION ALL
        SELECT all_categories.award,first_win,all_categories.nominee_id,all_categories.category, COUNT(*) as previous_losses
        FROM tony_nomination
            JOIN all_categories ON tony_nomination.nominee_id = all_categories.nominee_id
                                AND tony_nomination.category = all_categories.category
        WHERE winner=FALSE AND year < first_win
        GROUP BY all_categories.category,all_categories.nominee_id
        UNION ALL
        SELECT all_categories.award,first_win,all_categories.nominee_id,all_categories.category, COUNT(*) as previous_losses
        FROM emmy_nomination
            JOIN all_categories ON emmy_nomination.nominee_id = all_categories.nominee_id
                                AND emmy_nomination.category = all_categories.category
        WHERE winner=FALSE AND year < first_win
        GROUP BY all_categories.category,all_categories.nominee_id
    )
    SELECT previous_losses.award ,previous_losses.category, ROUND(AVG(previous_losses),2) AS avg_previous_losses
    FROM previous_losses
    GROUP BY category
    ORDER BY avg_previous_losses DESC
    LIMIT 5;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const common_combos = async function (req,res) {
    connection.query(`WITH emmy_tony_winners AS ( SELECT 'Emmy/Tony' AS combo, COUNT(DISTINCT name) AS amount
    FROM egot.nominee
             JOIN egot.emmy_nomination
                  ON nominee.id = emmy_nomination.nominee_id AND emmy_nomination.winner = True
             JOIN egot.tony_nomination ON nominee.id = tony_nomination.nominee_id AND
                                          tony_nomination.winner = True),
emmy_oscar_winners AS (SELECT 'Emmy/Oscar' AS combo, COUNT(DISTINCT name) AS amount
     FROM egot.nominee
              JOIN egot.emmy_nomination
                   ON nominee.id = emmy_nomination.nominee_id AND emmy_nomination.winner = True
              JOIN egot.oscar_nomination ON nominee.id = oscar_nomination.nominee_id AND
                                            oscar_nomination.winner = True),
emmy_grammy_winners AS (SELECT 'Emmy/Grammy' AS combo, COUNT(DISTINCT name) AS amount
      FROM egot.nominee
               JOIN egot.emmy_nomination ON nominee.id = emmy_nomination.nominee_id AND
                                            emmy_nomination.winner = True
               JOIN egot.grammy_nomination ON nominee.id = grammy_nomination.nominee_id AND
                                              grammy_nomination.winner = True),
tony_oscar_winners AS (SELECT 'Tony/Oscar' AS combo, COUNT(DISTINCT name) AS amount
     FROM egot.nominee
              JOIN egot.oscar_nomination ON nominee.id = oscar_nomination.nominee_id AND
                                            oscar_nomination.winner = True
              JOIN egot.tony_nomination ON nominee.id = tony_nomination.nominee_id AND
                                           tony_nomination.winner = True),
tony_grammy_winners AS (SELECT 'Tony/Grammy' AS combo, COUNT(DISTINCT name) AS amount
      FROM egot.nominee
               JOIN egot.grammy_nomination ON nominee.id = grammy_nomination.nominee_id AND
                                              grammy_nomination.winner = True
               JOIN egot.tony_nomination ON nominee.id = tony_nomination.nominee_id AND
                                            tony_nomination.winner = True),
grammy_oscar_winners AS (SELECT 'Grammy/Oscar' AS combo, COUNT(DISTINCT name) AS amount
       FROM egot.nominee
                JOIN egot.grammy_nomination ON nominee.id = grammy_nomination.nominee_id AND
                                               grammy_nomination.winner = True
                JOIN egot.oscar_nomination ON nominee.id = oscar_nomination.nominee_id AND
                                              oscar_nomination.winner = True)
SELECT * FROM grammy_oscar_winners
UNION ALL
SELECT * FROM tony_grammy_winners
UNION ALL
SELECT * FROM tony_oscar_winners
UNION ALL
SELECT * FROM emmy_grammy_winners
UNION ALL
SELECT * FROM emmy_oscar_winners
UNION ALL
SELECT * FROM emmy_tony_winners
ORDER BY amount DESC;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}

const egot_paths = async function (req,res) {
    connection.query(`SELECT name,path FROM egot.egot_winner;
`, (err,data) => {
    if(err || data.length ===0) {
        console.log(err);
        res.json({})
    } else {
        res.json(data);
    }
})
}


module.exports = {
    author,
    egots,
    nominee_detail,
    nominations,
    egots_youngest_fastest,
    recent_nominees,
    losses_before_first_win,
    nominee_most_categories,
    nominee_longest_year_span,
    losses_with_no_win,
    missing_one_award,
    hardest_categories,
    common_combos,
    egot_paths,
}
