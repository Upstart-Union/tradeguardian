export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      symbol: string;
    }>;
  },
) {
  const { symbol } = await params;

  const url = new URL(request.url);

  const timeframe =
    url.searchParams.get("timeframe") ?? "1M";

  const response = await fetch(
    `http://127.0.0.1:8000/market/${symbol}?timeframe=${encodeURIComponent(timeframe)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return Response.json(
      {
        error: "Failed to fetch market data",
      },
      {
        status: response.status,
      },
    );
  }

  const data = await response.json();

  return Response.json(data);
}