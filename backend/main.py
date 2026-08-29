from fastapi import FastAPI

from routes.account import router as account_router
from routes.portfolio import router as portfolio_router
from routes.analyze import router as analyze_router
from routes.history import router as history_router


app = FastAPI(
    title="TradeGuardian API",
    description="AI-powered trade verification and risk control system",
    version="0.1.0",
)


app.include_router(account_router)
app.include_router(portfolio_router)
app.include_router(analyze_router)
app.include_router(history_router)


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