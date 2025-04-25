import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/consts.js";

export const initApp = () => {
  const app = express();

  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );

  app.use(express.json());

  return app;
};

export default initApp;
