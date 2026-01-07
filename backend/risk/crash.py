from fastapi import APIRouter
import random

router = APIRouter()

def crash_probability():
    prob = random.uniform(0.1, 0.6)
    if not 0 <= prob <= 1:
        prob = 0.0
    return prob

@router.get("/risk")
def get_risk():
    return {"crash_probability": crash_probability()}
