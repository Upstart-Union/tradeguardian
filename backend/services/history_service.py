from models.decision import AnalysisResult


analysis_history: list[AnalysisResult] = []


def save_analysis(result: AnalysisResult) -> None:
    """
    Save a TradeGuardian analysis result to the
    in-memory decision history.
    """

    analysis_history.append(result)


def get_analysis_history() -> list[AnalysisResult]:
    """
    Return all saved TradeGuardian analysis results.
    """

    return analysis_history