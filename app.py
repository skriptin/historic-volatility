from flask import Flask, render_template, request, jsonify
from scripts import fetch, sma, ewma, garch

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
def calc_garch():
    print("Routing to script to fetch_pacf()")

    request_data = request.get_json()
    returns = request_data.get('stock_returns')
        
    if not request_data:
        print("No JSON recieved for sma")
        return jsonify({"error": "Invalid request: No JSON recieved"}), 400

    if returns is None or not isinstance(returns, dict):
        print("Returns are null or invalid in form")
        return jsonify({"error": "Invalid request: No stock returns recieved"}, 400)

    response = garch.get_pacf(returns)

    if "error" in response:
        print(response)
        return jsonify({"error": response["error"]}), 400
    return jsonify(response), 200

if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
