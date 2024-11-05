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

def calc_weekly_vol(df):
    """
    Calculates the anual volatility based on the daily price movements in a trading week
    :param df: A dataframe containg the daily stock price movements
    :return Dictionary containing annualized volatility calculated on a weekly basis
    """
    print("DataFrame columns(Weekly_vol):", df.columns)
    TRADING_WEEKS = 252
    weekly_volatility = {df['Date'].iloc[0].date(): 0}    
    median = 0
    squared_differences = 0
    daily_returns = [0]*5

    i = 5

    for index in range(0, 5):
        weekly_volatility[df.iloc[index]['Date']] = 0

    while i < len(df):
        median = 0
        squared_differences = 0

        for index in range(i-5, i):
            median = median + math.log(df.iloc[index+1]['Close']/df.iloc[index]['Close'])
            daily_returns[(index+1) % 5] = math.log(df.iloc[index+1]['Close']/df.iloc[index]['Close'])
        median = median / 5

        for index in range(i-5, i):
            squared_differences = squared_differences + (daily_returns[(index+1) % 5] - median) ** 2

        weekly_vol = math.sqrt(1/4*squared_differences * 252)*100
        weekly_vol = round(weekly_vol,2)

        weekly_volatility[df.iloc[i]['Date']] = weekly_vol
        print("Vol at index  ",i,weekly_vol)


        i += 1
    return weekly_volatility

        

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

    print("DataFrame columns(Intra_vol):", df.columns)

    TRADING_DAYS = 252
    daily_volatility = {df['Date'].iloc[0].date(): 0}

    for index in range(0, len(df)):

        daily_high = df.iloc[index]['High']
        daily_low = df.iloc[index]['Low']
        volatility = abs((daily_high-daily_low) / daily_low) * math.sqrt(TRADING_DAYS) * 100
        volatility = round(volatility, 2)

        daily_volatility[df.iloc[index]['Date']] = volatility

    return daily_volatility

def calc_forward_price(starting_price, num_days, expected_yearly_return):
    x = 5


def calc_vol_daily(df):
    """
    Calculated the anualized volatility of a ticker based on the price difference
    between the close of one day and the close of the other day
    """
    print("DataFrame columns (vol_daily):", df.columns)

    daily_volatility = {df['Date'].iloc[0].date(): 0}
    TRADING_DAYS = 252
    #df['Date'] = pd.to_datetime(df['Date'], errors='coerce')


    for index in range(0, len(df)):

        if index == 0:
            daily_volatility = {df['Date'].iloc[0].date(): 0}
        else:
            today_close = df.iloc[index]['Close']
            yesterday_close = df.iloc[index-1]['Close']
            volatility = abs(math.log(today_close/yesterday_close))
            volatility = math.sqrt(volatility)*100*math.sqrt(TRADING_DAYS) #we assume population statistic for n=1
            volatility = round(volatility, 2)

            daily_volatility[df.iloc[index]['Date']] = volatility

    return daily_volatility

def calc_vol_windowed(df, window_length: int):
    #Initalizations
    windowed_volatility = {df['Date'].iloc[0].date(): 0}
    TRADING_DAYS = 252
    i = window_length
    daily_returns = [0]*window_length

    # Theese days will be without data
    for index in range(0, window_length):
        windowed_volatility[df.iloc[index]['Date']] = 0

    while i < len(df):
        median = 0
        squared_differences = 0

        for index in range(i-window_length, i):
            median = median + math.log(df.iloc[index+1]['Close']/df.iloc[index]['Close'])
            daily_returns[(index+1) % 5] = math.log(df.iloc[index+1]['Close']/df.iloc[index]['Close'])
        median = median / window_length

        for index in range(i-window_length, i):
            squared_differences = squared_differences + (daily_returns[(index+1) % 5] - median) ** 2

        windowed_vol = math.sqrt( (1/(window_length-1)) * squared_differences * 252 )*100
        windowed_vol = round(windowed_vol,4)

        windowed_volatility[df.iloc[i]['Date']] = windowed_vol
        print("Vol at index  ",i,windowed_vol)

        i += 1
    return windowed_volatility

def main():
    # Get user input
    ticker = get_user_input("Enter the ticker symbol: ").upper()
    window_length = get_user_input("Please enter the window length used for the volatility calculations: ")

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
    print("Window Length:",window_length)
    print("Start Date:", start_date)
    print("End Date:", end_date)

    df = yf.download(ticker, start=start_date, end=end_date)
    df.reset_index(inplace=True)


    #daily_volatility = calc_vol_daily(df)
    #intra_day_volatility = calc_intra_day_vol(df)
    #weekly_vol = calc_weekly_vol(df)
    windowed_vol = calc_vol_windowed(df,int(window_length))

    dates_w = list(windowed_vol.keys())
    volatility_w = list(windowed_vol.values())
    plt.plot(dates_w, volatility_w, label='f" Annualized {window_length} Volatility of {ticker} "', color='blue', linestyle='-', marker='o')
    #dates = list(daily_volatility.keys())
    #volatility = list(daily_volatility.values())

    #dates2 = list(intra_day_volatility.keys())
    #volatility2 = list(intra_day_volatility.values())

    #dates3 =list(weekly_vol.keys())
    #volatility3 = list(weekly_vol.values())

    #filtered_dates = [date for date, vol in zip(dates2, volatility2) if vol is not None]  # Only include if vol is not None
    #filtered_volatility = [vol for vol in volatility2 if vol is not None]  # Corresponding volatilities

    #filtered_dates2 = [date for date, vol in zip(dates, volatility) if vol is not None]  # Only include if vol is not None
    #filtered_volatility2 = [vol for vol in volatility if vol is not None]  # Corresponding volatilities

    #filtered_dates3 = [date for date, vol in zip(dates3, volatility3) if vol is not None]  # Only include if vol is not None
    #filtered_volatility3 = [vol for vol in volatility3 if vol is not None]  # Corresponding volatilities

    # Create a line graph
    #plt.plot(filtered_dates2, filtered_volatility2, label='Interday vol(d1open-d2open)', color='blue', linestyle='-', marker='o')
    #plt.plot(filtered_dates, filtered_volatility, label='Intraday Vol (high-low)', color='red', linestyle='--', marker='x')
    #plt.plot(filtered_dates3, filtered_volatility3, label='Intraweekly Vol', color='Green', linestyle='--', marker='o')



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
