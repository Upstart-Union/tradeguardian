from fastapi import APIRouter

from models.trade import TradeProposal
from services.alpaca_service import (
    get_account,
    get_latest_price,
    get_positions,
)
from policies.risk_policy import evaluate_risk
from models.decision import (
    AnalysisResult,
    DecisionStatus,
    GuardianDecision,
    RiskMetrics,
)
from services.history_service import save_analysis

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

    trade_percent_of_equity = round(
        (trade_value / account_equity) * 100,
        2,
    )

    existing_position_value = 0.0
    existing_quantity = 0.0

    for position in positions:
        if position.symbol.upper() == symbol:
            existing_position_value = float(position.market_value)
            existing_quantity = float(position.qty)
            break

    if proposal.side.value == "buy":
        projected_quantity = (
            existing_quantity + proposal.quantity
        )

        projected_position_value = (
            existing_position_value + trade_value
        )

    else:
        projected_quantity = max(
            0,
            existing_quantity - proposal.quantity,
        )

        projected_position_value = max(
            0,
            existing_position_value - trade_value,
        )

    sell_validation = None

    if proposal.side.value == "sell":
        if proposal.quantity > existing_quantity:
            sell_validation = {
                "valid": False,
                "reason": (
                    f"Cannot sell {proposal.quantity} shares of "
                    f"{symbol}. Only {existing_quantity} shares "
                    f"are currently held."
                ),
            }
        else:
            sell_validation = {
                "valid": True,
                "reason": "Sell quantity is within the current position.",
            }

    projected_concentration_percent = round(
        (projected_position_value / account_equity) * 100,
        2,
    )
    
    if proposal.side.value == "buy":
        risk_decision = evaluate_risk(
            trade_exposure_percent=trade_percent_of_equity,
            projected_concentration_percent=(
                projected_concentration_percent
            ),
        )
    else:
        risk_decision = GuardianDecision(
            status=DecisionStatus.APPROVED,
            reasons=[
                "Sell order reduces the existing position and "
                "does not increase portfolio exposure."
            ],
        )

    if sell_validation and not sell_validation["valid"]:
        risk_decision = GuardianDecision(
            status=DecisionStatus.BLOCKED,
            reasons=[
                sell_validation["reason"],
            ],
        )

    result = AnalysisResult(
        message="Trade proposal analyzed",

        proposal={
            "symbol": symbol,
            "side": proposal.side.value,
            "quantity": proposal.quantity,
            "current_price": price,
            "trade_value": trade_value,
        },

        risk_metrics=RiskMetrics(
            existing_quantity=existing_quantity,
            projected_quantity=projected_quantity,

            account_equity=account_equity,
            trade_percent_of_equity=trade_percent_of_equity,

            existing_position_value=existing_position_value,
            projected_position_value=round(
                projected_position_value,
                2,
            ),

            projected_concentration_percent=(
                projected_concentration_percent
            ),
        ),

        decision=risk_decision,
    )

    save_analysis(result)

    return result