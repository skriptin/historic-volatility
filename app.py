from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def hello_world():
    print("Function executed")
    #return render_template('index.html')
    return render_template('index.html')

if __name__ == '__main__':
    print("Starting Flask app")
    app.run(debug=True)
