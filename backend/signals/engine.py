import pandas as pd
from backend.analytics.regime import load_data, compute_features, detect_regime
from backend.risk.crash import crash_probability

def generate_signal():
    df = load_data()
    df = compute_features(df)
    regime = detect_regime(df)

    df = df.dropna()
    if len(df) < 10:
        return "HOLD", 0.0

    prob = crash_probability(df)

    if regime == "High Volatility" and prob > 0.3:
        return "SELL", round(prob, 2)
    elif regime == "Low Volatility" and prob < 0.1:
        return "BUY", round(1 - prob, 2)
    else:
        return "HOLD", round(0.5, 2)

if __name__ == "__main__":
    signal, confidence = generate_signal()
    print("Trade Signal:", signal)
    print("Confidence:", confidence)
