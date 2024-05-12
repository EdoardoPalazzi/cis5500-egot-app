"""
IBDB.com (Tony's) data processor
Extracts award information from the HTML page manually downloaded from https://www.ibdb.com/awards/
"""
import os

from bs4 import BeautifulSoup, Tag
from enum import Enum
import re

from scraper.utils import log_message


# Enum defining three different types of awards
class PerformanceStatus(Enum):
    NO_PERFORMANCE = "No Performance"  # award not associated with any performance
    INDIVIDUAL_PERFORMANCE = "Individual Performance"  # award granted to an individual person/entity with respect to a particular performance
    GROUP_PERFORMANCE = "Group Performance"  # award granted to a performance that had potentially multiple contributors


def extract_award_info(html):
    """
    Extracts award info from HTML page and writes to file
    This single HTML contains all information needed for the dataset
    Source for the page: visit https://www.ibdb.com/awards/, set no parameters, save resultant page to HTML
    :param html: https://www.ibdb.com/awards/ HTML file
    :return: bool
    """
    soup = BeautifulSoup(html, 'html.parser')
    tony_award = soup.find('div', id='tony-award')
    write_filename = '../data/tonys/processed/tony_award_history.tsv'

    if os.path.exists(write_filename):
        os.remove(write_filename)
    elif not os.path.exists('../data/tonys/processed'):
        os.mkdir('../data/tonys/processed')

    try:
        with open(f'{write_filename}', 'w', encoding='utf-8') as file:
            file.write('year\tcategory\tnominee\twin\tperformance\tnominee_id\n')
            for award in tony_award:
                if not hasattr(award, 'attrs'):
                    continue
                if 'awd-name' in award.attrs['class']:
                    category = award.find('h4').text.strip()
                    year = category[:4]
                    category = category[5:].replace('Tony Award®', '').strip()
                    continue
                if 'award-padding' in award.attrs['class']:
                    winner = award.find_all('div')[1].find('div').text.strip()
                    first_div_info = get_first_div_info(award)
                    curr_perform_status = get_performance_status(award)
                    if curr_perform_status == PerformanceStatus.NO_PERFORMANCE:
                        file.write(
                            f'{year}\t{category}\t{first_div_info.get("nominee")}\t{winner}\tNo Associated Performance\n')
                        continue
                    second_div_info = get_second_div_info(award)
                    # For individual performances, the individual is mentioned first and then performance second
                    if curr_perform_status == PerformanceStatus.INDIVIDUAL_PERFORMANCE:
                        file.write(
                            f'{year}\t{category}\t{first_div_info.get("nominee")}\t{winner}\t{second_div_info[0].get("nominee")}\t{first_div_info.get("nominee_id")}\n')
                    else:
                        # For group performances, the performance is mentioned first and then contributers second
                        for second_div_element in second_div_info:
                            file.write(
                                f'{year}\t{category}\t{second_div_element.get("nominee")}\t{winner}\t{first_div_info.get("nominee")}\t{second_div_element.get("nominee_id")}\n')

        file.close()
        log_message(f'Tony\'s processing complete. File location: {write_filename}')
    except Exception as e:
        log_message(f'Error processing dataset: {e}')
        return False
    else:
        return True


def process_tonys_data(tonys_file):
    """
    Extract award info from Tony's award page (one page, downloaded manually)
    :param tonys_file: HTML file containing all awards information
    :return: bool
    """
    try:
        with open(tonys_file, 'r', encoding='utf-8') as file:
            html = file.read()
            extract_award_info(html)
        file.close()
    except Exception as e:
        log_message(f'Error processing dataset: {e}')
        return False
    else:
        return True


def get_performance_status(award):
    """
    Determines the performance status of the particular Tony Award
    :param award: div element containing a single tony award
    :return: Enum Performance_Status
    """
    div_elements = award.find_all('div')[1].find_all('div')
    if len(div_elements) <= 1 or not award.find_all('div')[1].find_all('div')[1].find_all('a'):
        return PerformanceStatus.NO_PERFORMANCE
    else:
        if "Beauty and the Beast" in award.find('a').text.strip():
            return PerformanceStatus.GROUP_PERFORMANCE
        second_div = div_elements[1]
        # Get the text inside the second <div> excluding the text within <a> tags
        second_div_text = ''.join(
            str(part) for part in second_div.contents if not isinstance(part, Tag) or part.name != 'a')
        # Any tony award whose second div contains a 'by' is a group performance (ie. produced by, written by etc.), and vice-versa
        if 'by' in second_div_text:
            return PerformanceStatus.GROUP_PERFORMANCE
        else:
            return PerformanceStatus.INDIVIDUAL_PERFORMANCE


def get_first_div_info(award):
    """
    Retrieves nominee and nominee ID from award link
    :param award:
    :return:
    """
    a_element = award.find('a')
    match = re.search(r'href="[^"]*/([^/]*)\"', str(a_element))
    if match:
        nominee_id = match.group(1)
    else:
        nominee_id = ''
    nominee = a_element.text.strip()
    return {'nominee': nominee, 'nominee_id': nominee_id if nominee_id else ''}


def get_second_div_info(award):
    """
    Retrieves second divs second nested div info contained in the link
    :param award: div element containing a single tony award
    :return: list of dicts
    """
    a_elements = award.find_all('div')[1].find_all('div')[1].find_all('a')
    nominees = []
    for element in a_elements:
        match = re.search(r'href="[^"]*/([^/]*)\"', str(element))
        if match:
            nominee_id = match.group(1)
        else:
            nominee_id = ''
        nominee = element.text.strip()
        nominees.append({'nominee': nominee, 'nominee_id': nominee_id if nominee_id else ''})
    return nominees
