import math
import os
import csv
import datetime
def sma_vol(window_length: int) -> dict:
    #Initalizations
    windowed_volatility = dict()
    daily_rets = {}
    TRADING_DAYS = 252
    i = window_length

    #Get the daily returns for windowed vol calculation
    imput_path = os.getcwd() + '/data/returns.csv'
    with open(imput_path, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            date = row[0]
            log_return = float(row[1])
            daily_rets[date] = log_return

    dates = list(daily_rets.keys())
    returns = list(daily_rets.values())

    print("the window legnth if outputted below")
    print(window_length)
    #if int(window_length) > len(dates):
    #    return "Failure window length greater than daterange"

    #print(dates)
    #print(returns)
    # Theese days will be without data
    #for index in range(0, window_length):
    #    windowed_volatility[dates[index]] = 0
    #print (windowed_volatility)

    return windowed_volatility
