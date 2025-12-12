from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

app = FastAPI()

# 모델 로딩
SENTIMENT_MODEL_NAME = "nlptown/bert-base-multilingual-uncased-sentiment"
tok = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_NAME)

# Pydantic 모델
class AnalyzeRequest(BaseModel):
    product_id: str
    reviews: List[str]
    language: str = "ko"

class AnalyzeResponse(BaseModel):
    product_id: str
    sentiment_score: float
    pros: List[str]
    cons: List[str]
    risk_factors: List[str]

# 감성 분석 함수
def sentiment_score(texts: List[str]) -> float:
    if not texts:
        return 0.0
    scores = []
    for t in texts:
        inputs = tok(t[:512], return_tensors="pt", truncation=True)
        with torch.no_grad():
            out = model(**inputs)
            probs = out.logits.softmax(dim=-1).squeeze().cpu().numpy()
        # 모델은 1~5 별점이라 가정 -> -1~1로 정규화
        stars = (probs * np.arange(1,6)).sum()
        norm = (stars - 3) / 2  # 1→-1, 3→0, 5→+1
        scores.append(norm)
    return float(np.mean(scores))

# 키워드 추출
def extract_keywords(texts: List[str], top_k: int = 10) -> List[str]:
    if not texts:
        return []
    vec = TfidfVectorizer(max_features=2000, ngram_range=(1,2))
    X = vec.fit_transform(texts)
    scores = np.asarray(X.sum(axis=0)).ravel()
    idxs = scores.argsort()[::-1][:top_k]
    vocab = np.array(vec.get_feature_names_out())
    return vocab[idxs].tolist()

# pros/cons/risk 분류
POSITIVE_HINTS = ["좋", "만족", "짱", "굿", "추천"]
NEGATIVE_HINTS = ["별로", "불만", "실망", "후회", "나쁘", "문제"]
RISK_HINTS     = ["불량", "고장", "환불", "반품", "위험"]

def split_pros_cons(texts: List[str]) -> Dict[str, List[str]]:
    pros, cons, risk = [], [], []
    for t in texts:
        lowered = t.lower()
        if any(h in lowered for h in RISK_HINTS):
            risk.append(t)
        elif any(h in lowered for h in NEGATIVE_HINTS):
            cons.append(t)
        elif any(h in lowered for h in POSITIVE_HINTS):
            pros.append(t)
    return {"pros": pros, "cons": cons, "risk": risk}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    s_score = sentiment_score(req.reviews)
    split = split_pros_cons(req.reviews)

    # 대표 키워드
    keywords = extract_keywords(req.reviews, top_k=20)

    def summarize_list(items: List[str], max_items: int = 3) -> List[str]:
        return items[:max_items]

    return AnalyzeResponse(
        product_id=req.product_id,
        sentiment_score=s_score,
        pros=summarize_list(split["pros"]),
        cons=summarize_list(split["cons"]),
        risk_factors=summarize_list(split["risk"]),
    )

