from models.agent import (
    AgentTradeProposal,
)
from models.decision import (
    AnalysisResult,
    DecisionStatus,
    GuardianDecision,
    RiskCheckResult,
    RiskChecks,
    RiskCheckStatus,
    RiskMetrics,
)

from policies.risk_policy import (
    MAX_CONCENTRATION_PERCENT,
    MAX_TRADE_EXPOSURE_PERCENT,
    evaluate_risk,
)

from services.alpaca_service import (
    get_account,
    get_positions,
)


def evaluate_trade(
    proposal: AgentTradeProposal,
) -> AnalysisResult:
    """
    Evaluate an options trade proposal against
    the TradeGuardian risk controls.
    """

    account = get_account()

    account_equity = float(
        account.equity
    )

    buying_power = float(
        account.buying_power
    )

    option_contract = (
        proposal.option_contract
    )

    trade_cost = round(
        option_contract.estimated_premium
        * 100
        * option_contract.quantity,
        2,
    )

    trade_percent_of_equity = round(
        (
            trade_cost
            / account_equity
            * 100
        ),
        4,
    )

    positions = get_positions()

    existing_quantity = 0.0
    existing_position_value = 0.0

    for position in positions:

        if (
            position.symbol
            == option_contract.symbol
        ):
            existing_quantity = float(
                position.qty
            )

            existing_position_value = abs(
                float(
                    position.market_value
                )
            )

            break

    projected_quantity = (
        existing_quantity
        + option_contract.quantity
    )

    projected_position_value = round(
        existing_position_value
        + trade_cost,
        2,
    )

    projected_concentration_percent = round(
        (
            projected_position_value
            / account_equity
            * 100
        ),
        4,
    )

    # ----------------------------------------
    # Exposure check
    # ----------------------------------------

    exposure_status = (
        RiskCheckStatus.PASS
        if (
            trade_percent_of_equity
            <= MAX_TRADE_EXPOSURE_PERCENT
        )
        else RiskCheckStatus.FAIL
    )

    exposure_check = RiskCheckResult(
        status=exposure_status,
        reason=(
            f"Trade exposure is "
            f"{trade_percent_of_equity:.2f}% "
            f"of account equity."
        ),
    )

    # ----------------------------------------
    # Concentration check
    # ----------------------------------------

    concentration_status = (
        RiskCheckStatus.PASS
        if (
            projected_concentration_percent
            <= MAX_CONCENTRATION_PERCENT
        )
        else RiskCheckStatus.FAIL
    )

    concentration_check = (
        RiskCheckResult(
            status=concentration_status,
            reason=(
                f"Projected concentration is "
                f"{projected_concentration_percent:.2f}% "
                f"of account equity."
            ),
        )
    )

    # ----------------------------------------
    # Buying power check
    # ----------------------------------------

    buying_power_status = (
        RiskCheckStatus.PASS
        if trade_cost <= buying_power
        else RiskCheckStatus.FAIL
    )

    buying_power_check = (
        RiskCheckResult(
            status=buying_power_status,
            reason=(
                f"Trade requires "
                f"${trade_cost:.2f} "
                f"of buying power. "
                f"Available buying power is "
                f"${buying_power:.2f}."
            ),
        )
    )

    # ----------------------------------------
    # Position check
    # ----------------------------------------

    position_status = (
        RiskCheckStatus.PASS
        if existing_quantity == 0
        else RiskCheckStatus.FAIL
    )

    position_check = RiskCheckResult(
        status=position_status,
        reason=(
            "No existing position in the "
            "proposed option contract."
            if existing_quantity == 0
            else (
                f"Existing position of "
                f"{existing_quantity} contracts "
                f"found in "
                f"{option_contract.option_symbol}."
            )
        ),
    )

    risk_checks = RiskChecks(
        exposure=exposure_check,
        concentration=concentration_check,
        buying_power=buying_power_check,
        position=position_check,
    )

    # ----------------------------------------
    # Policy evaluation
    # ----------------------------------------

    decision = evaluate_risk(
        trade_exposure_percent=(
            trade_percent_of_equity
        ),
        projected_concentration_percent=(
            projected_concentration_percent
        ),
    )

    # A failed hard operational check
    # cannot remain approved.
    if (
        buying_power_status
        == RiskCheckStatus.FAIL
        or position_status
        == RiskCheckStatus.FAIL
    ):
        reasons = list(
            decision.reasons
        )

        if (
            buying_power_status
            == RiskCheckStatus.FAIL
        ):
            reasons.append(
                buying_power_check.reason
            )

        if (
            position_status
            == RiskCheckStatus.FAIL
        ):
            reasons.append(
                position_check.reason
            )

        decision = GuardianDecision(
            status=DecisionStatus.BLOCKED,
            reasons=reasons,
        )

    risk_metrics = RiskMetrics(
        existing_quantity=(
            existing_quantity
        ),
        projected_quantity=(
            projected_quantity
        ),
        account_equity=(
            account_equity
        ),
        buying_power=(
            buying_power
        ),
        trade_percent_of_equity=(
            trade_percent_of_equity
        ),
        existing_position_value=(
            existing_position_value
        ),
        projected_position_value=(
            projected_position_value
        ),
        projected_concentration_percent=(
            projected_concentration_percent
        ),
    )

    return AnalysisResult(
        message=(
            "TradeGuardian risk analysis "
            "completed."
        ),
        proposal=proposal.model_dump(
            mode="json"
        ),
        risk_metrics=risk_metrics,
        risk_checks=risk_checks,
        decision=decision,
    )