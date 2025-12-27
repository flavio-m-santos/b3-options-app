
export enum OptionType {
  CALL = 'CALL',
  PUT = 'PUT'
}

export interface TechnicalIndicators {
  kairi: number;
  rsi7: number;
  stochK: number;
  stochD: number;
  signal: 'COMPRA' | 'VENDA' | 'NEUTRO';
}

export interface OptionData {
  ticker: string;
  underlying: string;
  type: OptionType;
  strike: number;
  expiry: string;
  lastPrice: number;
  change: number;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  volumeAvgRatio: number;
}

export interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  optionsVolume: number;
  technicals: TechnicalIndicators;
}

export interface StrategyLeg {
  id: string;
  option: OptionData;
  side: 'BUY' | 'SELL';
  quantity: number;
  simulatedIv?: number; // IV ajustada pelo usuário para simulação
}
