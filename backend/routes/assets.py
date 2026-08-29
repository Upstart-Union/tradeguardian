from fastapi import APIRouter, HTTPException

from services.alpaca_service import get_assets


router = APIRouter(
    prefix="/assets",
    tags=["Assets"],
)


@router.get("")
def get_available_assets():
    try:
        return get_assets()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unable to retrieve Alpaca assets: "
                f"{str(error)}"
            ),
        )