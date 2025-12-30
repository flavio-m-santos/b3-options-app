
import { GoogleGenAI } from "@google/genai";
import { OptionData, TickerData } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface AnalysisResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const analyzeAtypicalMovements = async (data: OptionData[], marketTechnicals: TickerData[]): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prompt focado em buscar dados REAIS de D-1 e movimentações recentes
  const prompt = `Acesse os dados mais recentes da B3 (D-1) sobre o mercado de opções brasileiro.
  Busque especificamente por:
  1. Relatórios de posições em aberto e movimentações de ontem (D-1).
  2. Séries de opções com maior volume atípico em PETR4, VALE3 e BBAS3.
  3. Compare os dados fictícios locais: ${JSON.stringify(data.map(d => ({ ticker: d.ticker, vol: d.volume })))} com a realidade atual do mercado.
  
  Responda em Português:
  - Quais são os tickers reais de opções com maior fluxo institucional hoje/ontem?
  - Existe alguma distorção relevante de volatilidade implícita ou volume?
  - Cite os strikes e vencimentos mais negociados no fechamento D-1.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    const text = response.text ?? "Não foi possível obter dados reais da B3 no momento.";
    
    // Extraindo fontes da pesquisa (Grounding Chunks)
    const sources: { title: string; uri: string }[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || "Fonte B3/Mercado",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    if (error.message?.includes("not found") || error.message?.includes("API key")) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        return { text: "Por favor, selecione uma chave de API para buscar dados reais.", sources: [] };
      }
    }
    return { text: `Erro na busca: ${error.message}`, sources: [] };
  }
};
