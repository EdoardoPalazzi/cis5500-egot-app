import pandas as pd
import os
from sqlalchemy import create_engine, text, insert, MetaData, Table, Column, String
from dotenv import load_dotenv

def populate_database():

    load_dotenv()

    # Construct the database URL using environment variables
    db_url = f"mysql+mysqlconnector://{os.environ.get('DB_USERNAME')}:{os.environ.get('DB_PASSWORD')}@{os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}/{os.environ.get('DB_NAME')}"

    # Create the engine
    engine = create_engine(db_url)
    
    # Comment out files depending all what you need to add

    # Important Note: I later discovered that when add

    files = {
    # 'oscar_nomination': 'database/cleaned_datasets/oscar_nomination.csv',
    # 'grammy_nomination': 'database/cleaned_datasets/grammy_nomination.csv',
    # 'emmy_nomination': 'database/cleaned_datasets/emmy_nomination.csv',
    # 'tony_nomination': 'database/cleaned_datasets/tony_nomination.csv',
    # 'award': 'database/cleaned_datasets/award.csv',
    # 'organization': 'database/cleaned_datasets/organization.csv',
    # 'nominee': 'database/cleaned_datasets/nominee.csv',
    'egot_winner': 'database/cleaned_datasets/egot_winner.csv'
}
    
    for key, value in files.items():
        table_name=key
        file_name=value
        df = pd.read_csv(file_name)
        df.drop_duplicates(inplace=True)
        df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

        ## Note that this only append - if there is existing data, ensure to delete it first before running this
        df.to_sql(table_name, engine, index=False, if_exists='append') 

        print(f'Data successfully loaded from {file_name} into the table {table_name}.')

populate_database()