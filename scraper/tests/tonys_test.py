import unittest

from scraper.processors.tonys import process_tonys_data

class TestTonyProcessor(unittest.TestCase):
    
    def test_process_tonys_data(self):
        tony_html_file = '../../data/tonys/scraped/ibdb_tony_awards_all.html'
        write_filename = '../../data/tonys/processed/tony_award_history.tsv'
        #below are five examples of lines that should be in the resulting tsv file
        expected_lines = [
            '2016\tBest Performance by an Actor in a Featured Role in a Play\tBill Camp\tNominee\tThe Crucible\n',#individual performance
            '2017\tBest Revival of a Play\tJohn Legend/Mike Jackson	Winner\tJitney\n', #group performance (EGOT Winner)
            '2002\tBest Musical\tWhoopi Goldberg\tWinner\tThoroughly Modern Millie\n', #group performance (EGOT Winner)
            '2002\tSpecial Lifetime Achievement Tony Award\tJulie Harris\tRecipient\tNo Associated Performance\n',#no performance
            '1994\tBest Musical\tRon Logan\tNominee\tBeauty and the Beast\n' #exception to 'by' rule
        ]
        process_tonys_data(tony_html_file)
        
        # # Make sure html file exists
        # self.assertTrue(os.path.exists(write_filename))
        actual_lines=[]

        try:
            # Here I needed latin-1
            with open(write_filename, 'r',encoding='latin-1') as file:
                actual_lines = file.readlines()
        except UnicodeDecodeError as e:
            print(f"Error decoding file: {e}")

        for expected_line in expected_lines:
            self.assertIn(expected_line, actual_lines)

if __name__ == '__main__':
    unittest.main()
