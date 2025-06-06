import express from "express";
import cors from "cors";
import { CLIENT_URL, ROOMS_ROUTE,USERS_ROUTE, GAMETYPE_ROUTE, STATISTICS_ROUTE,SCORE_ROUTE } from "./config/consts.js";
import loginRoute from "./routes/login.js";
import guestRout from "./routes/guest.js"
import userRouter from "./routes/user-route.js";
import { router as roomsRouter } from "./routes/rooms/router.js";
import gameTypeRoutes from "./routes/gameTypeRoutes.js"; 
import statisticsRouter from "./routes/statistics.js";
import scoreRoutes from "./routes/score-route.js";


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
  app.use(STATISTICS_ROUTE, statisticsRouter);
  app.use(SCORE_ROUTE, scoreRoutes);


  return app;
};

export default initApp;
