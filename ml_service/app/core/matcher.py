from typing import List, Dict

class SKUMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def match(self, target_title: str, candidates: list[str]) -> dict:
        if not candidates:
            return {"match": None, "score": 0.0}

        # Combine target and candidates for vectorization
        all_texts = [target_title] + candidates
        tfidf_matrix = self.vectorizer.fit_transform(all_texts)

        # Calculate cosine similarity between target (index 0) and candidates (index 1..)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        # Find best match
        best_idx = cosine_sim.argmax()
        best_score = float(cosine_sim[best_idx])

        if best_score > 0.3: # Threshold
            return {
                "match": candidates[best_idx],
                "score": best_score
            }
        
        return {"match": None, "score": best_score}

matcher = SKUMatcher()
