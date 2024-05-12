"""
Oscars.org data processor
Extracts award information from the HTML page manually downloaded from https://awardsdatabase.oscars.org/
"""

import os

from bs4 import BeautifulSoup

from scraper.utils import log_message


def extract_award_info(html):
    """
    Extracts award info from HTML page and writes to file
    This single HTML contains all information needed for the dataset
    Source for the page: visit https://awardsdatabase.oscars.org/, set year parameters, save resultant page to HTML
    :param html: Oscars html
    :return: bool
    """
    soup = BeautifulSoup(html, 'html.parser')
    oscar_award = soup.find('div', id='resultscontainer')
    awards_by_year = oscar_award.find_all('div', class_='result-group')
    write_filename = '../data/oscars/processed/oscar_award_history.tsv'

    if os.path.exists(write_filename):
        os.remove(write_filename)
    elif not os.path.exists('../data/oscars/processed'):
        os.mkdir('../data/oscars/processed')

    try:
        with open(f'{write_filename}', 'w', encoding='utf-8') as file:
            file.write('year\tcategory\tnominee\twinner\tfilm\n')
            for award_year in awards_by_year:
                year = award_year.find('div', class_='result-group-title').find('a').text
                year = year[:4]
                if int(year) < 1932:
                    year = int(year) + 1
                categories = award_year.find_all('div', class_='result-subgroup')
                for award_category in categories:
                    category = award_category.find('div', class_='result-subgroup-title').find('a').text
                    category = category.strip()
                    category = category.replace('\n', '')
                    nominees = award_category.find_all('div', class_='awards-result-nomination')
                    for award_nominees in nominees:
                        try:
                            nominee = award_nominees.find('div', class_='awards-result-nominationstatement').find(
                                'a').text
                            nominee = nominee.strip()
                            nominee = nominee.replace('\n', '')
                        except:
                            nominee = ''
                        try:
                            film = award_nominees.find('div', class_='awards-result-film-title').find('a').text
                        except:
                            film = ''
                        winner_test = award_nominees.findParent('div', class_='result-details').find('span',
                                                                                                     title='Winner')
                        if winner_test is not None:
                            winner = True
                        else:
                            winner = False
                        if nominee == '':
                            # Do not include entries with no nominee individual (special awards, honorary awards)
                            pass
                        else:
                            file.write(f'{year}\t{category}\t{nominee}\t{winner}\t{film}\n')
        file.close()
        log_message(f'Oscar\'s processing complete. File location: {write_filename}')
    except Exception as e:
        log_message(f'Error processing dataset: {e}')
        return False
    else:
        return True


def process_oscars_data(oscars_file):
    """
    Extract award info from Oscar's award page (one page, downloaded manually)
    :param oscars_file:
    :return: bool
    """
    try:
        with open(oscars_file, 'r', encoding='utf-8') as file:
            html = file.read()
            extract_award_info(html)
        file.close()
    except Exception as e:
        log_message(f'Error processing dataset: {e}')
        return False
    else:
        return True
