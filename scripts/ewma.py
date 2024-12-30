import math
import os
import csv
from datetime import datetime

def ewma_vol(alpha: float) -> dict:
    ewma_volatility = dict()
    daily_rets = dict()
    alpha = float(alpha)
    last_varience = 0


    print("Value of alpha: ", type(alpha), alpha)

    #Get the daily returns for windowed vol calculation
    cwd = os.getcwd()
    imput_path = os.path.join(cwd, 'data', 'returns.csv')
    print("Imput path for EWMA: ", imput_path)
    with open(imput_path, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            date = row[0]
            log_return = float(row[1])
            daily_rets[date] = log_return
    dates = list(daily_rets.keys())
    returns = list(daily_rets.values())

    if(len(dates) != len(returns)):
        return "Error in the list of dates and returns "

    # Base case of the EWMA function we use the first varience as the first value for the time series
    last_var = returns[0] ** 2
    ewma_volatility[dates[0]] = last_var

    for index in range (1,len(dates)):
        ewma_volatility[dates[index]] = ((1 - alpha) * last_var) + (alpha *  (returns[index] ** 2))
        last_var = ewma_volatility[dates[index]]

    for key in ewma_volatility:
        value = ewma_volatility[key]
        value = ((value * 252 ) ** 0.5) * 100
        ewma_volatility[key] = value


    return ewma_volatility
