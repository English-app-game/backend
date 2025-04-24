import http from "http";
import dotenv from "dotenv";
import { initApp } from "./app.js";
import { connectToDB } from "./config/db.js";
import { Server } from "socket.io";

dotenv.config();

const startServer = async () => {
  const app = initApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  await connectToDB();

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // temp route handler just to see everything's working
  app.get("/test-server", (req, res) => res.send("Server is working."));
};

startServer();
