
import matplotlib
#matplotlib.use('Agg')
import matplotlib.pyplot as plt
import yfinance as yf
from arch import arch_model
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf, pacf, acf
from statsmodels.stats.diagnostic import acorr_ljungbox
import pandas as pd
import numpy as np
import io
import matplotlib.dates as mdates


ANUALIZATION_FACTOR = 1587.45 # sqrt.(252) * 100
ANUALIZATION_FACTOR_SQ = 15.87


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
    log_returns = (np.diff(np.log(prices)))
    print(log_returns.mean(), np.median(log_returns), log_returns.std())

    # plt.figure(figsize=(10, 6))
    # plt.hist(log_returns, bins=1000, edgecolor='black')
    # plt.title('Histogram of Log Returns')
    # plt.xlabel('Log Return')
    # plt.ylabel('Frequency')
    # plt.grid(True)
    # plt.tight_layout()
    # plt.show()


    # ljung_box_results = acorr_ljungbox(log_returns, lags=[2,4,6,8,10,12,14,1000], return_df=True)
    # print(ljung_box_results)
    # acf_values = acf(log_returns, nlags=30)
    # for lag, val in enumerate(acf_values):
    #     print(f"Lag {lag}: {val}")

    # fig, ax = plt.subplots()
    # plot_pacf(log_returns**2, ax=ax, lags=30, alpha=0.05)
    # plt.show()
    returns_dict = dict(zip(dates[1:], log_returns))
    garch_fit(returns_dict, p=1, q=1, alpha=0.05, dist='skewt', lags=1)

def garch_fit(returns: dict, p: int, q: int, mean: str = 'Constant',
              model: str = 'GARCH', lags: int = 0, o: int = 0,
              distribution: str = 'skewt') -> object:
    """
    Fit a GARCH-family model to the returns data.
    
    :param returns: Dictionary of returns with dates as keys.
    :param p: Order of the GARCH component (volatility lags).
    :param q: Order of the ARCH component (shock lags).
    :param mean: Mean model ('Zero', 'Constant', 'AR', etc.).
    :param model: Volatility model ('GARCH', 'ARCH', 'EGARCH', 'FIGARCH', etc.).
    :param lags: Number of lags for the AR mean model.
    :param o: Asymmetric term order (used in EGARCH/GJR-GARCH).
    :param distribution: Error distribution ('normal', 't', 'skewt', etc.).
    :return: Fitted GARCH model result object.
    """
    returns_values = np.array(list(returns.values()))*100
    returns_keys = np.array(list(returns.keys()))

    am = arch_model(
        returns_values,
        vol=model,
        p=p,
        o=o,
        q=q,
        mean=mean,
        lags=lags,
        dist=distribution
    )
    
    result = am.fit(disp='off')
    return result



    am = model.fit(disp='off')
    print(garch_model.summary())
    garch_vol = garch_model.conditional_volatility



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