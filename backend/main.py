from fastapi import FastAPI
from routes.account import router as account_router
from routes.portfolio import router as portfolio_router

app = FastAPI(
    title="TradeGuardian API",
    description="AI-powered trade verification and risk control system",
    version="0.1.0",
)
app.include_router(account_router)
app.include_router(portfolio_router)

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