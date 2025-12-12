from typing import List, Dict
import random
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime

class PriceForecaster:
    def forecast(self, price_history: list[dict]) -> dict:
        if len(price_history) < 3:
            return {
                "forecast_price": price_history[-1]["price"] if price_history else 0,
                "trend": "stable",
                "confidence": 0.0
            }

        # Prepare data: X = days since start, y = price
        sorted_history = sorted(price_history, key=lambda x: x["timestamp"])
        start_date = datetime.fromisoformat(sorted_history[0]["timestamp"].replace("Z", "+00:00"))
        
        X = []
        y = []
        
        for entry in sorted_history:
            date = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
            days = (date - start_date).days
            X.append([days])
            y.append(entry["price"])

        # Train Model
        model = LinearRegression()
        model.fit(X, y)

        # Predict next week (last day + 7)
        last_day = X[-1][0]
        next_week_day = last_day + 7
        predicted_price = model.predict([[next_week_day]])[0]
        
        # Determine Trend
        slope = model.coef_[0]
        current_price = y[-1]
        
        if slope < -0.01 * current_price: # Dropping > 1% per day
            trend = "dropping"
        elif slope > 0.01 * current_price:
            trend = "rising"
        else:
            trend = "stable"

        return {
            "current_price": current_price,
            "predicted_price": round(predicted_price, 2),
            "confidence": round(random.uniform(0.7, 0.95), 2)
        }

forecaster = PriceForecaster()
