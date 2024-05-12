USE egot;

#####################################################################################
## 1) Return all EGOT winners

SELECT DISTINCT n.name
FROM egot.nominee n
         JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
         JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
         JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
         JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True;

#####################################################################################
# 2) Show all artists/nominees who are EGOT winners,
# showing them by who did it by the youngest age and who did it in the shortest period of time.

WITH min_years AS (SELECT n.id        AS nominee_id,
                          MIN(o.year) AS min_oscar_year,
                          MIN(g.year) AS min_grammy_year,
                          MIN(t.year) AS min_tony_year,
                          MIN(e.year) AS min_emmy_year
                   FROM egot.nominee n
                            LEFT JOIN egot.oscar_nomination o ON n.id = o.nominee_id AND o.winner = TRUE
                            LEFT JOIN egot.grammy_nomination g ON n.id = g.nominee_id AND g.winner = TRUE
                            LEFT JOIN egot.tony_nomination t ON n.id = t.nominee_id AND t.winner = TRUE
                            LEFT JOIN egot.emmy_nomination e ON n.id = e.nominee_id AND e.winner = TRUE
                   GROUP BY n.id)
SELECT n.name                         AS nominee_name,
       GREATEST(min_years.min_oscar_year, min_years.min_grammy_year, min_years.min_tony_year, min_years.min_emmy_year) -
       n.birth_year                   AS age,
       GREATEST(min_years.min_oscar_year, min_years.min_grammy_year, min_years.min_tony_year, min_years.min_emmy_year) -
       LEAST(min_years.min_oscar_year, min_years.min_grammy_year, min_years.min_tony_year,
             min_years.min_emmy_year) AS years_to_egot
FROM min_years
         JOIN egot.nominee n ON min_years.nominee_id = n.id
WHERE min_oscar_year IS NOT NULL
  AND min_grammy_year IS NOT NULL
  AND min_tony_year IS NOT NULL
  AND min_emmy_year IS NOT NULL
ORDER BY age ASC, years_to_egot ASC;

#####################################################################################
## 3) a) What is the most common combinations of two award winners
WITH emmy_tony_winners AS (SELECT DISTINCT name
                           FROM egot.nominee
                                    JOIN egot.emmy_nomination
                                         ON nominee.id = emmy_nomination.nominee_id AND emmy_nomination.winner = True
                                    JOIN egot.tony_nomination ON nominee.id = tony_nomination.nominee_id AND
                                                                 tony_nomination.winner = True),
     emmy_oscar_winners AS (SELECT DISTINCT name
                            FROM egot.nominee
                                     JOIN egot.emmy_nomination
                                          ON nominee.id = emmy_nomination.nominee_id AND emmy_nomination.winner = True
                                     JOIN egot.oscar_nomination ON nominee.id = oscar_nomination.nominee_id AND
                                                                   oscar_nomination.winner = True),
     emmy_grammy_winners AS (SELECT DISTINCT name
                             FROM egot.nominee
                                      JOIN egot.emmy_nomination ON nominee.id = emmy_nomination.nominee_id AND
                                                                   emmy_nomination.winner = True
                                      JOIN egot.grammy_nomination ON nominee.id = grammy_nomination.nominee_id AND
                                                                     grammy_nomination.winner = True),
     tony_oscar_winners AS (SELECT DISTINCT name
                            FROM egot.nominee
                                     JOIN egot.oscar_nomination ON nominee.id = oscar_nomination.nominee_id AND
                                                                   oscar_nomination.winner = True
                                     JOIN egot.tony_nomination ON nominee.id = tony_nomination.nominee_id AND
                                                                  tony_nomination.winner = True),
     tony_grammy_winners AS (SELECT DISTINCT name
                             FROM egot.nominee
                                      JOIN egot.grammy_nomination ON nominee.id = grammy_nomination.nominee_id AND
                                                                     grammy_nomination.winner = True
                                      JOIN egot.tony_nomination ON nominee.id = tony_nomination.nominee_id AND
                                                                   tony_nomination.winner = True),
     grammy_oscar_winners AS (SELECT DISTINCT name
                              FROM egot.nominee
                                       JOIN egot.grammy_nomination ON nominee.id = grammy_nomination.nominee_id AND
                                                                      grammy_nomination.winner = True
                                       JOIN egot.oscar_nomination ON nominee.id = oscar_nomination.nominee_id AND
                                                                     oscar_nomination.winner = True)
SELECT (SELECT COUNT(*) FROM grammy_oscar_winners) AS grammy_oscar_winners,
       (SELECT COUNT(*) FROM tony_grammy_winners)  AS tony_grammy_winners_amount,
       (SELECT COUNT(*) FROM tony_oscar_winners)   AS tony_oscar_winners_amount,
       (SELECT COUNT(*) FROM emmy_grammy_winners)  AS emmy_grammy_winners_amount,
       (SELECT COUNT(*) FROM emmy_oscar_winners)   AS emmy_oscar_winners_amount,
       (SELECT COUNT(*) FROM emmy_tony_winners)    AS emmy_tony_winners_amount;

