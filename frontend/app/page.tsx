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

type RiskCheckStatus =
  "PASS" | "FAIL";

type RiskCheckResult = {
  status: RiskCheckStatus;
  reason: string;
};

type AnalysisResult = {
  audit_id: string;
  timestamp: string;
  message: string;

  proposal: {
    symbol: string;
    side: string;
    quantity: number;
    current_price: number;
    trade_value: number;
  };

  risk_metrics: {
    existing_quantity: number;
    projected_quantity: number;
    account_equity: number;
    buying_power: number;
    trade_percent_of_equity: number;
    existing_position_value: number;
    projected_position_value: number;
    projected_concentration_percent: number;
  };

  risk_checks: {
    exposure: RiskCheckResult;
    concentration: RiskCheckResult;
    buying_power: RiskCheckResult;
    position: RiskCheckResult;
  };

  decision: {
    status: string;
    reasons: string[];
  };
};

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("10");

  const [orderType, setOrderType] =
    useState<"market" | "limit">("market");

  const [entryPrice, setEntryPrice] =
    useState("");

  const [stopLoss, setStopLoss] =
    useState("");

  const [takeProfit, setTakeProfit] =
    useState("");

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

  const [marketScrollTop, setMarketScrollTop] =
    useState(0);

  const [loadedMarketIndices, setLoadedMarketIndices] =
    useState<Set<number>>(
      () => new Set(),
    );
  const MARKET_ROW_HEIGHT = 46;
  const MARKET_VISIBLE_ROWS = 6;

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
    useState<AnalysisResult | null>(null);

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
    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      alert(
        "Please enter a valid quantity.",
      );

      return;
    }
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
            quantity: parsedQuantity,
            order_type: orderType,
            entry_price:
              entryPrice.trim() === ""
                ? null
                : Number(entryPrice),
            stop_loss:
              stopLoss.trim() === ""
                ? null
                : Number(stopLoss),
            take_profit:
              takeProfit.trim() === ""
                ? null
                : Number(takeProfit),
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

      alert(
        error instanceof Error
          ? error.message
          : String(error),
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

  const marketStartIndex =
    Math.floor(
      marketScrollTop /
        MARKET_ROW_HEIGHT,
    );

  const marketEndIndex =
    Math.min(
      filteredAssets.length,
      marketStartIndex +
        MARKET_VISIBLE_ROWS +
        2,
    );

  const virtualAssets =
    filteredAssets.slice(
      marketStartIndex,
      marketEndIndex,
    );

  const topSpacerHeight =
    marketStartIndex *
    MARKET_ROW_HEIGHT;

  const bottomSpacerHeight =
    Math.max(
      0,
      (
        filteredAssets.length -
        marketEndIndex
      ) *
        MARKET_ROW_HEIGHT,
    );

  useEffect(() => {
    if (!marketMenuOpen) {
      return;
    }

    const visibleIndices =
      virtualAssets.map(
        (_, index) =>
          marketStartIndex + index,
      );

    const timer = window.setTimeout(() => {
      setLoadedMarketIndices(
        (previous) => {
          const next = new Set(previous);

          visibleIndices.forEach(
            (index) => {
              next.add(index);
            },
          );

          return next;
        },
      );
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    marketMenuOpen,
    marketStartIndex,
    virtualAssets.length,
  ]);

  const currentMarketPrice =
    marketData?.latest_price ??
    analysisResult?.proposal.current_price ??
    0;

  const parsedStopLoss =
    stopLoss.trim() === ""
      ? null
      : Number(stopLoss);

  const parsedTakeProfit =
    takeProfit.trim() === ""
      ? null
      : Number(takeProfit);

  const effectiveEntryPrice =
    orderType === "market"
      ? currentMarketPrice
      : Number(entryPrice);

  const hasValidEntryPrice =
    Number.isFinite(effectiveEntryPrice) &&
    effectiveEntryPrice > 0;

  const riskAmount =
    hasValidEntryPrice &&
    parsedStopLoss !== null
      ? Math.abs(
          effectiveEntryPrice -
          parsedStopLoss,
        )
      : null;

  const rewardAmount =
    hasValidEntryPrice &&
    parsedTakeProfit !== null
      ? Math.abs(
          parsedTakeProfit -
          effectiveEntryPrice,
        )
      : null;

  const riskRewardRatio =
    riskAmount &&
    riskAmount > 0 &&
    rewardAmount !== null
      ? rewardAmount / riskAmount
      : null;

  const stopLossValid =
    parsedStopLoss === null
      ? null
      : side === "buy"
        ? parsedStopLoss < effectiveEntryPrice
        : parsedStopLoss > effectiveEntryPrice;

  const stopLossPercent =
    parsedStopLoss !== null &&
    effectiveEntryPrice > 0
      ? (
          ((parsedStopLoss -
            effectiveEntryPrice) /
            effectiveEntryPrice) *
          100
        )
      : null;

  const takeProfitPercent =
    parsedTakeProfit !== null &&
    effectiveEntryPrice > 0
      ? (
          ((parsedTakeProfit -
            effectiveEntryPrice) /
            effectiveEntryPrice) *
          100
        )
      : null;

  const guardianRisk = (() => {
    if (!analysisResult) {
      return null;
    }

    let score = 0;

    // Backend risk check failures
    const backendChecks = [
      analysisResult.risk_checks.exposure,
      analysisResult.risk_checks.position,
      analysisResult.risk_checks.concentration,
      analysisResult.risk_checks.buying_power,
    ];

    const failedChecks =
      backendChecks.filter(
        (check) => check.status === "FAIL",
      ).length;

    score += failedChecks * 25;


    // Stop loss protection
    if (parsedStopLoss === null) {
      score += 30;
    } else if (!stopLossValid) {
      score += 50;
    }


    // Risk / reward
    if (
      riskRewardRatio !== null &&
      riskRewardRatio < 1
    ) {
      score += 15;
    } else if (
      riskRewardRatio !== null &&
      riskRewardRatio < 1.5
    ) {
      score += 8;
    }


    score = Math.min(
      100,
      Math.round(score),
    );


    const level =
      score <= 25
        ? "LOW RISK"
        : score <= 60
          ? "MODERATE RISK"
          : "HIGH RISK";


    const status =
      score <= 25
        ? "APPROVED"
        : score <= 60
          ? "FLAGGED"
          : "BLOCKED";


    return {
      score,
      level,
      status,
    };
  })();

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
          <section className="flex min-h-0 flex-1 overflow-visible">

            <div className="flex min-h-0 flex-1 flex-col overflow-visible px-7 py-3">

              {/* MARKET + VERIFICATION */}
              <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_280px] gap-4">

                {/* LEFT: MARKET */}
                <div className="col-start-1 row-start-1 flex min-h-0 flex-col overflow-hidden rounded-md border border-[#272b31] bg-[#101010]">

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
                  <div className="mt-5 min-h-0 flex-1 px-6 pb-5">

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
                <section className="relative z-30 col-start-1 row-start-2 flex min-h-0 flex-col overflow-visible rounded-md border border-[#2d2d2d] bg-[#111111] px-5 py-3">

                  <div className="w-full shrink-0">

                    {/* Main Trade Controls */}
                    <div className="grid grid-cols-3 gap-x-5 gap-y-2">

                      {/* Symbol */}
                      <div className="relative z-50">

                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          SYMBOL
                        </label>

                        <div className="relative">

                          <button
                            type="button"
                            onClick={() => {
                              const nextOpen = !marketMenuOpen;

                              setMarketMenuOpen(nextOpen);

                              if (nextOpen) {
                                setMarketSearch("");
                                setMarketScrollTop(0);
                                setLoadedMarketIndices(new Set());
                              }
                            }}
                            className="flex h-[48px] w-full items-center rounded-md border border-[#353535] bg-[#171717] px-4 text-left text-white transition hover:border-[#4a4a4a] hover:bg-[#1b1b1b]"
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

                            <span className="ml-3 text-[15px] font-medium">
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
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>

                          </button>


                          {/* Keep your existing Market Dropdown here */}
                          {marketMenuOpen && (
                            <div
                              className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-md border border-[#353535] bg-[#171717] shadow-xl"
                              role="listbox"
                            >

                              <div className="border-b border-[#303030] p-3">
                                <div className="relative">

                                  <input
                                    type="text"
                                    value={marketSearch}
                                    onChange={(event) => {
                                      const value =
                                        event.target.value;

                                      setMarketSearch(value);
                                      setMarketScrollTop(0);
                                      setLoadedMarketIndices(
                                        new Set(),
                                      );
                                    }}
                                    placeholder="Search markets..."
                                    className="h-10 w-full rounded-md border border-[#353535] bg-[#121212] px-3 text-[13px] text-white outline-none placeholder:text-[#666666]"
                                  />

                                </div>
                              </div>

                              <div
                                className="h-[276px] overflow-y-auto market-scroll"
                                onScroll={(event) => {
                                  setMarketScrollTop(
                                    event.currentTarget.scrollTop,
                                  );
                                }}
                              >

                                {assetsLoading ? (

                                  <div className="space-y-1 p-2">

                                    {Array.from(
                                      { length: 6 },
                                      (_, index) => (
                                        <div
                                          key={index}
                                          className="flex h-[46px] items-center gap-3 px-2"
                                        >

                                          <div className="h-7 w-7 animate-pulse rounded-full bg-[#252525]" />

                                          <div className="flex-1 space-y-2">

                                            <div className="h-3 w-16 animate-pulse rounded bg-[#252525]" />

                                            <div className="h-2 w-28 animate-pulse rounded bg-[#202020]" />

                                          </div>

                                        </div>
                                      ),
                                    )}

                                  </div>

                                ) : filteredAssets.length === 0 ? (

                                  <div className="flex h-[120px] items-center justify-center">

                                    <span className="text-[13px] text-[#777777]">
                                      No markets found
                                    </span>

                                  </div>

                                ) : (

                                  <>
                                    <div
                                      style={{
                                        height: topSpacerHeight,
                                      }}
                                    />

                                    {virtualAssets.map(
                                      (asset, assetIndex) => {
                                        const realIndex =
                                          marketStartIndex + assetIndex;

                                        const isLoaded =
                                          loadedMarketIndices.has(
                                            realIndex,
                                          );

                                        return (
                                          <button
                                            key={`${asset.symbol}-${realIndex}`}
                                            type="button"
                                            onClick={() => {
                                              setSymbol(asset.symbol);
                                              setMarketMenuOpen(false);
                                              setMarketSearch("");
                                              setMarketScrollTop(0);
                                              setLoadedMarketIndices(
                                                new Set(),
                                              );
                                            }}
                                            className={`flex h-[46px] w-full items-center gap-3 px-4 text-left ${
                                              symbol === asset.symbol
                                                ? "bg-[#1f1f1f]"
                                                : "hover:bg-[#1d1d1d]"
                                            }`}
                                          >
                                            {!isLoaded ? (
                                              <div className="flex w-full items-center gap-3">
                                                <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#252525]" />

                                                <div className="flex-1 space-y-2">
                                                  <div className="h-3 w-16 animate-pulse rounded bg-[#252525]" />

                                                  <div className="h-2 w-28 animate-pulse rounded bg-[#202020]" />
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#222222]">
                                                  <img
                                                    src={`https://img.logo.dev/ticker/${asset.symbol}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`}
                                                    alt=""
                                                    className="h-full w-full object-contain"
                                                    onError={(event) => {
                                                      event.currentTarget.style.display =
                                                        "none";
                                                    }}
                                                  />
                                                </div>

                                                <div className="min-w-0">
                                                  <p className="truncate text-[14px] font-medium text-[#d5d5d5]">
                                                    {asset.symbol}
                                                  </p>

                                                  <p className="truncate text-[11px] text-[#777777]">
                                                    {asset.name}
                                                  </p>
                                                </div>
                                              </>
                                            )}
                                          </button>
                                        );
                                      },
                                    )}

                                    <div
                                      style={{
                                        height: bottomSpacerHeight,
                                      }}
                                    />
                                  </>

                                )}

                              </div>

                            </div>
                          )}

                        </div>

                      </div>


                      {/* Side */}
                      <div>

                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          SIDE
                        </label>

                        <div className="flex h-[48px] overflow-hidden rounded-md border border-[#353535] bg-[#171717]">

                          <button
                            type="button"
                            onClick={() => setSide("buy")}
                            className={`flex-1 text-[14px] font-medium transition ${
                              side === "buy"
                                ? "bg-[#1d1d1d] text-[#22c77a]"
                                : "text-[#a5a5a5]"
                            }`}
                          >
                            BUY
                          </button>

                          <button
                            type="button"
                            onClick={() => setSide("sell")}
                            className={`flex-1 border-l border-[#353535] text-[14px] font-medium transition ${
                              side === "sell"
                                ? "bg-[#1d1d1d] text-[#ef5350]"
                                : "text-[#a5a5a5]"
                            }`}
                          >
                            SELL
                          </button>

                        </div>

                      </div>


                      {/* Quantity */}
                      <div>

                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          QUANTITY
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(event) =>
                            setQuantity(event.target.value)
                          }
                          className="h-[48px] w-full rounded-md border border-[#353535] bg-[#171717] px-4 text-[15px] font-medium text-white outline-none transition focus:border-[#5a5a5a]"
                        />

                      </div>

                      {/* Entry Price */}
                      <div>

                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          ENTRY PRICE
                        </label>

                        <div className="flex h-[48px] overflow-hidden rounded-md border border-[#353535] bg-[#171717]">

                          <button
                            type="button"
                            onClick={() =>
                              setOrderType("market")
                            }
                            className={`px-4 text-[13px] font-medium ${
                              orderType === "market"
                                ? "bg-[#1d1d1d] text-[#f0d04f]"
                                : "text-[#8d939b]"
                            }`}
                          >
                            Market
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              setOrderType("limit")
                            }
                            className={`border-l border-[#353535] px-4 text-[13px] font-medium ${
                              orderType === "limit"
                                ? "bg-[#1d1d1d] text-[#f0d04f]"
                                : "text-[#8d939b]"
                            }`}
                          >
                            Limit
                          </button>


                          <input
                            type="number"
                            step="0.01"
                            disabled={orderType === "market"}
                            value={
                              orderType === "market"
                                ? currentMarketPrice.toFixed(2)
                                : entryPrice
                            }
                            onChange={(event) =>
                              setEntryPrice(event.target.value)
                            }
                            placeholder="0.00"
                            className="min-w-0 flex-1 border-l border-[#353535] bg-[#171717] px-3 text-[13px] text-white outline-none disabled:text-[#a7abb2]"
                          />

                        </div>


                        <p className="mt-2 text-[11px] text-[#777d87]">
                          Current Market Price
                        </p>

                      </div>


                      {/* Stop Loss */}
                      <div>

                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          STOP LOSS
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          value={stopLoss}
                          onChange={(event) =>
                            setStopLoss(event.target.value)
                          }
                          placeholder="Optional"
                          className="h-[48px] w-full rounded-md border border-[#353535] bg-[#171717] px-4 text-[14px] text-white outline-none placeholder:text-[#666666] focus:border-[#ef5350]"
                        />
                        <p
                          className={`mt-2 text-[11px] ${
                            stopLossPercent === null
                              ? "text-[#777d87]"
                              : stopLossPercent < 0
                                ? "text-[#ef7770]"
                                : "text-[#ef7770]"
                          }`}
                        >
                          {stopLossPercent === null
                            ? "Optional"
                            : `${stopLossPercent.toFixed(2)}% ($${Math.abs(
                                effectiveEntryPrice -
                                Number(stopLoss),
                              ).toFixed(2)})`}
                        </p>
                      </div>


                      {/* Take Profit */}
                      <div>

                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a9a9a]">
                          TAKE PROFIT
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          value={takeProfit}
                          onChange={(event) =>
                            setTakeProfit(event.target.value)
                          }
                          placeholder="Optional"
                          className="h-[48px] w-full rounded-md border border-[#353535] bg-[#171717] px-4 text-[14px] text-white outline-none placeholder:text-[#666666] focus:border-[#22c77a]"
                        />
                        <p
                          className={`mt-2 text-[11px] ${
                            takeProfitPercent === null
                              ? "text-[#777d87]"
                              : "text-[#38c980]"
                          }`}
                        >
                          {takeProfitPercent === null
                            ? "Optional"
                            : `${takeProfitPercent >= 0 ? "+" : ""}${takeProfitPercent.toFixed(2)}% ($${Math.abs(
                                Number(takeProfit) -
                                effectiveEntryPrice,
                              ).toFixed(2)})`}
                        </p>
                      </div>


                      {/* Analyze */}
                      {/* Bottom Row: Disclaimer + Analyze */}
                      <div className="col-span-3 flex items-center justify-between pt-1">

                        {/* Disclaimer */}
                        <div className="flex items-center gap-3 text-[12px] text-[#999999]">

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


                        {/* Analyze Button */}
                        <button
                          onClick={analyzeTrade}
                          disabled={analysisLoading}
                          className="flex h-[48px] w-[205px] shrink-0 items-center justify-between rounded-md bg-[#ffd33d] px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#171717] transition hover:bg-[#ffda5c] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          <span>
                            {analysisLoading
                              ? "ANALYZING..."
                              : "ANALYZE TRADE"}
                          </span>

                          <span className="text-[22px] font-normal">
                            →
                          </span>

                        </button>

                      </div>

                    </div>

                  </div>

                </section>

                {/* RIGHT: RISK CHECKS */}
                {/* RIGHT: RISK ANALYSIS + GUARDIAN DECISION */}
                <div className="col-start-2 row-span-2 row-start-1 flex min-h-0 flex-col gap-3">

                  {/* RISK ANALYSIS */}
                  <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#272b31] bg-[#101010]">

                    {/* Header */}
                    <div className="flex shrink-0 items-start justify-between border-b border-[#272b31] px-5 py-5">

                      <div className="flex items-center gap-3">

                        <p className="text-[13px] tracking-[0.12em] text-[#a0a4ab]">
                          RISK ANALYSIS
                        </p>

                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#555b65] text-[9px] text-[#8b939e]">
                          i
                        </span>

                      </div>

                      <div className="text-right">

                        <div className="flex items-baseline justify-end gap-1">

                          <span className="text-[11px] text-[#a0a4ab]">
                            Risk Level
                          </span>

                          <span className="font-mono text-[24px] font-semibold text-[#f0d04f]">
                            {guardianRisk
                              ? guardianRisk.score
                              : "—"}
                          </span>

                          <span className="text-[12px] text-[#8d939c]">
                            /100
                          </span>

                        </div>

                        <p className="mt-1 text-[10px] font-medium tracking-[0.12em] text-[#f0d04f]">
                          {guardianRisk
                            ? guardianRisk.level
                            : "STANDBY"}
                        </p>

                      </div>

                    </div>


                    {/* Checks */}
                    <div className="risk-analysis-scroll min-h-0 flex-1 overflow-y-auto px-4">

                      <DetailedRiskCheck
                        number="01"
                        title="Trade Risk"
                        subtitle={
                          analysisResult
                            ? `$${analysisResult.proposal.trade_value.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )} (${analysisResult.risk_metrics.trade_percent_of_equity.toFixed(2)}% of equity)`
                            : "Waiting for analysis"
                        }
                        status={
                          analysisResult
                            ? analysisResult.risk_checks.exposure.status === "PASS"
                              ? "pass"
                              : "fail"
                            : "idle"
                        }
                      />


                      <DetailedRiskCheck
                        number="02"
                        title="Position Size"
                        subtitle={
                          analysisResult
                            ? `Recommended: ${analysisResult.risk_metrics.projected_quantity} shares`
                            : "Waiting for analysis"
                        }
                        status={
                          analysisResult
                            ? analysisResult.risk_checks.position.status === "PASS"
                              ? "pass"
                              : "fail"
                            : "idle"
                        }
                      />


                      <DetailedRiskCheck
                        number="03"
                        title="Risk / Reward"
                        subtitle={
                          riskRewardRatio !== null
                            ? `Potential R:R  1 : ${riskRewardRatio.toFixed(2)}`
                            : "Set stop loss and take profit"
                        }
                        status={
                          riskRewardRatio === null
                            ? "idle"
                            : riskRewardRatio >= 1.5
                              ? "pass"
                              : "warning"
                        }
                      />


                      <DetailedRiskCheck
                        number="04"
                        title="Concentration"
                        subtitle={
                          analysisResult
                            ? `Projected ${symbol} allocation: ${analysisResult.risk_metrics.projected_concentration_percent.toFixed(2)}%`
                            : "Waiting for analysis"
                        }
                        status={
                          analysisResult
                            ? analysisResult.risk_checks.concentration.status === "PASS"
                              ? "pass"
                              : "fail"
                            : "idle"
                        }
                      />


                      <DetailedRiskCheck
                        number="05"
                        title="Buying Power"
                        subtitle={
                          analysisResult
                            ? `Trade cost: $${analysisResult.proposal.trade_value.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}`
                            : "Waiting for analysis"
                        }
                        secondaryText={
                          analysisResult
                            ? `Available: $${analysisResult.risk_metrics.buying_power.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}`
                            : undefined
                        }
                        status={
                          analysisResult
                            ? analysisResult.risk_checks.buying_power.status === "PASS"
                              ? "pass"
                              : "fail"
                            : "idle"
                        }
                      />


                      <DetailedRiskCheck
                        number="06"
                        title="Stop Loss Validity"
                        subtitle={
                          parsedStopLoss === null
                            ? "No stop loss set"
                            : stopLossValid
                              ? "Stop loss placement is valid"
                              : "Stop loss is on the wrong side of entry"
                        }
                        status={
                          parsedStopLoss === null
                            ? "warning"
                            : stopLossValid
                              ? "pass"
                              : "fail"
                        }
                      />


                      <DetailedRiskCheck
                        number="07"
                        title="Volatility (ATR)"
                        subtitle="Volatility analysis not yet available"
                        status="idle"
                      />


                      <DetailedRiskCheck
                        number="08"
                        title="Correlation Risk"
                        subtitle="Portfolio correlation analysis not yet available"
                        status="idle"
                      />


                      <DetailedRiskCheck
                        number="09"
                        title="Drawdown Impact"
                        subtitle="Projected drawdown analysis not yet available"
                        status="idle"
                        last
                      />

                    </div>

                  </section>

                  {/* GUARDIAN DECISION */}
                  <section className="shrink-0 rounded-md border border-[#272b31] bg-[#101010] p-5">

                    {/* Header */}
                    <div className="flex items-center gap-2">

                      <p className="text-[11px] tracking-[0.14em] text-[#9ca3ad]">
                        GUARDIAN DECISION
                      </p>

                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#555b65] text-[9px] text-[#8b939e]">
                        i
                      </span>

                    </div>


                    {analysisResult ? (

                      <>
                        {/* Decision */}
                        <div className="mt-4 flex items-center gap-3">

                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-md ${
                              analysisResult.decision.status === "APPROVED"
                                ? "bg-[#143225] text-[#38c980]"
                                : analysisResult.decision.status === "FLAGGED"
                                  ? "bg-[#3a3114] text-[#f0d04f]"
                                  : "bg-[#3a1c1c] text-[#ef5350]"
                            }`}
                          >
                            {analysisResult.decision.status === "APPROVED"
                              ? "✓"
                              : analysisResult.decision.status === "FLAGGED"
                                ? "!"
                                : "×"}
                          </span>


                          <p
                            className={`text-[25px] font-semibold tracking-tight ${
                              analysisResult.decision.status === "APPROVED"
                                ? "text-[#38c980]"
                                : analysisResult.decision.status === "FLAGGED"
                                  ? "text-[#f0d04f]"
                                  : "text-[#ef5350]"
                            }`}
                          >
                            {analysisResult.decision.status === "APPROVED"
                              ? "APPROVED"
                              : analysisResult.decision.status === "FLAGGED"
                                ? "CAUTION"
                                : "BLOCKED"}
                          </p>

                        </div>


                        {/* Description */}
                        <p className="mt-2 text-[13px] leading-5 text-[#a0a4ab]">
                          {analysisResult.decision.reasons[0]}
                        </p>


                        {/* Metrics */}
                        <div className="mt-4 grid grid-cols-3 divide-x divide-[#272b31] border-t border-[#272b31] pt-4">

                          <DecisionMetric
                            label="MAX LOSS"
                            value={
                              riskAmount !== null
                                ? `$${(
                                    riskAmount *
                                    Number(quantity || 0)
                                  ).toFixed(2)}`
                                : "—"
                            }
                            subvalue={
                              riskAmount !== null &&
                              effectiveEntryPrice > 0
                                ? `${(
                                    (riskAmount /
                                      effectiveEntryPrice) *
                                    100
                                  ).toFixed(2)}% of entry`
                                : "Set stop loss"
                            }
                          />


                          <DecisionMetric
                            label="RISK / REWARD"
                            value={
                              riskRewardRatio !== null
                                ? `1 : ${riskRewardRatio.toFixed(2)}`
                                : "—"
                            }
                            subvalue="Potential ratio"
                          />


                          <DecisionMetric
                            label="RISK LEVEL"
                            value={
                              analysisResult.decision.status === "APPROVED"
                                ? "LOW"
                                : analysisResult.decision.status === "FLAGGED"
                                  ? "MODERATE"
                                  : "HIGH"
                            }
                            subvalue={
                              analysisResult.decision.status === "APPROVED"
                                ? "Low Risk"
                                : analysisResult.decision.status === "FLAGGED"
                                  ? "Moderate Risk"
                                  : "High Risk"
                            }
                          />

                        </div>


                        {/* Review Button */}
                        <button
                          type="button"
                          className="mt-4 flex h-[38px] w-full items-center justify-center gap-4 rounded-md border border-[#b89620] text-[11px] font-semibold tracking-[0.1em] text-[#e6c44a] transition hover:bg-[#1b1b1b]"
                        >
                          <span>
                            REVIEW DETAILS
                          </span>

                          <span className="text-base">
                            →
                          </span>
                        </button>

                      </>

                    ) : (

                      <div className="mt-5">

                        <p className="text-[25px] font-semibold text-[#a7abb2]">
                          STANDBY
                        </p>

                        <p className="mt-2 text-[13px] text-[#7d8797]">
                          Run analysis to evaluate this trade.
                        </p>

                      </div>

                    )}

                  </section>

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
function RiskCheck({
  number,
  title,
  value,
  status,
  description,
  last = false,
}: {
  number: string;
  title: string;
  value: string;
  status: "pass" | "fail" | "idle";
  description: string;
  last?: boolean;
}) {
  const statusStyles = {
    pass: {
      badge:
        "bg-[#143225] text-[#38c980]",
      icon: "✓",
    },

    fail: {
      badge:
        "bg-[#3a1c1c] text-[#ef5350]",
      icon: "!",
    },

    idle: {
      badge:
        "bg-[#1b1e22] text-[#a7abb2]",
      icon: "—",
    },
  };

  const currentStatus =
    statusStyles[status];

  return (
    <div
      className={`py-6 ${
        last
          ? ""
          : "border-b border-[#272b31]"
      }`}
    >

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-5">

          <span className="text-[18px] font-medium text-[#f0d04f]">
            {number}
          </span>

          <div>

            <div className="flex items-center gap-3">

              <span className="text-[16px] text-[#e1e3e7]">
                {title}
              </span>

              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#777b83] text-[10px] text-[#a7abb2]">
                i
              </span>

            </div>

            <p className="mt-2 text-[12px] text-[#707780]">
              {description}
            </p>

          </div>

        </div>


        <div className="flex flex-col items-end gap-2">

          <span
            className={`flex min-h-9 min-w-9 items-center justify-center rounded-full px-3 text-[14px] font-medium ${
              currentStatus.badge
            }`}
          >
            {currentStatus.icon}
          </span>

          <span className="font-mono text-[12px] text-[#b7bbc2]">
            {value}
          </span>

        </div>

      </div>

    </div>
  );
}
function DetailedRiskCheck({
  number,
  title,
  subtitle,
  secondaryText,
  status,
  last = false,
}: {
  number: string;
  title: string;
  subtitle: string;
  secondaryText?: string;
  status: "pass" | "fail" | "warning" | "idle";
  last?: boolean;
}) {
  const styles = {
    pass: {
      badge:
        "bg-[#143225] text-[#38c980]",
      text: "PASS",
    },

    fail: {
      badge:
        "bg-[#3a1c1c] text-[#ef5350]",
      text: "FAIL",
    },

    warning: {
      badge:
        "bg-[#3a3114] text-[#f0d04f]",
      text: "WARNING",
    },

    idle: {
      badge:
        "bg-[#1b1e22] text-[#7d8797]",
      text: "—",
    },
  };

  const current =
    styles[status];

  return (
    <div
      className={`flex items-start gap-3 px-2 py-3 ${
        last
          ? ""
          : "border-b border-[#272b31]"
      }`}
    >

      <span className="mt-0.5 font-mono text-[13px] font-medium text-[#e6c44a]">
        {number}
      </span>


      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <p className="text-[14px] font-medium text-[#dfe2e7]">
            {title}
          </p>

          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#4b515a] text-[9px] text-[#7d8797]">
            i
          </span>

        </div>


        <p className="mt-1 truncate text-[11px] text-[#9299a3]">
          {subtitle}
        </p>


        {secondaryText && (
          <p className="mt-1 text-[11px] text-[#9299a3]">
            {secondaryText}
          </p>
        )}

      </div>


      <div className="flex items-center gap-3">

        <span
          className={`rounded-sm px-3 py-1.5 text-[10px] font-semibold tracking-wide ${
            current.badge
          }`}
        >
          {current.text}
        </span>


        <span className="text-[#747b85]">
          ⌄
        </span>

      </div>

    </div>
  );
}


function DecisionMetric({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue: string;
}) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">

      <p className="text-[9px] tracking-[0.12em] text-[#747b85]">
        {label}
      </p>

      <p className="mt-2 text-[15px] font-semibold text-[#e1e3e7]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#8b939e]">
        {subvalue}
      </p>

    </div>
  );
}