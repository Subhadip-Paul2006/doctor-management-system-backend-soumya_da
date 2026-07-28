import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};