'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AIOpportunity from './pages/ai_opportunity';
import { Sidebar } from './components/Sidebar';
import { TradingViewChart } from '../components/TradingViewChart';

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

// Alpaca Asset Structure
interface AlpacaAsset {
  symbol: string;
  name: string;
  exchange: string;
  asset_class: 'us_equity' | 'crypto';
  price: number;
  change: string;
}

// Comprehensive Alpaca Market Universe (Equities, ETFs, Crypto)
const DEFAULT_ALPACA_ASSETS: AlpacaAsset[] = [
  // Mega-cap & Tech
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 228.45, change: '+1.42%' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', asset_class: 'us_equity', price: 119.30, change: '+3.15%' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 214.11, change: '-0.85%' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', asset_class: 'us_equity', price: 418.00, change: '+0.65%' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 178.50, change: '+1.10%' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 163.20, change: '+0.34%' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 512.60, change: '+2.05%' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', asset_class: 'us_equity', price: 148.70, change: '+1.88%' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 685.20, change: '+0.95%' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 164.50, change: '+2.40%' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', asset_class: 'us_equity', price: 21.10, change: '-1.25%' },
  { symbol: 'PLTR', name: 'Palantir Technologies', exchange: 'NYSE', asset_class: 'us_equity', price: 31.40, change: '+4.12%' },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.', exchange: 'NASDAQ', asset_class: 'us_equity', price: 188.90, change: '+3.60%' },
  
  // Market ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', asset_class: 'us_equity', price: 552.14, change: '+0.45%' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', asset_class: 'us_equity', price: 472.88, change: '+0.91%' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', exchange: 'NYSE', asset_class: 'us_equity', price: 215.30, change: '+1.15%' },
  { symbol: 'VXX', name: 'iPath Series B S&P 500 VIX', exchange: 'BATS', asset_class: 'us_equity', price: 12.80, change: '-2.40%' },
  
  // Major Bluechips & Financials
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', asset_class: 'us_equity', price: 218.40, change: '+0.52%' },
  { symbol: 'BAC', name: 'Bank of America Corp', exchange: 'NYSE', asset_class: 'us_equity', price: 39.75, change: '+0.25%' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc', exchange: 'NYSE', asset_class: 'us_equity', price: 492.10, change: '+0.78%' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', asset_class: 'us_equity', price: 278.30, change: '+0.15%' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', asset_class: 'us_equity', price: 74.90, change: '+0.60%' },
  { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', asset_class: 'us_equity', price: 92.40, change: '-0.30%' },
  { symbol: 'BA', name: 'Boeing Co.', exchange: 'NYSE', asset_class: 'us_equity', price: 162.80, change: '-1.45%' },
  
  // Alpaca Supported Crypto Markets
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 58420.00, change: '+1.80%' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 2510.50, change: '-0.40%' },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 134.20, change: '+4.25%' },
  { symbol: 'DOGE/USD', name: 'Dogecoin / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 0.102, change: '+2.10%' },
  { symbol: 'AVAX/USD', name: 'Avalanche / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 24.80, change: '+3.15%' },
  { symbol: 'LINK/USD', name: 'Chainlink / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 11.45, change: '+1.60%' },
  { symbol: 'UNI/USD', name: 'Uniswap / US Dollar', exchange: 'CRYPTO', asset_class: 'crypto', price: 6.80, change: '-0.90%' },
];

interface TimeframeOptionItem {
  label: string;
  value: string;
}

// Fixed: Allow string category name to prevent TypeScript compilation errors
interface TimeframeCategory {
  category: string;
  items: TimeframeOptionItem[];
}

const TIMEFRAME_CATEGORIES: TimeframeCategory[] = [
  {
    category: 'Minutes (Live Streaming)',
    items: [
      { label: '1m (Live)', value: '1' },
      { label: '3m', value: '3' },
      { label: '5m', value: '5' },
      { label: '15m', value: '15' },
      { label: '30m', value: '30' },
      { label: '45m', value: '45' },
    ],
  },
  {
    category: 'Hour',
    items: [
      { label: '1h', value: '60' },
      { label: '2h', value: '120' },
      { label: '4h', value: '240' },
    ],
  },
  {
    category: 'Day',
    items: [{ label: '1D', value: 'D' }],
  },
  {
    category: 'Week',
    items: [{ label: '1W', value: 'W' }],
  },
  {
    category: 'Months',
    items: [
      { label: '1M', value: 'M' },
      { label: '3M', value: '3M' },
      { label: '6M', value: '6M' },
    ],
  },
  {
    category: 'Years',
    items: [{ label: '1Y', value: '12M' }],
  },
];

export default function TradeAnalysisPage() {
  const [isOrderTypeDropdownOpen, setIsOrderTypeDropdownOpen] = useState<boolean>(false);
  const orderTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<'analysis' | 'ai_opportunity'>('analysis');
  
  // Selected Timeframe state
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOptionItem>({
    label: '1m (Live)',
    value: '1',
  });
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState<boolean>(false);
  const timeframeDropdownRef = useRef<HTMLDivElement>(null);

  // '8' = Heikin-Ashi (Continuous Candles), '1' = Standard Candles, '3' = Area
  const [chartStyle, setChartStyle] = useState<'8' | '1' | '3'>('8');

  // Alpaca Assets & Symbol Selector state
  const [allAssets, setAllAssets] = useState<AlpacaAsset[]>(DEFAULT_ALPACA_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<AlpacaAsset>(DEFAULT_ALPACA_ASSETS[0]);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState<boolean>(false);
  const [symbolSearch, setSymbolSearch] = useState<string>('');
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);
  const symbolDropdownRef = useRef<HTMLDivElement>(null);

  // Trade form inputs
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [orderType, setOrderType] = useState<string>('Market');
  const [entryMode, setEntryMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>('228.45');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<BackendAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch live Alpaca assets from backend if available, fallback gracefully
  useEffect(() => {
    async function loadAlpacaAssets() {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${backendUrl}/assets/`, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllAssets(data);
          }
        }
      } catch (err) {
        // Fallback gracefully to DEFAULT_ALPACA_ASSETS
      }
    }
    loadAlpacaAssets();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timeframeDropdownRef.current && !timeframeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeframeDropdownOpen(false);
      }
      if (symbolDropdownRef.current && !symbolDropdownRef.current.contains(event.target as Node)) {
        setIsSymbolDropdownOpen(false);
      }
      if (orderTypeDropdownRef.current && !orderTypeDropdownRef.current.contains(event.target as Node)) {
        setIsOrderTypeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger ghost loading simulation on symbol dropdown open
  const handleOpenSymbolDropdown = () => {
    setIsSymbolDropdownOpen((prev) => !prev);
    if (!isSymbolDropdownOpen) {
      setIsLoadingAssets(true);
      setTimeout(() => {
        setIsLoadingAssets(false);
      }, 250);
    }
  };

  // Filtered Assets based on live search
  const filteredAssets = useMemo(() => {
    const query = symbolSearch.trim().toLowerCase();
    if (!query) return allAssets;
    return allAssets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.exchange.toLowerCase().includes(query)
    );
  }, [symbolSearch, allAssets]);

  // Fixed: Valid TradingView Exchange Formatter (COINBASE for crypto)
  const formattedTradingViewSymbol = useMemo(() => {
    const s = selectedAsset.symbol;
    if (s.includes(':')) return s;
    if (selectedAsset.asset_class === 'crypto') {
      return `COINBASE:${s.replace('/', '')}`;
    }
    const ex = selectedAsset.exchange.toUpperCase();
    return `${ex === 'BATS' || ex === 'ARCA' ? 'AMEX' : ex}:${s}`;
  }, [selectedAsset]);


  // TradeGuardian AI Risk Analysis Function
  const handleAnalyzeTrade = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
      const cleanSymbol = selectedAsset.symbol.replace('/', '');
      const response = await fetch(`${backendUrl}/analyze/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: cleanSymbol.toUpperCase(),
          side: side.toLowerCase(),
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

  if (currentView === 'ai_opportunity') {
    return <AIOpportunity onNavigate={(tab) => setCurrentView(tab)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#131315] text-[#e4e4e7] font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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

        .tradingview-clean-chart,
        .tradingview-clean-chart *,
        .tradingview-clean-chart iframe {
          border: none !important;
          border-width: 0 !important;
          outline: none !important;
          box-shadow: none !important;
          background: #131315 !important;
          background-color: #131315 !important;
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <Sidebar activeTab="analysis" onNavigate={(tab) => setCurrentView(tab)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-[#131315] overflow-hidden">
          {/* Main Header */}
          <header className="h-14 flex items-center justify-between px-6 border-b border-[#2b2a2c] shrink-0 bg-[#131315]">
            <div className="flex items-center gap-6">
              <h1 className="text-base font-bold text-[#e4e4e7]">Trade Analysis</h1>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Alpaca Paper Feed Connected
              </div>
              <button className="flex items-center gap-2 px-2.5 py-1 border border-[#facc15] text-[#facc15] rounded text-xs font-medium hover:bg-[#facc15]/10 transition-colors">
                Paper Account
                <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </header>

          {/* Body: Middle & Right Panels */}
          <div className="flex-1 flex overflow-hidden p-4 gap-3">
            {/* Middle Panel */}
            <main className="flex flex-col min-w-0 overflow-hidden flex-1 gap-3">
              {/* Chart Panel */}
              <div className="bg-[#131315] border border-[#2b2a2c] rounded-lg p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-start justify-between mb-2 shrink-0 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold leading-tight">{selectedAsset.symbol}</h2>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#1c1b1d] border border-[#2b2a2c] text-[#a1a1aa]">
                        {selectedAsset.exchange}
                      </span>
                      <span className="text-xs text-[#a1a1aa] font-medium hidden sm:inline">
                        {selectedAsset.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg font-bold">
                        ${analysisResult?.proposal?.current_price !== undefined ? Number(analysisResult.proposal.current_price).toFixed(2) : selectedAsset.price.toFixed(2)}
                      </span>
                      <span className={`text-xs font-medium ${selectedAsset.change.startsWith('+') ? 'text-[#10b981]' : 'text-red-400'}`}>
                        {selectedAsset.change}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1c1b1d] border border-[#2b2a2c] text-[#a1a1aa] ml-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedAsset.asset_class === 'crypto' ? 'bg-[#10b981] animate-ping' : 'bg-[#facc15]'}`} />
                        {selectedAsset.asset_class === 'crypto' ? '24/7 Live Ticking' : 'US Market Session'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Top Toolbar */}
                  <div className="flex items-center gap-2.5 flex-wrap justify-end">
                    {/* Chart Style Toggle */}
                    <div className="flex items-center bg-[#1c1b1d] border border-[#2b2a2c] rounded-md p-0.5 shrink-0 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setChartStyle('8')}
                        title="Continuous Heikin-Ashi Candlesticks"
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                          chartStyle === '8'
                            ? 'bg-[#facc15]/15 border border-[#facc15]/40 text-[#facc15] shadow-sm'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        Continuous
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartStyle('1')}
                        title="Standard Candlesticks"
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                          chartStyle === '1'
                            ? 'bg-[#facc15]/15 border border-[#facc15]/40 text-[#facc15] shadow-sm'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartStyle('3')}
                        title="Continuous Area Line"
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                          chartStyle === '3'
                            ? 'bg-[#facc15]/15 border border-[#facc15]/40 text-[#facc15] shadow-sm'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        Area
                      </button>
                    </div>

                    {/* Timeframe Dropdown */}
                    <div className="relative" ref={timeframeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 bg-[#1c1b1d] border rounded-md text-xs font-semibold transition-all cursor-pointer shadow-inner ${
                          isTimeframeDropdownOpen
                            ? 'border-[#facc15] text-[#e4e4e7]'
                            : 'border-[#2b2a2c] text-[#a1a1aa] hover:text-[#e4e4e7] hover:border-[#3f3f46]'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 text-[#facc15]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>
                          Timeframe:{' '}
                          <span className="text-[#facc15] font-bold tracking-wide">
                            {selectedTimeframe.label}
                          </span>
                        </span>
                        <svg
                          className={`w-3 h-3 text-[#a1a1aa] transition-transform duration-200 ${
                            isTimeframeDropdownOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      {isTimeframeDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-[#18181b] border border-[#2b2a2c] rounded-lg shadow-2xl p-3 z-50 max-h-[420px] overflow-y-auto custom-scrollbar">
                          <div className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider pb-2 mb-2 border-b border-[#2b2a2c] flex items-center justify-between">
                            <span>Select Timeframe</span>
                            <span className="text-[9px] text-[#facc15] font-normal">Active: {selectedTimeframe.label}</span>
                          </div>

                          <div className="space-y-3">
                            {TIMEFRAME_CATEGORIES.map((catGroup) => (
                              <div key={catGroup.category} className="space-y-1">
                                <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider px-1">
                                  {catGroup.category}
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {catGroup.items.map((tfItem) => {
                                    const isSelected = selectedTimeframe.label === tfItem.label;
                                    return (
                                      <button
                                        key={tfItem.label}
                                        type="button"
                                        onClick={() => {
                                          setSelectedTimeframe(tfItem);
                                          setIsTimeframeDropdownOpen(false);
                                        }}
                                        className={`py-1.5 px-2 text-xs rounded font-medium transition-colors ${
                                          isSelected
                                            ? 'bg-[#facc15] text-[#131315] font-bold shadow-sm'
                                            : 'bg-[#0e0e10] text-[#e4e4e7] hover:bg-[#27272a] hover:text-[#facc15]'
                                        }`}
                                      >
                                        {tfItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* TradingView Chart Container */}
                <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#131315] border-0 outline-none">
                  <TradingViewChart
                    symbol={formattedTradingViewSymbol}
                    interval={selectedTimeframe.value}
                    chartStyle={chartStyle}
                  />
                </div>
              </div>

              {/* Trade Details Panel */}
              <div className="bg-[#131315] border border-[#2b2a2c] rounded-lg shrink-0 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2b2a2c]/50">
                  <h3 className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#facc15]" style={{ fontSize: '15px' }}>
                      tune
                    </span>
                    TRADE DETAILS & EXECUTION
                  </h3>
                  <div className="text-[10px] text-[#a1a1aa] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
                    Alpaca Paper Active
                  </div>
                </div>

                {/* Row 1: Symbol + Side + Quantity */}
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-4 space-y-1.5 relative" ref={symbolDropdownRef}>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block">
                      Market / Symbol
                    </label>
                    
                    <button
                      type="button"
                      onClick={handleOpenSymbolDropdown}
                      className="w-full flex items-center justify-between bg-[#1c1b1d] border border-[#2b2a2c] hover:border-[#3f3f46] focus:border-[#facc15] rounded-md px-3 py-2 text-xs font-semibold text-[#e4e4e7] transition-all shadow-inner group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm font-bold text-[#facc15]">{selectedAsset.symbol}</span>
                        <span className="text-[10px] text-[#a1a1aa] font-medium truncate">{selectedAsset.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0e0e10] border border-[#2b2a2c] text-[#a1a1aa]">
                          {selectedAsset.exchange}
                        </span>
                        <svg className="w-3.5 h-3.5 text-[#a1a1aa] group-hover:text-[#e4e4e7] transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </button>

                    {isSymbolDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-1.5 w-[330px] bg-[#18181b] border border-[#2b2a2c] rounded-lg shadow-2xl p-2.5 z-50">
                        <div className="relative mb-2">
                          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#a1a1aa]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search Alpaca markets..."
                            value={symbolSearch}
                            onChange={(e) => setSymbolSearch(e.target.value)}
                            autoFocus
                            className="w-full bg-[#0e0e10] border border-[#2b2a2c] focus:border-[#facc15] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#e4e4e7] placeholder-[#71717a] outline-none transition-colors"
                          />
                        </div>

                        <div className="max-h-[255px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                          {isLoadingAssets ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-md bg-[#1c1b1d]/50 animate-pulse border border-[#2b2a2c]/40"
                              >
                                <div className="space-y-1.5">
                                  <div className="h-3 w-14 bg-[#2b2a2c] rounded" />
                                  <div className="h-2.5 w-24 bg-[#2b2a2c]/60 rounded" />
                                </div>
                                <div className="h-3.5 w-10 bg-[#2b2a2c] rounded" />
                              </div>
                            ))
                          ) : filteredAssets.length === 0 ? (
                            <div className="text-center py-6 text-xs text-[#71717a]">
                              No Alpaca market found
                            </div>
                          ) : (
                            filteredAssets.map((asset) => {
                              const isSelected = selectedAsset.symbol === asset.symbol;
                              return (
                                <button
                                  key={asset.symbol}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setLimitPrice(asset.price.toFixed(2));
                                    setIsSymbolDropdownOpen(false);
                                    setSymbolSearch('');
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors text-left ${
                                    isSelected
                                      ? 'bg-[#facc15]/10 border-l-2 border-[#facc15] text-[#facc15]'
                                      : 'hover:bg-[#1c1b1d] text-[#e4e4e7]'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 font-bold text-xs">
                                      <span>{asset.symbol}</span>
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#0e0e10] border border-[#2b2a2c] text-[#a1a1aa] font-normal">
                                        {asset.exchange}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-[#a1a1aa] font-medium truncate max-w-[150px]">
                                      {asset.name}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-semibold">${asset.price.toFixed(2)}</div>
                                    <div className={`text-[10px] font-medium ${asset.change.startsWith('+') ? 'text-[#10b981]' : 'text-red-400'}`}>
                                      {asset.change}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Side */}
                  <div className="col-span-4 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block">
                      Order Side
                    </label>
                    <div className="flex bg-[#1c1b1d] p-0.5 rounded-md border border-[#2b2a2c]">
                      <button
                        type="button"
                        onClick={() => setSide('BUY')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
                          side === 'BUY'
                            ? 'text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 shadow-sm'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        BUY / LONG
                      </button>
                      <button
                        type="button"
                        onClick={() => setSide('SELL')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
                          side === 'SELL'
                            ? 'text-[#ef4444] bg-[#ef4444]/15 border border-[#ef4444]/30 shadow-sm'
                            : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        SELL / SHORT
                      </button>
                    </div>
                  </div>

                  {/* Quantity Input with Live Min/Max Auto-Correction & Decimal Conversion */}
                  {(() => {
                    // 1. Calculate symbol-specific minimum & maximum share limits
                    const isCrypto = selectedAsset.asset_class === 'crypto';
                    const minQty = isCrypto ? (selectedAsset.price > 1000 ? 0.0001 : 0.01) : 0.01;
                    const maxQty = Number((400000 / (selectedAsset.price || 1)).toFixed(isCrypto ? 4 : 2));
                    const stepValue = isCrypto ? (selectedAsset.price > 1000 ? 0.005 : 0.1) : 1;

                    // 2. Parse quantity safely as float for live conversion
                    const numericQuantity = parseFloat(String(quantity)) || 0;
                    const effectivePrice = entryMode === 'LIMIT' && Number(limitPrice) > 0 ? Number(limitPrice) : selectedAsset.price;
                    const estimatedDollarValue = numericQuantity > 0 ? numericQuantity * effectivePrice : 0;

                    // 3. Helper to enforce bounds
                    const clampToBounds = (val: number) => {
                      if (isNaN(val) || val < minQty) return minQty;
                      if (val > maxQty) return maxQty;
                      return Number(val.toFixed(isCrypto ? 4 : 2));
                    };

                    return (
                      <div className="col-span-4 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
                            Share Quantity
                          </label>
                          <span className="text-[9px] text-[#a1a1aa]/60 font-medium">
                            Min: {minQty} | Max: {maxQty.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center bg-[#1c1b1d] border border-[#2b2a2c] hover:border-[#3f3f46] focus-within:border-[#facc15] rounded-md px-1.5 py-1 transition-all shadow-inner">
                          {/* Stepper Decrement */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = clampToBounds(Number((numericQuantity - stepValue).toFixed(4)));
                              setQuantity(nextVal);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-[#0e0e10] text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] transition-colors text-xs font-bold shrink-0 cursor-pointer"
                            title="Decrease"
                          >
                            -
                          </button>

                          {/* Live Bound-Detecting Decimal Input */}
                          <input
                            className="w-full bg-transparent border-none text-center text-xs font-semibold text-[#e4e4e7] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            type="number"
                            step="any"
                            min={minQty}
                            max={maxQty}
                            value={quantity}
                            placeholder={String(minQty)}
                            onChange={(e) => {
                              const val = e.target.value;

                              // Allow empty or intermediate decimal typing states so user can type "0.05"
                              if (val === '' || val === '0' || val === '0.' || val.endsWith('.')) {
                                setQuantity(val as any);
                                return;
                              }

                              const parsed = parseFloat(val);
                              if (!isNaN(parsed)) {
                                // DETECT IF PAST MAXIMUM: Automatically snap to max
                                if (parsed > maxQty) {
                                  setQuantity(maxQty);
                                  return;
                                }

                                // DETECT NEGATIVES: Automatically snap to min
                                if (parsed < 0) {
                                  setQuantity(minQty);
                                  return;
                                }

                                setQuantity(val as any);
                              }
                            }}
                            onBlur={() => {
                              // DETECT IF PAST MINIMUM OR MAXIMUM ON BLUR: Automatically clamp to bounds
                              const parsed = parseFloat(String(quantity));
                              setQuantity(clampToBounds(parsed));
                            }}
                            onKeyDown={(e) => {
                              // Pressing Enter confirms and auto-corrects immediately
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                          />

                          {/* Stepper Increment */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = clampToBounds(Number((numericQuantity + stepValue).toFixed(4)));
                              setQuantity(nextVal);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-[#0e0e10] text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] transition-colors text-xs font-bold shrink-0 cursor-pointer"
                            title="Increase"
                          >
                            +
                          </button>

                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#0e0e10] border border-[#2b2a2c] text-[9px] font-bold text-[#a1a1aa] pointer-events-none shrink-0">
                            QTY
                          </span>
                        </div>

                        {/* Automatic Live Dollar Conversion Display */}
                        <div className="flex items-center justify-between px-0.5 text-[10px] pt-0.5">
                          <span className="text-[#a1a1aa]/70 font-medium">Est. Value:</span>
                          <span className="text-[#facc15] font-semibold tracking-tight">
                            ≈ ${estimatedDollarValue.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            <span className="text-[9px] text-[#a1a1aa] font-normal">USD</span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Row 2: Order Type & Entry Price */}
                <div className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-4 space-y-1.5 relative" ref={orderTypeDropdownRef}>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block">
                      Execution Type
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOrderTypeDropdownOpen(!isOrderTypeDropdownOpen)}
                      className={`w-full flex items-center justify-between bg-[#1c1b1d] border rounded-md px-3 py-2 text-xs font-semibold text-[#e4e4e7] transition-all shadow-inner cursor-pointer ${
                        isOrderTypeDropdownOpen
                          ? 'border-[#facc15]'
                          : 'border-[#2b2a2c] hover:border-[#3f3f46]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
                        <span>{orderType} Order</span>
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform duration-200 ${
                          isOrderTypeDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {isOrderTypeDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-1.5 w-full bg-[#18181b] border border-[#2b2a2c] rounded-lg shadow-2xl p-1.5 z-50 space-y-1">
                        {[
                          { id: 'Market', label: 'Market Order', desc: 'Execute instantly at best price' },
                          { id: 'Limit', label: 'Limit Order', desc: 'Execute at set price or better' },
                          { id: 'Stop', label: 'Stop Loss Order', desc: 'Trigger market order on threshold' },
                          { id: 'Stop Limit', label: 'Stop Limit Order', desc: 'Trigger limit order on threshold' },
                        ].map((opt) => {
                          const isSelected = orderType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setOrderType(opt.id);
                                setIsOrderTypeDropdownOpen(false);
                              }}
                              className={`w-full flex flex-col text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#facc15]/10 border-l-2 border-[#facc15] text-[#facc15]'
                                  : 'text-[#e4e4e7] hover:bg-[#1c1b1d]'
                              }`}
                            >
                              <span className="text-xs font-bold">{opt.label}</span>
                              <span className="text-[10px] text-[#a1a1aa]">{opt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="col-span-8 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block">
                      Entry Price Target
                    </label>
                    <div className="flex bg-[#1c1b1d] rounded-md border border-[#2b2a2c] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setEntryMode('MARKET')}
                        className={`px-4 py-1.5 text-xs font-bold transition-all ${
                          entryMode === 'MARKET' ? 'text-[#131315] bg-[#facc15]' : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        MARKET
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntryMode('LIMIT')}
                        className={`px-4 py-1.5 text-xs font-bold border-r border-[#2b2a2c]/50 transition-all ${
                          entryMode === 'LIMIT' ? 'text-[#131315] bg-[#facc15]' : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                        }`}
                      >
                        LIMIT
                      </button>
                      <div className="relative flex-1 flex items-center">
                        <span className="pl-3 text-xs text-[#a1a1aa] font-bold">$</span>
                        <input
                          className={`w-full bg-transparent border-none py-1.5 pl-1 pr-3 text-xs font-semibold text-[#e4e4e7] focus:outline-none text-right ${
                            entryMode === 'MARKET' ? 'opacity-40 cursor-not-allowed' : 'cursor-text'
                          }`}
                          disabled={entryMode === 'MARKET'}
                          placeholder="0.00"
                          type="text"
                          value={entryMode === 'MARKET' ? selectedAsset.price.toFixed(2) : limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Stop Loss & Take Profit */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
                        Guardian Stop Loss
                      </label>
                      <span className="text-[9px] text-[#ef4444] font-semibold">Risk Protection</span>
                    </div>
                    <input
                      className="w-full bg-[#1c1b1d] border border-[#2b2a2c] focus:border-[#facc15] rounded-md py-1.5 px-3 text-xs text-[#e4e4e7] focus:outline-none transition-colors"
                      placeholder="e.g. 5% or $215.00"
                      type="text"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
                        Guardian Take Profit
                      </label>
                      <span className="text-[9px] text-[#10b981] font-semibold">Target Yield</span>
                    </div>
                    <input
                      className="w-full bg-[#1c1b1d] border border-[#2b2a2c] focus:border-[#facc15] rounded-md py-1.5 px-3 text-xs text-[#e4e4e7] focus:outline-none transition-colors"
                      placeholder="e.g. 10% or $250.00"
                      type="text"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 4: Actions */}
                <div className="flex items-center justify-between border-t border-[#2b2a2c]/50 pt-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] transition-colors text-xs font-medium"
                  >
                    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Risk Parameters
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyzeTrade}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-[#facc15] text-[#131315] font-bold text-xs px-6 py-2 rounded-md hover:bg-[#facc15]/90 transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-[#131315]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        ANALYZING RISK...
                      </>
                    ) : (
                      <>
                        ANALYZE TRADE
                        <svg fill="none" height="13" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Middle Panel Footer */}
              <div className="flex items-center justify-between text-[10px] text-[#a1a1aa]/60 shrink-0 px-1">
                <span>All trades are verified through TradeGuardian Alpaca risk filters.</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Alpaca Markets Real-Time
                </div>
              </div>
            </main>

            {/* Right Side Risk Panel */}
            <aside
              className="flex flex-col bg-[#131315] shrink-0 h-full overflow-y-auto custom-scrollbar"
              style={{ width: '430px' }}
            >
              {/* Risk Analysis Card */}
              <div className="flex flex-col bg-[#131315] border border-[#2b2a2c] rounded-lg flex-1 mb-3 shadow-sm">
                <div className="flex items-center justify-between p-3.5 border-b border-[#2b2a2c] shrink-0">
                  <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-widest">
                    RISK ANALYSIS
                  </h3>
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

                <div className="flex-1 p-4 relative overflow-y-auto custom-scrollbar">
                  {!analysisResult ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#131315]/80 backdrop-blur-[1px]">
                      <svg className="text-[#a1a1aa] mb-2" fill="none" height="28" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="28">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <p className="text-xs text-[#a1a1aa]">
                        Run an analysis to inspect<br />TradeGuardian risk checks.
                      </p>
                      {errorMessage && (
                        <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-[#0e0e10] border border-[#2b2a2c] rounded">
                          <div className="text-[9px] text-[#a1a1aa] uppercase">Trade Value</div>
                          <div className="text-base font-bold text-[#e4e4e7] mt-0.5">
                            ${Number(analysisResult?.proposal?.trade_value ?? 0).toLocaleString()}
                          </div>
                          <div className="text-[9px] text-[#a1a1aa]">
                            @ ${analysisResult?.proposal?.current_price}
                          </div>
                        </div>
                        <div className="p-2.5 bg-[#0e0e10] border border-[#2b2a2c] rounded">
                          <div className="text-[9px] text-[#a1a1aa] uppercase">Equity Exposure</div>
                          <div className="text-base font-bold text-[#10b981] mt-0.5">
                            {analysisResult?.risk_metrics?.trade_percent_of_equity}%
                          </div>
                          <div className="text-[9px] text-[#a1a1aa]">Portfolio Share</div>
                        </div>
                      </div>

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
                          <div key={idx} className="p-2 bg-[#0e0e10] border border-[#2b2a2c]/60 rounded text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#e4e4e7] text-[11px]">{item.title}</span>
                              <span
                                className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                  item.check.status === 'PASS'
                                    ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {item.check.status === 'PASS' ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#a1a1aa] leading-tight">
                              {item.check.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guardian Decision Card */}
              <div className="flex flex-col shrink-0 bg-[#131315] border border-[#2b2a2c] rounded-lg p-4 min-h-[220px] shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#2b2a2c] shrink-0">
                  <h3 className="text-[11px] font-bold text-[#e4e4e7] uppercase tracking-widest">
                    GUARDIAN DECISION
                  </h3>
                  {analysisResult && (
                    <span
                      className={`text-[9px] font-bold border px-2 py-0.5 rounded ${
                        analysisResult.decision.status === 'APPROVED'
                          ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10'
                          : 'text-red-400 border-red-500/30 bg-red-500/10'
                      }`}
                    >
                      {analysisResult.decision.status}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-[#a1a1aa]">
                  {!analysisResult ? (
                    <p className="text-xs">
                      Submit a trade to trigger<br />TradeGuardian decisions.
                    </p>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full border flex items-center justify-center mb-1.5 ${
                          analysisResult.decision.status === 'APPROVED'
                            ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        {analysisResult.decision.status === 'APPROVED' ? (
                          <svg fill="none" height="18" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg fill="none" height="18" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#e4e4e7] uppercase tracking-wide">
                        {analysisResult.decision.status === 'APPROVED' ? 'Order Approved' : 'Order Blocked'}
                      </div>
                      <div className="text-[10px] text-[#a1a1aa] mt-1 space-y-0.5 leading-relaxed">
                        {analysisResult.decision?.reasons?.map((reason, i) => (
                          <p key={i}>{reason}</p>
                        ))}
                      </div>

                      {analysisResult.decision.status === 'APPROVED' && (
                        <button
                          type="button"
                          className="mt-3 w-full py-1.5 bg-[#10b981] text-[#131315] rounded text-xs font-bold hover:bg-[#10b981]/90 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          Submit Paper Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}