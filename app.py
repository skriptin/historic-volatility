from flask import Flask, render_template, request, jsonify, send_file
from scripts import fetch, sma, ewma, garch, util
import numpy as np
import threading

model_store = {}
model_store_lock = threading.Lock()



app = Flask(__name__)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/get_data", methods=["POST"])
def get_data():
    print("Routing to script /get_date")
    ticker = request.form.get("ticker")
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")

    response = fetch.fetch_returns(ticker, start_date, end_date)

    if "error" in response:
        print(response)
        return jsonify({"error": response["error"]}), 400

    return jsonify(response), 200

@app.route("/calc_sma", methods=["POST"])
def calc_sma():
    print("Routing to script /calc_sma")

    request_data = request.get_json()

    if not request_data:
        print("No JSON recieved for sma")
        return jsonify({"error": "Invalid request: No JSON recieved"}), 400

    window = int(request_data.get("window"))
    returns = request_data.get("stock_returns")

    if returns is None or not isinstance(returns, dict):
        print("Invalid stock returns")
        return jsonify({"error": "Stock returns data is missing or invalid"}), 400

    response = sma.sma_vol(window, returns)

    if "error" in response:
        print(response)
        return jsonify({"error": response["error"]}), 400
    return jsonify(response),  200

@app.route("/calc_ewma", methods=["POST"])
def calc_ewma():
    print("Routing to script /calc_ewma")

    request_data = request.get_json()
    if not request_data:
        print("No JSON recieved for sma")
        return jsonify({"error": "Invalid request: No JSON recieved"}), 400


    alpha = request_data.get("alpha")
    returns = request_data.get("stock_returns")

    if returns is None or not isinstance(returns, dict):
        print("Invalid stock returns")
        return jsonify({"error": "Stock returns data is missing or invalid"}), 400

    response = ewma.ewma_vol(alpha, returns)
    
    if "error" in response:
        print(response)
        return jsonify({"error": response["error"]}), 400
    return jsonify(response), 200

@app.route("/get_pacf", methods=["POST"])
def get_pacf():
    print("Routing to script fetch_pacf()")

    request_data = request.get_json()
    returns = request_data.get('stock_returns')
    alpha = request_data.get('alpha')
    n_lags = request_data.get('nlags')
        
    if not request_data:
        print("No JSON recieved for sma")
        return jsonify({"error": "Invalid request: No JSON recieved"}), 400

    if returns is None or not isinstance(returns, dict):
        print("Returns are null or invalid in form")
        return jsonify({"error": "Invalid request: No stock returns recieved"}), 400

    try:
        pacf_img = garch.get_pacf(returns, float(alpha), int(n_lags))
        return send_file(pacf_img, mimetype='image/png'), 200
    except Exception as e:
        print(f"Error generating PACF flot {e}")
        return jsonify({"Error": "Failed to get PACF plot"}), 500


@app.route("/get_index", methods=["POST"])
def get_index():
    print("Routing script to fetch_index()")

    ticker = request.form.get("ticker")
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")

    response = fetch.get_index(ticker, start_date, end_date)

    if "error" in response:
        print(response)
        return jsonify({"error": response["error"]}), 400

    return jsonify(response), 200

@app.route("/fit_model", methods=["POST"])
def fit_garch():
    print("Routing to script /fit_model")
    request_data = request.get_json()

    if not request_data:
        print("No JSON recieved for model")
        return jsonify({"error": "Invalid request: No JSON recieved"}), 400

    try:
        # Extract dates array from JSON payload

        print("Raw p:", request_data.get('p'))
        print("Raw q:", request_data.get('q'))
        print("Raw o:", request_data.get('o'))



        dates = request_data.get('dates', [])  
        p = int(request_data.get('p', 1))
        q = int(request_data.get('q', 1))
        o = int(request_data.get('o', 0))
        lags_vol = str(request_data.get('lags_vol'))
        mean = str(request_data.get('mean', 'Constant'))
        model = str(request_data.get('model', 'GARCH'))
        lags = str(request_data.get('lags'))
        distribution = str(request_data.get('dist', 'normal'))
        model_name = str(request_data.get('name', 'my_garch_model'))
        ticker = str(request_data.get('ticker', 'SPY'))
        power = float(request_data.get("power", 2.0))
        print(f"Raw lags_vol: {lags_vol} ({type(lags_vol)})")
        print(f"Raw lags: {lags} ({type(lags)})")        
        lags_vol = util.convertStrToList(lags_vol)
        lags = util.convertStrToList(lags)

    except (ValueError, TypeError) as e:
        print(f"Error parsing request data: {e}")
        return jsonify({"error": "Invalid request data"}), 400

    variables = {
        "dates": dates,
        "p": p,
        "q": q,
        "o": o,
        "lags_vol": lags_vol,
        "mean": mean,
        "model": model,
        "lags": lags,
        "distribution": distribution,
        "model_name": model_name,
        "ticker": ticker,
    }

    for name, value in variables.items():
        print(f"{name}: type={type(value).__name__}, value={value}")

    returns = fetch.query_dates(dates, ticker)

    result = garch.model_fit(
        returns=returns,
        p=p,
        q=q,
        o=o,
        vol_lags=lags_vol,
        mean=mean,
        model=model,
        lags=lags,
        dist=distribution,
        model_name=model_name,
        power = power
    )
    with model_store_lock:
        model_store[model_name] = result

    return jsonify({"message": "GARCH model fitted successfully", "model_summary": "good"}), 200
    


if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
