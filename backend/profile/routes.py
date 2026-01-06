from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.auth.deps import get_current_user
from backend.data.db import get_connection

router = APIRouter(prefix="/profile", tags=["profile"])

class Profile(BaseModel):
    risk: str
    horizon: str
    strategy: str

@router.post("/")
def save_profile(profile: Profile, user_id: str = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM user_profiles WHERE user_id=%s", (user_id,))
    cur.execute(
        "INSERT INTO user_profiles (user_id, risk, horizon, strategy) VALUES (%s,%s,%s,%s)",
        (user_id, profile.risk, profile.horizon, profile.strategy)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "profile saved"}

@router.get("/")
def get_profile(user_id: str = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT risk, horizon, strategy FROM user_profiles WHERE user_id=%s", (user_id,))
    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row:
        return {}
    return {"risk": row[0], "horizon": row[1], "strategy": row[2]}
