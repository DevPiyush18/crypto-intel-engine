from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "Crypto Intelligence Engine is running"}
