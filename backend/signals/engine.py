from backend.portfolio.service import get_user_portfolio
from backend.data.db import get_connection
from backend.analytics.regime import load_data, compute_features, detect_regime
from backend.risk.crash import crash_probability
import numpy as np

def get_user_profile(user_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT risk, horizon, strategy FROM user_profiles WHERE user_id=%s", (user_id,))
    row = cur.fetchone()
    return row or ("Medium", "Mid", "Balanced")

def get_portfolio_exposure(user_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT SUM(allocation) FROM portfolio_assets pa
        JOIN portfolios p ON pa.portfolio_id=p.id
        WHERE p.user_id=%s
    """, (user_id,))
    val = cur.fetchone()[0]
    return val or 0

def generate_signal(user_id: int):
    df = load_data()
    df = compute_features(df)
    regime = detect_regime(df)

    portfolio = get_user_portfolio(user_id)

    btc_exposure = portfolio.get("BTC", 0)

    # --- Base signal from market regime ---
    if regime == "Bull":
        base_signal = "BUY"
        confidence = 0.75
    elif regime == "Bear":
        base_signal = "SELL"
        confidence = 0.75
    else:
        base_signal = "HOLD"
        confidence = 0.5

    # --- Portfolio intelligence layer ---
    if base_signal == "BUY" and btc_exposure > 0.6:
        return "HOLD", 0.9

    if base_signal == "SELL" and btc_exposure < 0.1:
        return "HOLD", 0.85

    return base_signal, confidence

