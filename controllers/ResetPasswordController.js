import { UserModel } from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { NODEMAILER_PASSWORD,NODEMAILER_EMAIL, PORT } from "../config/consts.js";

const resetTokens = new Map();

export default async function sendResetPasswordEmail(req, res) {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email doesn't exist in the system." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    resetTokens.set(token, { userId: user._id, createdAt: Date.now() });
    const resetLink = `http://localhost:3000/login/resetPassword?token=${token}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_EMAIL, 
        pass: NODEMAILER_PASSWORD, 
      },
    });

    await transporter.sendMail({
      from: `"Reset Password" <${NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    });

    return res.status(200).json({ message: "Reset link sent. Please check your Email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export { resetTokens };
