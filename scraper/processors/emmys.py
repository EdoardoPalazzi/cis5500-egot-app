"""
Emmy dataset processor
Processes the Emmy's dataset downloaded from Kaggle.com
"""

import csv
import os

from scraper.utils import log_message


def process_emmys_data(original_dataset_filepath):
    """
    This disaggregates the Emmy Award nominees column into one row each
    e.g., "Mark Ricker, Production Designer; James Truesdale, Art Director; Cherish M. Hale, Set Decorator"
    This creates three rows for each individual: 1) Mark Ricker 2) James Truesdale 3)  Cherish M. Hale
    :return: bool
    """
    original_dataset_filename = original_dataset_filepath
    write_filename = '../data/emmys/processed/emmy_award_history.tsv'

    if os.path.exists(write_filename):
        os.remove(write_filename)
    elif not os.path.exists('../data/emmys/processed'):
        os.mkdir('../data/emmys/processed')

    try:
        with open(f'{original_dataset_filename}', 'r', encoding='utf-8') as file_read:
            with open(f'{write_filename}', 'w+', encoding='utf-8') as file_write:
                csv_reader = csv.reader(file_read)
                next(csv_reader)
                file_write.write(f'origin_id\tyear\tcategory\ttitle\tnominee\trole\tcompany\tproducer\twin\n')
                for row in csv_reader:
                    # Strip and replace data as some characters caused issues in resultant TAB file
                    origin_id = row[0].strip().replace('\n', '')
                    year = row[1].strip().replace('\n', '')
                    category = row[2].strip().replace('\n', '')
                    title = row[3].strip().replace('\n', '')
                    staff = row[4].strip().replace('\n', '').replace('>', '').replace('"', '')
                    company = row[5].strip().replace('\n', '')
                    producer = row[6].strip().replace('\n', '')
                    win = row[7].strip().replace('\n', '')

                    # Staff is an aggregated list of people, delimited by ';'
                    staff_split = staff.split(';')
                    for name_role in staff_split:
                        # Individuals may or may not be listed with their role, delimited by ','
                        name_role_split = name_role.split(',')
                        name = name_role_split[0].strip()
                        role = ','.join(name_role_split[1:]).strip()
                        file_write.write(
                            f'{origin_id}\t{year}\t{category}\t{title}\t{name}\t{role}\t{company}\t{producer}\t{win}\n')
            file_write.close()
            log_message(f'Emmy\'s processing complete. File location: {write_filename}')
        file_read.close()
    except Exception as e:
        log_message(f'Error processing dataset: {e}')
        return False
    else:
        return True

