
import { GoogleGenAI } from "@google/genai";
import { OptionData, TickerData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeAtypicalMovements = async (data: OptionData[], marketTechnicals: TickerData[]): Promise<string> => {
  const atypicalOptions = data.filter(o => o.volumeAvgRatio > 2.5);
  
  const prompt = `Analise as opções da B3 com volume atípico considerando o contexto técnico.
  
  DADOS:
  - Opções Atípicas: ${JSON.stringify(atypicalOptions)}
  - Indicadores Técnicos: ${JSON.stringify(marketTechnicals.map(t => ({
    symbol: t.symbol,
    price: t.price,
    kairi: t.technicals.kairi,
    rsi: t.technicals.rsi7,
    signal: t.technicals.signal
  })))}
  
  Instrução Obrigatória - Forneça a resposta dividida em dois horizontes de tempo:
  
  1. **TRADE MENSAL (Curto Prazo)**:
     - Foco em Gamma e Delta.
     - Identifique oportunidades de "tiro curto" para o vencimento atual.
     - Sugira estruturas direcionais (Travas de Alta/Baixa) ou de volatilidade rápida.
  
  2. **TRADE LONGO PRAZO (> 3 Meses)**:
     - Foco em Vega e Theta.
     - Identifique oportunidades estruturais.
     - Sugira estruturas como Calendar Spreads (Trava Horizontal), Travas Diagonais ou compra de LEAPS.
     - Explique o racional de carregar essa posição por mais tempo.

  Seja direto, técnico e use terminologia de opções da B3.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 2500 }
      }
    });

    return response.text ?? "Análise indisponível no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com a IA. Verifique sua chave de API ou tente novamente mais tarde.";
  }
};
