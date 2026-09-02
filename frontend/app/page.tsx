import React from 'react';

export const PrecisionInstitutionalTradingSystem: React.FC = () => {
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
        <aside
          className="w-64 border-r border-[#2b2a2c] bg-[#131315] flex flex-col shrink-0 custom-scrollbar h-full"
          style={{ width: '256px' }}
        >
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

          <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect height="9" rx="1" width="7" x="3" y="3" />
                    <rect height="5" rx="1" width="7" x="14" y="3" />
                    <rect height="9" rx="1" width="7" x="14" y="12" />
                    <rect height="5" rx="1" width="7" x="3" y="16" />
                  </svg>
                  <span className="font-medium text-sm">Dashboard</span>
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 bg-[#facc15]/10 rounded-md border-l-2 border-[#facc15] text-[#facc15]"
                  href="#"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    query_stats
                  </span>
                  <span className="font-medium text-sm">Trade Analysis</span>
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="font-medium text-sm">Activity Log</span>
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                  <span className="font-medium text-sm">AI Opportunities</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border bg-purple-500/10 border-purple-500/30 text-purple-400">
                    NEW
                  </span>
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="font-medium text-sm">Settings</span>
                </a>
              </li>

              <li className="my-4 border-t border-[#2b2a2c]/50 mx-4" />

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                  <span className="font-medium text-sm">Analysis History</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                    UNAVAILABLE
                  </span>
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span className="font-medium text-sm">Positions</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                    UNAVAILABLE
                  </span>
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                </a>
              </li>

              <li className="px-3">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1c1b1d] rounded-md transition-colors"
                  href="#"
                >
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  <span className="font-medium text-sm">Performance</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500 text-red-500">
                    UNAVAILABLE
                  </span>
                </a>
              </li>

              <li className="my-4 border-t border-[#2b2a2c]/50 mx-4" />
            </ul>

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

          <div className="p-4 border-t border-[#2b2a2c] mt-auto">
            <button className="flex items-center justify-between w-full px-2 py-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] rounded transition-colors">
              <div className="flex items-center gap-3 px-2">
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="font-medium">Collapse</span>
              </div>
            </button>
          </div>
        </aside>
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
              <div className="bg-[#131315] border border-[#2b2a2c] rounded-lg p-6 flex flex-col shrink-0 flex-1 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">AAPL</h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold">$321.25</span>
                      <span className="text-sm font-medium text-[#10b981]">+2.34 (0.73%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0e0e10] border border-[#2b2a2c] rounded p-1">
                    <button className="px-3 py-1 text-xs font-medium text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
                      1D
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
                      5D
                    </button>
                    <button className="px-3 py-1 text-xs font-bold text-[#131315] bg-[#facc15] rounded">
                      1M
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
                      3M
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
                      1Y
                    </button>
                    <div className="w-px h-4 bg-[#2b2a2c] mx-1" />
                    <button className="p-1 text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
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
                <div className="flex-1" />
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
                        className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 pl-10 pr-8 text-sm font-medium text-[#e4e4e7] focus:outline-none focus:border-[#2b2a2c] cursor-pointer"
                        readOnly
                        type="text"
                        defaultValue="AAPL"
                      />
                    </div>
                  </div>

                  <div className="col-span-4 space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Side
                    </label>
                    <div className="flex bg-[#0e0e10] rounded border border-[#2b2a2c]">
                      <button className="flex-1 py-2.5 text-xs font-bold text-[#10b981] bg-[#1c2921] border border-[#10b981]/30 rounded shadow-sm">
                        BUY
                      </button>
                      <button className="flex-1 py-2.5 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] rounded">
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
                        className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#2b2a2c]"
                        type="number"
                        defaultValue="10"
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
                        defaultValue="Market"
                        className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#2b2a2c] appearance-none cursor-pointer"
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
                      <button className="px-6 py-2.5 text-xs font-bold text-[#131315] bg-[#facc15]">
                        MARKET
                      </button>
                      <button className="px-6 py-2.5 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] border-r border-[#2b2a2c]/50">
                        LIMIT
                      </button>
                      <input
                        className="flex-1 bg-transparent border-none py-2.5 px-3 text-sm text-[#e4e4e7] focus:outline-none focus:ring-0 text-right opacity-50 cursor-not-allowed"
                        disabled
                        placeholder="0.00"
                        type="text"
                        defaultValue="0.00"
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
                      className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#a1a1aa] focus:outline-none focus:border-[#2b2a2c]"
                      placeholder="Optional"
                      type="text"
                    />
                    <div className="text-[10px] text-[#a1a1aa]/60 mt-1">Price or %</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-[#a1a1aa] uppercase">
                      Take Profit
                    </label>
                    <input
                      className="w-full bg-[#0e0e10] border border-[#2b2a2c] rounded py-2.5 px-3 text-sm text-[#a1a1aa] focus:outline-none focus:border-[#2b2a2c]"
                      placeholder="Optional"
                      type="text"
                    />
                    <div className="text-[10px] text-[#a1a1aa]/60 mt-1">Price or %</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#2b2a2c] pt-4">
                  <button className="flex items-center gap-2 text-xs font-medium text-[#facc15] hover:text-[#facc15]/80 transition-colors">
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
                  <button className="flex items-center gap-2 bg-[#facc15] text-[#131315] font-bold text-sm px-8 py-3 rounded hover:bg-[#facc15]/90 transition-colors">
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
              className="flex flex-col border-[#2b2a2c] bg-[#131315] shrink-0 h-full p-6 overflow-y-auto custom-scrollbar"
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
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
                    STANDBY
                  </span>
                </div>

                <div className="flex-1 p-6 relative overflow-y-auto">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 bg-[#131315]/80 backdrop-blur-[1px]">
                    <div className="text-[#a1a1aa] mb-3">
                      <svg
                        fill="none"
                        height="32"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        width="32"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#a1a1aa]">
                      Run an analysis to see
                      <br />
                      TradeGuardian risk checks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guardian Decision Panel */}
              <div className="flex flex-col shrink-0 bg-[#131315] border border-[#2b2a2c] rounded-lg min-h-[260px]">
                <div className="flex items-center justify-between p-4 border-b border-[#2b2a2c] shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold text-[#e4e4e7] uppercase tracking-widest">
                      GUARDIAN DECISION
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
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
                    STANDBY
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#a1a1aa]">
                  <div className="text-[#a1a1aa] mb-3">
                    <svg
                      fill="none"
                      height="36"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="36"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-xs">
                    Submit a trade to receive
                    <br />
                    TradeGuardian decision.
                  </p>
                </div>
              </div>
            </aside>
            {/* END: Right Side Panels */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecisionInstitutionalTradingSystem;