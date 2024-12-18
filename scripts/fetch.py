import argparse
import csv
import yfinance as yf
import os
import math

def calc_series_of_daily_log_returns(df) -> dict:
    log_returns = dict()
    for index in range(1,len(df)):
        date = df.iloc[index]['Date'].strftime('%Y-%m-%d')
        log_returns[date] = math.log(df.iloc[index]['Close']/df.iloc[index-1]['Close'])
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


def main():

    parser = argparse.ArgumentParser(description="Enter stock name and date range to retrive data from")
    parser.add_argument("ticker", type=str)
    parser.add_argument("start_date", type=str)
    parser.add_argument("end_date", type=str)
    args = parser.parse_args()

    try:
        df = yf.download(args.ticker, start=args.start_date, end=args.end_date)
    except ValueError as e:
        print("Error getting data") #Implement front end error message later

    df.reset_index(inplace=True)
    daily_rets = calc_series_of_daily_log_returns(df)
    cwd = os.getcwd()
    output_path = cwd + '/data/returns.csv'

    with open(output_path, 'w', newline="") as f:
        writer = csv.writer(f)
        for date, log_return in daily_rets.items():
            writer.writerow([date, log_return])

if __name__ == "__main__":
    main()
