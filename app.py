from flask import Flask, render_template, request, jsonify
from scripts import fetch, sma

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/get_data", methods=["POST"])
def get_data():
    ticker = request.form.get("ticker")
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")

    response = fetch.fetch_returns(ticker, start_date, end_date)

    if "error" in response:
        return jsonify({"error": response["error"]}), 400

    return jsonify(response), 200



if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
