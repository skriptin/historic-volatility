import math
import os
import csv
from datetime import datetime

def sma_vol(window_length: int) -> dict:
    #Initalizations
    window_length = int(window_length)
    windowed_volatility = dict()
    daily_rets = dict()
    current_value = 0

    #Get the daily returns for windowed vol calculation
    cwd = os.getcwd()
    imput_path = os.path.join(cwd, 'data', 'returns.csv')
    print("Imput path for SMA: ", imput_path)
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
        current_return = returns[index] ** 2 
        current_value = current_return + current_value
        windowed_volatility[date] = 0
    windowed_volatility[dates[window_length-1]] = current_value

    print("Window length: ", window_length,"Data points: ", len(dates))
    for index in range(window_length, len(dates)):
        current_value = current_value - returns[index - window_length] ** 2 + returns[index] ** 2
        windowed_volatility[dates[index]] = current_value

    for key in windowed_volatility:
        value = windowed_volatility[key]
        value = ((value/window_length*252) ** 0.5) * 100
        windowed_volatility[key] = value
                

    return windowed_volatility

if __name__ == "__main__":
    sma_vol(10)
