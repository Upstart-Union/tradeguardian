from fastapi import APIRouter

from models.trade import TradeProposal
from services.alpaca_service import get_latest_price

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"],
)


@router.post("/")
def analyze_trade(proposal: TradeProposal):
    price = round(get_latest_price(proposal.symbol), 2)

    trade_value = round(price * proposal.quantity, 2)

    return {
        "message": "Trade proposal analyzed",
        "proposal": {
            "symbol": proposal.symbol.upper(),
            "side": proposal.side.value,
            "quantity": proposal.quantity,
            "current_price": price,
            "trade_value": trade_value,
        },
    }