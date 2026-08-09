export const formatTokenNumber = (token: number): string => {
  return `#${token.toString().padStart(3, "0")}`;
};
