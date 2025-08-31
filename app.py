import firebase_admin
from firebase_admin import credentials, auth
cred = credentials.Certificate("static/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

from flask import Flask, render_template, request, jsonify, send_file
from scripts import fetch, sma, ewma, models, util, model_cache, database 
import numpy as np





app = Flask(__name__)


@app.route("/")
def home():
    return render_template('login.html')

@app.route("/createaccount")
def createaccount():
    return render_template("createaccount.html")

@app.route("/protected", methods=["POST"])
def protected():
    data = request.get_json()
    id_token = data.get("token")

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        return jsonify({"message": f"Authenticated user {uid}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route("/index")
def index():
    return render_template("index.html") 

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
def fit_model():
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

    # for name, value in variables.items():
    #     print(f"{name}: type={type(value).__name__}, value={value}")

    returns = fetch.query_dates(dates, ticker)

    result = models.model_fit(
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

    model_obj = model_cache.Model(model_name, result, list(returns.keys()), ticker)
    model_cache.add_model(model_obj)
    model_cache.print_model_names()


    model_summary = models.serealize_modelInfo(result)
    model_summary["Model Summary"]["Model Name"] = model_name
    model_summary["Model Summary"]["Security"] = ticker

    return jsonify(model_summary), 200
    
@app.route("/forecast", methods=["POST"])
def forecast():
    print("Routing script to forecast")
    
    request_data = request.get_json()

    model_name = request_data.get("ModelName")
    if not model_name or not isinstance(model_name, str) or model_name.strip() == "":
        return jsonify({"error": "Invalid or missing 'Model Name'."}), 400

    horizon_raw = request_data.get("Horizon")
    try:
        horizon = int(horizon_raw)
        if horizon <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid 'Horizon'. Must be a positive integer."}), 400

    model_to_forecast = model_cache.get_model(model_name)
    model_cache.print_model_names()

    if model_to_forecast is None:
        return jsonify({"error": f"Model '{model_name}' not found in cache."}), 404

    print(type(model_to_forecast))
    forecast = models.forecast(model_to_forecast, horizon)


    return jsonify(forecast), 200

@app.route("/backpredictions", methods=["POST"])
def backpredictions():

    request_data = request.get_json()
    model_name = request_data.get("ModelName")

    if not model_name or not isinstance(model_name, str) or model_name.strip() == "":
        return jsonify({"error": "Invalid or missing 'Model Name'."}), 400
    
    model = model_cache.get_model(model_name)
    model_cache.print_model_names()


    preds = models.back_predictions(model)
    
    return jsonify(preds), 200

@app.route("/save_model", methods=["POST"])
def save_model():
    try:
        request_data = request.get_json()
        model_name = str(request_data.get("ModelName"))
        id_token = str(request_data.get("token"))
        
        if not model_name:
            return jsonify({"error": "ModelName is required"}), 400
        if not id_token:
            return jsonify({"error": "Token is required"}), 400


        # Verify token and get user email
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]

        model = model_cache.get_model(model_name)
        if not model:
            return jsonify({"error": "Model not found in memory cache"}), 404

        database.store_model(uid, model_name, model)
        return jsonify({"success": True}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        print("Error saving model:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/remove_model", methods=["POST"])
def remove_model():
    request_data = request.get_json()
    model_name = str(request_data.get("ModelName"))
    if model_name is None:
        return jsonify({"error": "Invalid or missing 'Model Name'."}), 400

    model = model_cache.get_model(model_name)
    if not model:
        return jsonify({"error": "Model not found in memory cache"}), 404
    model_cache.remove_model(model_name)

    # Implement removal from db

    return jsonify({"success": f"Removed {model_name}"}), 200

if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
