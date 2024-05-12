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