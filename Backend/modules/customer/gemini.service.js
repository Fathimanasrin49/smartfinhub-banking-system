import { getGeminiModel, GEMINI_FRAUD_MODEL } from '../../config/gemini.js';

export const getExpenseInsights = async (expenseSummary) => {
  try {
    const model = getGeminiModel();
    const prompt = `As a financial advisor, provide brief (2-3 sentences) spending insights based on this expense breakdown. Be concise and actionable.
    
Expense Summary (in INR):
${JSON.stringify(expenseSummary, null, 2)}

Give practical tips to save money.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    return 'Unable to generate insights at the moment.';
  }
};

export const getFraudAlertExplanation = async (alertMessage) => {
  try {
    const model = getGeminiModel();
    const prompt = `Explain this bank fraud alert in simple terms for a customer (1-2 sentences): "${alertMessage}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    return alertMessage;
  }
};

/**
 * AI-based fraud analysis. Analyzes recent transactions and returns
 * zero or more fraud alerts: { risk_level, message, transaction_id? }.
 */
export const analyzeTransactionsForFraud = async (accountNumber, transactions) => {
  if (!transactions || transactions.length === 0) return [];

  try {
    const model = getGeminiModel(GEMINI_FRAUD_MODEL);
    const txnSummary = transactions.map((t) => ({
      id: t.id,
      transaction_id: t.transaction_id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description || '',
      created_at: t.created_at,
      sender: t.sender_account,
      receiver: t.receiver_account,
    }));

    const prompt = `You are a bank fraud detection system. Analyze the following recent transactions for account ${accountNumber} and identify any suspicious activity.

Transactions (JSON):
${JSON.stringify(txnSummary, null, 2)}

Rules:
- Consider: unusual amounts, rapid successive transactions, first-time transfers to new accounts, odd descriptions, unusual time patterns.
- Return a JSON array of alerts. Each alert: { "risk_level": "low"|"medium"|"high"|"critical", "message": "brief explanation for customer", "transaction_id": optional number (transaction id) }.
- risk_level: low = informational, medium = worth reviewing, high = suspicious, critical = urgent.
- If nothing suspicious, return empty array: [].
- Return ONLY valid JSON array, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    if (!text || !text.trim()) return [];

    // Robust JSON extraction: Find the first [ and the last ]
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
      console.warn('[AI fraud analysis] Response did not contain a valid JSON array:', text);
      return [];
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1);
    
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((a) => a && (a.risk_level || a.message))
        .map((a) => ({
          risk_level: ['low', 'medium', 'high', 'critical'].includes(a.risk_level) ? a.risk_level : 'medium',
          message: typeof a.message === 'string' ? a.message : 'Unusual activity detected',
          transaction_id: a.transaction_id != null ? a.transaction_id : null,
        }));
    } catch (parseErr) {
      console.error('[AI fraud analysis] Failed to parse extracted JSON:', parseErr.message);
      return [];
    }
  } catch (e) {
    console.error('[AI fraud analysis]', e.message);
    return [];
  }
};
