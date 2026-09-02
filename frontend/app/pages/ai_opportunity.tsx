'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { AIOpportunity } from '../types/trade';

interface Props {
  onNavigate: (tab: 'analysis' | 'ai_opportunity') => void;
  onSelectTrade?: (opportunity: AIOpportunity) => void;
}

export default function AIOpportunityPage({ onNavigate, onSelectTrade }: Props) {
  const [opportunities, setOpportunities] = useState<AIOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [selectedBias, setSelectedBias] = useState<string>('All');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('All');

  useEffect(() => {
    // Fetch from your backend agent endpoint (e.g. FastAPI / Express / Alpaca MCP agent)
    async function fetchOpportunities() {
      try {
        setLoading(true);
        // Replace with your backend URL: const res = await fetch('http://localhost:8000/api/opportunities');
        // const data = await res.json();
        
        // Example dynamic payload simulating agent output:
        const data: AIOpportunity[] = [
          {
            id: 'opp-1',
            symbol: 'AAPL',
            status: 'NEW',
            confidence: 78,
            bias: 'Bullish',
            strategy: 'Bull Call Spread',
            legs: [
              { action: 'BUY', strike: 320, type: 'Call' },
              { action: 'SELL', strike: 335, type: 'Call' }
            ],
            expiration: 'Oct 16, 2026',
            dte: 45,
            maxRisk: 1205,
            potentialReward: 2395,
            riskRewardRatio: '1 : 1.99',
            tags: ['Momentum', 'Breakout'],
            thesis: 'Price above key moving averages with strong momentum and bullish market sentiment.'
          },
          {
            id: 'opp-2',
            symbol: 'TSLA',
            status: 'EVALUATING',
            confidence: 68,
            bias: 'Bullish',
            strategy: 'Bull Call Spread',
            legs: [
              { action: 'BUY', strike: 350, type: 'Call' },
              { action: 'SELL', strike: 370, type: 'Call' }
            ],
            expiration: 'Sep 18, 2026',
            dte: 17,
            maxRisk: 1345,
            potentialReward: 2655,
            riskRewardRatio: '1 : 1.97',
            tags: ['Earnings', 'Momentum'],
            thesis: 'Earnings catalyst with positive momentum and increasing options flow.'
          },
          {
            id: 'opp-3',
            symbol: 'NVDA',
            status: 'READY',
            confidence: 64,
            bias: 'Bullish',
            strategy: 'Bull Call Spread',
            legs: [
              { action: 'BUY', strike: 140, type: 'Call' },
              { action: 'SELL', strike: 150, type: 'Call' }
            ],
            expiration: 'Oct 16, 2026',
            dte: 45,
            maxRisk: 980,
            potentialReward: 2020,
            riskRewardRatio: '1 : 2.06',
            tags: ['AI Sector', 'Trend'],
            thesis: 'Strong AI sector tailwinds and institutional accumulation patterns.'
          },
          {
            id: 'opp-4',
            symbol: 'MSFT',
            status: 'READY',
            confidence: 61,
            bias: 'Bullish',
            strategy: 'Bull Put Spread',
            legs: [
              { action: 'BUY', strike: 405, type: 'Put' },
              { action: 'SELL', strike: 390, type: 'Put' }
            ],
            expiration: 'Oct 16, 2026',
            dte: 45,
            maxRisk: 890,
            potentialReward: 1610,
            riskRewardRatio: '1 : 1.81',
            tags: ['Cloud', 'Stability'],
            thesis: 'Cloud growth accelerating with improving margin expansion.'
          }
        ];
        setOpportunities(data);
      } catch (err) {
        console.error('Failed to load opportunities from agent', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  const handleOpenAnalysis = (opp: AIOpportunity) => {
    onSelectTrade?.(opp);
    onNavigate('analysis');
  };

  // Filter application
  const filtered = opportunities.filter((item) => {
    if (selectedBias !== 'All' && item.bias !== selectedBias) return false;
    if (selectedStrategy !== 'All' && item.strategy !== selectedStrategy) return false;
    return true;
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#131315] text-[#e4e4e7]">
      <div className="flex flex-1 overflow-hidden h-full">
        <Sidebar activeTab="ai_opportunity" onNavigate={onNavigate} />

        <div className="flex-1 flex flex-col h-full bg-[#131315] min-w-0">
          {/* Header with Dynamic Count & Filter Triggers */}
          <header className="flex items-center justify-between px-6 border-b border-[#2b2a2c] shrink-0 bg-[#131315] py-4 items-start min-w-0">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-[#e4e4e7] whitespace-nowrap">AI Opportunities</h1>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  Let TradeGuardian agents scan the market and surface high-quality options opportunities.
                </p>

                {/* Filter Controls */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setSelectedBias(selectedBias === 'All' ? 'Bullish' : 'All')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1b1d] border border-[#2b2a2c]/50 rounded hover:bg-[#2b2a2c] transition-colors"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa]">Market Bias</span>
                    <span className="text-xs font-medium text-[#e4e4e7]">{selectedBias}</span>
                  </button>

                  <button
                    onClick={() => setSelectedStrategy(selectedStrategy === 'All' ? 'Bull Call Spread' : 'All')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1b1d] border border-[#2b2a2c]/50 rounded hover:bg-[#2b2a2c] transition-colors"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa]">Strategy</span>
                    <span className="text-xs font-medium text-[#e4e4e7]">{selectedStrategy}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-6 items-center mt-1">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Market Data Connected
              </div>
              <span className="px-3 py-1.5 border border-[#facc15] text-[#facc15] rounded text-xs font-medium">
                Paper Account
              </span>
            </div>
          </header>

          {/* Main Dynamic Cards View */}
          <main className="flex-1 flex flex-col min-w-0 custom-scrollbar p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#e4e4e7]">
                  {loading ? 'Scanning market...' : `${filtered.length} opportunities found`}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4 pb-4">
                {filtered.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-[#1c1b1d] border border-[#2b2a2c]/50 rounded-lg flex flex-col hover:border-[#facc15]/30 transition-colors h-full p-4 gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        {opp.status}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">{opp.confidence}%</div>
                        <div className="text-[8px] text-[#a1a1aa] uppercase tracking-widest">Confidence</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-[#e4e4e7] text-lg">{opp.symbol}</div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{opp.bias}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-[#a1a1aa] uppercase tracking-widest">Proposed Strategy</div>
                      <div className="text-sm font-bold text-emerald-400">{opp.strategy}</div>
                      {opp.legs.map((leg, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className={leg.action === 'BUY' ? 'text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                            {leg.action}
                          </span>
                          <span className="text-[#e4e4e7]">${leg.strike} {leg.type}</span>
                        </div>
                      ))}
                      <div className="text-[10px] text-[#a1a1aa]">{opp.expiration} ({opp.dte} DTE)</div>
                    </div>

                    <div className="space-y-1 border-t border-[#2b2a2c]/30 pt-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#a1a1aa]">Max Risk</span>
                        <span className="text-[#e4e4e7] font-medium">${opp.maxRisk.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#a1a1aa]">Potential Reward</span>
                        <span className="text-[#e4e4e7] font-medium">${opp.potentialReward.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#a1a1aa]">Risk / Reward</span>
                        <span className="text-[#e4e4e7] font-medium">{opp.riskRewardRatio}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {opp.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[9px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">{opp.thesis}</p>

                    <div className="mt-auto pt-4 border-t border-[#2b2a2c]/30">
                      <button
                        onClick={() => handleOpenAnalysis(opp)}
                        className="w-full py-2 border border-[#facc15]/50 rounded text-[10px] font-bold text-[#facc15] hover:bg-[#facc15]/10 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        Open Trade Analysis
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}