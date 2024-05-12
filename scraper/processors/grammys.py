"""
Grammys.com data processor
Extracts award information from the JSON files downloaded via Grammy's scraper
"""
import os

from scraper.utils import log_message, load_json, strip_whitespace_safe


def extract_award_info(award_data):
    """
    This extracts data from the Grammys JSON files and puts it into a tab delimited file
    :param award_data: JSON object for the Grammy year
    :return: bool
    """
    write_filename = '../data/grammys/processed/grammy_award_history.tsv'
    try:
        with open(f'{write_filename}', 'a+', encoding='utf-8') as file:
            show_data = award_data['pageProps']['pageContent']['getAwardsYears']['hits'][0]
            year = show_data['showYear']
            category = show_data['categoryDetails']
            # Iterate over each award category for the year
            for item in category:
                award = item['title'][0]['name']
                # Iterate over nominees
                for nominee in item['nominations']:
                    winner = nominee['isWinner']
                    title = nominee['title']
                    # Iterate over the nominees to create de-aggregated records for each credit artist
                    for artist in nominee['creditedArtists']:
                        artist_name = strip_whitespace_safe(artist['title'])
                        file.write(f'{year}\t{award}\t{title}\t{artist_name}\t{winner}\n')
        file.close()
    except Exception as e:
        log_message(f'Error processing dataset: {e}')
        return False
    else:
        return True


def process_grammys_data(scraped_directory):
    """
    Iterate over a directory of .JSON files for Grammys data
    :return:
    """
    files = os.listdir(scraped_directory)
    write_filename = '../data/grammys/processed/grammy_award_history.tsv'

    if os.path.exists(write_filename):
        os.remove(write_filename)
    elif not os.path.exists('../data/grammys/processed'):
        os.mkdir('../data/grammys/processed')

    try:
        with open(write_filename, 'a+', encoding='utf-8') as file:
            file.write(f'year\taward\ttitle\tnominee\twinner\n')
        for file in files:
            if file.endswith('.json'):
                filename = os.path.join(scraped_directory, file)
                award_data = load_json(filename)
                extract_award_info(award_data)
    except Exception as e:
        log_message(f'Error processing data: {e}')
        return False
    else:
        log_message(f'Grammy\'s processing complete. File location: {write_filename}')
        return True