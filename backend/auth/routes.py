from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.data.db import get_connection
from backend.auth.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserCreate):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (user.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    cur.execute("INSERT INTO users (email, hashed_password) VALUES (%s, %s)", (user.email, hashed))
    conn.commit()
    cur.close()
    conn.close()

    return {"message": "User created"}

@router.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, hashed_password FROM users WHERE email=%s", (user.email,))
    result = cur.fetchone()
    if not result:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    user_id, hashed = result
    if not verify_password(user.password, hashed):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": str(user_id)})
    return {"access_token": token, "token_type": "bearer"}
