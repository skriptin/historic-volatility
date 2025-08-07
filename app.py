from flask import Flask, render_template, request, jsonify, send_file
from scripts import fetch, sma, ewma, garch
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

@app.route("/fit_garch", methods=["POST"])
def fit_garch():
    print("Routing to script /fit_garch")
    request_data = request.get_json()

    if not request_data:
        print("No JSON recieved for garch")
        return jsonify({"error": "Invalid request: No JSON recieved"}), 400

    try:
        returns = dict(request_data.get('stock_returns'))  
        p = int(request_data.get('p', 1))
        q = int(request_data.get('q', 1))
        mean = str(request_data.get('mean', 'Constant'))
        model = str(request_data.get('model', 'GARCH'))
        lags = int(request_data.get('lags', 0))
        o = int(request_data.get('o', 0))
        distribution = request_data.get('distribution', 'normal')
        model_name = request_data.get('model_name', 'my_garch_model')
    except (ValueError, TypeError) as e:
        print(f"Error parsing request data: {e}")
        return jsonify({"error": "Invalid request data"}), 400

    if not returns:
        return jsonify({"error": "Missing or invalid 'stock_returns' in request"}), 400

    result = garch_fit(
        returns=returns,
        p=p,
        q=q,
        mean=mean,
        model=model,
        lags=lags,
        o=o,
        distribution=distribution
        model_name=model_name
    )
    with model_store_lock:
        model_store[model_name] = result

    return jsonify({"message": "GARCH model fitted successfully", "model_summary": result.summary()}), 200
    


if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
