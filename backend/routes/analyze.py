from fastapi import APIRouter

from models.trade import TradeProposal
from services.alpaca_service import (
    get_account,
    get_latest_price,
    get_positions,
)

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"],
)


@router.post("/")
def analyze_trade(proposal: TradeProposal):
    account = get_account()
    positions = get_positions()

    account_equity = float(account.equity)

    symbol = proposal.symbol.upper()
    price = round(get_latest_price(symbol), 2)
    trade_value = round(price * proposal.quantity, 2)

    trade_exposure_percent = round(
        (trade_value / account_equity) * 100,
        2,
    )

    existing_position_value = 0.0

    for position in positions:
        if position.symbol.upper() == symbol:
            existing_position_value = float(position.market_value)
            break

    if proposal.side.value == "buy":
        projected_position_value = (
            existing_position_value + trade_value
        )
    else:
        projected_position_value = max(
            0,
            existing_position_value - trade_value,
        )

    projected_concentration_percent = round(
        (projected_position_value / account_equity) * 100,
        2,
    )

    return {
        "message": "Trade proposal analyzed",
        "proposal": {
            "symbol": symbol,
            "side": proposal.side.value,
            "quantity": proposal.quantity,
            "current_price": price,
            "trade_value": trade_value,
        },
        "risk_metrics": {
            "account_equity": account_equity,
            "trade_exposure_percent": trade_exposure_percent,
            "existing_position_value": existing_position_value,
            "projected_position_value": round(
                projected_position_value,
                2,
            ),
            "projected_concentration_percent": (
                projected_concentration_percent
            ),
        },
    }