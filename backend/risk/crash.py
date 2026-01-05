import pandas as pd
import numpy as np
from backend.data.db import get_connection

def load_data():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM prices ORDER BY timestamp", conn)
    conn.close()
    return df

def compute_returns(df):
    df["returns"] = df["price"].pct_change()
    return df.dropna()

def crash_probability(df):
    # Using historical extreme loss estimation
    threshold = df["returns"].quantile(0.05)
    crashes = df[df["returns"] <= threshold]
    prob = len(crashes) / len(df)
    return round(prob, 4)

def value_at_risk(df, confidence=0.95):
    return np.quantile(df["returns"], 1 - confidence)

if __name__ == "__main__":
    df = load_data()
    df = compute_returns(df)

    if len(df) < 10:
        print("Not enough data for risk estimation")
    else:
        prob = crash_probability(df)
        var = value_at_risk(df)
        print("Crash Probability:", prob)
        print("Value at Risk:", var)
