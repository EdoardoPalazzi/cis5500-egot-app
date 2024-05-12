from scraper.processors.imdb import process_imdb_data
from scraper.processors.tonys import process_tonys_data
from scraper.utils import log_message

log_message('-------------EGOTdb-------------')
log_message('Begin dataset file processing...')

award_shows = ['Emmy\'s (Daytime)', 'Emmy\'s (Primetime)', 'Grammy\'s', 'Oscar\'s']
award_shows_directory = ['emmys_daytime', 'emmys_primetime', 'grammys', 'oscars']
for idx, award_show in enumerate(award_shows):
    log_message(f'Begin processing {award_show} data')
    process_imdb_data(award_show, award_shows_directory[idx])

log_message('Begin processing Tony data')
tonys_html_file = '../data/tonys/scraped/ibdb_tony_awards_all.html'
process_tonys_data(tonys_html_file)

log_message('All dataset processing complete.')
