export type MarketBias = 'Bullish' | 'Bearish' | 'Neutral';
export type StrategyType = 'Bull Call Spread' | 'Bull Put Spread' | 'Bear Put Spread' | 'Iron Condor';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface OptionLeg {
  action: 'BUY' | 'SELL';
  strike: number;
  type: 'Call' | 'Put';
}

export interface AIOpportunity {
  id: string;
  symbol: string;
  status: 'NEW' | 'EVALUATING' | 'READY';
  confidence: number;
  bias: MarketBias;
  strategy: StrategyType;
  legs: OptionLeg[];
  expiration: string;
  dte: number;
  maxRisk: number;
  potentialReward: number;
  riskRewardRatio: string;
  tags: string[];
  thesis: string;
}