from fastapi import APIRouter

from models.trade import TradeProposal
from services.alpaca_service import get_account, get_latest_price

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"],
)


@router.post("/")
def analyze_trade(proposal: TradeProposal):
    account = get_account()

    account_equity = float(account.equity)

    price = round(get_latest_price(proposal.symbol), 2)
    trade_value = round(price * proposal.quantity, 2)

    trade_exposure_percent = round(
        (trade_value / account_equity) * 100,
        2,
    )

    return {
        "message": "Trade proposal analyzed",
        "proposal": {
            "symbol": proposal.symbol.upper(),
            "side": proposal.side.value,
            "quantity": proposal.quantity,
            "current_price": price,
            "trade_value": trade_value,
        },
        "risk_metrics": {
            "account_equity": account_equity,
            "trade_exposure_percent": trade_exposure_percent,
        },
    }