# 2) Show all artists/nominees who are EGOT winners,
# showing them by who did it by the youngest age and who did it in the shortest period of time.
USE egot;
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
