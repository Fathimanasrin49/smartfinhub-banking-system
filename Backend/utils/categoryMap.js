// Auto-categorization mapping for expense tracking
export const CATEGORY_MAP = {
  amazon: 'shopping',
  flipkart: 'shopping',
  myntra: 'shopping',
  zomato: 'food',
  swiggy: 'food',
  uber: 'transport',
  ola: 'transport',
  rapido: 'transport',
  electricity: 'bills',
  water: 'bills',
  gas: 'bills',
  jio: 'bills',
  airtel: 'bills',
  vodafone: 'bills',
  netflix: 'entertainment',
  prime: 'entertainment',
  spotify: 'entertainment',
  hospital: 'healthcare',
  pharmacy: 'healthcare',
  doctor: 'healthcare',
};

export const categorizeDescription = (description = '') => {
  const lower = description.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'other';
};
