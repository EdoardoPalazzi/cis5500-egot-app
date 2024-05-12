# 13) Who won the most different amount of categories

WITH all_winning_nominations AS (
    SELECT e.nominee_id, category
     FROM egot.emmy_nomination e IGNORE INDEX (emmy_winner)
     WHERE winner = TRUE
     UNION ALL
     SELECT g.nominee_id, category
     FROM egot.grammy_nomination g IGNORE INDEX (grammy_winner)
     WHERE winner = TRUE
     UNION ALL
     SELECT o.nominee_id, category
     FROM egot.oscar_nomination o IGNORE INDEX (oscar_winner)
     WHERE winner = TRUE
     UNION ALL
     SELECT t.nominee_id, category
     FROM egot.tony_nomination t IGNORE INDEX (tony_winner)
     WHERE winner = TRUE
)
SELECT name, COUNT(DISTINCT category) as count
FROM all_winning_nominations
    JOIN nominee ON all_winning_nominations.nominee_id = nominee.id
GROUP BY name
ORDER BY count DESC;