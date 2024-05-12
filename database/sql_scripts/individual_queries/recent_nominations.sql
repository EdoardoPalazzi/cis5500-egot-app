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