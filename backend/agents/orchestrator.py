from agents.devil_advocate import (
    review_opportunity,
)
from agents.guardian_agent import (
    evaluate_trade,
)
from agents.options_strategy_agent import (
    select_option_contract,
)
from agents.research_agent import (
    scan_market,
)


def run_tradeguardian():
    """
    Run the complete TradeGuardian
    multi-agent analysis pipeline.

    Pipeline:

    Research Agent
        ↓
    Devil's Advocate
        ↓
    Options Strategy Agent
        ↓
    Guardian Risk Engine
    """

    opportunities = scan_market()

    results = []

    for opportunity in opportunities:

        # ----------------------------------------
        # Devil's Advocate review
        # ----------------------------------------

        review = review_opportunity(
            opportunity
        )

        if not review.approved:
            results.append(
                {
                    "symbol": opportunity.symbol,
                    "opportunity": (
                        opportunity.model_dump(
                            mode="json"
                        )
                    ),
                    "devil_advocate": (
                        review.model_dump(
                            mode="json"
                        )
                    ),
                    "proposal": None,
                    "analysis": None,
                }
            )

            continue

        # ----------------------------------------
        # Options Strategy Agent
        # ----------------------------------------

        proposal = (
            select_option_contract(
                opportunity
            )
        )

        if proposal is None:
            results.append(
                {
                    "symbol": opportunity.symbol,
                    "opportunity": (
                        opportunity.model_dump(
                            mode="json"
                        )
                    ),
                    "devil_advocate": (
                        review.model_dump(
                            mode="json"
                        )
                    ),
                    "proposal": None,
                    "analysis": None,
                }
            )

            continue

        # ----------------------------------------
        # Guardian Risk Engine
        # ----------------------------------------

        analysis = evaluate_trade(
            proposal
        )

        results.append(
            {
                "symbol": opportunity.symbol,
                "opportunity": (
                    opportunity.model_dump(
                        mode="json"
                    )
                ),
                "devil_advocate": (
                    review.model_dump(
                        mode="json"
                    )
                ),
                "proposal": (
                    proposal.model_dump(
                        mode="json"
                    )
                ),
                "analysis": (
                    analysis.model_dump(
                        mode="json"
                    )
                ),
            }
        )

    return results