export async function GET() {
  const response = await fetch(
    "http://127.0.0.1:8000/assets",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return Response.json(
      {
        error: "Failed to fetch assets",
      },
      {
        status: response.status,
      },
    );
  }

  const data = await response.json();

  return Response.json(data);
}