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
  const startTime = Date.now();

  try {
    console.log(`🔍 Looking up user with email: ${email}`);
    const dbStartTime = Date.now();
    
    const user = await UserModel.findOne({ email });
    const dbEndTime = Date.now();
    console.log(`📊 Database query took: ${dbEndTime - dbStartTime}ms`);

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ error: "User not found" });
    }

    console.log(`🔐 Comparing password for user: ${user.name}`);
    const bcryptStartTime = Date.now();
    
    const isMatch = await bcrypt.compare(password, user.password);
    const bcryptEndTime = Date.now();
    console.log(`📊 Password comparison took: ${bcryptEndTime - bcryptStartTime}ms`);
    
    if (!isMatch) {
      console.log(`❌ Invalid password for user: ${email}`);
      return res.status(401).json({ error: "Invalid password" });
    }

    console.log(`🎫 Creating JWT token for user: ${user.name}`);
    const tokenStartTime = Date.now();
    
    const token = createToken({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarImg: user.avatarImg,
      isGuest: false,
    });
    
    const tokenEndTime = Date.now();
    console.log(`📊 Token creation took: ${tokenEndTime - tokenStartTime}ms`);

    const totalTime = Date.now() - startTime;
    console.log(`✅ Login successful for ${user.name} - Total time: ${totalTime}ms`);

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
    const totalTime = Date.now() - startTime;
    console.error(`💥 Login error after ${totalTime}ms:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
}