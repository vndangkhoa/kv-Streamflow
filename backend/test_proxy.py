import requests
import sys

try:
    url = "http://localhost:8000/api/images/proxy"
    params = {
        "url": "https://placehold.co/600x400.png",
        "width": 300
    }
    print(f"Testing {url} with params {params}...")
    response = requests.get(url, params=params)
    
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"Content-Length: {len(response.content)}")
    
    if response.status_code == 200 and response.headers.get('content-type') == 'image/webp':
        print("SUCCESS: Image proxy is working!")
        sys.exit(0)
    else:
        print("FAILURE: Image proxy failed.")
        print(f"Response: {response.text[:200]}")
        sys.exit(1)
except Exception as e:
    print(f"EXCEPTION: {e}")
    sys.exit(1)
