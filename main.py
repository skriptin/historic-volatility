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

def calc_GARCH_vol(df, window_length: int):
    x=5


def calc_vol_EWMA(df, window_length: int, lam_bda: float):
    #Initalizations
    exp_ma = {df['Date'].iloc[0].date(): 0}
    TRADING_DAYS = 252
    last_var = 0
    squared_return = 0
    alpha = 1- lam_bda

    # Theese days will be without data
    exp_ma[df.iloc[0]['Date']] = 0
    for index in range(1,window_length+1):
        exp_ma[df.iloc[index]['Date']] = 0
        squared_return = math.log(df.iloc[index]['Close']/df.iloc[index-1]['Close']) ** 2
        last_var = last_var + ((squared_return * alpha) * (lam_bda ** (window_length - index)))

    print("Volatility for the 6th point ",math.sqrt(last_var*252)*100)
    exp_ma[df.iloc[window_length+1]['Date']] = math.sqrt(last_var)*100
    i = window_length+2
    while i < len(df):
        squared_return = math.log(df.iloc[i-1]['Close']/df.iloc[i-2]['Close']) ** 2
        volatility = (lam_bda*last_var) + (squared_return*alpha) 
        last_var = volatility 
        exp_ma[df.iloc[i]['Date']] = math.sqrt(volatility*252) * 100
        i += 1
    return exp_ma


def calc_vol_windowed(df, window_length: int):
    #Initalizations
    windowed_volatility = dict()
    TRADING_DAYS = 252
    i = window_length
    daily_returns = [0]*window_length

    # Theese days will be without data
    for index in range(0, window_length+1):
        windowed_volatility[df.iloc[index]['Date']] = 0

    while i < len(df) - 1:
        median = 0
        squared_differences = 0

        for index in range(i-window_length + 1, i + 1):
            median = median + math.log(df.iloc[index]['Close']/df.iloc[index-1]['Close'])
            daily_returns[(index) % window_length] = math.log(df.iloc[index]['Close']/df.iloc[index-1]['Close'])
        median = median / window_length

        for index in range(i-window_length+1, i + 1):
            squared_differences = squared_differences + (daily_returns[(index) % window_length] - median) ** 2

        windowed_vol = math.sqrt( (1/(window_length-1)) * squared_differences * 252 )* 100
        windowed_vol = round(windowed_vol,4)

        windowed_volatility[df.iloc[i+1]['Date']] = windowed_vol
        #print("Vol at index  ",i+1,windowed_vol)

        i += 1
    return windowed_volatility

def calc_series_of_daily_log_returns(df) -> dict:
    # given the df of stock prices return a dict with the log return corresponding to the date of the return
    log_returns = dict()
    for index in range(1,len(df)):
        log_returns[df.iloc[index]['Date']] = math.log(df.iloc[index]['Close']/df.iloc[index-1]['Close'])
        print('Date',df.iloc[index]['Date'])
        print("close of day  ",df.iloc[index]['Close'])
        print("close of yesterday ",df.iloc[index-1]['Close'])
        print("std derived",log_returns[df.iloc[index]['Date']])
    return log_returns



def main():
    # Get user input
    #ticker = get_user_input("Enter the ticker symbol: ").upper()
    #window_length = get_user_input("Please enter the window length used for the volatility calculation: ")
    #lam_bda = get_user_input("Please enter lambda for the weight of the EWMA volatility calculation: ")
    # Validate start date
    #while True:
    #    start_date = get_user_input("Enter the starting date (YYYY-MM-DD): ")
    #    if validate_date(start_date):
    #        break
   #     print("Invalid date format. Please use YYYY-MM-DD.")

    # Validate end date
   # while True:
   #     end_date = get_user_input("Enter the ending date (YYYY-MM-DD): ")
    #    if validate_date(end_date):
    #        break
    #    print("Invalid date format. Please use YYYY-MM-DD.")

    ticker = "SPY"
    window_length = 50
    start_date = "2024-09-01"
    end_date = "2024-10-01"
    lam_bda = 0.9

    print("Ticker:", ticker)
    print("Window Length:",window_length)
    print("Start Date:", start_date)
    print("End Date:", end_date)

    df = yf.download(ticker, start=start_date, end=end_date)
    df.reset_index(inplace=True)
    df.to_csv('rawdata.csv')

    #windowed_vol = calc_vol_windowed(df,int(window_length))
    window_length = 10
    #EWMA_vol = calc_vol_EWMA(df, int(window_length), float(lam_bda))
    daily_rets = calc_series_of_daily_log_returns(df)

    #dates_w = list(windowed_vol.keys())
    #volatility_w = list(windowed_vol.values())

    #dates_e = list(EWMA_vol.keys())
    #volatility_e = list(EWMA_vol.values())


    #plt.plot(dates_w, volatility_w, label='f" Annualized {window_length} Volatility of {ticker} "', color='blue', linestyle='-', marker='o')
    #plt.plot(dates_e, volatility_e, label='f" Annualized {window_length} Volatility of {ticker} WITH EMA "', color='red', linestyle='-', marker='x')

    # Add titles and labels
    plt.title(ticker)
    plt.xlabel('Dates')
    plt.ylabel('Volatility')

    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45)
    plt.legend()

    # Show the plot
    plt.tight_layout()  # Adjust layout to prevent clipping of tick-labels
    plt.show()



if __name__ == "__main__":
    main()
