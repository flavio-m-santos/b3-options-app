
import { OptionData, OptionType, TickerData } from './types';

export const MOCK_TICKERS: TickerData[] = [
  { 
    symbol: 'PETR4', price: 38.45, change: 0.55, changePercent: 1.45, high: 38.90, low: 37.80, volume: 45000000,
    optionsVolume: 1250000000, // R$ 1.25B
    technicals: { kairi: 2.4, rsi7: 68, stochK: 82, stochD: 78, signal: 'NEUTRO' }
  },
  { 
    symbol: 'VALE3', price: 62.12, change: -1.20, changePercent: -1.89, high: 63.50, low: 61.90, volume: 32000000,
    optionsVolume: 890000000, // R$ 890M
    technicals: { kairi: -3.8, rsi7: 22, stochK: 12, stochD: 15, signal: 'COMPRA' }
  },
  { 
    symbol: 'ITUB4', price: 34.20, change: 0.10, changePercent: 0.29, high: 34.40, low: 34.10, volume: 18000000,
    optionsVolume: 450000000,
    technicals: { kairi: 0.5, rsi7: 52, stochK: 45, stochD: 48, signal: 'NEUTRO' }
  },
  { 
    symbol: 'BBAS3', price: 27.50, change: 0.45, changePercent: 1.66, high: 27.80, low: 27.10, volume: 12000000,
    optionsVolume: 320000000,
    technicals: { kairi: 1.1, rsi7: 58, stochK: 65, stochD: 60, signal: 'NEUTRO' }
  },
  { 
    symbol: 'BBDC4', price: 14.85, change: -0.05, changePercent: -0.34, high: 14.95, low: 14.75, volume: 22000000,
    optionsVolume: 210000000,
    technicals: { kairi: -1.2, rsi7: 41, stochK: 30, stochD: 35, signal: 'NEUTRO' }
  },
  { 
    symbol: 'B3SA3', price: 11.20, change: -0.12, changePercent: -1.06, high: 11.45, low: 11.15, volume: 15000000,
    optionsVolume: 185000000,
    technicals: { kairi: -2.1, rsi7: 35, stochK: 25, stochD: 28, signal: 'NEUTRO' }
  },
  { 
    symbol: 'MGLU3', price: 1.85, change: 0.08, changePercent: 4.52, high: 1.92, low: 1.82, volume: 85000000,
    optionsVolume: 155000000,
    technicals: { kairi: 5.4, rsi7: 75, stochK: 92, stochD: 88, signal: 'VENDA' }
  },
  { 
    symbol: 'GGBR4', price: 24.15, change: -0.35, changePercent: -1.43, high: 24.60, low: 24.05, volume: 9000000,
    optionsVolume: 110000000,
    technicals: { kairi: -1.5, rsi7: 38, stochK: 40, stochD: 42, signal: 'NEUTRO' }
  },
  { 
    symbol: 'HAPV3', price: 3.75, change: 0.05, changePercent: 1.35, high: 3.82, low: 3.68, volume: 42000000,
    optionsVolume: 85000000,
    technicals: { kairi: 0.8, rsi7: 55, stochK: 60, stochD: 58, signal: 'NEUTRO' }
  },
  { 
    symbol: 'ABEV3', price: 12.40, change: 0.15, changePercent: 1.22, high: 12.50, low: 12.30, volume: 15000000,
    optionsVolume: 75000000,
    technicals: { kairi: 4.1, rsi7: 82, stochK: 88, stochD: 85, signal: 'VENDA' }
  },
];

export const MOCK_OPTIONS: OptionData[] = [
  {
    ticker: 'PETRL385', underlying: 'PETR4', type: OptionType.CALL, strike: 38.50, expiry: '2024-12-20',
    lastPrice: 1.25, change: 15.4, volume: 1250000, openInterest: 4500000, iv: 32.5,
    delta: 0.52, gamma: 0.12, theta: -0.04, vega: 0.08, volumeAvgRatio: 4.8
  },
  {
    ticker: 'PETRX360', underlying: 'PETR4', type: OptionType.PUT, strike: 36.00, expiry: '2024-12-20',
    lastPrice: 0.45, change: -22.1, volume: 850000, openInterest: 2100000, iv: 35.2,
    delta: -0.21, gamma: 0.08, theta: -0.03, vega: 0.05, volumeAvgRatio: 3.2
  },
  {
    ticker: 'VALEL640', underlying: 'VALE3', type: OptionType.CALL, strike: 64.00, expiry: '2024-12-20',
    lastPrice: 0.88, change: -45.2, volume: 3200000, openInterest: 8500000, iv: 28.4,
    delta: 0.35, gamma: 0.10, theta: -0.02, vega: 0.07, volumeAvgRatio: 1.1
  },
  {
    ticker: 'VALEX600', underlying: 'VALE3', type: OptionType.PUT, strike: 60.00, expiry: '2024-12-20',
    lastPrice: 1.12, change: 55.4, volume: 4100000, openInterest: 6200000, iv: 30.1,
    delta: -0.42, gamma: 0.11, theta: -0.03, vega: 0.06, volumeAvgRatio: 6.5
  },
  {
    ticker: 'MGLUL190', underlying: 'MGLU3', type: OptionType.CALL, strike: 1.90, expiry: '2024-12-20',
    lastPrice: 0.12, change: 45.0, volume: 15200000, openInterest: 45000000, iv: 85.2,
    delta: 0.48, gamma: 1.25, theta: -0.01, vega: 0.02, volumeAvgRatio: 12.5
  }
];
