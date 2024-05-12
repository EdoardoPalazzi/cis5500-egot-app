USE egot;

##################################################
# Create a egot_winner table, and then use the other tables to derive desired information
# about egot winners
############################################

CREATE TABLE egot_winner (
    id INT PRIMARY KEY,
    imdb_id INT,
    name VARCHAR(200),
    age INT,
    years_to_egot INT,
    path VARCHAR(100),
    birth_year INT,
    death_year INT
);

## Get all egot winner info
## Use results to generate a CSV file to load into the database (csv file can be found in
## cleaned database directory

## Note that the later parts of this query are not working efficiently - if it needs to be run
## again, please make changes to it.
WITH EGOTS AS (
    SELECT DISTINCT n.name,n.id, n.imdb_id, birth_year,death_year
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
    SELECT EGOTS.id as id, EGOTS.imdb_id as imdb_id, EGOTS.name AS name, CONCAT(award_type,' (',MIN(year),')') as first_win, MIN(year) as year,birth_year,death_year
    FROM EGOTS
        LEFT JOIN all_winning_nominations ON EGOTS.id=all_winning_nominations.nominee_id
    GROUP BY name, award_type
    ORDER BY name,MIN(year)
),
id_name_path AS (SELECT id,name, imdb_id, GROUP_CONCAT(first_win ORDER BY (year)) AS path,birth_year,death_year
                      FROM first_win
                      GROUP BY name),
min_years AS (SELECT n.id AS nominee_id,
                          MIN(o.year) AS min_oscar_year,
                          MIN(g.year) AS min_grammy_year,
                          MIN(t.year) AS min_tony_year,
                          MIN(e.year) AS min_emmy_year
                   FROM egot.nominee n
                            LEFT JOIN egot.oscar_nomination o ON n.id = o.nominee_id AND o.winner = TRUE
                            LEFT JOIN egot.grammy_nomination g ON n.id = g.nominee_id AND g.winner = TRUE
                            LEFT JOIN egot.tony_nomination t ON n.id = t.nominee_id AND t.winner = TRUE
                            LEFT JOIN egot.emmy_nomination e ON n.id = e.nominee_id AND e.winner = TRUE
                   GROUP BY n.id),
youngest_fastest_info AS (SELECT id,n.name                         AS name,
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
ORDER BY age ASC, years_to_egot ASC)
SELECT id_name_path.id as id, id_name_path.imdb_id as imdb_id, id_name_path.name as name, age, years_to_egot, path,birth_year,death_year
FROM id_name_path
    JOIN youngest_fastest_info ON id_name_path.id=youngest_fastest_info.id;


SELECT * FROM egot_winner;
