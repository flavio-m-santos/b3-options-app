import React from 'react';
import { OptionData } from '../types';
import { MOCK_OPTIONS } from '../constants';

interface ScannerProps {
  onAnalyze: (options: OptionData[]) => void;
  isAnalyzing: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onAnalyze, isAnalyzing }) => {
  const atypical = MOCK_OPTIONS.filter(o => o.volumeAvgRatio > 2.0).sort((a, b) => b.volumeAvgRatio - a.volumeAvgRatio);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
          Alertas de Volume
        </h2>
        <button 
          onClick={() => onAnalyze(atypical)}
          disabled={isAnalyzing}
          className="bg-blue-600 active:bg-blue-700 disabled:bg-gray-800 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-tighter"
        >
          {isAnalyzing ? 'Analisando...' : 'Análise IA'}
        </button>
      </div>

      <div className="space-y-2">
        {atypical.map((opt) => (
          <div key={opt.ticker} className="bg-[#161b22] border border-gray-800 p-3 rounded-lg flex items-center justify-between active:border-blue-500 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded flex flex-col items-center justify-center border ${opt.type === 'CALL' ? 'border-green-800/40 bg-green-900/10' : 'border-red-800/40 bg-red-900/10'}`}>
                 <span className={`text-[8px] font-black ${opt.type === 'CALL' ? 'text-green-500' : 'text-red-500'}`}>{opt.type}</span>
                 <span className="text-[10px] font-bold text-white">{opt.ticker.slice(-3)}</span>
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-white uppercase">{opt.ticker}</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                  K: R$ {opt.strike.toFixed(2)} | Vencto: {formatDate(opt.expiry)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-black text-yellow-500">{opt.volumeAvgRatio.toFixed(1)}x Vol</div>
              <div className={`text-[10px] font-bold ${opt.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {opt.change > 0 ? '+' : ''}{opt.change.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scanner;