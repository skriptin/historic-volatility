import math
import os
import csv
from datetime import datetime

def sma_vol(window_length: int) -> dict:
    #Initalizations
    window_length = int(window_length)
    windowed_volatility = dict()
    daily_rets = dict()
    TRADING_DAYS_ROOT = 252 ** 0.5
    i = window_length
    current_value = 0
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

    if int(window_length) > len(dates):
        return "Failure window length greater than date-range"
    # The first dates up to window length will be zero
    for index in range(0, window_length):
        date = dates[index]
        current_return = abs(returns[index] * TRADING_DAYS_ROOT * 100) 
        print(current_return, date)
        current_value = current_return + current_value
        windowed_volatility[index] = 0
    current_value = current_value/window_length
    windowed_volatility[dates[window_length]] = current_value

    for index in range(window_length+1, len(dates)):
        current_value = current_return - (returns[index - window_length-1]/window_length)
        current_value = current_value + (returns[index]/window_length)
        windowed_volatility[dates[index]] = current_value
    # Theese days will be without data


    return windowed_volatility
