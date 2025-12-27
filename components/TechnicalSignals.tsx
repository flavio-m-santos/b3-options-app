
import React from 'react';
import { MOCK_TICKERS } from '../constants';

const TechnicalSignals: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {MOCK_TICKERS.filter(t => t.technicals.signal !== 'NEUTRO').map(ticker => (
        <div key={ticker.symbol} className={`p-4 rounded-xl border ${ticker.technicals.signal === 'COMPRA' ? 'border-green-900 bg-green-900/10' : 'border-red-900 bg-red-900/10'} flex flex-col gap-3`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-white text-lg">{ticker.symbol}</h4>
              <p className="text-xs text-gray-400">Timing de Montagem</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse ${ticker.technicals.signal === 'COMPRA' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              Signal: {ticker.technicals.signal}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0d1117] p-2 rounded border border-gray-800">
              <span className="text-[9px] text-gray-500 block uppercase">Kairi</span>
              <span className={`text-xs font-mono font-bold ${Math.abs(ticker.technicals.kairi) > 3 ? 'text-yellow-400' : 'text-gray-300'}`}>
                {ticker.technicals.kairi}%
              </span>
            </div>
            <div className="bg-[#0d1117] p-2 rounded border border-gray-800">
              <span className="text-[9px] text-gray-500 block uppercase">IFR (7)</span>
              <span className={`text-xs font-mono font-bold ${ticker.technicals.rsi7 < 30 || ticker.technicals.rsi7 > 70 ? 'text-yellow-400' : 'text-gray-300'}`}>
                {ticker.technicals.rsi7}
              </span>
            </div>
            <div className="bg-[#0d1117] p-2 rounded border border-gray-800">
              <span className="text-[9px] text-gray-500 block uppercase">Stoch</span>
              <span className="text-xs font-mono font-bold text-gray-300">
                {ticker.technicals.stochK.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 italic">
            {ticker.technicals.signal === 'COMPRA' 
              ? `Sugestão: Montar Bull Put Spread ou Trava de Alta. Alvo de strike vendido sugerido: R$ ${(ticker.price * (1 + ticker.technicals.kairi/100)).toFixed(2)}`
              : `Sugestão: Montar Bear Call Spread ou Trava de Baixa. Alvo de strike vendido sugerido: R$ ${(ticker.price * (1 + ticker.technicals.kairi/100)).toFixed(2)}`
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnicalSignals;
