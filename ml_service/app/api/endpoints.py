from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.matcher import matcher
from app.core.forecaster import forecaster

router = APIRouter()

class MatchRequest(BaseModel):
    title: str
    image_url: Optional[str] = None

class ForecastRequest(BaseModel):
    price_history: List[float]

@router.post("/match/sku")
def match_sku(request: MatchRequest):
    try:
        results = matcher.match(request.title, request.image_url or "")
        return {"matches": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/price")
def predict_price(request: ForecastRequest):
    try:
        result = forecaster.forecast(request.price_history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
