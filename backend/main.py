from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.account import router as account_router
from routes.portfolio import router as portfolio_router
from routes.analyze import router as analyze_router
from routes.market import router as market_router
from routes.history import router as history_router
from routes.assets import router as assets_router
from routes.live import router as live_router
from routes.agents import router as agents_router




from core.database import initialize_database


initialize_database()


app = FastAPI(
    title="TradeGuardian API",
    description="AI-powered trade verification and risk control system",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://supreme-fortnight-g47pp96xvg7xh9wr-3000.app.github.dev",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(account_router)
app.include_router(portfolio_router)
app.include_router(analyze_router)
app.include_router(market_router)
app.include_router(history_router)
app.include_router(assets_router)
app.include_router(live_router)
app.include_router(agents_router)


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