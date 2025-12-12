from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

app = FastAPI()

class HistoryPoint(BaseModel):
    ts: str   # ISO
    price_krw: float

class ForecastRequest(BaseModel):
    product_id: str
    history: List[HistoryPoint]
    steps: int = 14

class ForecastResponse(BaseModel):
    product_id: str
    horizon_days: int
    forecast: Dict[str, float]  # ts -> price_krw

def build_series(history: List[HistoryPoint]) -> pd.Series:
    if not history:
        raise ValueError("History is empty")
    df = pd.DataFrame([{"ts": h.ts, "price": h.price_krw} for h in history])
    df["ts"] = pd.to_datetime(df["ts"])
    df = df.sort_values("ts")
    s = df.set_index("ts")["price"]
    return s

@app.post("/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest):
    s = build_series(req.history)

    model = SARIMAX(s, order=(1,1,1), seasonal_order=(1,1,1,7))
    res = model.fit(disp=False)

    pred = res.get_forecast(steps=req.steps)
    mean = pred.predicted_mean
    out = {ts.isoformat(): float(value) for ts, value in mean.items()}

    return ForecastResponse(
        product_id=req.product_id,
        horizon_days=req.steps,
        forecast=out,
    )

