
import React, { useState, useEffect } from 'react';
import { MOCK_TICKERS, MOCK_OPTIONS } from './constants';
import { OptionData } from './types';
import Scanner from './components/Scanner';
import StrategyBuilder from './components/StrategyBuilder';
import VolumeMonitor from './components/VolumeMonitor';
import TechnicalSignals from './components/TechnicalSignals';
import { analyzeAtypicalMovements, AnalysisResult } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'builder' | 'market'>('scanner');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKeySelection = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKeySelection();

    const updateTime = () => {
      const now = new Date();
      setLastUpdate(now.toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit'
      }));
    };
    updateTime();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleAiAnalysis = async (options: OptionData[]) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeAtypicalMovements(options, MOCK_TICKERS);
      setAiAnalysis(result);
    } catch (error) {
      setAiAnalysis({ text: "Erro na conexão com a IA.", sources: [] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Dispara uma análise baseada em busca real ao clicar em Sync
    await handleAiAnalysis(MOCK_OPTIONS);
    setIsSyncing(false);
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a] p-6">
        <div className="bg-[#0b0e14] border border-gray-800 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center space-y-6">
          <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600/20">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Dados Reais B3</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Para buscar relatórios de posições D-1 em tempo real, conecte sua chave de API.
          </p>
          <button onClick={handleSelectKey} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">
            Conectar Chave de API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-[#05070a]">
      <div className="flex flex-col bg-[#0b0e14] shadow-2xl overflow-hidden relative w-full max-w-[420px] h-[100dvh] sm:h-[850px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-[#1a1f26] sm:my-8">
        
        <header className="bg-[#0d1117] border-b border-gray-800 px-5 py-4 shrink-0 z-30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl">
                <svg className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">B3 Terminal</h1>
                <span className="text-[9px] text-blue-500 font-black tracking-widest uppercase">D-1 Market Intel</span>
              </div>
            </div>
            <button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="bg-[#1a1f26] active:bg-blue-900 text-[10px] font-black text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 disabled:opacity-50"
            >
              {isSyncing ? 'BUSCANDO...' : 'SYNC B3 D-1'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-[#161b22] px-3 py-1.5 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase">Dados Oficiais Google Search</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono font-bold">{lastUpdate}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {activeTab === 'scanner' && (
            <div className="space-y-4">
              <TechnicalSignals />
              
              {aiAnalysis && (
                <div className="p-4 bg-blue-950/20 rounded-xl border border-blue-500/30 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-blue-400 uppercase flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                      Panorama B3 D-1 (Real)
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">{aiAnalysis.text}</p>
                  
                  {aiAnalysis.sources.length > 0 && (
                    <div className="border-t border-blue-900/50 pt-3">
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Fontes Consultadas:</span>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.sources.map((source, i) => (
                          <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-[#0d1117] text-gray-400 px-2 py-1 rounded border border-gray-800 hover:text-blue-400 transition-colors truncate max-w-[150px]">
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Scanner onAnalyze={handleAiAnalysis} isAnalyzing={isAnalyzing} />
            </div>
          )}
          {activeTab === 'builder' && <StrategyBuilder />}
          {activeTab === 'market' && <VolumeMonitor />}
        </main>

        <nav className="shrink-0 bg-[#0d1117] border-t border-gray-800 h-20">
          <div className="flex justify-around items-center h-full">
            <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center gap-1.5 flex-1 ${activeTab === 'scanner' ? 'text-blue-500' : 'text-gray-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-[9px] font-black uppercase">Scanner</span>
            </button>
            <button onClick={() => setActiveTab('builder')} className={`flex flex-col items-center gap-1.5 flex-1 ${activeTab === 'builder' ? 'text-blue-500' : 'text-gray-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="text-[9px] font-black uppercase">Builder</span>
            </button>
            <button onClick={() => setActiveTab('market')} className={`flex flex-col items-center gap-1.5 flex-1 ${activeTab === 'market' ? 'text-blue-500' : 'text-gray-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[9px] font-black uppercase">Market</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
