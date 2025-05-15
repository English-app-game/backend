import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/consts.js";
import loginRoute from "./routes/login.js";
import guestRout from "./routes/guest.js"

export const initApp = () => {
  const app = express();

  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(loginRoute);
  app.use(guestRout);


  return app;
};

export default initApp;
