import os

from scraper.utils import retrieve_html


def scrape_oscars():
    """
    Scrapes imdb.com for Grammy award data
    :return: none
    """
    award_show = 'oscars'
    write_file_directory = f'../../data/{award_show}/scraped/imdb/html'
    file_extension = 'html'

    # Check directory exists
    if not os.path.exists(write_file_directory):
        os.mkdir(write_file_directory)

    base_url = "https://www.imdb.com/event/ev0000003/"
    years = range(1929, 2024)

    non_awards_year = [1933]

    for year in years:
        if year in non_awards_year:
            continue
        url_with_year = f"{base_url}{year}"
        retrieve_html(url_with_year, year, write_file_directory, file_extension)


scrape_oscars()
