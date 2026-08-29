# TradeGuardian risk thresholds
from models.decision import DecisionStatus, GuardianDecision

MAX_TRADE_EXPOSURE_PERCENT = 15.0
FLAG_TRADE_EXPOSURE_PERCENT = 5.0

MAX_CONCENTRATION_PERCENT = 25.0
FLAG_CONCENTRATION_PERCENT = 10.0


def evaluate_risk(
    trade_exposure_percent: float,
    projected_concentration_percent: float,
) -> GuardianDecision:
    """
    Evaluate a proposed trade against TradeGuardian risk policies.

    Returns APPROVED, FLAGGED, or BLOCKED along with reasons.
    """

    reasons = []
    decision = "APPROVED"

    # Individual trade exposure
    if trade_exposure_percent > MAX_TRADE_EXPOSURE_PERCENT:
        decision = "BLOCKED"

        reasons.append(
            f"Trade exposure is {trade_exposure_percent}% "
            f"which exceeds the maximum allowed "
            f"{MAX_TRADE_EXPOSURE_PERCENT}%."
        )

    elif trade_exposure_percent > FLAG_TRADE_EXPOSURE_PERCENT:
        if decision != "BLOCKED":
            decision = "FLAGGED"

        reasons.append(
            f"Trade exposure is {trade_exposure_percent}% "
            f"which exceeds the warning threshold "
            f"{FLAG_TRADE_EXPOSURE_PERCENT}%."
        )

    # Portfolio concentration
    if projected_concentration_percent > MAX_CONCENTRATION_PERCENT:
        decision = "BLOCKED"

        reasons.append(
            f"Projected concentration is "
            f"{projected_concentration_percent}% which exceeds "
            f"the maximum allowed "
            f"{MAX_CONCENTRATION_PERCENT}%."
        )

    elif projected_concentration_percent > FLAG_CONCENTRATION_PERCENT:
        if decision != "BLOCKED":
            decision = "FLAGGED"

        reasons.append(
            f"Projected concentration is "
            f"{projected_concentration_percent}% which exceeds "
            f"the warning threshold "
            f"{FLAG_CONCENTRATION_PERCENT}%."
        )

    if not reasons:
        reasons.append(
            "Trade is within the current TradeGuardian risk limits."
        )

    return GuardianDecision(
        status=DecisionStatus(decision),
        reasons=reasons,
    )