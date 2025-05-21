import { UserModel } from "../models/User.js";
import bcrypt from "bcrypt";

const setNewPassword = async (userId, newPassword) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  const savedUser = await user.save();
  return savedUser;
};

export default setNewPassword;
