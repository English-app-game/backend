import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { createToken } from "../utils/jwt.js";
import { verifyToken } from "../utils/jwt.js";

export function verifyAuthToken(req){
  const authHeader = req.headers.authorization;
  if(!authHeader) throw new Error ("No token provided");

  const token= authHeader.split(" ")[1];
  if(!token) throw new Error("Malformed token");

  return verifyToken(token);
}

export async function loginUserController(req, res) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = createToken({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarImg: user.avatarImg,
      isGuest: false,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarImg: user.avatarImg,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}