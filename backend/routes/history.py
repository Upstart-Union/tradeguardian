from fastapi import APIRouter

from models.decision import AnalysisResult
from services.history_service import get_analysis_history


router = APIRouter(
    prefix="/history",
    tags=["History"],
)


@router.get(
    "/",
    response_model=list[AnalysisResult],
)
def get_history():
    return get_analysis_history()