import calendar
from alpaca.data.enums import OptionsFeed
from alpaca.trading.client import TradingClient
from core.config import ALPACA_API_KEY, ALPACA_SECRET_KEY

from alpaca.data.live.stock import StockDataStream
from alpaca.data.enums import DataFeed
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.historical.option import (
    OptionHistoricalDataClient,
)
from alpaca.data.requests import (
    OptionChainRequest,
    OptionSnapshotRequest,
    StockLatestTradeRequest,
)
from alpaca.data import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import (
    TimeFrame,
    TimeFrameUnit,
)
from alpaca.trading.enums import ContractType
from alpaca.trading.requests import (
    GetOptionContractsRequest,
)
from datetime import datetime, timedelta, timezone

trading_client = TradingClient(
    api_key=ALPACA_API_KEY,
    secret_key=ALPACA_SECRET_KEY,
    paper=True,
)
stock_data_client = StockHistoricalDataClient(
    ALPACA_API_KEY,
    ALPACA_SECRET_KEY,
)
option_data_client = OptionHistoricalDataClient(
    ALPACA_API_KEY,
    ALPACA_SECRET_KEY,
)
stock_stream = StockDataStream(
    ALPACA_API_KEY,
    ALPACA_SECRET_KEY,
    feed=DataFeed.IEX,
)

def get_account():
    """Fetch the Alpaca paper trading account."""
    return trading_client.get_account()

def get_positions():
    """Fetch all current positions from the Alpaca paper account."""
    return trading_client.get_all_positions()

def get_assets():
    """Fetch all active US equity assets available through Alpaca."""
    assets = trading_client.get_all_assets()

    return [
        {
            "symbol": asset.symbol,
            "name": asset.name,
            "exchange": asset.exchange,
            "asset_class": str(asset.asset_class),
            "tradable": asset.tradable,
        }
        for asset in assets
        if asset.status == "active"
        and asset.tradable
    ]

def get_latest_price(symbol: str) -> float:
    """Fetch the latest available trade price for a stock."""

    request = StockLatestTradeRequest(
        symbol_or_symbols=symbol.upper(),
        feed=DataFeed.IEX,
    )

    latest_trade = stock_data_client.get_stock_latest_trade(request)

    return float(latest_trade[symbol.upper()].price)

def get_market_bars(
    symbol: str,
    timeframe: str = "1M",
):
    symbol = symbol.upper()
    timeframe = timeframe.upper()

    end = datetime.now(timezone.utc)

    timeframe_map = {
        "1D": {
            "alpaca_timeframe": TimeFrame(
                5,
                TimeFrameUnit.Minute,
            ),
            "days": 3,
        },

        "5D": {
            "alpaca_timeframe": TimeFrame(
                15,
                TimeFrameUnit.Minute,
            ),
            "days": 10,
        },

        "1M": {
            "alpaca_timeframe": TimeFrame.Day,
            "days": 45,
        },

        "3M": {
            "alpaca_timeframe": TimeFrame.Day,
            "days": 120,
        },

        "1Y": {
            "alpaca_timeframe": TimeFrame.Day,
            "days": 400,
        },
    }

    config = timeframe_map.get(
        timeframe,
    )

    if config is None:
        raise ValueError(
            f"Unsupported timeframe: {timeframe}"
        )

    start = end - timedelta(
        days=config["days"],
    )

    request = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe=config["alpaca_timeframe"],
        start=start,
        end=end,
        feed=DataFeed.IEX,
    )

    bars = stock_data_client.get_stock_bars(
        request
    )

    raw_bars = list(
        bars[symbol]
    )

    # -----------------------------------------------------
    # 1D
    # Keep only the latest available trading session.
    # -----------------------------------------------------

    if timeframe == "1D":

        if raw_bars:
            latest_session = (
                raw_bars[-1]
                .timestamp
                .astimezone(timezone.utc)
                .date()
            )

            raw_bars = [
                bar
                for bar in raw_bars
                if (
                    bar.timestamp
                    .astimezone(timezone.utc)
                    .date()
                    == latest_session
                )
            ]

    # -----------------------------------------------------
    # 5D
    # Keep exactly the latest five trading sessions.
    # -----------------------------------------------------

    elif timeframe == "5D":

        trading_dates = []

        for bar in reversed(raw_bars):

            trading_date = (
                bar.timestamp
                .astimezone(timezone.utc)
                .date()
            )

            if trading_date not in trading_dates:
                trading_dates.append(
                    trading_date
                )

            if len(trading_dates) == 5:
                break

        trading_dates = set(
            trading_dates
        )

        raw_bars = [
            bar
            for bar in raw_bars
            if (
                bar.timestamp
                .astimezone(timezone.utc)
                .date()
                in trading_dates
            )
        ]

    # -----------------------------------------------------
    # 1M
    # -----------------------------------------------------

    elif timeframe == "1M":

        cutoff = subtract_months(
            end,
            1,
        )

        raw_bars = [
            bar
            for bar in raw_bars
            if bar.timestamp >= cutoff
        ]

    # -----------------------------------------------------
    # 3M
    # -----------------------------------------------------

    elif timeframe == "3M":

        cutoff = subtract_months(
            end,
            3,
        )

        raw_bars = [
            bar
            for bar in raw_bars
            if bar.timestamp >= cutoff
        ]

    # -----------------------------------------------------
    # 1Y
    # -----------------------------------------------------

    elif timeframe == "1Y":

        cutoff = subtract_months(
            end,
            12,
        )

        raw_bars = [
            bar
            for bar in raw_bars
            if bar.timestamp >= cutoff
        ]

    return [
        {
            "timestamp": bar.timestamp.isoformat(),
            "open": float(bar.open),
            "high": float(bar.high),
            "low": float(bar.low),
            "close": float(bar.close),
            "volume": float(bar.volume),
        }
        for bar in raw_bars
    ]

