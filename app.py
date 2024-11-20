from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('index.html')

def get_daily_rets():
    x=5
def get_SMA()
    x=5
def get_EWMA()
    x=5


if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
