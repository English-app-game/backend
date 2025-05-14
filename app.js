import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/consts.js";
import loginRoute from "./routes/login.js";
import guestRout from "./routes/guest.js"
import userRouter from "./routes/User-route.js";
import { USERS_ROUTE } from "./config/consts.js";
import { router as roomsRouter } from "./routes/rooms/router.js";

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

  app.use(USERS_ROUTE, userRouter);
  app.use("/api/rooms", roomsRouter);

  return app;
};

export default initApp;
