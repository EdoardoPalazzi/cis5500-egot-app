## 11) Who was nominated the most amount of times without ever winning?
USE egot;

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
ORDER BY losing_nominations.nominations DESC
LIMIT 25;
