import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // Use process.env.API_KEY directly as per guidelines.
  // The environment variable is assumed to be pre-configured and valid.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateWhatsAppMessage = async (
  patientName: string, 
  context: string,
  tone: 'formal' | 'friendly' = 'friendly'
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Actúa como un asistente administrativo de "Optica Maxima G.E".
      Redacta un mensaje corto para WhatsApp dirigido al paciente "${patientName}".
      
      Contexto del mensaje: ${context}
      Tono: ${tone === 'formal' ? 'Formal y profesional' : 'Amable y cercano'}.
      Idioma: Español.
      
      Reglas:
      1. No uses saludos genéricos como "Estimado cliente", usa su nombre.
      2. Sé breve y conciso.
      3. Incluye emojis sutiles si el tono es amable.
      4. No inventes precios ni fechas que no estén en el contexto.
      5. Solo devuelve el texto del mensaje, nada más.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el mensaje.";
  } catch (error) {
    console.error("Error generating message:", error);
    return `Hola ${patientName}, te escribimos de Optica Maxima G.E para informarte sobre: ${context}`;
  }
};