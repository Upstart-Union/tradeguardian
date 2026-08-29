from alpaca.trading.client import TradingClient
from core.config import ALPACA_API_KEY, ALPACA_SECRET_KEY

from alpaca.data.live.stock import StockDataStream
from alpaca.data.enums import DataFeed
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockLatestTradeRequest
from alpaca.data import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import (
    TimeFrame,
    TimeFrameUnit,
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

    end = datetime.now(timezone.utc)

    timeframe_map = {
        "1D": {
            "alpaca_timeframe": TimeFrame(
                5,
                TimeFrameUnit.Minute,
            ),
            "days": 2,
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
            "days": 35,
        },

        "3M": {
            "alpaca_timeframe": TimeFrame.Day,
            "days": 100,
        },

        "1Y": {
            "alpaca_timeframe": TimeFrame.Day,
            "days": 370,
        },
    }

    config = timeframe_map.get(
        timeframe.upper(),
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
    # 5D = exactly the latest 5 trading sessions
    # -----------------------------------------------------

    if timeframe.upper() == "5D":

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

    market_bars = []

    for bar in raw_bars:

        market_bars.append(
            {
                "timestamp":
                    bar.timestamp.isoformat(),

                "open":
                    float(bar.open),

                "high":
                    float(bar.high),

                "low":
                    float(bar.low),

                "close":
                    float(bar.close),

                "volume":
                    float(bar.volume),
            }
        )

    return market_bars