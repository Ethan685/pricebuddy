from fastapi import FastAPI
from app.api import endpoints

app = FastAPI(title="PriceBuddy AI Service", version="1.0.0")

app.include_router(endpoints.router)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "pricebuddy-ai"}
