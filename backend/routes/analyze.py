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
    RiskCheckStatus,
    RiskCheckResult,
    RiskChecks,
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
    buying_power = float(account.buying_power)

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

    # Calculate projected position after the proposed trade
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

    # Validate sell quantity
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
                "reason": (
                    "Sell quantity is within the current position."
                ),
            }

    # Calculate projected portfolio concentration
    projected_concentration_percent = round(
        (projected_position_value / account_equity) * 100,
        2,
    )

    # -------------------------------------------------
    # Individual risk checks
    # -------------------------------------------------

    MAX_TRADE_EXPOSURE_PERCENT = 10.0
    MAX_CONCENTRATION_PERCENT = 25.0

    # Exposure check
    exposure_pass = (
        trade_percent_of_equity
        <= MAX_TRADE_EXPOSURE_PERCENT
    )

    exposure_check = RiskCheckResult(
        status=(
            RiskCheckStatus.PASS
            if exposure_pass
            else RiskCheckStatus.FAIL
        ),
        reason=(
            f"Trade exposure is "
            f"{trade_percent_of_equity:.2f}% of account equity."
            if exposure_pass
            else (
                f"Trade exposure of "
                f"{trade_percent_of_equity:.2f}% exceeds the "
                f"{MAX_TRADE_EXPOSURE_PERCENT:.2f}% limit."
            )
        ),
    )


    # Concentration check
    concentration_pass = (
        projected_concentration_percent
        <= MAX_CONCENTRATION_PERCENT
    )

    concentration_check = RiskCheckResult(
        status=(
            RiskCheckStatus.PASS
            if concentration_pass
            else RiskCheckStatus.FAIL
        ),
        reason=(
            f"Projected position concentration is "
            f"{projected_concentration_percent:.2f}%."
            if concentration_pass
            else (
                f"Projected concentration of "
                f"{projected_concentration_percent:.2f}% "
                f"exceeds the "
                f"{MAX_CONCENTRATION_PERCENT:.2f}% limit."
            )
        ),
    )


    # Buying power check
    buying_power_pass = (
        proposal.side.value == "sell"
        or trade_value <= buying_power
    )

    buying_power_check = RiskCheckResult(
        status=(
            RiskCheckStatus.PASS
            if buying_power_pass
            else RiskCheckStatus.FAIL
        ),
        reason=(
            "Sell orders do not require additional buying power."
            if proposal.side.value == "sell"
            else (
                f"Trade requires ${trade_value:,.2f}, "
                f"within available buying power of "
                f"${buying_power:,.2f}."
                if buying_power_pass
                else (
                    f"Trade requires ${trade_value:,.2f}, "
                    f"but only ${buying_power:,.2f} "
                    f"is available."
                )
            )
        ),
    )


    # Position / sell validation check
    if proposal.side.value == "sell":

        position_pass = (
            sell_validation is not None
            and sell_validation["valid"]
        )

        position_reason = (
            sell_validation["reason"]
            if sell_validation
            else "Position validation completed."
        )

    else:

        position_pass = True

        position_reason = (
            f"Projected position will be "
            f"{projected_quantity} shares."
        )

    position_check = RiskCheckResult(
        status=(
            RiskCheckStatus.PASS
            if position_pass
            else RiskCheckStatus.FAIL
        ),
        reason=position_reason,
    )


    risk_checks = RiskChecks(
        exposure=exposure_check,
        concentration=concentration_check,
        buying_power=buying_power_check,
        position=position_check,
    )

    # Evaluate the trade
    if proposal.side.value == "buy":
        risk_decision = evaluate_risk(
            trade_exposure_percent=trade_percent_of_equity,
            projected_concentration_percent=(
                projected_concentration_percent
            ),
        )

        # Buying power validation
        if trade_value > buying_power:
            risk_decision = GuardianDecision(
                status=DecisionStatus.BLOCKED,
                reasons=[
                    f"Trade value of ${trade_value:,.2f} exceeds "
                    f"available buying power of "
                    f"${buying_power:,.2f}."
                ],
            )

    else:
        risk_decision = GuardianDecision(
            status=DecisionStatus.APPROVED,
            reasons=[
                "Sell order reduces the existing position and "
                "does not increase portfolio exposure."
            ],
        )

    # Oversell protection takes priority
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
            buying_power=buying_power,
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
        risk_checks=risk_checks,
        decision=risk_decision,
    )

    save_analysis(result)

    return result