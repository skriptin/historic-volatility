
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import yfinance as yf
from arch import arch_model
from arch.univariate.base import ARCHModelResult
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf, pacf, acf
from statsmodels.stats.diagnostic import acorr_ljungbox
import pandas as pd
import numpy as np
import io
import matplotlib.dates as mdates
from scripts import model_cache, util

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
    Model = model_cache.Model("Tester model", result, list(returns_dict.keys()), "SPY")
    back_preds = back_predictions(Model)
    size = util.get_total_size(Model)
    print(f"Total size of the model: {size}bytes")



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

    return result

def serealize_modelInfo(res: ARCHModelResult) -> dict:
    """
    Extracts model information from the parent class
    ARCHModelResult and serliazies it into a dict for\
    jsonifying to the front-end.

    Parameters
    ----------
    res: ARCHModelResult
        Model to be serliazed

    Returns
    -------
    model_summary: dict
                Model infomraiton

    """
    model = res.model
    model_summary = {
        "Mean Model": model.name,
        "Vol Model": model.volatility.name,
        "Distribution": model.distribution.name,
        "Creation Date": res._datetime.strftime("%a, %b %d %Y"),
        "R-squared": float(f"{res.rsquared:#8.3f}"),
        "Log-Likelihood": float(f"{res.loglikelihood:#10.6g}"),
        "AIC": float(f"{res.aic:#10.6g}"),
        "BIC": float(f"{res.bic:#10.6g}"),
        "No. Observations": f"{res._nobs}"
    }

    params = res.params
    std_err = res.std_err
    p_values = res.pvalues
    names = res._names
    mean_params = {}
    vol_params = {}

    mc = res.model.num_params
    vc = res.model.volatility.num_params

    for i in range(len(params)):
        param_info = {
            "Value": float(format(params.iloc[i], ".5g")),
            "Std Error": float(format(std_err.iloc[i],".5g")),
            "P value": float(format(p_values.iloc[i],".5g"))
        }
        if i < mc:
            mean_params[names[i]] = param_info
        elif i < mc + vc:
            vol_params[names[i]] = param_info
        else:
            pass

    model_info = {
        "Model Summary": model_summary,
        "Mean Model": mean_params,
        "Volatility Model": vol_params
    }
    return model_info



def forecast(model: model_cache.Model, horizon: int) -> dict:
    """
    Predict future volatility using the fitted models model.
    :return: Predicted volatility Scaled and Annualized.
    """
    
    forecast = model.model_object.forecast(horizon=horizon)
    last_date = pd.to_datetime(model.dates[-1])
    forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=horizon, freq='B')
    
    variance = forecast.variance.values[-1]          
    daily_vol = variance ** 0.5                       
    annualized_vol = daily_vol * ANUALIZATION_FACTOR_SQ       
    
    return {date.date().isoformat(): vol for date, vol in zip(forecast_dates, annualized_vol)}

def back_predictions(model: model_cache.Model) -> dict:
    """
    Predict future volatility using the fitted model.
    Returns a dictionary mapping dates to annualized volatility values.
    
    - NaN values are replaced with 0.
    - Dates are assumed to be pre-sorted.
    """
    try:
        vol_model = model.model_object
        vol_dates = model.dates

        # Ensure required attribute exists
        if not hasattr(vol_model, "conditional_volatility"):
            raise AttributeError("The model object does not have 'conditional_volatility'.")

        # Compute annualized volatility
        back_preds = vol_model.conditional_volatility * ANUALIZATION_FACTOR_SQ

        # Replace NaNs with zero
        back_preds = np.nan_to_num(back_preds)

        # Ensure dates and predictions match in length
        if len(vol_dates) != len(back_preds):
            raise ValueError("The number of dates does not match the number of volatility predictions.")

        # Zip into dictionary (no sorting needed)
        result = {pd.to_datetime(date).date().isoformat(): vol for date, vol in zip(vol_dates, back_preds)}

        return result

    except AttributeError as e:
        print(f"[AttributeError] {e}")
    except ValueError as e:
        print(f"[ValueError] {e}")
    except Exception as e:
        print(f"[Unhandled Exception] {e}")

    # Return empty dict on failure
    return {}




def verify_rolling_forecast():
    """
    Verify the rolling forecast of the GARCH model.
    :return: None
    """
    pass


if __name__ == "__main__":

    garch_testing()