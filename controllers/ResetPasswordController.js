import setNewPassword from "../services/setNewPassword.js";
import { resetTokens } from "../services/resetPassword.js";

export const handleResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const tokenData = resetTokens.get(token);
  if (!tokenData) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  console.log("tokenData:", tokenData);
  console.log("userId:", tokenData.userId);

  try {
    await setNewPassword(tokenData.userId, newPassword);
    resetTokens.delete(token);
    res.json({ message: "Password updated successfully" });
    console.log("updated succesfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
};
