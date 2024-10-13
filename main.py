import yfinance as yf
from datetime import datetime
import pandas as pd
def get_user_input(prompt):
    """
    Prompts the user for input and returns the input as a string.
    :param prompt: The message to display when asking for input.
    :return: The input string entered by the user.
    """
    return input(prompt)

def validate_date(date_str):
    """
    Validates if the input string is a correct date format (YYYY-MM-DD).
    :param date_str: The date string to validate.
    :return: True if valid, False otherwise.
    """
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def main():
    # Get user input
    ticker = get_user_input("Enter the ticker symbol: ").upper()

    # Validate start date
    while True:
        start_date = get_user_input("Enter the starting date (YYYY-MM-DD): ")
        if validate_date(start_date):
            break
        print("Invalid date format. Please use YYYY-MM-DD.")

    # Validate end date
    while True:
        end_date = get_user_input("Enter the ending date (YYYY-MM-DD): ")
        if validate_date(end_date):
            break
        print("Invalid date format. Please use YYYY-MM-DD.")

    print("Ticker:", ticker)
    print("Start Date:", start_date)
    print("End Date:", end_date)

    df = yf.download(ticker, start=start_date, end=end_date)
    print(df)

def tester():
    df = yf.download('SPY', start="2024-01-01", end="2024-09-01", interval='1h')
    #print(df)
    try:
        df.to_csv('rawdata.csv')
    except PermissionError:
        print("Error: Permission denied")
    except Exception as e:
        print(f"Error occured {e}")


if __name__ == "__main__":
    #main()
    tester()
