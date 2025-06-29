import { UserModel } from "../models/User.js";
import { generateResetToken, sendResetPasswordEmailToUser, getResetTokens } from "../services/mails/resetPassword.js";

export default async function sendResetPasswordEmail(req, res) {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email doesn't exist in the system." });
    }

    const token = generateResetToken(user._id);
    await sendResetPasswordEmailToUser(user, token);

    return res.status(200).json({ message: "Reset link sent. Please check your Email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const resetTokens = getResetTokens();
