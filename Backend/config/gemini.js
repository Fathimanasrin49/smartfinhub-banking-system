import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const DEFAULT_GROQ_FRAUD_MODEL = process.env.GROQ_FRAUD_MODEL || DEFAULT_GROQ_MODEL;

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

export const GEMINI_MODEL = DEFAULT_GROQ_MODEL;
export const GEMINI_FRAUD_MODEL = DEFAULT_GROQ_FRAUD_MODEL;

class GroqCompatibleModel {
  constructor(modelName) {
    this.modelName = modelName || DEFAULT_GROQ_MODEL;
  }

  async generateContent(prompt) {
    if (!groq) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    const completion = await groq.chat.completions.create({
      model: this.modelName,
      temperature: 0.2,
      messages: [{ role: 'user', content: String(prompt || '') }],
    });
    const text = completion?.choices?.[0]?.message?.content || '';
    return {
      response: {
        text: () => text,
      },
    };
  }
}

export const getGeminiModel = (modelName = GEMINI_FRAUD_MODEL) => new GroqCompatibleModel(modelName);
