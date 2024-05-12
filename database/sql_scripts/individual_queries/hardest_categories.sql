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
