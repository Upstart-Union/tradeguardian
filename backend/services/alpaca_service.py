from alpaca.trading.client import TradingClient
from core.config import ALPACA_API_KEY, ALPACA_SECRET_KEY

from alpaca.data.enums import DataFeed
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockLatestTradeRequest

trading_client = TradingClient(
    api_key=ALPACA_API_KEY,
    secret_key=ALPACA_SECRET_KEY,
    paper=True,
)
stock_data_client = StockHistoricalDataClient(
    api_key=ALPACA_API_KEY,
    secret_key=ALPACA_SECRET_KEY,
)

def get_account():
    """Fetch the Alpaca paper trading account."""
    return trading_client.get_account()

def get_positions():
    """Fetch all current positions from the Alpaca paper account."""
    return trading_client.get_all_positions()

def get_latest_price(symbol: str) -> float:
    """Fetch the latest available trade price for a stock."""

    request = StockLatestTradeRequest(
        symbol_or_symbols=symbol.upper(),
        feed=DataFeed.IEX,
    )

    latest_trade = stock_data_client.get_stock_latest_trade(request)

    return float(latest_trade[symbol.upper()].price)