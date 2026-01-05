from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.signals.engine import generate_signal
from backend.analytics.regime import load_data, compute_features, detect_regime
from backend.risk.crash import crash_probability

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/prices")
def get_prices():
    df = load_data()
    return df.tail(50).to_dict(orient="records")
