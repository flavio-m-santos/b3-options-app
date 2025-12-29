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
      minute: '2-digit'
    }));
  };

  useEffect(() => {
    updateTimestamp();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      updateTimestamp();
      setIsSyncing(false);
    }, 800);
  };

  const handleAiAnalysis = async (options: OptionData[]) => {
    setIsAnalyzing(true);
    
    // Verificação de chave se o ambiente permitir
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Prosseguimos assumindo que o usuário selecionou, para evitar race conditions
      }
    }

    try {
      const result = await analyzeAtypicalMovements(options, MOCK_TICKERS);
      setAiAnalysis(result);
    } catch (error) {
      setAiAnalysis("Erro na análise. Verifique sua chave de API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAiResponse = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g); 
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={index} className="text-blue-300 font-bold">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`min-h-screen flex justify-center bg-[#05070a] ${viewMode === 'mobile' ? 'items-center sm:py-8' : ''}`}>
      <div className={`
        transition-all duration-500 ease-in-out flex flex-col bg-[#0b0e14] shadow-2xl overflow-hidden relative
        ${viewMode === 'mobile' 
          ? 'w-full max-w-[420px] h-[100dvh] sm:h-[850px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-[#1a1f26]' 
          : 'w-full min-h-screen'
        }
      `}>
        
        <header className="bg-[#0d1117] border-b border-gray-800 px-5 py-4 shrink-0 z-30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <svg className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">B3 Terminal</h1>
                <span className="text-[9px] text-blue-500 font-black tracking-widest uppercase">Real-time Data</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-[#1a1f26] hover:bg-[#252b33] text-[10px] font-black text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-all active:scale-95"
              >
                {isSyncing ? 'SYNC...' : 'SYNC B3'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-[#161b22] px-3 py-1.5 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] font-black text-white uppercase">Sessão {new Date().getFullYear()}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono font-bold tracking-tighter">{lastUpdate}</span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {MOCK_TICKERS.map(ticker => (
                <div key={ticker.symbol} className="bg-[#161b22] border border-gray-800 px-3 py-1 rounded-lg flex items-center gap-2 min-w-fit hover:border-blue-900 transition-colors">
                  <span className="text-[10px] font-black text-gray-500">{ticker.symbol}</span>
                  <span className={`text-[10px] font-mono font-bold ${ticker.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ticker.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-4 ${viewMode === 'web' ? 'container mx-auto max-w-7xl' : ''}`}>
          <div className="mb-4 bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-3 flex items-start gap-3">
            <div className="bg-yellow-600/20 p-1 rounded">
              <svg className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-[10px] text-yellow-200/70 leading-relaxed font-medium">
              Dados simulados para o dia <span className="text-yellow-400 font-bold">{new Date().toLocaleDateString('pt-BR')}</span>. Conexões de rede em sandboxes podem apresentar latência.
            </p>
          </div>

          {activeTab === 'scanner' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <TechnicalSignals />
              <div className={viewMode === 'web' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start' : ''}>
                <Scanner onAnalyze={handleAiAnalysis} isAnalyzing={isAnalyzing} />
                {aiAnalysis && (
                  <div className={`mt-6 animate-in zoom-in-95 fade-in duration-500 relative group`}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-50"></div>
                    <div className="relative bg-[#0d1117] rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-blue"></span>
                            Análise Cognitiva Gemini
                          </h3>
                          <button onClick={() => setAiAnalysis(null)} className="text-gray-500 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-300 leading-relaxed font-medium whitespace-pre-wrap bg-[#161b22] p-4 rounded-xl border border-gray-800">
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

        <nav className="shrink-0 bg-[#0d1117] border-t border-gray-800 safe-bottom">
          <div className={`flex justify-around items-center h-20 ${viewMode === 'web' ? 'max-w-md mx-auto' : ''}`}>
            {[
              { id: 'scanner', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />, label: 'Scanner' },
              { id: 'builder', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />, label: 'Builder' },
              { id: 'market', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, label: 'Market' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex flex-col items-center gap-1.5 flex-1 transition-all duration-300 ${activeTab === tab.id ? 'text-blue-500 scale-110' : 'text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{tab.icon}</svg>
                <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;