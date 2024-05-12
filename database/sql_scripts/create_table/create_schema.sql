CREATE DATABASE egot;

USE egot;

SHOW TABLES;
SELECT * FROM egot_winner;

DROP TABLE IF EXISTS emmy_nomination;
DROP TABLE IF EXISTS grammy_nomination;
DROP TABLE IF EXISTS oscar_nomination;
DROP TABLE IF EXISTS tony_nomination;
DROP TABLE IF EXISTS nominee;
DROP TABLE IF EXISTS award;
DROP TABLE IF EXISTS organization;

CREATE TABLE organization (
	name VARCHAR(50) PRIMARY KEY,
	year_founded INT
);

CREATE TABLE award (
	name VARCHAR(25),
	official_name VARCHAR(50),
	awarded_for VARCHAR(50),
	presenting_organization VARCHAR(50),
	PRIMARY KEY (name),
	FOREIGN KEY (presenting_organization) REFERENCES organization(name)
);

CREATE TABLE nominee (
	id INT PRIMARY KEY,
	name VARCHAR(200),
	imdb_id VARCHAR(25),
    tony_id VARCHAR(200),
    birth_year INT,
    death_year INT
);

CREATE TABLE emmy_nomination (
	year INT,
	category VARCHAR(200),
    title VARCHAR(300),
	nominee_id INT,
	winner BOOLEAN,
    award_type VARCHAR(25),
	episode VARCHAR(50), ## must check
	PRIMARY KEY (category, nominee_id, title, year, episode),
	FOREIGN KEY (award_type) REFERENCES award(name),
    FOREIGN KEY (nominee_id) REFERENCES nominee(id)
);

CREATE TABLE grammy_nomination (
	year INT,
	category VARCHAR(200),
	title VARCHAR(300),
	nominee_id INT,
	winner BOOLEAN,
	PRIMARY KEY (category, nominee_id, title, year),
	FOREIGN KEY (nominee_id) REFERENCES nominee(id)
);

CREATE TABLE oscar_nomination (
	year INT,
	category VARCHAR(200),
    title VARCHAR(300),
	nominee_id INT,
	winner BOOLEAN,
	song_title VARCHAR(50),## must check
    PRIMARY KEY (category, nominee_id, title, year, song_title),
    FOREIGN KEY (nominee_id) REFERENCES nominee(id)
);

CREATE TABLE tony_nomination (
	year INT,
	category VARCHAR(200),
	title VARCHAR(300),
	nominee_id INT,
	winner BOOLEAN,
	PRIMARY KEY (category, nominee_id, title, year),
	FOREIGN KEY (nominee_id) REFERENCES nominee(id)
);