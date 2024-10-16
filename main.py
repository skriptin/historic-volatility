import yfinance as yf
from datetime import datetime
import pandas as pd
import math
import matplotlib.pyplot as plt


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
    
def calc_intra_day_vol(df):

    df.reset_index(inplace=True)
    print("DataFrame columns:", df.columns)

    TRADING_DAYS = 252
    #df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    daily_volatility = {df['Date'].iloc[0].date(): 0}

    for index in range(0, len(df)):

        daily_high = df.iloc[index]['High']
        daily_low = df.iloc[index]['Low']
        volatility = abs((daily_high-daily_low) / daily_low) * math.sqrt(TRADING_DAYS) * 100
        volatility = round(volatility, 2)

        daily_volatility[df.iloc[index]['Date']] = volatility

    return daily_volatility



def calc_vol_daily(df):
    """
    Calculated the anualized volatility of a ticker based on the price difference
    between the close of one day and the close of the other day
    """
    df.reset_index(inplace=True)
    print("DataFrame columns:", df.columns)

    TRADING_DAYS = 252
    #df['Date'] = pd.to_datetime(df['Date'], errors='coerce')


    for index in range(0, len(df)):

        if index == 0:
            daily_volatility = {df['Date'].iloc[0].date(): 0}
        else:
            today_open = df.iloc[index]['Open']
            yesterday_open = df.iloc[index-1]['Open']
            volatility = abs((yesterday_open-today_open) / today_open) * math.sqrt(TRADING_DAYS) * 100
            volatility = round(volatility, 2)

            daily_volatility[df.iloc[index]['Date']] = volatility

    return daily_volatility

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
    #print(df)

    daily_volatility = calc_vol_daily(df)
    intra_day_volatility = calc_intra_day_vol(df)

    dates = list(daily_volatility.keys())
    volatility = list(daily_volatility.values())

    dates1 = list(intra_day_volatility.keys())
    volatility2 = list(intra_day_volatility.values())

    # Create a line graph
    plt.plot(dates, volatility, label='Dataset A', color='blue', linestyle='-', marker='o')
    plt.plot(dates1, volatility2, label='Dataset B', color='red', linestyle='--', marker='x')

    # Add titles and labels
    plt.title('SPY')
    plt.xlabel('Date')
    plt.ylabel('Volatility')

    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45)
    plt.legend()

    # Show the plot
    plt.tight_layout()  # Adjust layout to prevent clipping of tick-labels
    plt.show()


def tester():
    df = yf.download('SPY', start="2024-01-01", end="2024-10-01")
    #print(df)
    try:
        df.to_csv('rawdata.csv')
    except PermissionError:
        print("Error: Permission denied")
    except Exception as e:
        print(f"Error occured {e}")
    daily_volatility = calc_vol_daily(df)
    intra_day_volatility = calc_intra_day_vol(df)

    dates = list(daily_volatility.keys())
    volatility = list(daily_volatility.values())

    dates1 = list(intra_day_volatility.keys())
    volatility2 = list(intra_day_volatility.values())

    # Create a line graph
    plt.plot(dates, volatility, label='Dataset A', color='blue', linestyle='-', marker='o')
    plt.plot(dates1, volatility2, label='Dataset B', color='red', linestyle='--', marker='x')

    # Add titles and labels
    plt.title('SPY')
    plt.xlabel('Date')
    plt.ylabel('Volatility')

    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45)
    plt.legend()

    # Show the plot
    plt.tight_layout()  # Adjust layout to prevent clipping of tick-labels
    plt.show()





if __name__ == "__main__":
    main()
    #tester()
