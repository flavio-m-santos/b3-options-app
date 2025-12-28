
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
  
  // Estado para controlar o modo de visualização
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');

  useEffect(() => {
    // Simula a data da última atualização dos dados
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  }, []);

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

  // Função para formatar o texto da IA (Bold e Quebras de linha)
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
    // Canvas Fundo (Cinza escuro para destacar o "device" no modo mobile)
    <div className={`min-h-screen flex justify-center bg-[#05070a] ${viewMode === 'mobile' ? 'items-center sm:py-8' : ''}`}>
      
      {/* Container Principal do App */}
      <div className={`
        transition-all duration-500 ease-in-out flex flex-col bg-[#0b0e14] shadow-2xl overflow-hidden relative
        ${viewMode === 'mobile' 
          ? 'w-full max-w-[420px] h-[100dvh] sm:h-[850px] sm:rounded-[2rem] sm:border-[8px] sm:border-gray-800' 
          : 'w-full min-h-screen'
        }
      `}>
        
        {/* Header Compacto */}
        <header className="bg-[#0d1117] border-b border-gray-800 px-4 py-3 shrink-0 z-30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md shadow-lg shadow-blue-900/20">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">B3 Terminal</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Botão de Toggle Web/Mobile */}
              <button 
                onClick={() => setViewMode(viewMode === 'mobile' ? 'web' : 'mobile')}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded-lg transition-colors border border-gray-700"
                title={viewMode === 'mobile' ? "Mudar para Web" : "Mudar para Mobile"}
              >
                {viewMode === 'mobile' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] font-bold uppercase hidden sm:inline">Web</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] font-bold uppercase hidden sm:inline">Mobile</span>
                  </>
                )}
              </button>

              <div className="flex flex-col items-end leading-none">
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-blue-400">LIVE</span>
                 </div>
                 <span className="text-[8px] text-gray-500 font-mono mt-0.5">Updated: {lastUpdate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 mask-linear-fade">
            {MOCK_TICKERS.map(ticker => (
              <div key={ticker.symbol} className="bg-[#161b22] border border-gray-800 px-3 py-1.5 rounded flex items-center gap-2 min-w-fit shadow-sm hover:border-gray-600 transition-colors cursor-default">
                <span className="text-[10px] font-black text-gray-400 uppercase">{ticker.symbol}</span>
                <span className={`text-[10px] font-mono font-bold ${ticker.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {ticker.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </header>

        {/* Conteúdo Principal com Scroll Interno */}
        <main className={`flex-1 overflow-y-auto p-4 ${viewMode === 'web' ? 'container mx-auto max-w-7xl' : ''}`}>
          {activeTab === 'scanner' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <TechnicalSignals />
              
              {/* Layout em Grid no modo Web para o Scanner */}
              <div className={viewMode === 'web' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start' : ''}>
                <Scanner onAnalyze={handleAiAnalysis} isAnalyzing={isAnalyzing} />
                
                {/* AI Analysis Result Card - Sticky no modo Web */}
                {aiAnalysis && (
                  <div className={`animate-in slide-in-from-bottom-6 fade-in duration-500 relative group ${viewMode === 'web' ? 'sticky top-4' : ''}`}>
                    {/* Glow Effect Background */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    
                    <div className="relative bg-[#0f141c] rounded-xl border border-blue-500/30 shadow-2xl overflow-hidden">
                      {/* Decorative Top Line */}
                      <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 border-b border-gray-800/60 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 16V21M8 19L12 21L16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                Gemini Insight
                                <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-500 text-white font-mono">PRO</span>
                              </h3>
                              <p className="text-[10px] text-blue-400/80 font-mono mt-0.5">ANÁLISE MULTI-TEMPORAL</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAiAnalysis(null)} 
                            className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
                            {formatAiResponse(aiAnalysis)}
                          </div>
                        </div>
                      </div>

                      {/* Footer Stats */}
                      <div className="bg-[#0b0e14]/50 border-t border-gray-800 px-5 py-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase">Análise Concluída</span>
                        </div>
                        <span className="text-[9px] font-mono text-gray-600">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="animate-in fade-in duration-300 h-full">
              <StrategyBuilder />
            </div>
          )}

          {activeTab === 'market' && (
            <div className="animate-in fade-in duration-300 h-full">
              <VolumeMonitor />
            </div>
          )}
        </main>

        {/* Bottom Navigation - Sticky no container */}
        <nav className="shrink-0 bg-[#0d1117] border-t border-gray-800 z-50">
          <div className={`flex justify-around items-center h-16 ${viewMode === 'web' ? 'max-w-md mx-auto' : ''}`}>
            <button 
              onClick={() => setActiveTab('scanner')}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'scanner' ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-[9px] font-black uppercase">Scanner</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'builder' ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="text-[9px] font-black uppercase">Builder</span>
            </button>

            <button 
              onClick={() => setActiveTab('market')}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'market' ? 'text-blue-500' : 'text-gray-500'}`}
            >
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
