
import React, { useState, useMemo } from 'react';
import { StrategyLeg, OptionType } from '../types';
import { MOCK_OPTIONS, MOCK_TICKERS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line } from 'recharts';

// --- Black-Scholes Utility Functions ---
const cnd = (x: number): number => {
  const a1 = 0.31938153, a2 = -0.356563782, a3 = 1.781477937, a4 = -1.821255978, a5 = 1.330274429;
  const L = Math.abs(x);
  const K = 1.0 / (1.0 + 0.2316419 * L);
  let w = 1.0 - 1.0 / Math.sqrt(2 * Math.PI) * Math.exp(-L * L / 2) * (a1 * K + a2 * K * K + a3 * Math.pow(K, 3) + a4 * Math.pow(K, 4) + a5 * Math.pow(K, 5));
  if (x < 0) w = 1.0 - w;
  return w;
};

const calculateOptionPrice = (S: number, K: number, T: number, r: number, v: number, type: OptionType): number => {
  if (T <= 0.0001) return type === OptionType.CALL ? Math.max(0, S - K) : Math.max(0, K - S);
  const v_dec = v / 100;
  const d1 = (Math.log(S / K) + (r + v_dec * v_dec / 2) * T) / (v_dec * Math.sqrt(T));
  const d2 = d1 - v_dec * Math.sqrt(T);
  return type === OptionType.CALL ? S * cnd(d1) - K * Math.exp(-r * T) * cnd(d2) : K * Math.exp(-r * T) * cnd(-d2) - S * cnd(-d1);
};

const StrategyBuilder: React.FC = () => {
  const [legs, setLegs] = useState<StrategyLeg[]>([]);
  const [selectedUnderlying, setSelectedUnderlying] = useState<string>(MOCK_TICKERS[0].symbol);
  const [daysToExpiry, setDaysToExpiry] = useState<number>(20);
  const riskFreeRate = 0.1075;
  
  const currentSpot = useMemo(() => MOCK_TICKERS.find(t => t.symbol === selectedUnderlying)?.price || 38.45, [selectedUnderlying]);
  const liquidOptions = useMemo(() => MOCK_OPTIONS.filter(opt => opt.underlying === selectedUnderlying), [selectedUnderlying]);
  const [selectedOptionTicker, setSelectedOptionTicker] = useState<string>(liquidOptions[0]?.ticker || '');

  const addLeg = (side: 'BUY' | 'SELL') => {
    const opt = MOCK_OPTIONS.find(o => o.ticker === selectedOptionTicker);
    if (!opt) return;
    setLegs([...legs, { id: Math.random().toString(36).substr(2, 9), option: opt, side, quantity: 100, simulatedIv: opt.iv }]);
  };

  const { chartData, maxRisk, isUnlimitedRisk } = useMemo(() => {
    if (legs.length === 0) return { chartData: [], maxRisk: 0, isUnlimitedRisk: false };
    const range = currentSpot * 0.3, min = Math.max(0, currentSpot - range), max = currentSpot + range;
    const points = [], T = daysToExpiry / 365;
    let lowestProfit = Infinity, netCallQty = 0;
    legs.forEach(l => { if(l.option.type === OptionType.CALL) netCallQty += (l.side === 'BUY' ? l.quantity : -l.quantity); });
    for (let price = min; price <= max; price += range / 20) {
      let expProfit = 0, theoProfit = 0;
      legs.forEach(leg => {
        let legExpValue = leg.option.type === OptionType.CALL ? Math.max(0, price - leg.option.strike) : Math.max(0, leg.option.strike - price);
        let legTheoValue = calculateOptionPrice(price, leg.option.strike, T, riskFreeRate, leg.simulatedIv || leg.option.iv, leg.option.type);
        const cost = leg.option.lastPrice;
        let pAtExp = (legExpValue - cost) * leg.quantity, pTheo = (legTheoValue - cost) * leg.quantity;
        if (leg.side === 'SELL') { pAtExp = -pAtExp; pTheo = -pTheo; }
        expProfit += pAtExp; theoProfit += pTheo;
      });
      if (expProfit < lowestProfit) lowestProfit = expProfit;
      points.push({ price: parseFloat(price.toFixed(2)), profit: parseFloat(expProfit.toFixed(2)), theoretical: parseFloat(theoProfit.toFixed(2)) });
    }
    return { chartData: points, maxRisk: lowestProfit < 0 ? Math.abs(lowestProfit) : 0, isUnlimitedRisk: netCallQty < 0 };
  }, [legs, daysToExpiry, currentSpot]);

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor Mobile */}
      <div className="bg-[#161b22] p-4 rounded-xl border border-gray-800 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MOCK_TICKERS.slice(0, 5).map(ticker => (
            <button key={ticker.symbol} onClick={() => setSelectedUnderlying(ticker.symbol)} className={`px-4 py-2 rounded font-black text-[10px] uppercase border ${selectedUnderlying === ticker.symbol ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#0d1117] border-gray-700 text-gray-500'}`}>
              {ticker.symbol}
            </button>
          ))}
        </div>

        <select value={selectedOptionTicker} onChange={(e) => setSelectedOptionTicker(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-xs font-bold text-white appearance-none">
          {liquidOptions.map(opt => <option key={opt.ticker} value={opt.ticker}>{opt.ticker} | K: {opt.strike.toFixed(2)}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => addLeg('BUY')} className="bg-green-600 active:scale-95 py-3 rounded-lg text-xs font-black uppercase text-white shadow-lg">Comprar</button>
          <button onClick={() => addLeg('SELL')} className="bg-red-600 active:scale-95 py-3 rounded-lg text-xs font-black uppercase text-white shadow-lg">Vender</button>
        </div>
      </div>

      {/* Gráfico Mobile */}
      <div className="bg-[#161b22] p-4 rounded-xl border border-gray-800 h-64 shadow-lg">
        {legs.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} opacity={0.2} />
              <XAxis dataKey="price" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <ReferenceLine y={0} stroke="#4a5568" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="theoretical" stroke="#60a5fa" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-[10px] font-black uppercase tracking-widest">Aguardando Estrutura</div>
        )}
      </div>

      {/* Risco e Pernas */}
      <div className="space-y-3">
        {legs.length > 0 && (
          <div className={`p-4 rounded-xl border ${isUnlimitedRisk ? 'bg-red-950/20 border-red-500' : 'bg-gray-900 border-gray-800'} text-center`}>
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{isUnlimitedRisk ? 'Risco Ilimitado' : 'Perda Máxima'}</div>
            <div className={`text-xl font-mono font-black ${isUnlimitedRisk ? 'text-red-500' : 'text-white'}`}>
              {isUnlimitedRisk ? '∞' : `R$ ${maxRisk.toFixed(2)}`}
            </div>
          </div>
        )}

        {legs.map(leg => (
          <div key={leg.id} className="bg-[#0d1117] border border-gray-800 p-3 rounded-lg flex justify-between items-center group">
            <div className="flex gap-2 items-center">
              <div className={`w-1.5 h-6 rounded-full ${leg.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="text-[11px] font-black text-white">{leg.option.ticker}</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase">K: {leg.option.strike.toFixed(2)} | Qtd: {leg.quantity}</div>
              </div>
            </div>
            <button onClick={() => setLegs(legs.filter(l => l.id !== leg.id))} className="bg-gray-800 p-2 rounded-full">
               <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyBuilder;
