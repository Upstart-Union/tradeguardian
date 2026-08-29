import asyncio
import json
import queue
import threading
from collections import defaultdict

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from alpaca.data.enums import DataFeed
from alpaca.data.live.stock import StockDataStream

from core.config import (
    ALPACA_API_KEY,
    ALPACA_SECRET_KEY,
)


router = APIRouter(
    prefix="/live",
    tags=["Live Market Data"],
)


# ---------------------------------------------------------
# ONE Alpaca stream for the entire FastAPI process
# ---------------------------------------------------------

stream = StockDataStream(
    ALPACA_API_KEY,
    ALPACA_SECRET_KEY,
    feed=DataFeed.IEX,
)

stream_thread = None
stream_started = False
stream_lock = threading.Lock()


# symbol -> set of browser queues
subscribers = defaultdict(set)


# ---------------------------------------------------------
# Receive Alpaca bars and fan them out to browsers
# ---------------------------------------------------------

async def handle_bar(bar):
    payload = {
        "symbol": bar.symbol,
        "timestamp": bar.timestamp.isoformat(),
        "open": float(bar.open),
        "high": float(bar.high),
        "low": float(bar.low),
        "close": float(bar.close),
        "volume": float(bar.volume),
    }

    with stream_lock:
        clients = list(
            subscribers.get(
                bar.symbol,
                set(),
            )
        )

    for client_queue in clients:
        try:
            client_queue.put_nowait(
                payload
            )
        except Exception as error:
            print(
                f"[LIVE] Queue error for "
                f"{bar.symbol}: "
                f"{type(error).__name__}: {error}"
            )


# ---------------------------------------------------------
# Run the ONE Alpaca connection
# ---------------------------------------------------------

def run_stream():
    try:
        print(
            "[LIVE] Starting shared Alpaca stream"
        )

        stream.run()

    except Exception as error:
        import traceback

        print(
            "[LIVE] Alpaca stream error: "
            f"{type(error).__name__}: {error}"
        )

        traceback.print_exc()


# ---------------------------------------------------------
# Start the shared Alpaca stream
# ---------------------------------------------------------

def start_stream(symbol: str):
    global stream_thread
    global stream_started

    with stream_lock:

        if not stream_started:

            stream.subscribe_bars(
                handle_bar,
                symbol,
            )

            stream_thread = threading.Thread(
                target=run_stream,
                daemon=True,
            )

            stream_thread.start()

            stream_started = True

            print(
                f"[LIVE] Starting stream with "
                f"subscription: {symbol}"
            )

            return

        stream.subscribe_bars(
            handle_bar,
            symbol,
        )

        print(
            f"[LIVE] Subscribed to additional symbol: "
            f"{symbol}"
        )


# ---------------------------------------------------------
# FastAPI SSE endpoint
# ---------------------------------------------------------

@router.get("/market")
async def market_stream(
    request: Request,
):
    symbol = request.query_params.get(
        "symbol",
        "AAPL",
    ).upper()

    client_queue = queue.Queue()

    with stream_lock:
        subscribers[symbol].add(
            client_queue
        )

    try:
        start_stream(symbol)

        print(
            f"[LIVE] Browser subscribed via SSE: "
            f"{symbol}"
        )

        async def event_generator():

            try:
                while True:

                    if await request.is_disconnected():
                        break

                    try:
                        payload = await asyncio.to_thread(
                            client_queue.get,
                            True,
                            15,
                        )

                        yield (
                            "data: "
                            + json.dumps(payload)
                            + "\n\n"
                        )

                    except queue.Empty:
                        # Keep the HTTP stream alive
                        yield ": keep-alive\n\n"

            finally:
                with stream_lock:

                    subscribers[symbol].discard(
                        client_queue
                    )

                    if not subscribers[symbol]:

                        del subscribers[symbol]

                        try:
                            stream.unsubscribe_bars(
                                symbol
                            )

                            print(
                                f"[LIVE] Unsubscribed: "
                                f"{symbol}"
                            )

                        except Exception as error:
                            print(
                                "[LIVE] Unsubscribe error: "
                                f"{type(error).__name__}: "
                                f"{error}"
                            )

                print(
                    f"[LIVE] Browser SSE disconnected: "
                    f"{symbol}"
                )

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as error:

        with stream_lock:
            subscribers[symbol].discard(
                client_queue
            )

        raise error