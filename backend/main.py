from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from backend.auth.routes import router as auth_router
from backend.auth.google import router as google_router
from backend.profile.routes import router as profile_router
from backend.portfolio.routes import router as portfolio_router
from backend.auth.deps import get_current_user

from backend.signals.engine import generate_signal
from backend.analytics.regime import load_data, compute_features, detect_regime
from backend.risk.crash import crash_probability

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-session-key"
)


# --- Routers ---
app.include_router(auth_router)
app.include_router(google_router)
app.include_router(profile_router)
app.include_router(portfolio_router)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Core Endpoints ---
@app.get("/")
def root():
    return {"status": "Crypto Intelligence Engine running"}

@app.get("/signal")
def get_signal(user_id: str = Depends(get_current_user)):
    signal, confidence = generate_signal()
    return {"signal": signal, "confidence": confidence}

@app.get("/regime")
def get_regime(user_id: str = Depends(get_current_user)):
    df = load_data()
    df = compute_features(df)
    regime = detect_regime(df)
    return {"regime": regime}

@app.get("/risk")
def get_risk(user_id: str = Depends(get_current_user)):
    df = load_data().dropna()
    if len(df) < 10:
        return {"error": "Not enough data"}
    prob = crash_probability(df)
    return {"crash_probability": prob}

@app.get("/prices")
def get_prices(user_id: str = Depends(get_current_user)):
    df = load_data()
    return df.tail(50).to_dict(orient="records")
