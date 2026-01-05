import pandas as pd
from backend.data.db import get_connection

def load_data():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM prices ORDER BY timestamp", conn)
    conn.close()
    return df

def compute_features(df):
    df["returns"] = df["price"].pct_change()
    df["volatility"] = df["returns"].rolling(5).std()
    df["momentum"] = df["returns"].rolling(5).mean()
    return df

def detect_regime(df):
    df = df.dropna()
    
    if len(df) == 0:
        return "Not enough data yet"

    vol = df["volatility"].iloc[-1]

    if vol > 0.01:
        return "High Volatility"
    elif vol > 0.005:
        return "Medium Volatility"
    else:
        return "Low Volatility"

if __name__ == "__main__":
    df = load_data()
    df = compute_features(df)
    regime = detect_regime(df)
    print("Current Market Regime:", regime)
