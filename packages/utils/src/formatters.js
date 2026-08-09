export const formatTokenNumber = (token) => {
  return `#${token.toString().padStart(3, "0")}`;
};

export const formatFee = (fee) => {
  if (fee == null) return "";
  return `₹${fee}`;
};
