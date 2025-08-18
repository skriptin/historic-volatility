
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import yfinance as yf
from arch import arch_model
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf, pacf, acf
from statsmodels.stats.diagnostic import acorr_ljungbox
import pandas as pd
import numpy as np
import io
import matplotlib.dates as mdates
import json 


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


    returns_dict = dict(zip(dates[1:], log_returns))
    result = model_fit(returns_dict, p=1, q=1, o=1, dist='skewt', model="HARCH", mean="AR", lags=[1], vol_lags = [1,2,5], power = 2.0)
    model_info_json = serealize_modelInfo(result)
    print(result)

def model_fit(
    returns: dict, 
    p: int, 
    q: int, 
    o: int, 
    vol_lags: list = [], 
    mean: str = 'Constant',
    model: str = 'GARCH', 
    lags: list = [],
    dist: str = 'skewt',
    model_name: str = "my_garch_model",
    power: float = 2.0
) -> object:
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
    print(f'PYTHON PRITING MODEL TYPE IN GARCH SCRIPT: {model}')
    if model == "harch":
        am = arch_model(
            returns_values,
            vol=model,
            p=vol_lags,
            q=q,
            mean=mean,
            lags=lags,
            dist=dist,
            power = power
        )
    else:
        am = arch_model(
            returns_values,
            vol=model,
            p=p,
            o=o,
            q=q,
            mean=mean,
            lags=lags,
            dist=dist,
            power=power
        )

    result = am.fit(disp='off')


    print(result.summary())
    print(result.conditional_volatility)      
    return result
 
def serealize_modelInfo(res: object):

    print(res.params)

    params = res.params
    # std_err = res.bse
    # conf_int = res.conf_int()
    # pvalues = res.pvalues

    Model_Results = []
    Mean_Model = []
    Volatility_Model = []
    Distribution = []
    for param in params.index:

        if param[0] == "y" or param == "Const":
            Mean_Model.append({
                "param": param,
                "coef": params[param],
                "std_err": std_err[param],
                "t_stat": params[param] / std_err[param],
                "p_value": pvalues[param],
            })
        elif param == "eta" or param == "lambda":
            Distribution.append({
                "param": param,
                "coef": params[param],
                "std_err": std_err[param],
                "t_stat": params[param] / std_err[param],
                "p_value": pvalues[param],
            })
        else:
            Volatility_Model.append({
                "param": param,
                "coef": params[param],
                "std_err": std_err[param],
                "t_stat": params[param] / std_err[param],
                "p_value": pvalues[param],
            })

        mean_params.append({
            "param": param,
            "coef": params[param],
            "std_err": std_err[param],
            "t_stat": params[param] / std_err[param],
            "p_value": pvalues[param],
            "conf_int": list(conf_int.loc[param])
        })

    # model_summary = {
    #     "model_type": "AR-GARCH",
    #     "dependent_variable": "y",
    #     "n_observations": res.nobs,
    #     "r_squared": res.rsquared if hasattr(res, 'rsquared') else None,
    #     "adj_r_squared": res.rsquared_adj if hasattr(res, 'rsquared_adj') else None,
    #     "log_likelihood": res.loglikelihood,
    #     "aic": res.aic,
    #     "bic": res.bic,
    #     "mean_model": mean_params,
    #     # Add volatility parameters similarly if available
    # }

    return json.dumps(model_summary)



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