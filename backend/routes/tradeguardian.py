from fastapi import APIRouter, HTTPException

from agents.orchestrator import (
    run_tradeguardian,
)


router = APIRouter(
    prefix="/tradeguardian",
    tags=["TradeGuardian Agents"],
)


@router.post("/run")
def run_agents():
    """
    Run the complete TradeGuardian
    multi-agent pipeline.
    """

    try:
        results = run_tradeguardian()

        return {
            "count": len(results),
            "results": results,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "TradeGuardian agent pipeline failed: "
                f"{str(error)}"
            ),
        )