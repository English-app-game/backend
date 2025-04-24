import express from "express";
import cors from "cors";

export const initApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.json());

  return app;
};

export default initApp;
