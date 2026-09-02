'use client';

import React from 'react';

export interface SidebarProps {
  activeTab: 'analysis' | 'ai_opportunity';
  onNavigate?: (tab: 'analysis' | 'ai_opportunity') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  return (
    <aside
      className="w-64 border-r border-[#2b2a2c] bg-[#131315] flex flex-col shrink-0 custom-scrollbar h-full"
      style={{ width: '256px' }}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#2b2a2c]/50">
        <div className="flex items-center gap-3">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaJuoD2zc70ThZz24wu4V2g-CLlJn-zsbDIwcryDpqKYmntpN7nEy_j8URp21iJYwlAiQX33qaquMQ2GeNKJBTB9DDIoMOkkTtuuDTxOHEejpMvsj0FirC-Hgp61O-ZiquIStJx9O2mecX6HfP9vCiitpRe_WW3DhStgcJHMJDcFW4nime8CM2Q6MUFN95xaOJoXqkPjY5Tv4gTIqHmzyqDQO64J7GpubjiAZ9VgMHA0awrxyzgBEFW54ngltlYMbTEw"
            alt="Alpaca Logo"
            className="w-8 h-8 object-contain rounded-full"
          />
          <div>
            <div className="font-bold text-[#e4e4e7]">Alpaca</div>
            <div className="text-[10px] text-[#a1a1aa]">TradeGuardian AI</div>
          </div>
        </div>
        <svg
          className="text-[#a1a1aa]"
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
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li className="px-3">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] transition-colors text-left"
            >
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <rect height="9" rx="1" width="7" x="3" y="3" />
                <rect height="5" rx="1" width="7" x="14" y="3" />
                <rect height="9" rx="1" width="7" x="14" y="12" />
                <rect height="5" rx="1" width="7" x="3" y="16" />
              </svg>
              <span className="font-medium text-sm">Dashboard</span>
            </button>
          </li>

          {/* Trade Analysis Button */}
          <li className="px-3">
            <button
              type="button"
              onClick={() => onNavigate?.('analysis')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'analysis'
                  ? 'bg-[#facc15]/10 border-l-2 border-[#facc15] text-[#facc15]'
                  : 'text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontSize: '18px' }}>
                query_stats
              </span>
              <span className="font-medium text-sm">Trade Analysis</span>
            </button>
          </li>

          {/* Activity Log */}
          <li className="px-3">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors text-left"
            >
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-medium text-sm">Activity Log</span>
            </button>
          </li>

          {/* AI Opportunities Button */}
          <li className="px-3">
            <button
              type="button"
              onClick={() => onNavigate?.('ai_opportunity')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'ai_opportunity'
                  ? 'bg-[#facc15]/10 border-l-2 border-[#facc15] text-[#facc15]'
                  : 'text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d]'
              }`}
            >
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <span className="font-medium text-sm">AI Opportunities</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border bg-purple-500/10 border-purple-500/30 text-purple-400">
                NEW
              </span>
            </button>
          </li>

          {/* Settings */}
          <li className="px-3">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors text-left"
            >
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="font-medium text-sm">Settings</span>
            </button>
          </li>

          <li className="my-4 border-t border-[#2b2a2c]/50 mx-4" />

          {/* Analysis History */}
          <li className="px-3">
            <div className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors cursor-default">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
              <span className="font-medium text-sm">Analysis History</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                UNAVAILABLE
              </span>
            </div>
          </li>

          {/* Positions */}
          <li className="px-3">
            <div className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors cursor-default">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span className="font-medium text-sm">Positions</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                UNAVAILABLE
              </span>
            </div>
          </li>

          {/* Orders */}
          <li className="px-3">
            <div className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors cursor-default">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3.01" y1="6" y2="6" />
                <line x1="3" x2="3.01" y1="12" y2="12" />
                <line x1="3" x2="3.01" y1="18" y2="18" />
              </svg>
              <span className="font-medium text-sm">Orders</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                UNAVAILABLE
              </span>
            </div>
          </li>

          {/* Performance */}
          <li className="px-3">
            <div className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors cursor-default">
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <span className="font-medium text-sm">Performance</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                UNAVAILABLE
              </span>
            </div>
          </li>

          <li className="my-4 border-t border-[#2b2a2c]/50 mx-4" />
        </ul>

        {/* Account Info */}
        <div className="px-6 py-4">
          <h3 className="text-[10px] font-bold text-[#a1a1aa] mb-4 uppercase tracking-widest">
            ACCOUNT
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#a1a1aa] mb-1">Total Equity</div>
              <div className="text-xl font-bold font-sans text-[#e4e4e7]">$100,000.00</div>
            </div>
            <div>
              <div className="text-xs text-[#a1a1aa] mb-1">Buying Power</div>
              <div className="text-xl font-bold font-sans text-[#e4e4e7]">$400,000.00</div>
            </div>
            <div>
              <div className="text-xs text-[#a1a1aa] mb-1">Open Positions</div>
              <div className="text-[15px] font-bold font-sans text-[#e4e4e7]">0</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Collapse button */}
      <div className="p-4 border-t border-[#2b2a2c] mt-auto">
        <button
          type="button"
          className="flex items-center justify-between w-full px-2 py-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] rounded transition-colors"
        >
          <div className="flex items-center gap-3 px-2">
            <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="font-medium">Collapse</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;