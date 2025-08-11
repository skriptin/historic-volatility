import yfinance as yf
import math
import pandas as pd 
from datetime import datetime


# Lots to be done here mainly with acessing a databas

def query_dates(dates: list, ticker: str):
    for i in range(len(dates)):
        dates[i] = (
            datetime.strptime(dates[i][0], "%Y-%m-%d"),
            datetime.strptime(dates[i][1], "%Y-%m-%d")
        )
    
    # Find min and max dates
    all_dates = [d for tup in dates for d in tup]
    date_min = min(all_dates)
    date_max = max(all_dates)

    # check DB if dates for ticker are in here

    # if not fetch returns
    returns = fetch_returns(ticker, date_max, date_min)
    queried_returns = dict()

    for start_date, end_date in dates:
        for date, value in returns.items():
            if start_date <= date <= end_date:
                queried_returns[date] = value  



    return dict(sorted(queried_returns.items()))

"""
Calculates daily log returns from a dictionary of date-price pairs.

Args:
    date_price_dict (dict): A dictionary where keys are date strings ('YYYY-MM-DD')
                            and values are the closing prices (floats).

Returns:
    dict: A dictionary where keys are date strings ('YYYY-MM-DD')
            and values are the daily log returns (floats).
            Returns an empty dictionary if less than 2 data points.
"""
def calc_log_returns_from_dict(date_price_dict: dict) -> dict:
    print("Calclulating log returns")
    log_returns = dict()

    sorted_dates = sorted(date_price_dict.keys())

    for i in range(1, len(sorted_dates)):
        current_date_str = sorted_dates[i]
        previous_date_str = sorted_dates[i-1]

        current_price = date_price_dict[current_date_str]
        previous_price = date_price_dict[previous_date_str]

        # Calculate log return: ln(P_current / P_previous)
        log_return = math.log(current_price / previous_price)
        log_returns[current_date_str] = log_return

    #print(log_returns)
    return log_returns


"""
Fetches stock data from yfinance, converts it to a date-price dictionary,
and calculates daily log returns from the dictionary.

Args:
    ticker (str): Stock ticker symbol.
    start_date (str): Start date in 'YYYY-MM-DD' format.
    end_date (str): End date in 'YYYY-MM-DD' format.

Returns:
    dict: A dictionary where keys are date strings and values are
            the daily log returns, or a dictionary with an 'error' key
            if fetching or processing fails.
"""
def fetch_returns(ticker, start_date, end_date):


    print(f"Fetching {ticker} data from Yahoo Finance")
    print(f"{start_date}, {end_date}")
    try:
        df = yf.download(ticker, start=start_date, end=end_date, progress=False)
        print(df)
    except Exception as e: # Catch general Exception including YFRateLimitError
         print(f"Error fetching data for {ticker}: {e}")
         return {"error": f"Error fetching data for {ticker}: {e}"}

    if df.empty:
         print(f"No data fetched for {ticker}")
         return {"error": f"No data found for {ticker} in the specified date range."}

    # --- Convert DataFrame to Dictionary ---
    date_price_dict = dict()
    df.reset_index(inplace=True)
    list_df = df.values.tolist()
    
    for row in list_df:
        date = row[0]
        close_price = row[1]
        date_str = date.strftime('%Y-%m-%d')
        date_price_dict[date_str] = close_price

    # --- Calculate Log Returns from the Date-Price Dictionary ---
    if not date_price_dict or len(date_price_dict) < 2:
         return {"error": "Not enough price data available to calculate returns."}
    daily_rets = calc_log_returns_from_dict(date_price_dict)

    return daily_rets


"""
    Fetches index data from y-finance

Args:
ticker (str): Stock ticker symbol.
start_date (str): Start date in 'YYYY-MM-DD' format.
end_date (str): End date in 'YYYY-MM-DD' format.

Returns:
dict: A dictionary where keys are date strings and values are
        the daily log returns, or a dictionary with an 'error' key
        if fetching or processing fails.
"""
def get_index(ticker, start_date, end_date):

    print(f"Fetching {ticker} data from Yahoo Finance")
    try:
        df = yf.download(ticker, start=start_date, end=end_date, progress=False)
        print(df)
    except Exception as e: # Catch general Exception including YFRateLimitError
            print(f"Error fetching data for {ticker}: {e}")
            return {"error": f"Error fetching data for {ticker}: {e}"}

    if df.empty:
            print(f"No data fetched for {ticker}")
            return {"error": f"No data found for {ticker} in the specified date range."}

    # --- Convert DataFrame to Dictionary ---
    index_dict = dict()
    df.reset_index(inplace=True)
    list_df = df.values.tolist()

    for row in list_df:
        date = row[0]
        close_price = row[1]
        date_str = date.strftime('%Y-%m-%d')
        index_dict[date_str] = close_price

    return index_dict


