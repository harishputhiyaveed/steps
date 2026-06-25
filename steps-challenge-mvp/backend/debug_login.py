"""
Add debug logging to login endpoint
"""
import sys
sys.path.insert(0, '/Users/harish/galaxium-travels/steps-challenge-mvp/backend')

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json

# Monkey patch to add logging
original_login = None

def log_request_body(app):
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        if request.url.path == "/api/auth/login" and request.method == "POST":
            body = await request.body()
            print(f"\n=== LOGIN REQUEST ===")
            print(f"Body: {body.decode()}")
            try:
                data = json.loads(body.decode())
                print(f"Parsed: {data}")
                print(f"Email: '{data.get('email')}'")
                print(f"Password: '{data.get('password')}'")
            except:
                pass
            print(f"===================\n")
            
            # Recreate request with body
            from starlette.requests import Request as StarletteRequest
            async def receive():
                return {"type": "http.request", "body": body}
            request = StarletteRequest(request.scope, receive)
        
        response = await call_next(request)
        return response

if __name__ == "__main__":
    print("This script should be imported, not run directly")

# Made with Bob
