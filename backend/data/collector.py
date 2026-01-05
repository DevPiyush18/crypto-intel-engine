import requests
import time

URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

def fetch_price():
    response = requests.get(URL)
    return response.json()

if __name__ == "__main__":
    while True:
        price = fetch_price()
        print(price)
        time.sleep(10)
