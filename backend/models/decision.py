from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum

from pydantic import BaseModel, Field


class DecisionStatus(str, Enum):
    APPROVED = "APPROVED"
    FLAGGED = "FLAGGED"
    BLOCKED = "BLOCKED"


class GuardianDecision(BaseModel):
    status: DecisionStatus

    reasons: list[str] = Field(
        default_factory=list,
        description="Reasons behind the Guardian decision",
    )

class RiskCheckStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"


class RiskCheckResult(BaseModel):
    status: RiskCheckStatus
    reason: str


class RiskChecks(BaseModel):
    exposure: RiskCheckResult
    concentration: RiskCheckResult
    buying_power: RiskCheckResult
    position: RiskCheckResult

class RiskMetrics(BaseModel):
    existing_quantity: float
    projected_quantity: float

    account_equity: float
    buying_power: float
    trade_percent_of_equity: float

    existing_position_value: float
    projected_position_value: float
    projected_concentration_percent: float


class AnalysisResult(BaseModel):
    audit_id: UUID = Field(default_factory=uuid4)

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    message: str

    proposal: dict
    risk_metrics: RiskMetrics
    risk_checks: RiskChecks
    decision: GuardianDecision