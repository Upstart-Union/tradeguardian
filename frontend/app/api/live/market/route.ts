export async function GET(
  request: Request,
) {
  const url = new URL(request.url);

  const symbol =
    url.searchParams.get("symbol") ?? "AAPL";

  const timeframe =
    url.searchParams.get("timeframe") ?? "1M";

  const response = await fetch(
    `http://127.0.0.1:8000/live/market?symbol=${encodeURIComponent(
      symbol,
    )}&timeframe=${encodeURIComponent(
      timeframe,
    )}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return new Response(
      await response.text(),
      {
        status: response.status,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }

  return new Response(
    response.body,
    {
      status: 200,
      headers: {
        "Content-Type":
          "text/event-stream",
        "Cache-Control":
          "no-cache, no-transform",
        Connection: "keep-alive",
      },
    },
  );
}