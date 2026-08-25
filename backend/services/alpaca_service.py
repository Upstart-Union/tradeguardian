from alpaca.trading.client import TradingClient

from core.config import ALPACA_API_KEY, ALPACA_SECRET_KEY


trading_client = TradingClient(
    api_key=ALPACA_API_KEY,
    secret_key=ALPACA_SECRET_KEY,
    paper=True,
)


def get_account():
    """Fetch the Alpaca paper trading account."""
    return trading_client.get_account()

def get_positions():
    """Fetch all current positions from the Alpaca paper account."""
    return trading_client.get_all_positions()