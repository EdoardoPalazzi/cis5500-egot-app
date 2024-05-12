## 1) Return all EGOT winners

SELECT DISTINCT n.name FROM egot.nominee n
         JOIN egot.grammy_nomination gn ON n.id = gn.nominee_id AND gn.winner = True
         JOIN egot.emmy_nomination en ON n.id = en.nominee_id AND en.winner = True
         JOIN egot.oscar_nomination onn ON n.id = onn.nominee_id AND onn.winner = True
         JOIN egot.tony_nomination tn ON n.id = tn.nominee_id AND tn.winner = True;