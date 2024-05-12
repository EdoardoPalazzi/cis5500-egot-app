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