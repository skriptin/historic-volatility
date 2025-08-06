
import matplotlib
#matplotlib.use('Agg')
import matplotlib.pyplot as plt
import yfinance as yf
from arch import arch_model
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf, pacf
import pandas as pd
import numpy as np
import io
import matplotlib.dates as mdates


def get_pacf(returns: dict, alpha: float, n_lags: int):

    returns_list = list(returns.values())
    returns_list_np = np.array(returns_list)

    buf = get_pacf_imgPlot(returns_list_np, n_lags, alpha)

    return buf

def get_pacf_imgPlot(returns, nlags, alpha):

    
    fig, ax = plt.subplots()
    plot_pacf(returns**2, ax=ax, lags=nlags, alpha=alpha)

    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)

    return buf


def garch_testing():

    rawdata_df = pd.read_csv('rawdata.csv')
    rawdata_df = rawdata_df[['Date', 'Close']]
    rawdata_df['Close'] = pd.to_numeric(rawdata_df['Close'], errors='coerce')
    rawdata_df = rawdata_df.dropna(subset=['Close'])
    dates = rawdata_df['Date'].to_numpy()
    prices = rawdata_df['Close'].to_numpy()
    log_returns = np.diff(np.log(prices)) * np.sqrt(252) * 100

    fig, ax = plt.subplots()
    plot_pacf(log_returns**2, ax=ax, lags=1500, alpha=0.05)
    plt.show()

 
    returns_dict = dict(zip(dates[1:], log_returns))
    garch_fit(returns_dict, p=2, q=2, alpha=0.05)

def garch_fit(returns: dict, p: int, q: int, alpha: float):
    """
    Fit a GARCH model to the returns data.
    :param returns: Dictionary of returns with dates as keys.
    :param p: Order of the GARCH model.
    :param q: Order of the ARCH model.
    :param alpha: Significance level for the confidence intervals.
    :return: Fitted GARCH model.
    """
    returns_values = np.array(list(returns.values()))
    returns_keys = np.array(list(returns.keys()))

    # Fit the GARCH model
    model = arch_model(returns_values, vol='Garch', p=p, q=q)
    garch_model = model.fit()
    print(garch_model.summary())
    garch_vol = garch_model.conditional_volatility

    plt.figure(figsize=(12, 6))
    plt.plot(returns_keys, returns_values, label='Annualized-log Returns')
    plt.plot(returns_keys, garch_vol, label='GARCH Conditional Volatility')
    plt.xlabel('Date')
    plt.ylabel('Value')
    plt.title('Stock Returns vs GARCH Model Volatility')
    plt.legend()

    ax = plt.gca()
    locator = mdates.AutoDateLocator()
    formatter = mdates.AutoDateFormatter(locator)
    ax.xaxis.set_major_locator(locator)
    ax.xaxis.set_major_formatter(formatter)

    plt.tight_layout()
    plt.show()

def predict():
    """
    Predict future volatility using the fitted GARCH model.
    :return: Predicted volatility.
    """
    pass
def verify_rolling_forecast():
    """
    Verify the rolling forecast of the GARCH model.
    :return: None
    """
    pass
def return_garch_volatility():
    pass


if __name__ == "__main__":

    garch_testing()