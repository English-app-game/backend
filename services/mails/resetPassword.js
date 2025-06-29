import crypto from "crypto";
import nodemailer from "nodemailer";
import { NODEMAILER_EMAIL, NODEMAILER_PASSWORD, CLIENT_URL } from "../../config/consts.js";

const resetTokens = new Map();

export function generateResetToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens.set(token, { userId, createdAt: Date.now() });

  setTimeout(() => {
    resetTokens.delete(token);
  }, 1000 * 60 * 10); // 10 minutes

  return token;
}

export function getResetTokens() {
  return resetTokens;
}

export async function sendResetPasswordEmailToUser(user, token) {
  const resetLink = `${CLIENT_URL}/login/setNewPassword?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: NODEMAILER_EMAIL,
      pass: NODEMAILER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Reset Password" <${NODEMAILER_EMAIL}>`,
    to: user.email,
    subject: "Reset Your Password In Spealish",
    html: `
      <p>Hello ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
}
