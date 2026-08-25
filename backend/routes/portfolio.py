from fastapi import APIRouter, HTTPException

from services.alpaca_service import get_account, get_positions


router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.get("/")
def read_portfolio():
    try:
        account = get_account()
        positions = get_positions()

        formatted_positions = []

        for position in positions:
            formatted_positions.append(
                {
                    "symbol": position.symbol,
                    "quantity": str(position.qty),
                    "market_value": str(position.market_value),
                    "average_entry_price": str(position.avg_entry_price),
                    "current_price": str(position.current_price),
                    "unrealized_pl": str(position.unrealized_pl),
                    "unrealized_pl_percent": str(
                        position.unrealized_plpc
                    ),
                }
            )

        return {
            "account": {
                "cash": str(account.cash),
                "equity": str(account.equity),
                "buying_power": str(account.buying_power),
            },
            "positions": formatted_positions,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve portfolio: {str(error)}",
        )