#####################################################################################
## 4) Identify individuals that have nominated/won recently

WITH all_winning_nominations AS (SELECT e.nominee_id, year
                                 FROM egot.emmy_nomination e
                                 WHERE winner = TRUE
                                 UNION ALL
                                 SELECT g.nominee_id, year
                                 FROM egot.grammy_nomination g
                                 UNION ALL
                                 SELECT o.nominee_id, year
                                 FROM egot.oscar_nomination o
                                 UNION ALL
                                 SELECT t.nominee_id, year
                                 FROM egot.tony_nomination t)
SELECT n.name, COUNT(*) amount
FROM nominee n
         JOIN all_winning_nominations ON n.id = all_winning_nominations.nominee_id
WHERE year >= 2010 AND birth_year IS NOT NULL
GROUP BY n.name
ORDER BY amount DESC;

#####################################################################################
# 5) Who has won 3 of the 4 awards
WITH no_emmys AS (SELECT DISTINCT n.name
                  FROM egot.nominee n
                           JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                           JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                           JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
     no_grammys AS (SELECT DISTINCT n.name
                    FROM egot.nominee n
                             JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                             JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                             JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
     no_oscars AS (SELECT DISTINCT n.name
                   FROM egot.nominee n
                            JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                            JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                            JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
     no_tonys AS (SELECT DISTINCT n.name
                  FROM egot.nominee n
                           JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                           JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                           JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True),
     egot_winners AS (SELECT DISTINCT n.name
                      FROM egot.nominee n
                               JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                               JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                               JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                               JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True)
SELECT name
FROM no_emmys
WHERE name NOT IN (SELECT name from egot_winners)
UNION
SELECT name
FROM no_grammys
WHERE name NOT IN (SELECT name from egot_winners)
UNION
SELECT name
FROM no_oscars
WHERE name NOT IN (SELECT name from egot_winners)
UNION
SELECT name
FROM no_tonys
WHERE name NOT IN (SELECT name from egot_winners);

# #####################################################################################
# ## 6) Nominees have been nominated for both an Oscar and a Grammy in the same year but didnt win either award
# ## Note - this has not been put into the our server yet
#
# SELECT DISTINCT n.name AS nominee_name,
#                 o.year AS oscar_year,
#                 g.year AS grammy_year
# FROM egot.nominee n
#          JOIN egot.oscar_nomination o ON n.id = o.nominee_id
#          JOIN egot.grammy_nomination g ON n.id = g.nominee_id
# WHERE o.winner = FALSE
#   AND g.winner = FALSE
#   AND o.year = g.year
# ORDER BY o.year;

#####################################################################################
## 7) Which Winning Nominee Lost the Most Amount of Nominations Before Winning One
WITH winning_nominations AS (
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
SELECT name, COUNT(*) AS losts_before_first_win
FROM nominee n
    JOIN first_win ON first_win.nominee_id=n.id
    JOIN losing_nominations ON n.id=losing_nominations.nominee_id
WHERE year< first_win.first_win_year
GROUP BY name
ORDER BY losts_before_first_win DESC;


#####################################################################################
## 8) Who has been nominated for all four awards and has not won any
WITH egot_nominees AS (
    SELECT DISTINCT emmy_nomination.nominee_id
        FROM emmy_nomination
        JOIN egot.grammy_nomination on emmy_nomination.nominee_id = grammy_nomination.nominee_id
                                           AND emmy_nomination.winner=FALSE
                                           AND grammy_nomination.winner=FALSE
        JOIN egot.oscar_nomination on emmy_nomination.nominee_id=oscar_nomination.nominee_id
                                          AND oscar_nomination.winner=FALSE
        JOIN egot.tony_nomination ON emmy_nomination.nominee_id= egot.tony_nomination.nominee_id
                                         AND egot.tony_nomination.winner=FALSE
),
all_winners AS (
    SELECT nominee_id
    FROM egot.emmy_nomination
    WHERE winner=TRUE
    UNION ALL
    SELECT nominee_id
    FROM egot.grammy_nomination
    WHERE winner=TRUE
    UNION ALL
    SELECT nominee_id
    FROM egot.oscar_nomination
    WHERE winner=TRUE
    UNION ALL
    SELECT nominee_id
    FROM egot.tony_nomination
    WHERE winner=TRUE
)
SELECT name
FROM egot_nominees
    JOIN egot.nominee ON egot_nominees.nominee_id=egot_nominees.nominee_id
WHERE id NOT IN (SELECT id FROM all_winners);


#####################################################################################
## 9) Which type of award in each type of award took the longest (i.e most amount of nominations before winning?

With all_categories AS (
    SELECT category, nominee_id, MIN(DISTINCT year) as first_win
    FROM emmy_nomination
    WHERE winner=TRUE
    GROUP BY category, nominee_id
),
previous_losses AS (
    SELECT all_categories.nominee_id,all_categories.category, COUNT(*) as previous_losses
    FROM emmy_nomination
        JOIN all_categories ON emmy_nomination.nominee_id = all_categories.nominee_id
                            AND emmy_nomination.category = all_categories.category
    WHERE winner=FALSE AND year < first_win
    GROUP BY all_categories.category,all_categories.nominee_id
)
SELECT previous_losses.category, AVG(previous_losses)
FROM previous_losses
GROUP BY category
ORDER BY previous_losses DESC;


#####################################################################################
## 10) Who (TOP 25) was nominated across the longest span of years?

WITH all_winning_nominations AS (
    SELECT e.nominee_id, year
     FROM egot.emmy_nomination e
     WHERE winner = TRUE
     UNION ALL
     SELECT g.nominee_id, year
     FROM egot.grammy_nomination g
     WHERE winner = TRUE
     UNION ALL
     SELECT o.nominee_id, year
     FROM egot.oscar_nomination o
     WHERE winner = TRUE
     UNION ALL
     SELECT t.nominee_id, year
     FROM egot.tony_nomination t
     WHERE winner = TRUE
),
max_min_years AS (
    SELECT nominee_id, MIN(YEAR) as min ,MAX(YEAR) as max
    FROM all_winning_nominations
    GROUP BY nominee_id
)
SELECT name, max-min AS year_span
FROM nominee
    JOIN max_min_years ON max_min_years.nominee_id= nominee.id
WHERE nominee.birth_year IS NOT NULL  ##### this rules out companies
ORDER BY year_span DESC
LIMIT 25;


#####################################################################################
## 11) Who was nominated the most amount of times without ever winning?
WITH losing_nominations AS (
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
SELECT DISTINCT name,losing_nominations.nominations
FROM losing_nominations
    JOIN nominee ON losing_nominations.nominee_id = nominee.id
WHERE nominee_id NOT IN (SELECT nominee_id FROM all_winning_nominations)
ORDER BY losing_nominations.nominations DESC;

#####################################################################################
# 13) Who won the most different amount of categories

WITH all_winning_nominations AS (
    SELECT e.nominee_id, category
     FROM egot.emmy_nomination e
     WHERE winner = TRUE
     UNION ALL
     SELECT g.nominee_id, category
     FROM egot.grammy_nomination g
     WHERE winner = TRUE
     UNION ALL
     SELECT o.nominee_id, category
     FROM egot.oscar_nomination o
     WHERE winner = TRUE
     UNION ALL
     SELECT t.nominee_id, category
     FROM egot.tony_nomination t
     WHERE winner = TRUE
)
SELECT name, COUNT(DISTINCT category) as count
FROM all_winning_nominations
    JOIN nominee ON all_winning_nominations.nominee_id = nominee.id
GROUP BY name
ORDER BY count DESC;

#####################################################################################
#14) EGOT paths
WITH EGOTS AS (
    SELECT DISTINCT n.name, n.id
    FROM egot.nominee n
         JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
         JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
         JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
         JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True
),
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
    SELECT EGOTS.name AS name, CONCAT(award_type,' (',MIN(year),')') as first_win, MIN(year) as year
    FROM EGOTS
        LEFT JOIN all_winning_nominations ON EGOTS.id=all_winning_nominations.nominee_id
    GROUP BY name, award_type
    ORDER BY name,MIN(year)
)
SELECT name, GROUP_CONCAT(first_win ORDER BY (year)) AS path
FROM first_win
GROUP BY name;

#####################################################################################
# 13) Has there been an increase/decrease throughout the last seven decades in the amount of winners who have won
#      the same award multiple times?

-- Note: This query is specifically for Emmy nominations, can be adjusted for other award types

-- I need to figure out how to loop this across seven decades
# SET @current_year= 1950;
#
# WITH winner_amount_per_category AS (
#     SELECT category, COUNT(*) AS winning_nominations
#     FROM emmy_nomination
#     WHERE winner=TRUE AND year >= @current_year AND year < @current_year +10
#     GROUP BY category
# ),
# distinct_winner_amount_per_category AS (
#     SELECT category, count(DISTINCT nominee_id) AS distinct_winners
#     FROM emmy_nomination
#     WHERE winner=TRUE AND year >= @current_year AND year < @current_year +10
#     GROUP BY category
# ),
# distinct_win_percentage_per_category AS (SELECT win.category, dis.distinct_winners/win.winning_nominations AS distinct_win_percentage
#     FROM winner_amount_per_category win
#     JOIN distinct_winner_amount_per_category dis ON win.category = dis.category
#     ORDER BY distinct_win_percentage DESC
# )
# SELECT AVG(distinct_win_percentage)
# FROM distinct_win_percentage_per_category;
#
# SET @current_year= @current_year +10;
