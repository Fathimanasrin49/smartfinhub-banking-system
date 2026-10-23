export const generateTransactionId = () => {
  return 'TXN' + Date.now() + '-' + Math.random().toString(36).slice(2, 9).toUpperCase();
};
