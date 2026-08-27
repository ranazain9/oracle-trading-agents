"""
ORACLE Trading Agent - High-Speed Financial News Sentiment Scorer
"""
from typing import List, Dict, Any

class NewsSentimentScorer:
    """
    High-speed quantitative news sentiment analyzer.
    """

    @staticmethod
    def score_headlines(symbol: str, headlines: List[str]) -> Dict[str, Any]:
        """
        Fast keyword-weighted financial sentiment scoring engine.
        """
        if not headlines:
            return {
                "sentiment_score": 0.0,
                "sentiment_label": "NEUTRAL",
                "confidence": 0.5,
                "summary": "No recent headlines available."
            }

        text = " ".join(headlines).lower()
        bull_words = [
            "surge", "jump", "record", "beat", "high", "growth", "boost", 
            "gain", "rally", "shine", "boom", "upgrade", "outperform", "bull", "profit"
        ]
        bear_words = [
            "drop", "fall", "miss", "low", "loss", "crash", "plunge", 
            "concern", "worry", "risk", "down", "downgrade", "bear", "caution", "cut"
        ]

        bull_count = sum(1 for w in bull_words if w in text)
        bear_count = sum(1 for w in bear_words if w in text)

        diff = bull_count - bear_count
        score = max(min(diff * 0.35, 1.0), -1.0)

        if score >= 0.3:
            label = "MODERATE_BULLISH" if score < 0.7 else "STRONG_BULLISH"
        elif score <= -0.3:
            label = "MODERATE_BEARISH" if score > -0.7 else "STRONG_BEARISH"
        else:
            label = "NEUTRAL"

        return {
            "sentiment_score": round(score, 2),
            "sentiment_label": label,
            "confidence": 0.85,
            "summary": f"Detected {bull_count} positive and {bear_count} negative financial sentiment drivers."
        }
