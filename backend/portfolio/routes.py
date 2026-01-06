from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.auth.deps import get_current_user
from backend.data.db import get_connection

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

class Asset(BaseModel):
    asset: str
    allocation: float

@router.post("/")
def save_portfolio(assets: list[Asset], user_id: str = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("INSERT INTO portfolios (user_id) VALUES (%s) RETURNING id", (user_id,))
    pid = cur.fetchone()[0]

    for a in assets:
        cur.execute(
            "INSERT INTO portfolio_assets (portfolio_id, asset, allocation) VALUES (%s,%s,%s)",
            (pid, a.asset, a.allocation)
        )

    conn.commit()
    cur.close()
    conn.close()
    return {"status": "portfolio saved"}

@router.get("/")
def get_portfolio(user_id: str = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT a.asset, a.allocation
        FROM portfolios p
        JOIN portfolio_assets a ON p.id = a.portfolio_id
        WHERE p.user_id=%s
        ORDER BY p.id DESC LIMIT 1
    """, (user_id,))
    
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return [{"asset": r[0], "allocation": r[1]} for r in rows]
