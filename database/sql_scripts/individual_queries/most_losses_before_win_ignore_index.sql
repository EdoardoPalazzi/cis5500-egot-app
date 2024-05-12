## 7) Which Winning Nominee Lost the Most Amount of Nominations Before Winning One
WITH winning_nominations AS (
    SELECT nominee_id,year
    FROM egot.emmy_nomination IGNORE INDEX (emmy_winner)
    WHERE winner=TRUE
    UNION ALL
    SELECT nominee_id,year
    FROM egot.grammy_nomination IGNORE INDEX (grammy_winner)
    WHERE winner=TRUE
    UNION ALL
    SELECT nominee_id,year
    FROM egot.oscar_nomination IGNORE INDEX (oscar_winner)
    WHERE winner=TRUE
    UNION ALL
    SELECT nominee_id,year
    FROM egot.tony_nomination IGNORE INDEX (tony_winner)
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