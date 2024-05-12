import os

from scraper.utils import retrieve_html, log_message


def scrape_emmys(type, beginning_year, end_year):
    """
    Scrapes imdb.com for Emmy award data
    :param type: primetime or daytime
    :param beginning_year: begin awards year
    :param end_year: end awards year (excl.)
    :return:
    """

    award_show = 'emmys'
    if type == 'primetime':
        base_url = "https://www.imdb.com/event/ev0000223/"
    elif type == 'daytime':
        base_url = "https://www.imdb.com/event/ev0000206/"
    else:
        log_message(f'base_url could not be found.')
        return None

    write_file_directory = f'../../data/{award_show}_{type}/scraped/imdb/html'
    file_extension = 'html'

    if not os.path.exists(write_file_directory):
        os.mkdir(write_file_directory)

    years = range(beginning_year, end_year)

    for year in years:
        url_with_year = f"{base_url}{year}"
        retrieve_html(url_with_year, year, write_file_directory, file_extension)


# Scrape for Emmy's (Primetime)
scrape_emmys('primetime', 1949, 2024)
# Scrape for Emmy's (Daytime)
scrape_emmys('daytime', 1974, 2024)
