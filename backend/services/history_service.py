import json

from core.database import get_connection
from models.decision import AnalysisResult


def save_analysis(result: AnalysisResult) -> None:
    """
    Save a TradeGuardian analysis result to SQLite.
    """

    connection = get_connection()

    try:
        connection.execute(
            """
            INSERT INTO analysis_history (
                audit_id,
                timestamp,
                data
            )
            VALUES (?, ?, ?)
            """,
            (
                str(result.audit_id),
                result.timestamp.isoformat(),
                result.model_dump_json(),
            ),
        )

        connection.commit()

    finally:
        connection.close()


def get_analysis_history() -> list[AnalysisResult]:
    """
    Return all saved TradeGuardian analysis results.
    """

    connection = get_connection()

    try:
        rows = connection.execute(
            """
            SELECT data
            FROM analysis_history
            ORDER BY timestamp DESC
            """
        ).fetchall()

        return [
            AnalysisResult.model_validate(
                json.loads(row["data"])
            )
            for row in rows
        ]

    finally:
        connection.close()