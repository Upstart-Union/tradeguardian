"use client";

import {
  useEffect,
  useState,
} from "react";

import MarketChart from "../components/MarketChart";

type MarketBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};


type MarketData = {
  symbol: string;
  latest_price: number;
  bars: MarketBar[];
};

type Asset = {
  symbol: string;
  name: string;
  exchange: string;
  asset_class: string;
  tradable: boolean;
};

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("10");

  const [timeframe, setTimeframe] =
    useState("1M");

  const [sidebarAccountOpen, setSidebarAccountOpen] =
    useState(false);

  const [paperAccountOpen, setPaperAccountOpen] =
    useState(false);

  const [marketMenuOpen, setMarketMenuOpen] =
    useState(false);

  const [marketSearch, setMarketSearch] =
    useState("");

  const [marketStartIndex, setMarketStartIndex] =
    useState(0);

  const [marketLoadedIndices, setMarketLoadedIndices] =
    useState<number[]>([]);

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [assetsLoading, setAssetsLoading] =
    useState(true);

  const [marketData, setMarketData] =
    useState<MarketData | null>(null);

  const [marketLoading, setMarketLoading] =
    useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [analysisResult, setAnalysisResult] =
    useState<any>(null);

  useEffect(() => {
    async function loadAssets() {
      try {
        setAssetsLoading(true);

        const response = await fetch(
          "/api/assets",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load assets",
          );
        }

        const data: Asset[] =
          await response.json();

        setAssets(data);

      } catch (error) {
        console.error(
          "Asset loading error:",
          error,
        );

      } finally {
        setAssetsLoading(false);
      }
    }

    loadAssets();

  }, []);

  useEffect(() => {
    async function loadMarketData() {
      try {
        setMarketLoading(true);

        const response = await fetch(
          `/api/market/${symbol}?timeframe=${timeframe}`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load market data",
          );
        }

        const data = await response.json();

        setMarketData(data);

      } catch (error) {
        console.error(
          "Market data error:",
          error,
        );

        alert(
          `Market data failed: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`,
        );

      } finally {
        setMarketLoading(false);
      }
    }


    loadMarketData();

  }, [symbol, timeframe]);

  async function analyzeTrade() {
    try {
      setAnalysisLoading(true);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            symbol,
            side,
            quantity: Number(quantity),
          }),
        },
      );

      const data = await response.json();

      console.log(
        "Analysis response:",
        data,
      );

      if (!response.ok) {
        throw new Error(
          data.detail ??
          "Failed to analyze trade",
        );
      }

      setAnalysisResult(data);

    } catch (error) {
      console.error(
        "Trade analysis error:",
        error,
      );

    } finally {
      setAnalysisLoading(false);
    }
  }

  const filteredAssets =
    assets.filter((asset) => {
      const query =
        marketSearch.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        asset.symbol
          .toLowerCase()
          .includes(query) ||
        asset.name
          .toLowerCase()
          .includes(query)
      );
    });

  return (
    <main className="min-h-screen bg-[#171717] text-[#e5e5e5]">
      <div className="flex min-h-screen">

        {/* LEFT SIDEBAR */}
        <aside className="flex h-screen w-[256px] shrink-0 flex-col border-r border-[#272b31] bg-[#0c0e10]">

          {/* Brand */}
          <div className="flex h-[110px] items-center border-b border-[#272b31] px-6">

            <div className="flex items-center gap-3">

              {/* Alpaca Mark */}
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center">
                <img
                  src="/alpaca-symbol.png"
                  alt="Alpaca"
                  className="h-[44px] w-[44px] object-contain"
                />
              </div>

              <div className="min-w-0">

                <h1 className="whitespace-nowrap text-[20px] font-semibold tracking-tight text-[#e7e7e7]">
                  Alpaca
                </h1>

                <p className="mt-1 whitespace-nowrap text-[14px] text-[#9ca0a8]">
                  TradeGuardian AI
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setSidebarAccountOpen(
                  !sidebarAccountOpen,
                )
              }
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#c7c7c7] transition hover:bg-[#1b1d20] hover:text-white"
              aria-label="Change account"
            >
              <svg
                className={`h-4 w-4 transition-transform ${
                  sidebarAccountOpen
                    ? "rotate-180"
                    : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

          </div>

          {/* Navigation */}
          <nav className="px-3 py-4">

            <button className="flex h-[50px] w-full items-center gap-4 border-l-2 border-[#ffd31a] bg-[#17191d] px-4 text-left text-[16px] font-medium text-[#ffd84d]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <path d="M14 17h6" />
                <path d="M17 14v6" />
              </svg>
              <span>Dashboard</span>
            </button>

            <button className="mt-1 flex h-[52px] w-full items-center gap-4 px-4 text-left text-[16px] text-[#c6c8ce] transition hover:bg-[#17191d]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              <span>Positions</span>
            </button>

            <button className="mt-1 flex h-[52px] w-full items-center gap-4 px-4 text-left text-[16px] text-[#c6c8ce] transition hover:bg-[#17191d]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M5 7h3" />
                <path d="M11 7h8" />
                <path d="M5 12h3" />
                <path d="M11 12h8" />
                <path d="M5 17h3" />
                <path d="M11 17h8" />
                <circle cx="4" cy="7" r="1" fill="currentColor" stroke="none" />
                <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
                <circle cx="4" cy="17" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span>Orders</span>
            </button>

            <button className="mt-1 flex h-[52px] w-full items-center gap-4 px-4 text-left text-[16px] text-[#c6c8ce] transition hover:bg-[#17191d]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="M7 15l4-4 3 2 5-6" />
              </svg>
              <span>Performance</span>
            </button>

            <button className="mt-1 flex h-[52px] w-full items-center gap-4 px-4 text-left text-[16px] text-[#c6c8ce] transition hover:bg-[#17191d]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </svg>
              <span>Activity Log</span>
            </button>

            <button className="mt-1 flex h-[52px] w-full items-center gap-4 px-4 text-left text-[16px] text-[#c6c8ce] transition hover:bg-[#17191d]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" />
              </svg>
              <span>Settings</span>
            </button>

          </nav>


          {/* Account */}
          <div className="mx-5 border-t border-[#2a2d32] pt-8">

            <p className="text-[13px] font-medium uppercase tracking-wide text-[#a7aab1]">
              Account
            </p>

            <div className="mt-5 space-y-6">

              <AccountMetric
                label="Total Equity"
                value="$100,000.00"
              />

              <AccountMetric
                label="Buying Power"
                value="$400,000.00"
              />

              <AccountMetric
                label="Open Positions"
                value="0"
              />

            </div>

          </div>


          {/* Sidebar Bottom */}
          <div className="mt-auto border-t border-[#2a2d32] p-5">

            <button className="flex h-[54px] w-full items-center justify-between rounded-md border border-[#30343a] bg-[#121417] px-4 text-[15px] text-[#c7c9cf] transition hover:border-[#454a52] hover:bg-[#17191d]">

              <span>Analysis History</span>

              <span className="text-xl">
                →
              </span>

            </button>

          </div>

        </aside>


        {/* MAIN APPLICATION */}
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">

          {/* TOP BAR */}
          <header className="flex h-[110px] shrink-0 items-center justify-between border-b border-[#272b31] bg-[#0c0e10] px-12">

            {/* Workspace Title */}
            <div>

              <p className="text-[13px] font-medium tracking-wide text-[#ffd84d]">
                WORKSPACE
              </p>

              <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-[#e5e7eb]">
                Trade Analysis
              </h2>

            </div>


            {/* Account Controls */}
            <div className="flex items-center gap-10">

              {/* Connection Status */}
              <div className="flex min-w-0 flex-1 items-center gap-3">

                <span className="h-2.5 w-2.5 rounded-full bg-[#20b26b]" />

                <span className="text-[15px] text-[#9fa3aa]">
                  Market Data Connected
                </span>

              </div>


              {/* Paper Account */}
              <button
                type="button"
                onClick={() =>
                  setPaperAccountOpen(
                    !paperAccountOpen,
                  )
                }
                className="flex h-[48px] items-center gap-7 rounded-md border border-[#e1b900] bg-[#111316] px-5 text-[15px] font-medium text-[#f0cd48] transition hover:bg-[#1b1d20] hover:text-[#ffe26a]"
                aria-label="Change trading account"
              >
                <span>
                  Paper Account
                </span>

                <svg
                  className={`h-4 w-4 transition-transform ${
                    paperAccountOpen
                      ? "rotate-180"
                      : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

            </div>

          </header>


          {/* ANALYSIS WORKSPACE */}
          <section className="flex min-h-0 flex-1 overflow-hidden">

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-7 py-3">

              {/* MARKET + VERIFICATION */}
              <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.75fr)_minmax(390px,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-5">

                {/* LEFT: MARKET */}
                <div className="col-start-1 row-start-1 min-h-0 overflow-hidden rounded-md border border-[#272b31] bg-[#101010]">

                  {/* Market Header */}
                  <div className="flex items-start justify-between px-6 pt-7">

                    {/* Symbol + Price */}
                    <div>

                      <h3 className="text-[30px] font-semibold tracking-tight text-[#e5e7eb]">
                        {marketData?.symbol ?? symbol}
                      </h3>

                      <div className="mt-2 flex items-baseline gap-4">

                        <span className="text-[26px] font-medium text-[#e5e7eb]">
                          {marketData
                            ? `$${marketData.latest_price.toFixed(2)}`
                            : "--"}
                        </span>

                        <span className="text-[15px] font-medium text-[#38c980]">
                          +2.34 (0.73%)
                        </span>

                      </div>

                    </div>


                    {/* Timeframe Controls */}
                    <div className="flex items-center gap-3">

                      <div className="flex overflow-hidden rounded-md border border-[#292929] bg-[#111111]">

                        {["1D", "5D", "1M", "3M", "1Y"].map(
                          (period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() =>
                                setTimeframe(period)
                              }
                              className={`px-5 py-3 text-[15px] transition ${
                                timeframe === period
                                  ? "bg-[#151515] font-medium text-[#f1d14b]"
                                  : "text-[#9ca1aa] hover:bg-[#151515] hover:text-[#d5d5d5]"
                              }`}
                            >
                              {period}
                            </button>
                          ),
                        )}

                      </div>


                      {/* Chart Settings */}
                      <button className="flex h-[50px] w-[50px] items-center justify-center rounded-md border border-[#292929] bg-[#111111] text-lg text-[#b6bbc4] transition hover:bg-[#151515] hover:text-[#d5d5d5]">
                        ⚙
                      </button>

                    </div>

                  </div>


                  {/* Chart */}
                  <div className="mt-7 h-[calc(100%_-_120px)] min-h-0 px-6 pb-6">

                    {marketLoading ? (

                      <div className="flex h-full items-center justify-center">
                        <span className="font-mono text-xs tracking-[0.12em] text-[#667085]">
                          LOADING MARKET DATA
                        </span>
                      </div>

                    ) : marketData ? (

                      <div className="h-full">
                        <MarketChart
                          bars={marketData.bars}
                          timeframe={timeframe}
                          symbol={symbol}
                        />
                      </div>

                    ) : (

                      <div className="flex h-full items-center justify-center">
                        <span className="font-mono text-xs tracking-[0.12em] text-[#667085]">
                          MARKET DATA UNAVAILABLE
                        </span>
                      </div>

                    )}

                  </div>

                </div>

                {/* TRADE COMMAND BAR */}
                <section className="col-start-1 row-start-2 min-h-0 rounded-md border border-[#2d2d2d] bg-[#111111] px-5 py-6">

                  <div className="w-full">

                    {/* Main Trade Controls */}
                    <div className="flex items-end gap-7">

                      {/* Symbol */}
                      <div className="w-[216px]">

                        <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          SYMBOL
                        </label>

                        <div className="relative">

                          {/* Selected Market */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextOpen = !marketMenuOpen;

                              setMarketMenuOpen(nextOpen);

                              if (nextOpen) {
                                setMarketSearch("");
                                setMarketStartIndex(0);

                                setMarketLoadedIndices(
                                  Array.from(
                                    {
                                      length: Math.min(
                                        7,
                                        assets.length,
                                      ),
                                    },
                                    (_, index) => index,
                                  ),
                                );
                              }
                            }}
                            className="flex h-[60px] w-full items-center rounded-md border border-[#353535] bg-[#171717] px-4 text-left text-white transition hover:border-[#4a4a4a] hover:bg-[#1b1b1b]"
                            aria-haspopup="listbox"
                            aria-expanded={marketMenuOpen}
                          >

                            <img
                              src={`https://img.logo.dev/ticker/${symbol}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`}
                              alt=""
                              className="h-5 w-5 shrink-0 rounded-full object-contain"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />

                            <span className="ml-4 text-[16px] font-medium">
                              {symbol}
                            </span>

                            <svg
                              className={`ml-auto h-4 w-4 text-[#a5a5a5] transition-transform ${
                                marketMenuOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>

                          </button>

                          {/* Market Dropdown */}
                          {marketMenuOpen && (
                            <div
                              className="absolute bottom-[68px] left-0 right-0 z-50 overflow-hidden rounded-md border border-[#353535] bg-[#171717] shadow-xl"
                              role="listbox"
                            >
                              {/* Search */}
                              <div className="border-b border-[#303030] p-3">
                                <div className="relative">
                                  <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                  </svg>

                                  <input
                                    type="text"
                                    value={marketSearch}
                                    onChange={(event) => {
                                      const value =
                                        event.target.value;

                                      setMarketSearch(value);
                                      setMarketStartIndex(0);

                                      const query =
                                        value.trim().toLowerCase();

                                      const matchingAssets =
                                        assets.filter((asset) => {
                                          if (!query) {
                                            return true;
                                          }

                                          return (
                                            asset.symbol
                                              .toLowerCase()
                                              .includes(query) ||
                                            asset.name
                                              .toLowerCase()
                                              .includes(query)
                                          );
                                        });

                                      setMarketLoadedIndices(
                                        Array.from(
                                          {
                                            length: Math.min(
                                              7,
                                              matchingAssets.length,
                                            ),
                                          },
                                          (_, index) => index,
                                        ),
                                      );
                                    }}
                                    placeholder="Search markets..."
                                    className="h-10 w-full rounded-md border border-[#353535] bg-[#121212] pl-10 pr-3 text-[13px] text-white outline-none placeholder:text-[#666666] focus:border-[#555555]"
                                  />
                                </div>
                              </div>

                              {/* Market viewport */}
                              <div
                                className="h-[322px] overflow-y-auto overscroll-contain"
                                onScroll={(event) => {
                                  const rowHeight = 46;
                                  const visibleRows = 7;

                                  const scrollTop =
                                    event.currentTarget.scrollTop;

                                  const nextStartIndex = Math.min(
                                    Math.floor(
                                      scrollTop / rowHeight,
                                    ),
                                    Math.max(
                                      0,
                                      filteredAssets.length -
                                        visibleRows,
                                    ),
                                  );

                                  if (
                                    nextStartIndex ===
                                    marketStartIndex
                                  ) {
                                    return;
                                  }

                                  setMarketStartIndex(
                                    nextStartIndex,
                                  );

                                  /*
                                  * Only the newly entering row(s)
                                  * should show a loading placeholder.
                                  */
                                  const nextVisibleIndices =
                                    Array.from(
                                      {
                                        length: Math.min(
                                          visibleRows,
                                          Math.max(
                                            0,
                                            filteredAssets.length -
                                              nextStartIndex,
                                          ),
                                        ),
                                      },
                                      (_, index) =>
                                        nextStartIndex + index,
                                    );

                                  const missingIndices =
                                    nextVisibleIndices.filter(
                                      (index) =>
                                        !marketLoadedIndices.includes(
                                          index,
                                        ),
                                    );

                                  if (
                                    missingIndices.length === 0
                                  ) {
                                    return;
                                  }

                                  window.setTimeout(() => {
                                    setMarketLoadedIndices(
                                      (current) => [
                                        ...new Set([
                                          ...current,
                                          ...missingIndices,
                                        ]),
                                      ],
                                    );
                                  }, 180);
                                }}
                              >
                                <div
                                  style={{
                                    height:
                                      filteredAssets.length * 46,
                                    position: "relative",
                                  }}
                                >
                                  {Array.from({
                                    length: Math.min(
                                      7,
                                      Math.max(
                                        0,
                                        filteredAssets.length -
                                          marketStartIndex,
                                      ),
                                    ),
                                  }).map((_, visibleIndex) => {
                                    const assetIndex =
                                      marketStartIndex +
                                      visibleIndex;

                                    const asset =
                                      filteredAssets[
                                        assetIndex
                                      ];

                                    if (!asset) {
                                      return null;
                                    }

                                    const isLoaded =
                                      marketLoadedIndices.includes(
                                        assetIndex,
                                      );

                                    return (
                                      <button
                                        key={`${asset.symbol}-${assetIndex}`}
                                        type="button"
                                        onClick={() => {
                                          setSymbol(asset.symbol);
                                          setMarketMenuOpen(false);
                                          setMarketSearch("");
                                          setMarketStartIndex(0);

                                          setMarketLoadedIndices(
                                            Array.from(
                                              {
                                                length: Math.min(
                                                  7,
                                                  assets.length,
                                                ),
                                              },
                                              (_, index) => index,
                                            ),
                                          );
                                        }}
                                        className={`absolute left-0 w-full ${
                                          symbol === asset.symbol
                                            ? "bg-[#1f1f1f]"
                                            : "hover:bg-[#1d1d1d]"
                                        }`}
                                        style={{
                                          top:
                                            assetIndex * 46,
                                          height: 46,
                                        }}
                                        role="option"
                                        aria-selected={
                                          symbol === asset.symbol
                                        }
                                      >
                                        {isLoaded ? (
                                          <div className="flex h-full items-center gap-3 px-4 text-left">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#222222]">
                                              <img
                                                src={`https://img.logo.dev/ticker/${asset.symbol}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`}
                                                alt=""
                                                className="h-full w-full object-contain"
                                                onError={(event) => {
                                                  event.currentTarget.style.display = "none";
                                                }}
                                              />
                                            </div>

                                            <div className="min-w-0">
                                              <p className="truncate text-[15px] font-medium text-[#d5d5d5]">
                                                {asset.symbol}
                                              </p>

                                              <p className="truncate text-[11px] text-[#777777]">
                                                {asset.name}
                                              </p>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex h-full items-center gap-3 px-4">
                                            <div className="h-7 w-7 animate-pulse rounded-full bg-[#252525]" />

                                            <div className="flex-1">
                                              <div className="h-3 w-20 animate-pulse rounded bg-[#252525]" />
                                              <div className="mt-1.5 h-2 w-28 animate-pulse rounded bg-[#202020]" />
                                            </div>
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>


                      {/* Side */}
                      <div className="w-[251px]">

                        <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          SIDE
                        </label>

                        <div className="flex h-[60px] overflow-hidden rounded-md border border-[#353535] bg-[#171717]">

                          <button
                            type="button"
                            onClick={() => setSide("buy")}
                            className={`flex-1 text-[16px] font-medium transition ${
                              side === "buy"
                                ? "bg-[#1d1d1d] text-[#22c77a]"
                                : "text-[#a5a5a5] hover:bg-[#1b1b1b]"
                            }`}
                          >
                            BUY
                          </button>

                          <button
                            type="button"
                            onClick={() => setSide("sell")}
                            className={`flex-1 border-l border-[#353535] text-[16px] font-medium transition ${
                              side === "sell"
                                ? "bg-[#1d1d1d] text-[#ef5350]"
                                : "text-[#a5a5a5] hover:bg-[#1b1b1b]"
                            }`}
                          >
                            SELL
                          </button>

                        </div>

                      </div>


                      {/* Quantity */}
                      <div className="w-[231px]">

                        <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          QUANTITY
                        </label>

                        <div className="relative">

                          <input
                            type="number"
                            value={quantity}
                            onChange={(event) =>
                              setQuantity(event.target.value)
                            }
                            className="h-[60px] w-full rounded-md border border-[#353535] bg-[#171717] px-4 pr-14 text-[16px] font-medium text-white outline-none transition focus:border-[#5a5a5a]"
                          />

                          <div className="absolute right-0 top-0 flex h-full w-12 flex-col border-l border-[#353535]">

                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(
                                  String(Number(quantity || 0) + 1),
                                )
                              }
                              className="flex flex-1 items-center justify-center text-[#b0b0b0] hover:bg-[#1d1d1d]"
                            >
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m6 14 6-6 6 6" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(
                                  String(
                                    Math.max(
                                      0,
                                      Number(quantity || 0) - 1,
                                    ),
                                  ),
                                )
                              }
                              className="flex flex-1 items-center justify-center border-t border-[#353535] text-[#b0b0b0] hover:bg-[#1d1d1d]"
                            >
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m6 10 6 6 6-6" />
                              </svg>
                            </button>

                          </div>

                        </div>

                      </div>


                      {/* Submit */}
                      <button
                        onClick={analyzeTrade}
                        disabled={analysisLoading}
                        className="flex h-[60px] flex-1 items-center justify-between rounded-md bg-[#ffd33d] px-6 text-[14px] font-semibold uppercase tracking-[0.08em] text-[#171717] transition hover:bg-[#ffda5c] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <span>
                          {analysisLoading
                            ? "ANALYZING..."
                            : "ANALYZE TRADE"}
                        </span>

                        <span className="text-[24px] font-normal">
                          →
                        </span>

                      </button>

                    </div>


                    {/* Disclaimer */}
                    <div className="mt-4 flex items-center gap-3 text-[13px] text-[#999999]">

                      <span className="text-[18px] text-[#aaaaaa]">
                        ♢
                      </span>

                      <span>
                        Paper trading via Alpaca
                      </span>

                      <span className="text-[#555555]">
                        •
                      </span>

                      <span>
                        All trades subject to TradeGuardian risk controls
                      </span>

                    </div>

                  </div>

                </section>

                {/* RIGHT: RISK CHECKS */}
                <div className="col-start-2 row-span-2 row-start-1 flex min-h-0 flex-col overflow-hidden rounded-md border border-[#272b31] bg-[#101010]">

                  {/* Risk Checks Header */}
                  <div className="px-7 pt-7">
                    <p className="text-[13px] tracking-[0.12em] text-[#a0a4ab]">
                      RISK CHECKS
                    </p>
                  </div>


                  {/* Risk Checks */}
                  <div className="mt-6 flex-1 px-7">

                    {/* Check 01 */}
                    <div className="border-b border-[#272b31] pb-6">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-5">

                          <span className="text-[18px] font-medium text-[#f0d04f]">
                            01
                          </span>

                          <div className="flex items-center gap-3">

                            <span className="text-[16px] text-[#e1e3e7]">
                              Exposure
                            </span>

                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#777b83] text-[10px] text-[#a7abb2]">
                              i
                            </span>

                          </div>

                        </div>

                        <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#1b1e22] px-3 text-[#a7abb2]">
                          —
                        </div>

                      </div>

                      <span className="mt-4 block text-[#4b5058]">
                        +
                      </span>

                    </div>


                    {/* Check 02 */}
                    <div className="border-b border-[#272b31] py-6">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-5">

                          <span className="text-[18px] font-medium text-[#f0d04f]">
                            02
                          </span>

                          <div className="flex items-center gap-3">

                            <span className="text-[16px] text-[#e1e3e7]">
                              Concentration
                            </span>

                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#777b83] text-[10px] text-[#a7abb2]">
                              i
                            </span>

                          </div>

                        </div>

                        <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#1b1e22] px-3 text-[#a7abb2]">
                          —
                        </div>

                      </div>

                      <span className="mt-4 block text-[#4b5058]">
                        +
                      </span>

                    </div>


                    {/* Check 03 */}
                    <div className="border-b border-[#272b31] py-6">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-5">

                          <span className="text-[18px] font-medium text-[#f0d04f]">
                            03
                          </span>

                          <div className="flex items-center gap-3">

                            <span className="text-[16px] text-[#e1e3e7]">
                              Buying Power
                            </span>

                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#777b83] text-[10px] text-[#a7abb2]">
                              i
                            </span>

                          </div>

                        </div>

                        <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#1b1e22] px-3 text-[#a7abb2]">
                          —
                        </div>

                      </div>

                      <span className="mt-4 block text-[#4b5058]">
                        +
                      </span>

                    </div>


                    {/* Check 04 */}
                    <div className="py-6">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-5">

                          <span className="text-[18px] font-medium text-[#f0d04f]">
                            04
                          </span>

                          <div className="flex items-center gap-3">

                            <span className="text-[16px] text-[#e1e3e7]">
                              Position
                            </span>

                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#777b83] text-[10px] text-[#a7abb2]">
                              i
                            </span>

                          </div>

                        </div>

                        <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#1b1e22] px-3 text-[#a7abb2]">
                          —
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* GUARDIAN DECISION */}
                  <div className="shrink-0 border-t border-[#272b31] px-7 py-5">

                    <p className="text-[10px] tracking-[0.16em] text-[#7d8797]">
                      GUARDIAN DECISION
                    </p>


                    {analysisResult ? (

                      <>

                        <p
                          className={`mt-3 text-[28px] font-semibold tracking-tight ${
                            analysisResult.decision.status === "APPROVED"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {analysisResult.decision.status}
                        </p>

                        <p className="mt-2 text-sm leading-5 text-[#7d8797]">
                          {analysisResult.decision.reasons[0]}
                        </p>

                      </>

                    ) : (

                      <div className="mt-3 flex items-center gap-3">

                        <span className="text-[28px] font-semibold tracking-tight text-[#a7abb2]">
                          STANDBY
                        </span>

                        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#1b1e22] px-2 text-[#a7abb2]">
                          —
                        </span>

                      </div>

                    )}

                    {!analysisResult && (
                      <p className="mt-4 text-sm text-[#7d8797]">
                        Run analysis to see results.
                      </p>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}


/* ACCOUNT METRIC */

function AccountMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.14em] text-[#667085]">
        {label}
      </p>

      <p className="mt-2 font-mono text-lg font-semibold text-[#e6eaf0]">
        {value}
      </p>
    </div>
  );
}


/* PIPELINE STEP */

function PipelineStep({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 py-5 ${
        last
          ? ""
          : "border-b border-[#252a33]"
      }`}
    >

      <div className="pt-0.5 font-mono text-[10px] text-[#8b9bb4]">
        {number}
      </div>


      <div className="min-w-0">

        <h4 className="text-sm font-medium text-[#e5e7eb]">
          {title}
        </h4>

        <p className="mt-1 text-xs leading-5 text-[#747d8c]">
          {description}
        </p>

      </div>

    </div>
  );
}
function MarketStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-r border-[#252a33] px-5 py-4 last:border-r-0">

      <p className="text-[9px] tracking-[0.14em] text-[#667085]">
        {label}
      </p>

      <p className="mt-2 font-mono text-sm text-[#dce1e9]">
        {value}
      </p>

    </div>
  );
}