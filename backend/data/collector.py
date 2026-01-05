import requests
import time
from db import get_connection

URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

def fetch_price():
    response = requests.get(URL)
    return response.json()["bitcoin"]["usd"]

def store_price(asset, price):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO prices (asset, price) VALUES (%s, %s)",
        (asset, price)
    )
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    while True:
        price = fetch_price()
        print("BTC:", price)
        store_price("BTC", price)
        time.sleep(10)
