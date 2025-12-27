
import { GoogleGenAI, Type } from "@google/genai";
import { OptionData, TickerData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeAtypicalMovements = async (data: OptionData[], marketTechnicals: TickerData[]) => {
  const atypicalOptions = data.filter(o => o.volumeAvgRatio > 2.5);
  
  const prompt = `Analise as opções da B3 com volume atípico considerando o contexto técnico:
  
  OPÇÕES ATÍPICAS: ${JSON.stringify(atypicalOptions)}
  CONDIÇÕES TÉCNICAS DO MERCADO: ${JSON.stringify(marketTechnicals.map(t => ({
    symbol: t.symbol,
    price: t.price,
    kairi: t.technicals.kairi,
    rsi: t.technicals.rsi7,
    signal: t.technicals.signal
  })))}
  
  Instrução:
  1. Use o Kairi e IFR para validar se o volume atípico é exaustão (reversão) ou tendência (rompimento).
  2. Sugira o Alvo de Strike (Strike de Saída) baseado na volatilidade e no desvio do Kairi.
  3. Recomende uma estrutura (ex: Iron Condor se o Kairi for neutro, ou Travas se houver sinal).
  
  Retorne em Português com foco em 'Onde entrar' e 'Até onde levar (Alvo)'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 2500 }
    }
  });

  return response.text || "Análise indisponível no momento.";
};
