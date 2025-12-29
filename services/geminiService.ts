
import { GoogleGenAI } from "@google/genai";
import { OptionData, TickerData } from "../types";

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

/**
 * Interface estendida para suportar o gerenciamento de chaves do ambiente.
 * Fix: Use a named interface AIStudio to avoid property type mismatch and modifier conflicts on the global Window object.
 */
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}

export const analyzeAtypicalMovements = async (data: OptionData[], marketTechnicals: TickerData[]): Promise<string> => {
  // Criar nova instância sempre para garantir o uso da chave atualizada
  // Fix: Use process.env.API_KEY directly as required by the library guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const atypicalOptions = data.filter(o => o.volumeAvgRatio > 2.0);
  
  const prompt = `Você é um analista sênior de derivativos da B3. 
  Analise os seguintes dados de opções e indicadores técnicos de mercado:
  
  DADOS DE OPÇÕES ATÍPICAS:
  ${JSON.stringify(atypicalOptions)}
  
  INDICADORES TÉCNICOS DOS ATIVOS:
  ${JSON.stringify(marketTechnicals.map(t => ({
    ticker: t.symbol,
    preco: t.price,
    sinal: t.technicals.signal,
    rsi: t.technicals.rsi7
  })))}
  
  REGRAS DE RESPOSTA:
  1. Identifique se o volume atípico sugere montagem de posição institucional.
  2. Sugira 2 estratégias: uma para o vencimento ATUAL e outra ESTRUTURAL (longo prazo).
  3. Use terminologia B3 (ex: Travas, Calendário, Borboleta, Condor).
  4. Seja extremamente conciso e direto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    });

    // Fix: Access .text property directly (not a method).
    return response.text ?? "Análise indisponível no momento.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Se o erro indicar que a chave não foi encontrada ou permissão negada
    // Fix: Per guidelines, if "Requested entity was not found" is returned, prompt for key selection.
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key not found")) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        return "Por favor, selecione uma chave de API válida para continuar a análise.";
      }
    }
    
    return `Falha na conexão: ${error.message || "Erro desconhecido"}. Verifique sua conexão ou tente novamente.`;
  }
};
