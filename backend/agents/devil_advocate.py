from models.agent import (
    DevilAdvocateReview,
    MarketDirection,
    MarketOpportunity,
)


def review_opportunity(
    opportunity: MarketOpportunity,
) -> DevilAdvocateReview:
    """
    Challenge a market opportunity by looking
    for reasons the proposed directional thesis
    could fail.
    """

    concerns = []

    risk_score = 20.0

    if opportunity.confidence >= 90:
        concerns.append(
            "Very high confidence can indicate "
            "the momentum signal may be extended."
        )

        risk_score += 20

    if opportunity.confidence >= 75:
        concerns.append(
            "Strong recent momentum may reverse "
            "after an extended move."
        )

        risk_score += 15

    if (
        opportunity.direction
        == MarketDirection.BULLISH
    ):
        concerns.append(
            "A bullish thesis can fail if the "
            "underlying loses momentum or breaks "
            "below recent support."
        )

    elif (
        opportunity.direction
        == MarketDirection.BEARISH
    ):
        concerns.append(
            "A bearish thesis can fail if the "
            "underlying reverses upward or "
            "experiences a short squeeze."
        )

    risk_score = min(
        risk_score,
        100,
    )

    approved = risk_score < 70

    if approved:

        recommendation = (
            "Opportunity may proceed to options "
            "strategy selection and Guardian "
            "risk evaluation."
        )

    else:

        recommendation = (
            "Opportunity should not proceed "
            "because the identified risks are "
            "too significant."
        )

    return DevilAdvocateReview(
        approved=approved,
        risk_score=round(
            risk_score,
            2,
        ),
        concerns=concerns,
        recommendation=recommendation,
    )