def subtract_months(
    value: datetime,
    months: int,
) -> datetime:
    month_index = (
        value.year * 12
        + value.month
        - 1
        - months
    )

    year = month_index // 12
    month = month_index % 12 + 1

    day = min(
        value.day,
        calendar.monthrange(
            year,
            month,
        )[1],
    )

    return value.replace(
        year=year,
        month=month,
        day=day,
    )
def get_option_contracts(
    symbol: str,
    option_type: str,
    min_days_to_expiration: int = 14,
    max_days_to_expiration: int = 45,
    strike_price_gte: float | None = None,
    strike_price_lte: float | None = None,
):
    """
    Retrieve active option contracts for an
    underlying symbol.
    """

    symbol = symbol.upper()

    today = datetime.now(
        timezone.utc,
    ).date()

    expiration_date_gte = (
        today
        + timedelta(
            days=min_days_to_expiration,
        )
    )

    expiration_date_lte = (
        today
        + timedelta(
            days=max_days_to_expiration,
        )
    )

    if option_type.lower() == "call":

        contract_type = ContractType.CALL

    elif option_type.lower() == "put":

        contract_type = ContractType.PUT

    else:

        raise ValueError(
            "option_type must be "
            "'call' or 'put'"
        )

    request = GetOptionContractsRequest(
        underlying_symbols=[
            symbol,
        ],
        expiration_date_gte=(
            expiration_date_gte
        ),
        expiration_date_lte=(
            expiration_date_lte
        ),
        strike_price_gte=(
            str(strike_price_gte)
            if strike_price_gte is not None
            else None
        ),
        strike_price_lte=(
            str(strike_price_lte)
            if strike_price_lte is not None
            else None
        ),
        type=contract_type,
        limit=100,
    )

    response = (
        trading_client.get_option_contracts(
            request,
        )
    )

    return response.option_contracts
def get_option_snapshot(
    option_symbol: str,
):
    """
    Retrieve the latest market snapshot for
    an option contract.
    """

    option_symbol = option_symbol.upper()

    request = OptionSnapshotRequest(
        symbol_or_symbols=option_symbol,
        feed=OptionsFeed.INDICATIVE,
    )

    snapshots = (
        option_data_client.get_option_snapshot(
            request,
        )
    )

    snapshot = snapshots.get(
        option_symbol,
    )

    if snapshot is None:
        raise ValueError(
            f"No option market data found for "
            f"{option_symbol}"
        )

    latest_quote = snapshot.latest_quote
    latest_trade = snapshot.latest_trade

    bid_price = (
        float(latest_quote.bid_price)
        if latest_quote is not None
        else None
    )

    ask_price = (
        float(latest_quote.ask_price)
        if latest_quote is not None
        else None
    )

    latest_trade_price = (
        float(latest_trade.price)
        if latest_trade is not None
        else None
    )

    if (
        bid_price is not None
        and ask_price is not None
        and bid_price > 0
        and ask_price > 0
    ):
        estimated_premium = (
            bid_price + ask_price
        ) / 2

    elif latest_trade_price is not None:
        estimated_premium = (
            latest_trade_price
        )

    else:
        raise ValueError(
            f"No usable option price found for "
            f"{option_symbol}"
        )

    return {
        "symbol": option_symbol,
        "bid_price": bid_price,
        "ask_price": ask_price,
        "latest_trade_price": (
            latest_trade_price
        ),
        "estimated_premium": round(
            estimated_premium,
            4,
        ),
        "implied_volatility": (
            float(snapshot.implied_volatility)
            if snapshot.implied_volatility
            is not None
            else None
        ),
    }

def get_option_chain(
    symbol: str,
):
    """
    Retrieve option-chain snapshots with
    currently available option market data.
    """

    request = OptionChainRequest(
        underlying_symbol=symbol.upper(),
        feed=OptionsFeed.INDICATIVE,
    )

    return option_data_client.get_option_chain(
        request
    )