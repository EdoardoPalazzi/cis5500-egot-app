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
