import express from "express";
import cors from "cors";
import { CLIENT_URL, ROOMS_ROUTE,USERS_ROUTE, GAMETYPE_ROUTE } from "./config/consts.js";
import loginRoute from "./routes/login.js";
import guestRout from "./routes/guest.js"
import userRouter from "./routes/User-route.js";
import { router as roomsRouter } from "./routes/rooms/router.js";
import gameTypeRoutes from "./routes/gameTypeRoutes.js"; 

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
  app.use(guestRout);
  app.use(GAMETYPE_ROUTE,gameTypeRoutes);
  app.use(USERS_ROUTE, userRouter);
  app.use(ROOMS_ROUTE, roomsRouter);

  return app;
};

export default initApp;
