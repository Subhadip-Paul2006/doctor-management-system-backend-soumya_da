import ApiError from "../../utils/apiError.js";
import redis from "../../config/redis.config.js";
import {
  findUserByEmail,
  findUserById,
  createUserWithProfile,
  updateUserPassword,
  updateRefreshToken,
  clearRefreshToken,
} from "./auth.repository.js";
import { hashPassword, comparePassword, generateOtp, hashToken } from "./auth.helper.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokenGenerator.js";
import { OTP_EXPIRY_SECONDS, OTP_PREFIX } from "./auth.constants.js";
import { sendEmail } from "../../utils/emailService.js";

export const registerUser = async ({ name, email, password, phone, dob }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const role = "PATIENT"; // self-registration is Patient-only

  const user = await createUserWithProfile({
    userData: { name, email, phone, role, password: hashedPassword },
    role,
    dob,
  });

  return sanitizeUser(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user || !user.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await findUserById(decoded.id);
  if (!user || user.refreshToken !== hashToken(incomingRefreshToken)) {
    throw new ApiError(401, "Refresh token is invalid or has been revoked");
  }

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const logoutUser = async (userId) => {
  await clearRefreshToken(userId);
};

export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal whether the email exists
    return;
  }

  if (!user.selfRegistered) {
    throw new ApiError(
      403,
      "This account's password can only be reset by your Clinic Admin or Super Admin"
    );
  }

  const otp = generateOtp();
  await redis.set(`${OTP_PREFIX}${email}`, otp, "EX", OTP_EXPIRY_SECONDS);

  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const storedOtp = await redis.get(`${OTP_PREFIX}${email}`);
  if (!storedOtp || storedOtp !== otp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(user.id, hashedPassword);
  await redis.del(`${OTP_PREFIX}${email}`);
};

// ---- helpers ----

const issueTokens = async (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await updateRefreshToken(user.id, hashToken(refreshToken));

  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser;
};