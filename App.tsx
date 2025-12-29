import React, { useState, useEffect } from 'react';
import { MOCK_TICKERS } from './constants';
import { OptionData } from './types';
import Scanner from './components/Scanner';
import StrategyBuilder from './components/StrategyBuilder';
import VolumeMonitor from './components/VolumeMonitor';
import TechnicalSignals from './components/TechnicalSignals';
import { analyzeAtypicalMovements } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'builder' | 'market'>('scanner');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');

  const updateTimestamp = () => {
    const now = new Date();
    setLastUpdate(now.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }));
  };

  useEffect(() => {
    updateTimestamp();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    // Simula latência de rede/scraping
    setTimeout(() => {
      updateTimestamp();
      setIsSyncing(false);
    }, 1200);
  };

  const handleAiAnalysis = async (options: OptionData[]) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeAtypicalMovements(options, MOCK_TICKERS);
      setAiAnalysis(result);
    } catch (error) {
      setAiAnalysis("Erro na análise IA. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAiResponse = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g); 
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={index} className="text-blue-200 font-bold bg-blue-900/20 px-1 rounded">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`min-h-screen flex justify-center bg-[#05070a] ${viewMode === 'mobile' ? 'items-center sm:py-8' : ''}`}>
      <div className={`
        transition-all duration-500 ease-in-out flex flex-col bg-[#0b0e14] shadow-2xl overflow-hidden relative
        ${viewMode === 'mobile' 
          ? 'w-full max-w-[420px] h-[100dvh] sm:h-[850px] sm:rounded-[2rem] sm:border-[8px] sm:border-gray-800' 
          : 'w-full min-h-screen'
        }
      `}>
        
        <header className="bg-[#0d1117] border-b border-gray-800 px-4 py-3 shrink-0 z-30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md shadow-lg shadow-blue-900/20">
                <svg className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <h1 className="text-xs font-black text-white uppercase tracking-tight leading-none">B3 Options</h1>
                <span className="text-[8px] text-gray-500 font-bold">TERMINAL DE DADOS</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-gray-800 hover:bg-gray-700 text-[10px] font-bold text-gray-300 px-2 py-1 rounded border border-gray-700 flex items-center gap-1 transition-all active:scale-95"
              >
                {isSyncing ? 'SYNC...' : 'ATUALIZAR'}
              </button>

              <button 
                onClick={() => setViewMode(viewMode === 'mobile' ? 'web' : 'mobile')}
                className="bg-gray-800 text-gray-400 p-1 rounded border border-gray-700"
              >
                {viewMode === 'mobile' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-green-500 uppercase">Mercado Aberto</span>
              </div>
              <span className="text-[9px] text-gray-500 font-mono">Ref: {lastUpdate}</span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {MOCK_TICKERS.map(ticker => (
                <div key={ticker.symbol} className="bg-[#161b22] border border-gray-800 px-2.5 py-1 rounded flex items-center gap-2 min-w-fit shadow-sm">
                  <span className="text-[9px] font-black text-gray-400">{ticker.symbol}</span>
                  <span className={`text-[9px] font-mono font-bold ${ticker.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ticker.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-4 ${viewMode === 'web' ? 'container mx-auto max-w-7xl' : ''}`}>
          <div className="mb-4 bg-blue-900/10 border border-blue-800/30 rounded-lg p-2 flex items-center gap-2">
            <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-[8px] text-blue-300 leading-tight">
              Os dados apresentados são baseados em estimativas de mercado e simulações para o dia de hoje. Conexão direta com APIs B3 requer ambiente de produção.
            </p>
          </div>

          {activeTab === 'scanner' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <TechnicalSignals />
              <div className={viewMode === 'web' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start' : ''}>
                <Scanner onAnalyze={handleAiAnalysis} isAnalyzing={isAnalyzing} />
                {aiAnalysis && (
                  <div className={`animate-in slide-in-from-bottom-6 fade-in duration-500 relative group ${viewMode === 'web' ? 'sticky top-4' : ''}`}>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-[#0f141c] rounded-xl border border-blue-500/30 shadow-2xl overflow-hidden">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Gemini Analysis
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-500 text-white">PRO</span>
                          </h3>
                          <button onClick={() => setAiAnalysis(null)} className="text-gray-500 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {formatAiResponse(aiAnalysis)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'builder' && <div className="animate-in fade-in duration-300 h-full"><StrategyBuilder /></div>}
          {activeTab === 'market' && <div className="animate-in fade-in duration-300 h-full"><VolumeMonitor /></div>}
        </main>

        <nav className="shrink-0 bg-[#0d1117] border-t border-gray-800 z-50">
          <div className={`flex justify-around items-center h-16 ${viewMode === 'web' ? 'max-w-md mx-auto' : ''}`}>
            <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'scanner' ? 'text-blue-500' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-[9px] font-black uppercase">Scanner</span>
            </button>
            <button onClick={() => setActiveTab('builder')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'builder' ? 'text-blue-500' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="text-[9px] font-black uppercase">Builder</span>
            </button>
            <button onClick={() => setActiveTab('market')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'market' ? 'text-blue-500' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[9px] font-black uppercase">Market</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;