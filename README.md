
# cis5500-project

## Team Members 
- Brendan Brett - bbt@seas.upenn.edu - @brendanbrett
- Edoardo Palazzi - palazzi@seas.upenn.edu - @EdoardoPalazzi
- Eitan Jacob - eitanj@seas.upenn.edu - @EitanJacob

## Instructions to run app:
- Two .env files are linked in the Project Report PDF. These are required for connecting to the DB and to the external API. 
  1. Add first .env file into the project root directory. This .env contains DB credentials.
  2. Add second .env file into the egotapp\client directory. This .env contains the API key for themoviedb.org

### Directory structure:
- **data**: contains raw and processed data from scraping
- **database**: cleaned datasets for ingestion into DB, database DDL, and database ingestion code
- **egotapp**: React/Node.js app
- **milestones**: Milestone documentation
- **scraper**: code used to scrape our datasources
