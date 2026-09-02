from fastapi import APIRouter, HTTPException

from agents.orchestrator import run_tradeguardian


router = APIRouter(
    prefix="/agents",
    tags=["AI Agents"],
)


@router.post("/run")
def run_agents():
    """
    Run the complete TradeGuardian AI agent pipeline.

    Pipeline:
    Research Agent
        ->
    Devil's Advocate
        ->
    Options Strategy Agent
        ->
    Guardian Risk Agent
    """

    try:
        results = run_tradeguardian()

        return {
            "message": (
                "TradeGuardian agent pipeline completed."
            ),
            "results": results,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "TradeGuardian agent pipeline failed: "
                f"{type(error).__name__}: {str(error)}"
            ),
        )