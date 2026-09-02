from datetime import (
    date,
    datetime,
)

from models.agent import (
    AgentTradeProposal,
    MarketDirection,
    MarketOpportunity,
    OptionContractProposal,
    OptionType,
)

from services.alpaca_service import (
    get_option_chain,
)


def select_option_contract(
    opportunity: MarketOpportunity,
) -> AgentTradeProposal | None:
    """
    Convert a market opportunity into a
    directional options proposal.

    Only contracts that already have usable
    option market data are considered.
    """

    if (
        opportunity.direction
        == MarketDirection.NEUTRAL
    ):
        return None

    if (
        opportunity.direction
        == MarketDirection.BULLISH
    ):
        option_type = OptionType.CALL

    else:
        option_type = OptionType.PUT

    current_price = (
        opportunity.current_price
    )

    chain = get_option_chain(
        opportunity.symbol
    )

    today = date.today()

    candidates = []

    for option_symbol, snapshot in (
        chain.items()
    ):
        latest_quote = (
            snapshot.latest_quote
        )

        if latest_quote is None:
            continue

        bid_price = (
            latest_quote.bid_price
        )

        ask_price = (
            latest_quote.ask_price
        )

        if (
            bid_price is None
            or ask_price is None
        ):
            continue

        bid_price = float(
            bid_price
        )

        ask_price = float(
            ask_price
        )

        if (
            bid_price <= 0
            or ask_price <= 0
        ):
            continue

        # -------------------------------------------------
        # Parse OCC option symbol
        #
        # Example:
        # TSLA260916C00360000
        # -------------------------------------------------

        try:
            option_part = option_symbol[
                len(
                    opportunity.symbol
                ):
            ]

            expiration_text = (
                option_part[:6]
            )

            contract_type = (
                option_part[6]
            )

            strike_text = (
                option_part[7:]
            )

            expiration_date = (
                datetime.strptime(
                    expiration_text,
                    "%y%m%d",
                ).date()
            )

            strike_price = (
                int(strike_text)
                / 1000
            )

        except (
            ValueError,
            IndexError,
        ):
            continue

        if (
            contract_type
            != option_type.value[0].upper()
        ):
            continue

        days_to_expiration = (
            expiration_date
            - today
        ).days

        if (
            days_to_expiration < 14
            or days_to_expiration > 45
        ):
            continue

        # Keep contracts reasonably near
        # the underlying price.
        strike_distance_percent = (
            abs(
                strike_price
                - current_price
            )
            / current_price
        )

        if (
            strike_distance_percent
            > 0.10
        ):
            continue

        # Calculate the estimated premium
        # from the current bid/ask midpoint.
        estimated_premium = (
            bid_price
            + ask_price
        ) / 2

        # Reject excessively wide spreads.
        spread_percent = (
            (ask_price - bid_price)
            / estimated_premium
        )

        if (
            spread_percent > 0.30
        ):
            continue

        candidates.append(
            {
                "option_symbol": (
                    option_symbol
                ),
                "strike_price": (
                    strike_price
                ),
                "expiration_date": (
                    expiration_date
                ),
                "days_to_expiration": (
                    days_to_expiration
                ),
                "bid_price": (
                    bid_price
                ),
                "ask_price": (
                    ask_price
                ),
                "estimated_premium": (
                    estimated_premium
                ),
                "spread_percent": (
                    spread_percent
                ),
                "strike_distance_percent": (
                    strike_distance_percent
                ),
                "snapshot": (
                    snapshot
                ),
            }
        )

    if not candidates:
        return None

    # Prefer:
    #
    # 1. Closest strike to the underlying
    # 2. Smaller bid/ask spread
    #
    # The tuple determines the ranking order.
    best_contract = min(
        candidates,
        key=lambda contract: (
            contract[
                "strike_distance_percent"
            ],
            contract[
                "spread_percent"
            ],
        ),
    )

    strategy = (
        "long_call"
        if option_type == OptionType.CALL
        else "long_put"
    )

    reasoning = [
        (
            f"{opportunity.direction.value.title()} "
            "market opportunity selected."
        ),
        (
            f"Using a {option_type.value} "
            "option to express the "
            "directional thesis."
        ),
        (
            "Selected from the live "
            "option-chain market data."
        ),
        (
            "Selected a contract within "
            "the 14 to 45 day expiration "
            "window."
        ),
        (
            "Selected a near-the-money "
            "strike with a usable bid/ask."
        ),
        (
            "Premium is calculated from "
            "the bid/ask midpoint."
        ),
    ]

    option_contract = (
        OptionContractProposal(
            symbol=(
                opportunity.symbol
            ),
            option_symbol=(
                best_contract[
                    "option_symbol"
                ]
            ),
            option_type=(
                option_type
            ),
            strike_price=(
                best_contract[
                    "strike_price"
                ]
            ),
            expiration_date=str(
                best_contract[
                    "expiration_date"
                ]
            ),
            quantity=1,
            estimated_premium=round(
                best_contract[
                    "estimated_premium"
                ],
                4,
            ),
            strategy=strategy,
            reasoning=reasoning,
        )
    )

    return AgentTradeProposal(
        opportunity=opportunity,
        option_contract=(
            option_contract
        ),
        agent_confidence=(
            opportunity.confidence
        ),
    )