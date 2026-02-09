import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Sei un assistente esperto nella creazione di mappe mentali.
Il tuo compito è convertire le richieste dell'utente in una struttura Markdown valida per Markmap.

Regole:
1. Usa SOLO la sintassi Markdown standard (intestazioni #, ##, ### e liste puntate -).
2. L'argomento principale deve essere un'intestazione di livello 1 (# Titolo).
3. I rami principali devono essere di livello 2 (## Ramo).
4. I dettagli possono essere intestazioni minori o liste puntate.
5. NON includere blocchi di codice (\`\`\`), non includere spiegazioni o testo conversazionale. Fornisci SOLO il contenuto grezzo del markdown.
6. Se l'utente ti chiede di modificare la mappa, restituisci L'INTERA struttura markdown aggiornata, non solo le differenze.
7. Sii creativo ed esaustivo nell'espandere gli argomenti se l'utente fornisce solo un titolo.

Esempio di Output:
# Intelligenza Artificiale
## Machine Learning
- Supervisionato
- Non supervisionato
- Rinforzo
## Deep Learning
- Reti Neurali
- Computer Vision
- NLP

Ricorda: Solo Markdown puro.
`;

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize Gemini chat:", error);
    throw error;
  }
};

export const sendMessageStream = async (message: string, onChunk: (chunk: string) => void) => {
  const chat = initializeChat();
  
  try {
    const result = await chat.sendMessageStream({ message });
    
    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
