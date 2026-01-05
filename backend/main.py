from fastapi import FastAPI
from backend.signals.engine import generate_signal
from backend.analytics.regime import load_data, compute_features, detect_regime
from backend.risk.crash import crash_probability

app = FastAPI()

@app.get("/")
def root():
    return {"status": "Crypto Intelligence Engine running"}

@app.get("/signal")
def get_signal():
    signal, confidence = generate_signal()
    return {"signal": signal, "confidence": confidence}

@app.get("/regime")
def get_regime():
    df = load_data()
    df = compute_features(df)
    regime = detect_regime(df)
    return {"regime": regime}

@app.get("/risk")
def get_risk():
    df = load_data()
    df = df.dropna()
    if len(df) < 10:
        return {"error": "Not enough data"}
    prob = crash_probability(df)
    return {"crash_probability": prob}
