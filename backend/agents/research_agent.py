from models.agent import (
    MarketDirection,
    MarketOpportunity,
)
from services.alpaca_service import (
    get_latest_price,
    get_market_bars,
)


DEFAULT_WATCHLIST = [
    "AAPL",
    "MSFT",
    "NVDA",
    "TSLA",
    "SPY",
]


def analyze_symbol(
    symbol: str,
) -> MarketOpportunity | None:
    """
    Analyze a single symbol and detect a basic
    bullish or bearish momentum opportunity.
    """

    bars = get_market_bars(
        symbol,
        timeframe="1M",
    )

    if len(bars) < 10:
        return None

    current_price = get_latest_price(
        symbol,
    )

    closes = [
        bar["close"]
        for bar in bars
    ]

    recent_closes = closes[-5:]
    previous_closes = closes[-10:-5]

    recent_average = sum(
        recent_closes,
    ) / len(recent_closes)

    previous_average = sum(
        previous_closes,
    ) / len(previous_closes)

    price_change_percent = (
        (
            current_price
            - previous_average
        )
        / previous_average
    ) * 100

    reasoning = []

    if (
        recent_average > previous_average
        and current_price > recent_average
    ):
        confidence = min(
            50
            + abs(
                price_change_percent
            )
            * 10,
            95,
        )

        reasoning.append(
            "Recent average price is above "
            "the previous average."
        )

        reasoning.append(
            "Current price is above the "
            "recent average."
        )

        reasoning.append(
            f"Price moved "
            f"{price_change_percent:.2f}% "
            "relative to the previous "
            "five-session average."
        )

        return MarketOpportunity(
            symbol=symbol,
            direction=MarketDirection.BULLISH,
            confidence=round(
                confidence,
                2,
            ),
            current_price=current_price,
            reasoning=reasoning,
        )

    if (
        recent_average < previous_average
        and current_price < recent_average
    ):
        confidence = min(
            50
            + abs(
                price_change_percent
            )
            * 10,
            95,
        )

        reasoning.append(
            "Recent average price is below "
            "the previous average."
        )

        reasoning.append(
            "Current price is below the "
            "recent average."
        )

        reasoning.append(
            f"Price moved "
            f"{price_change_percent:.2f}% "
            "relative to the previous "
            "five-session average."
        )

        return MarketOpportunity(
            symbol=symbol,
            direction=MarketDirection.BEARISH,
            confidence=round(
                confidence,
                2,
            ),
            current_price=current_price,
            reasoning=reasoning,
        )

    return None


def scan_market(
    symbols: list[str] | None = None,
) -> list[MarketOpportunity]:
    """
    Scan a watchlist and return detected
    opportunities ranked by confidence.
    """

    watchlist = (
        symbols
        if symbols is not None
        else DEFAULT_WATCHLIST
    )

    opportunities = []

    for symbol in watchlist:

        try:
            opportunity = analyze_symbol(
                symbol,
            )

            if opportunity is not None:
                opportunities.append(
                    opportunity,
                )

        except Exception as error:
            print(
                f"Research agent failed "
                f"for {symbol}: {error}"
            )

    return sorted(
        opportunities,
        key=lambda opportunity: (
            opportunity.confidence
        ),
        reverse=True,
    )