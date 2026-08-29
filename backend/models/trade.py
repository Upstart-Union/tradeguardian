from enum import Enum

from pydantic import BaseModel, Field


class TradeSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class TradeProposal(BaseModel):
    symbol: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Stock ticker symbol",
    )

    side: TradeSide

    quantity: float = Field(
        ...,
        gt=0,
        description="Number of shares to trade",
    )