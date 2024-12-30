import yfinance as yf
import pandas as pd
import csv
import os
import math
from datetime import datetime
from pandas import Timestamp


def calc_series_of_daily_log_returns(df) -> dict:
    log_returns = dict()
    df['Date'] = pd.to_datetime(df['Date'])
    TRADING_DAYS = (255 ** 0.5) * 100
    # Calculate log returns
    for index in range(1, len(df)):
        #This was extremely annoying to do
        date = df.iloc[index]['Date']
        date = date.iloc[0].to_pydatetime().date()
        date = date.strftime('%Y-%m-%d')
        log_returns[date] = abs(math.log(df.iloc[index]['Close'] / df.iloc[index - 1]['Close']))
    return log_returns

def fetch_returns(ticker, start_date, end_date):
    try:
        df = yf.download(ticker, start=start_date, end=end_date)
    except ValueError as e:
        return {"error fetching data"}
    df.reset_index(inplace=True)
    daily_rets = calc_series_of_daily_log_returns(df)
    cwd = os.getcwd()
    output_path = cwd + '/data/returns.csv'
    with open(output_path, 'w', newline="") as f:
        writer = csv.writer(f)
        for date, log_return in daily_rets.items():
            writer.writerow([date, log_return])

    return daily_rets
