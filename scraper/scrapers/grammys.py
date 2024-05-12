"""
Scraper for both grammy.com and imdb.com
Builds requests, initiates request, and saves the files to HTML for processing
"""

import os

from scraper.utils import retrieve_html


def build_request_url(award_show_number):
    """
    Builds the request URL to fetch data from grammy.com
    :param award_show_number:
    :return:
    """
    base_url = 'https://www.grammy.com/_next/data/kW8aR-gcqWa6iMFDxsGoR/awards/'

    # The latest grammy awards shows have a variant URL with the year appended to the slug
    match award_show_number:
        case '60th':
            url_year = 2017
        case '61st':
            url_year = 2018
        case '62nd':
            url_year = 2019
        case '63rd':
            url_year = 2020
        case '64th':
            url_year = 2021
        case '65th':
            url_year = 2022
        case '66th':
            url_year = 2023
        case _:
            # All other grammy award shows do not require the year in the URL
            extended_url = f'{base_url}{award_show_number}-annual-grammy-awards.json?slug={award_show_number}-annual-grammy-awards'
            return extended_url

    extended_url = f'{base_url}{award_show_number}-annual-grammy-awards-{url_year}.json?slug={award_show_number}-annual-grammy-awards-{url_year}'

    return extended_url


def create_show_number_slug():
    """
    Create the award show number to be used as part of URL slug used for grammy.com
    :return:
    """
    total_award_years = 66
    years = []
    for i in range(1, total_award_years + 1):
        x = str(i)
        suffix = None
        if i < 10 or i >= 20:
            if x[-1] in '1':
                suffix = 'st'
            if x[-1] in '2':
                suffix = 'nd'
            if x[-1] in '3':
                suffix = 'rd'
            if x[-1] in ('4', '5', '6', '7', '8', '9', '0'):
                suffix = 'th'
        else:
            suffix = 'th'
        years.append(x + suffix)
    return years


def scrape_grammys():
    """
    Used to scrape grammys data from grammys.com
    :return:
    """
    write_file_directory = '../../data/grammys/'
    file_extension = 'json'

    # Get a list of years in slug form
    years_list = create_show_number_slug()

    for year in years_list:
        year_requested = year
        request_url = build_request_url(year_requested)
        retrieve_html(request_url, year_requested, write_file_directory, file_extension)


def scrape_grammys_imdb():
    """
    Scrapes imdb.com for Grammy award data
    :return: none
    """
    award_show = 'grammys'
    write_file_directory = f'../../data/{award_show}/scraped/imdb/html'
    file_extension = 'html'

    if not os.path.exists(write_file_directory):
        os.mkdir(write_file_directory)

    base_url = "https://www.imdb.com/event/ev0000301/"
    years = range(1959, 2025)

    irregular_awards_year = [1959, 1960]

    for year in years:
        if year in irregular_awards_year:
            if year == 1959:
                for year_suffix in range(1, 3):
                    url_with_year = f"{base_url}{year}/{year_suffix}"
                    year_with_suffix = f'{year}-{year_suffix}'
                    retrieve_html(url_with_year, year_with_suffix, write_file_directory, file_extension)
                continue
            if year == 1960:
                continue
        url_with_year = f"{base_url}{year}"
        retrieve_html(url_with_year, year, write_file_directory, file_extension)


scrape_grammys_imdb()
