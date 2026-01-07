from backend.db import get_db

def get_user_portfolio(user_id: int):
    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT asset, allocation
        FROM portfolio_assets pa
        JOIN portfolios p ON pa.portfolio_id = p.id
        WHERE p.user_id = %s
    """, (user_id,))

    rows = cur.fetchall()
    cur.close()
    db.close()

    portfolio = {asset: allocation for asset, allocation in rows}
    return portfolio
