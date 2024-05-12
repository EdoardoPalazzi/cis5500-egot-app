import datetime
import json
import random
import re
import time
from datetime import datetime

import requests


def log_message(message):
    """
    Print timestamped message to console
    :param message: to print
    :return: none
    """
    dt = datetime.now()
    print(f'{dt}: {message}')


def load_json(filename):
    """
    Loads a .JSON file with read
    :param filename: filename to load
    :return: json
    """
    with open(f'{filename}', 'r', encoding='utf-8') as file:
        try:
            json_data = json.load(file)
        except Exception as e:
            print(f'Issue loading from {file}: {e}')
            return None
    return json_data


def save_site_to_file(directory, url, file_extension, page):
    """
    Save the site content to file
    :param directory: for file to be written (include ending slash)
    :param url: URL retrieved
    :param file_extension: file extension
    :param page: page response from get request
    :return: True
    """
    if not str(directory).endswith('/'):
        directory = str(directory) + '/'
    try:
        with open(f'{directory}{url}.{file_extension}', 'wb') as file:
            file.write(page.content)
            file.close()
            return True
    except Exception as e:
        print(f'Error opening file: {e}')
        return False


def retrieve_html(url, filename, write_file_directory, file_extension):
    """
    Retrieves HTML based on the provided URL and saves the response to file
    Includes exponential backoff to avoid any issues with hitting the sites
    :param url: URL to get
    :param filename: filename for response
    :param write_file_directory: file directory for response
    :param file_extension: file extension to use
    :return: request response
    """
    retry_delay = 1
    max_retries = 10

    for attempt in range(max_retries):
        try:
            log_message(f'Retrieving {url}.')
            response = requests.get(url)
            response.raise_for_status()
        except requests.RequestException as e:
            # Exponential backoff of requests to avoid issues
            if attempt >= 9:
                log_message(f'Too many attempts. Quitting.')
                exit(1)
            log_message(e)

            time.sleep(retry_delay)
            retry_delay *= 2

            log_message(f'Backing off for {retry_delay} seconds.')
        else:
            url_filename = re.sub(f'{url}', '', url)
            save_site_to_file(write_file_directory, filename, file_extension, response)
            delay = round(random.uniform(0, 1), 2)
            log_message(f'Finished site {filename}. Sleep for {delay} seconds...')
            time.sleep(delay)
            return response


def strip_whitespace_safe(s):
    """
    Strips whitespace if string exists
    Otherwise, returns None
    Prevents errors from attempting to strip NoneType object
    :param s: string
    :return: stripped string
    """
    return s.strip() if s is not None else s