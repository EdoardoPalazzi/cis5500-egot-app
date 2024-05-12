import json
import os
import re

from scraper.utils import log_message, load_json


def imdb_html_to_json(award_name_as_directory, award_name_friendly):
    """
    Extracts the JSON object from the scraped IMDB HTML page
    :param award_name_as_directory: e.g., 'emmys_primetime
    :param award_name_friendly: e.g., 'Emmys'
    :return: bool
    """
    scraped_directory = f'../data/{award_name_as_directory}/scraped/imdb/html'

    if not os.path.exists(scraped_directory):
        log_message(f'Error: processed files not found in {scraped_directory}. Aborting conversion from JSON to HTML.')
        exit(1)

    files = os.listdir(scraped_directory)
    file_process_count = 0

    try:
        for listed_file in files:
            if listed_file.endswith('.html'):
                filename = os.path.join(scraped_directory, listed_file)
                with open(filename, 'r', encoding='utf-8') as file:
                    html_content = file.read()
                    pattern = re.compile(r'IMDbReactWidgets\.NomineesWidget\.push\(\[\'center-3-react\',({.*})\]\);',
                                         re.DOTALL)
                    match = pattern.search(html_content)

                    if re.match:
                        json_data = match.group(1)
                        json_object = json.loads(json_data)
                        with open(f'{filename}.json', 'w+') as write_file:
                            json.dump(json_object, write_file, indent=4)
                        write_file.close()
                        file_process_count += 1
                file.close()
    except Exception as e:
        log_message(f'Error processing data: {e}')
        return False
    else:
        log_message(f'{award_name_friendly}: {file_process_count} HTML files converted to JSON.')
        return True


def process_imdb_data(award_show, award_directory):
    # Clear existing file
    scraped_directory = f'../data/{award_directory}/scraped/imdb/html'
    write_filename = f'../data/{award_directory}/processed/{award_directory}_award_history_imdb.tsv'
    if os.path.exists(write_filename):
        os.remove(write_filename)

    imdb_html_to_json(award_directory, f'{award_show}')

    files = sorted(os.listdir(scraped_directory))

    try:
        with open(write_filename, 'a+', encoding='utf-8') as file:
            match award_directory:
                case 'oscars':
                    file.write(f'year\tcategory\tnominee\ttitle\twinner\timdb_id\timdb_img\tsong_title\n')
                case 'grammys':
                    file.write(f'year\tcategory\tnominee\ttitle\twinner\timdb_id\timdb_img\trole\n')
                case 'tonys':
                    file.write(f'year\tcategory\tnominee\ttitle\twinner\timdb_id\timdb_img\n')
                case _:
                    file.write(f'year\tcategory\tnominee\ttitle\twinner\timdb_id\timdb_img\tepisode\n')
        for json_file in files:
            if json_file.endswith('.json'):
                filename = os.path.join(scraped_directory, json_file)
                year = json_file.split(sep='.')[0]
                award_data = load_json(filename)
                extract_award_info(award_show, award_directory, award_data, year)
        file.close()
    except Exception as e:
        log_message(f'Error processing data: {e}')
        return False
    else:
        log_message(f'{award_show} processing complete. File location: {write_filename}')
        return True


def getShowInfoAndWrite(file, person, nominee, episode, year, award_title, title, winner, award_directory):
    nominee_name = person['name'].strip().replace('\n', '')
    imdb_id = person['const'].strip().replace('\n', '')
    note = nominee['notes'].strip().replace('\n', '') if str(nominee['notes']).startswith('Song:') or str(
        nominee['notes']).startswith('For song') or str(nominee['notes']).startswith(
        'For the song') else ''
    imageUrl = person['imageUrl']
    episode = episode.strip().replace('\n', '')
    if (award_directory == 'emmys_daytime' or award_directory == 'emmys_primetime'):
        file.write(
            f'{year}\t{award_title}\t{nominee_name}\t{title}\t{winner}\t{imdb_id}\t{imageUrl}\t{episode}\n')
    else:
        file.write(
            f'{year}\t{award_title}\t{nominee_name}\t{title}\t{winner}\t{imdb_id}\t{imageUrl}\t{note}\n')


def extract_award_info(award_show, award_directory, award_data, year):
    year = year
    write_filename = f'../data/{award_directory}/processed/{award_directory}_award_history_imdb.tsv'

    show_data = award_data['nomineesWidgetModel']['eventEditionSummary']['awards'][0]['categories']
    with open(f'{write_filename}', 'a', encoding='utf-8') as file:
        for award in show_data:
            award_title = award['categoryName']
            nominees = award['nominations']
            for nominee in nominees:
                if nominee['primaryNominees']:
                    primary_nominees = nominee['primaryNominees']
                    for primary_nominee in primary_nominees:
                        try:
                            originalName = nominee['primaryNominees'][0]['originalName']
                        except:
                            # it's an artist
                            nominee_name = primary_nominee['name']
                            imdb_id = primary_nominee['const']
                            imageUrl = primary_nominee['imageUrl']
                            winner = nominee['isWinner']
                            note = ''
                            if award_directory == 'oscars' or award_directory == 'emmys_daytime':
                                if nominee['secondaryNominees']:
                                    titles = []
                                    for secondary_nominee in nominee['secondaryNominees']:
                                        titles.append(secondary_nominee['name'])
                                    title = '; '.join(titles)
                            elif award_directory == 'emmys_primetime' and nominee['secondaryNominees']:
                                title = nominee['secondaryNominees'][0]['name']
                            else:
                                title = nominee['notes']
                            if award_directory == 'grammys':
                                match = re.search(r'\((.*?)\)', str(primary_nominee['note']))
                                if match:
                                    note = match.group(1)
                                else:
                                    note = ''
                                file.write(
                                    f'{year}\t{award_title}\t{nominee_name}\t{title}\t{winner}\t{imdb_id}\t{imageUrl}\t{note}\n')
                                continue
                            if (award_directory == 'emmys_daytime' or award_directory == 'emmys_primetime') and nominee[
                                'episodeNames']:
                                for episode in nominee['episodeNames']:
                                    getShowInfoAndWrite(file, primary_nominee, nominee, episode, year, award_title,
                                                        title,
                                                        winner, award_directory)
                            else:
                                getShowInfoAndWrite(file, primary_nominee, nominee, '', year, award_title, title,
                                                    winner,
                                                    award_directory)
                        else:
                            # it's a show/series
                            title = primary_nominee['name']
                            winner = nominee['isWinner']
                            for person in nominee['secondaryNominees']:
                                nominee_name, imdb_id, note, imageUrl, episode = '', '', '', '', ''
                                if (award_directory == 'emmys_daytime' or award_directory == 'emmys_primetime') and \
                                        nominee['episodeNames']:
                                    for episode in nominee['episodeNames']:
                                        getShowInfoAndWrite(file, person, nominee, episode, year, award_title, title,
                                                            winner, award_directory)
                                else:
                                    getShowInfoAndWrite(file, person, nominee, '', year, award_title, title, winner,
                                                        award_directory)
            else:
                continue
    file.close()
