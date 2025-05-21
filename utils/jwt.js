import jwt from "jsonwebtoken";

export function createToken(payload, expiresIn = "2h") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}