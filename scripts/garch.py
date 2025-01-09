import os
import csv
import matplotlib.pyplot as plt


def main():
    print("main running")

    daily_rets = dict()

    cwd = os.getcwd()
    imput_path = os.path.join(cwd,"..", 'data', 'returns.csv')
    with open(imput_path, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            date = row[0]
            log_return = float(row[1])
            daily_rets[date] = log_return
    #print(daily_rets)

    plt.plot(list(daily_rets.keys()),list(daily_rets.values()))
    plt.show()

def get_residuals() -> list: 
    x=0

def calc_garch() -> dict:
    x=0

if __name__ == "__main__":
    main()