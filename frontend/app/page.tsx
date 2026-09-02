'use client';

import React, { useState, useEffect, useRef } from 'react';
import AIOpportunity from './pages/ai_opportunity';
import { Sidebar } from './components/Sidebar';

// 1. Backend API Response Interfaces
interface BackendRiskCheckItem {
  status: 'PASS' | 'FAIL';
  reason: string;
}

interface BackendAnalysisResponse {
  message: string;
  proposal: {
    symbol: string;
    side: string;
    quantity: number;
    current_price: number;
    trade_value: number;
  };
  risk_metrics: {
    account_equity: number;
    buying_power: number;
    trade_percent_of_equity: number;
    existing_position_value: number;
    projected_position_value: number;
    projected_concentration_percent: number;
  };
  risk_checks: {
    exposure: BackendRiskCheckItem;
    concentration: BackendRiskCheckItem;
    buying_power: BackendRiskCheckItem;
    position: BackendRiskCheckItem;
  };
  decision: {
    status: 'APPROVED' | 'BLOCKED' | 'WARNING';
    reasons: string[];
  };
}

export default function TradeAnalysisPage() {
  // ALL HOOKS MUST BE DECLARED FIRST AT THE TOP LEVEL
  const [currentView, setCurrentView] = useState<'analysis' | 'ai_opportunity'>('analysis');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '1Y'>('1M');
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Trade form inputs
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [orderType, setOrderType] = useState<string>('Market');
  const [entryMode, setEntryMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>('321.25');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<BackendAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // TradingView Chart Effect (must be declared before any return)
  useEffect(() => {
    if (currentView !== 'analysis') return;
    if (!chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    chartContainerRef.current.appendChild(widgetDiv);

    const intervalMap: Record<string, string> = {
      '1D': '5',
      '5D': '30',
      '1M': 'D',
      '3M': 'D',
      '1Y': 'W',
    };

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol.includes(':') ? symbol : `NASDAQ:${symbol}`,
      interval: intervalMap[timeframe] || 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: 'rgba(19, 19, 21, 1)',
      gridColor: 'rgba(43, 42, 44, 0.4)',
      hide_top_toolbar: true,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    chartContainerRef.current.appendChild(script);
  }, [symbol, timeframe, currentView]);

  // TradeGuardian AI Risk Analysis Function
  const handleAnalyzeTrade = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${backendUrl}/analyze/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          side: side.toLowerCase(), // FastAPI expects "buy" or "sell"
          quantity: Number(quantity),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data: BackendAnalysisResponse = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Error connecting to TradeGuardian backend:', err);
      setErrorMessage(err.message || 'Failed to connect to TradeGuardian API');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // CONDITIONAL VIEW SWITCH (NOW SAFELY PLACED AFTER ALL HOOKS)
  if (currentView === 'ai_opportunity') {
    return <AIOpportunity onNavigate={(tab) => setCurrentView(tab)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#131315] text-[#e4e4e7] font-sans antialiased">
      {/* Embedded fonts and custom scrollbar styles to ensure identical rendering */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #131315;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* BEGIN: Sidebar */}
        <Sidebar activeTab="analysis" onNavigate={(tab) => setCurrentView(tab)} />
        {/* END: Sidebar */}

        {/* BEGIN: Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-[#131315]">
          {/* BEGIN: MainHeader */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-[#2b2a2c] shrink-0 bg-[#131315]">
            <div className="flex items-center gap-6">
              <h1 className="text-lg font-bold text-[#e4e4e7]">Trade Analysis</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Market Data Connected
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-[#facc15] text-[#facc15] rounded text-xs font-medium hover:bg-[#facc15]/10 transition-colors">
                Paper Account
                <svg
                  fill="none"
                  height="14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </header>
          {/* END: MainHeader */}

          <div className="flex-1 flex overflow-hidden">
            <main className="flex flex-col min-w-0 overflow-y-auto custom-scrollbar flex-1 pr-4 pt-6 pl-6 pb-6">
              {/* Chart Panel */}
              <div className="bg-[#131315] border border-[#2b2a2c] rounded-lg p-6 flex flex-col shrink-0 min-h-[460px] flex-1 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">{symbol}</h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold">
                        ${analysisResult ? analysisResult.proposal.current_price.toFixed(2) : '321.25'}
                      </span>
                      <span className="text-sm font-medium text-[#10b981]">+2.34 (0.73%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0e0e10] border border-[#2b2a2c] rounded p-1">
                    {(['1D', '5D', '1M', '3M', '1Y'] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 text-xs transition-colors rounded ${
                          timeframe === tf
                            ? 'font-bold text-[#131315] bg-[#facc15]'
                            : 'font-medium text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                    <div className="w-px h-4 bg-[#2b2a2c] mx-1" />
                    <button type="button" className="p-1 text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
                      <svg
                        fill="none"
                        height="14"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="14"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* TradingView Chart Container */}
                <div className="flex-1 w-full min-h-[360px] relative overflow-hidden rounded">
                  <div ref={chartContainerRef} className="w-full h-full" />
                </div>
              </div>

              {/* Trade Details Panel */}
              <div className="bg-[#131315] border border-[#2b2a2c] rounded-lg shrink-0 p-4">
                <h3 className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-6">
                  TRADE DETAILS
                </h3>
                <div className="grid grid-cols-12 gap-6 mb-4">
                  <div className="col-span-4 space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Symbol
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-[#a1a1aa]"
                          fill="currentColor"
                          viewBox="0 0 384 512"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                        </svg>
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="text-[#a1a1aa]"
                          fill="none"
                          height="14"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="14"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                      <input
                        className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 pl-10 pr-8 text-sm font-medium text-[#e4e4e7] focus:outline-none focus:border-[#facc15] cursor-text"
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  <div className="col-span-4 space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Side
                    </label>
                    <div className="flex bg-[#0e0e10] rounded border border-[#2b2a2c]">
                      <button
                        type="button"
                        onClick={() => setSide('BUY')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded shadow-sm transition-colors ${
                          side === 'BUY'
                            ? 'text-[#10b981] bg-[#1c2921] border border-[#10b981]/30'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setSide('SELL')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded shadow-sm transition-colors ${
                          side === 'SELL'
                            ? 'text-[#ef4444] bg-[#291c1c] border border-[#ef4444]/30'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div className="col-span-4 space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase flex justify-between">
                      Quantity
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#facc15]"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    <div className="text-[10px] text-[#a1a1aa]/60 mt-1">
                      Max: 1,247 shares
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6 mb-4">
                  <div className="col-span-4 space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Order Type
                    </label>
                    <div className="relative">
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#facc15] appearance-none cursor-pointer"
                      >
                        <option value="Market">Market</option>
                        <option value="Limit">Limit</option>
                        <option value="Stop">Stop</option>
                        <option value="Stop Limit">Stop Limit</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="text-[#a1a1aa]"
                          fill="none"
                          height="14"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="14"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-8 space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Entry Price
                    </label>
                    <div className="flex bg-[#0e0e10] rounded border border-[#2b2a2c] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setEntryMode('MARKET')}
                        className={`px-6 py-2.5 text-xs font-bold transition-colors ${
                          entryMode === 'MARKET' ? 'text-[#131315] bg-[#facc15]' : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        MARKET
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntryMode('LIMIT')}
                        className={`px-6 py-2.5 text-xs font-bold border-r border-[#2b2a2c]/50 transition-colors ${
                          entryMode === 'LIMIT' ? 'text-[#131315] bg-[#facc15]' : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        LIMIT
                      </button>
                      <input
                        className={`flex-1 bg-transparent border-none py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:ring-0 text-right ${
                          entryMode === 'MARKET' ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
                        }`}
                        disabled={entryMode === 'MARKET'}
                        placeholder="0.00"
                        type="text"
                        value={entryMode === 'MARKET' ? '0.00' : limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Stop Loss
                    </label>
                    <input
                      className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#facc15]"
                      placeholder="Optional"
                      type="text"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                    />
                    <div className="text-[10px] text-[#a1a1aa]/60 mt-1">Price or %</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Take Profit
                    </label>
                    <input
                      className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#facc15]"
                      placeholder="Optional"
                      type="text"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                    />
                    <div className="text-[10px] text-[#a1a1aa]/60 mt-1">Price or %</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#2b2a2c] pt-4">
                  <button type="button" className="flex items-center gap-2 text-xs font-medium text-[#facc15] hover:text-[#facc15]/80 transition-colors">
                    <svg
                      fill="none"
                      height="14"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Advanced Options
                    <svg
                      fill="none"
                      height="12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* ACTIVE ANALYZE TRADE BUTTON */}
                  <button
                    type="button"
                    onClick={handleAnalyzeTrade}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-[#facc15] text-[#131315] font-bold text-sm px-8 py-3 rounded hover:bg-[#facc15]/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-[#131315]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        ANALYZING RISK...
                      </>
                    ) : (
                      <>
                        ANALYZE TRADE
                        <svg
                          fill="none"
                          height="16"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-[10px] text-[#a1a1aa]/60 mt-2 px-1">
                <div className="flex items-center gap-2">
                  <svg
                    fill="none"
                    height="12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  All trades are subject to TradeGuardian risk controls and market conditions.
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#10b981]" />
                  Data provided by Alpaca Markets
                </div>
              </div>
            </main>

            {/* BEGIN: Right Side Panels */}
            <aside
              className="flex flex-col border-l border-[#2b2a2c] bg-[#131315] shrink-0 h-full p-6 overflow-y-auto custom-scrollbar"
              style={{ width: '400px' }}
            >
              {/* Risk Analysis Panel */}
              <div className="flex flex-col bg-[#131315] border border-[#2b2a2c] rounded-lg flex-1 mb-4">
                <div className="flex items-center justify-between p-4 border-b border-[#2b2a2c] shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-widest">
                      RISK ANALYSIS
                    </h3>
                    <svg
                      className="text-[#a1a1aa]"
                      fill="none"
                      height="12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="12"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  {analysisResult ? (
                    <span className="text-[9px] font-bold text-[#10b981] border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 rounded">
                      EVALUATED
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
                      STANDBY
                    </span>
                  )}
                </div>

                <div className="flex-1 p-6 relative overflow-y-auto">
                  {!analysisResult ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 bg-[#131315]/80 backdrop-blur-[1px]">
                      <div className="text-[#a1a1aa] mb-3">
                        <svg fill="none" height="32" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="32">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                      <p className="text-xs text-[#a1a1aa]">
                        Run an analysis to see<br />TradeGuardian risk checks.
                      </p>
                      {errorMessage && (
                        <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Metric Cards from Alpaca Backend */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-[#0e0e10] border border-[#2b2a2c] rounded">
                          <div className="text-[10px] text-[#a1a1aa] uppercase">Trade Value</div>
                          <div className="text-lg font-bold text-[#e4e4e7] mt-0.5">
                            ${analysisResult.proposal.trade_value.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-[#a1a1aa]">
                            @ ${analysisResult.proposal.current_price} / share
                          </div>
                        </div>
                        <div className="p-3 bg-[#0e0e10] border border-[#2b2a2c] rounded">
                          <div className="text-[10px] text-[#a1a1aa] uppercase">Equity Exposure</div>
                          <div className="text-lg font-bold text-[#10b981] mt-0.5">
                            {analysisResult.risk_metrics.trade_percent_of_equity}%
                          </div>
                          <div className="text-[9px] text-[#a1a1aa]">Portfolio Share</div>
                        </div>
                      </div>

                      {/* Checks returned by routes/analyze.py */}
                      <div className="space-y-2 pt-2 border-t border-[#2b2a2c]/50">
                        <div className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
                          TradeGuardian Guardrails
                        </div>

                        {[
                          { title: 'Buying Power Check', check: analysisResult.risk_checks.buying_power },
                          { title: 'Trade Exposure (≤10%)', check: analysisResult.risk_checks.exposure },
                          { title: 'Concentration (≤25%)', check: analysisResult.risk_checks.concentration },
                          { title: 'Position Validation', check: analysisResult.risk_checks.position },
                        ].map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-[#0e0e10] border border-[#2b2a2c]/60 rounded text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#e4e4e7]">{item.title}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  item.check.status === 'PASS'
                                    ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {item.check.status === 'PASS' ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#a1a1aa] leading-tight">
                              {item.check.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guardian Decision Panel */}
              <div className="flex flex-col shrink-0 bg-[#131315] border border-[#2b2a2c] rounded-lg min-h-[260px]">
                <div className="flex items-center justify-between p-4 border-b border-[#2b2a2c] shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold text-[#e4e4e7] uppercase tracking-widest">
                      GUARDIAN DECISION
                    </h3>
                    <svg className="text-[#a1a1aa]" fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  {analysisResult ? (
                    <span
                      className={`text-[9px] font-bold border px-2 py-0.5 rounded ${
                        analysisResult.decision.status === 'APPROVED'
                          ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10'
                          : 'text-red-400 border-red-500/30 bg-red-500/10'
                      }`}
                    >
                      {analysisResult.decision.status}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
                      STANDBY
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#a1a1aa]">
                  {!analysisResult ? (
                    <>
                      <div className="text-[#a1a1aa] mb-3">
                        <svg fill="none" height="36" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="36">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                      <p className="text-xs">
                        Submit a trade to receive<br />TradeGuardian decision.
                      </p>
                    </>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full border flex items-center justify-center mb-2 ${
                          analysisResult.decision.status === 'APPROVED'
                            ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        {analysisResult.decision.status === 'APPROVED' ? (
                          <svg fill="none" height="20" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="20">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg fill="none" height="20" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="20">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#e4e4e7] uppercase tracking-wide">
                        {analysisResult.decision.status === 'APPROVED' ? 'Order Approved' : 'Order Blocked'}
                      </div>
                      <div className="text-[11px] text-[#a1a1aa] mt-2 leading-relaxed text-center space-y-1">
                        {analysisResult.decision.reasons.map((reason, i) => (
                          <p key={i}>{reason}</p>
                        ))}
                      </div>

                      {analysisResult.decision.status === 'APPROVED' && (
                        <button
                          type="button"
                          className="mt-4 w-full py-2 bg-[#10b981] text-[#131315] rounded text-xs font-bold hover:bg-[#10b981]/90 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          Submit Paper Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>
            {/* END: Right Side Panels */}
          </div>
        </div>
      </div>
    </div>
  );
}