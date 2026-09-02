from enum import Enum

from pydantic import BaseModel, Field


class MarketDirection(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"


class OptionType(str, Enum):
    CALL = "call"
    PUT = "put"


class OpportunityStatus(str, Enum):
    DETECTED = "detected"
    REJECTED = "rejected"
    APPROVED = "approved"


class MarketOpportunity(BaseModel):
    symbol: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Underlying stock ticker symbol",
    )

    direction: MarketDirection

    confidence: float = Field(
        ...,
        ge=0,
        le=100,
        description="Agent confidence score",
    )

    current_price: float = Field(
        ...,
        gt=0,
        description="Current underlying market price",
    )

    reasoning: list[str]

    status: OpportunityStatus = (
        OpportunityStatus.DETECTED
    )


class OptionContractProposal(BaseModel):
    symbol: str = Field(
        ...,
        min_length=1,
        description="Underlying stock ticker",
    )

    option_symbol: str = Field(
        ...,
        min_length=1,
        description="Alpaca option contract symbol",
    )

    option_type: OptionType

    strike_price: float = Field(
        ...,
        gt=0,
    )

    expiration_date: str

    quantity: int = Field(
        ...,
        gt=0,
    )

    estimated_premium: float = Field(
        ...,
        gt=0,
        description="Estimated premium per contract",
    )

    strategy: str

    reasoning: list[str]


class AgentTradeProposal(BaseModel):
    opportunity: MarketOpportunity

    option_contract: OptionContractProposal

    agent_confidence: float = Field(
        ...,
        ge=0,
        le=100,
    )


class DevilAdvocateReview(BaseModel):
    approved: bool

    risk_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Higher score means greater risk",
    )

    concerns: list[str]

    recommendation: str