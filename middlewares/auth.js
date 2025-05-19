import { verifyAuthToken } from "../controllers/authController.js";

export function authMiddleware(req, res, next) {
  try {
    const decoded = verifyAuthToken(req);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
