USE egot;


## Get all current indexes
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'egot';

## 1) Create indexes on winner of nominations tables
CREATE INDEX emmy_winner on emmy_nomination(winner);
CREATE INDEX tony_winner on tony_nomination(winner);
CREATE INDEX grammy_winner on grammy_nomination(winner);
CREATE INDEX oscar_winner on oscar_nomination(winner); ## Not sure if I needed to add for oscar since oscar already has winner as apart of the PK

# DROP INDEX emmy_winner on emmy_nomination;
# DROP INDEX tony_winner on tony_nomination;
# DROP INDEX grammy_winner on grammy_nomination;
# DROP INDEX oscar_winner on oscar_nomination;

## 2) Create index on birth_year of nominee table
    # I dropped this because I don't think its helpful after our egot_winner table
# CREATE INDEX nominee_birth_year ON nominee(birth_year);
# DROP INDEX nominee_birth_year ON nominee;

SELECT * FROM egot_winner
