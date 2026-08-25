from fastapi import FastAPI

app = FastAPI(
    title="TradeGuardian API",
    description="AI-powered trade verification and risk control system",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "TradeGuardian API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }