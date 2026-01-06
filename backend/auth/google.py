import os
from fastapi import APIRouter, Request
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from backend.data.db import get_connection
from backend.auth.jwt import create_access_token
print("GOOGLE CLIENT ID:", os.getenv("GOOGLE_CLIENT_ID"))

router = APIRouter(prefix="/auth/google")

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"}
)

@router.get("/login")
async def login(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token["userinfo"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (user["email"],))
    existing = cur.fetchone()

    if not existing:
        cur.execute(
            "INSERT INTO users (email, hashed_password) VALUES (%s,%s) RETURNING id",
            (user["email"], "google")
        )
        user_id = cur.fetchone()[0]
        conn.commit()
    else:
        user_id = existing[0]

    jwt = create_access_token({"sub": str(user_id)})
    return RedirectResponse(f"http://localhost:3000?token={jwt}")
