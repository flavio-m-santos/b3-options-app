
import React from 'react';
import { MOCK_TICKERS } from '../constants';

const VolumeMonitor: React.FC = () => {
  const sortedByVolume = [...MOCK_TICKERS].sort((a, b) => b.optionsVolume - a.optionsVolume);
  const maxVolume = sortedByVolume[0].optionsVolume;

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `R$ ${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(0)}M`;
    return `R$ ${val}`;
  };

  const getLiquidityBadge = (optionsVol: number) => {
    if (optionsVol > 800000000) return { label: 'ALTA', color: 'text-green-400 bg-green-900/30 border-green-800' };
    if (optionsVol > 200000000) return { label: 'MÉDIA', color: 'text-blue-400 bg-blue-900/30 border-blue-800' };
    return { label: 'BAIXA', color: 'text-gray-400 bg-gray-900/30 border-gray-800' };
  };

  return (
    <div className="bg-[#161b22] rounded-xl border border-gray-800 flex flex-col h-full shadow-lg">
      <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#0d1117]/50 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Top 10 Volume B3
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Ranking de Liquidez em Opções</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar max-h-[600px]">
        {sortedByVolume.map((ticker, index) => {
          const badge = getLiquidityBadge(ticker.optionsVolume);
          return (
            <div key={ticker.symbol} className="group relative">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black w-5 h-5 rounded flex items-center justify-center ${index < 3 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{ticker.symbol}</span>
                    <span className={`ml-2 text-[8px] font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-gray-200">
                    {formatCurrency(ticker.optionsVolume)}
                  </div>
                  <div className={`text-[9px] font-bold ${ticker.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {ticker.changePercent > 0 ? '+' : ''}{ticker.changePercent}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-800/50 h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${index < 3 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-600'}`}
                  style={{ width: `${(ticker.optionsVolume / maxVolume) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-[#0d1117]/50 border-t border-gray-800 rounded-b-xl">
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
          <span>Soma Top 10</span>
          <span className="text-blue-400 font-mono">
            {formatCurrency(sortedByVolume.reduce((acc, curr) => acc + curr.optionsVolume, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VolumeMonitor;
