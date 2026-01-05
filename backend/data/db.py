import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="crypto_engine",
        user="postgres",
        password="Pg+5385+18"
    )
