export const generateRegistrationCode = () => {
  return "FF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};
