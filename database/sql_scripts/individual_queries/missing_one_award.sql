
## 5) Who has won 3 of the 4 awards
WITH no_emmys AS (SELECT DISTINCT n.name
                  FROM egot.nominee n
                           JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                           JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                           JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
     no_grammys AS (SELECT DISTINCT n.name
                    FROM egot.nominee n
                             JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                             JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                             JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
     no_oscars AS (SELECT DISTINCT n.name
                   FROM egot.nominee n
                            JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                            JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                            JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True),
     no_tonys AS (SELECT DISTINCT n.name
                  FROM egot.nominee n
                           JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                           JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                           JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True),
     egot_winners AS (SELECT DISTINCT n.name
                      FROM egot.nominee n
                               JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
                               JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
                               JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
                               JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True)
SELECT name
FROM no_emmys
WHERE name NOT IN (SELECT name from egot_winners)
UNION
SELECT name
FROM no_grammys
WHERE name NOT IN (SELECT name from egot_winners)
UNION
SELECT name
FROM no_oscars
WHERE name NOT IN (SELECT name from egot_winners)
UNION
SELECT name
FROM no_tonys
WHERE name NOT IN (SELECT name from egot_winners);