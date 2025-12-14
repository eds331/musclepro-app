import { GoogleGenAI, Chat } from "@google/genai";
import { User } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. FITNESS COACH (Technical, Direct, No Fluff)
export const createChatSession = (user: User): Chat => {
  const context = `
    Actúas como Coach MUSCLEPRO (Fitness & Performance).
    Usuario: ${user.username}. Nivel: ${user.stats?.level}. Meta: ${user.stats?.goal}.

    DIRECTRICES OBLIGATORIAS:
    1. Eres técnico, directo y científico.
    2. Respuestas cortas (max 3 oraciones si es posible).
    3. NO uses frases motivacionales vacías ("Tú puedes", "Vamos campeón").
    4. Céntrate en datos: RPE, descanso, tempo, macronutrientes.
    5. Si falta info, pídela.

    Ejemplo de respuesta ideal:
    "Para optimizar la sentadilla, mantén la carga pero baja a 3 segundos en la excéntrica. Controla tu RPE a 8."
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: context,
    },
  });
};

// 2. WORLD NARRATOR (Strategic, Analytical, Life RPG)
export const createWorldChat = (user: User): Chat => {
  const profile = user.worldProfile;
  const context = `
    Actúas como EL NARRADOR del "Mundo MUSCLEPRO" (Life RPG).
    Usuario: ${user.username}. Nivel Global: ${profile?.globalLevel}. Energía: ${profile?.energy}/1000.

    DIRECTRICES OBLIGATORIAS:
    1. Tu tono es solemne, estratégico y analítico (estilo videojuego oscuro/serio).
    2. Analizas las 9 áreas de vida del usuario.
    3. Si la energía es baja, sugiere descanso estratégico, no "echarle ganas".
    4. Tus consejos son sobre balance, disciplina y gestión de recursos (créditos/energía).
    5. Nunca sermonees. Solo expón la realidad de sus estadísticas.

    Ejemplo de respuesta ideal:
    "Tu área de 'Trabajo' ha subido, pero 'Descanso' está crítica. Tu energía ha caído a 400. Recomiendo gastar créditos en recuperación antes de que afecte tu rendimiento global."
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: context,
    },
  });
};

export const sendMessageToAI = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "No pude procesar la respuesta.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Error de conexión con el sistema central.";
  }
};