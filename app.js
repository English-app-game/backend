import express from "express";
import cors from "cors";
import { CLIENT_URL, ROOMS_ROUTE } from "./config/consts.js";
import userRouter from "./routes/User-route.js";
import { USERS_ROUTE } from "./config/consts.js";
import { router as roomsRouter } from "./routes/rooms/router.js";
import loginRoute from "./routes/login.js";

export const initApp = () => {
  const app = express();

  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(USERS_ROUTE, userRouter);
  app.use(ROOMS_ROUTE, roomsRouter);
  app.use(loginRoute);


  return app;
};

export default initApp;
