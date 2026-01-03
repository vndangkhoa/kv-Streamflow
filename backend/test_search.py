import hmac
import hashlib
import time
import requests
import sys

SECRET = "sf_tv_secure_9s8d7f6g5h4j3k2l1"
BASE_URL = "http://localhost:8000/api/rophim/search"

def extract_search(query):
    timestamp = str(int(time.time()))
    path = "/api/rophim/search"
    method = "GET"
    
    # Signature: timestamp + path + method
    payload = f"{timestamp}{path}{method}".encode()
    signature = hmac.new(SECRET.encode(), payload, hashlib.sha256).hexdigest()
    
    headers = {
        "X-Timestamp": timestamp,
        "X-Signature": signature
    }
    
    params = {
        "q": query,
        "limit": 10
    }
    
    print(f"Testing Search: '{query}'")
    try:
        resp = requests.get(BASE_URL, headers=headers, params=params)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            movies = data.get("movies", [])
            print(f"Found {len(movies)} results.")
            if movies:
                print(f"First result: {movies[0]['title']}")
        else:
            print(f"Error: {resp.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    q = sys.argv[1] if len(sys.argv) > 1 else "avengers"
    extract_search(q)
