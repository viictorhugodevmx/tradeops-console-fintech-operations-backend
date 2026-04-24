export const generateTradeFolio = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `TR-${timestamp}`;
};