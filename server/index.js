require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createClient } = require("redis");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const GRID_SIZE = 20;
const TOTAL_PIXELS = GRID_SIZE * GRID_SIZE;
const COOLDOWN_MS = 200;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const client = createClient({ url: REDIS_URL });
client.on("error", (err) => console.log("Redis Client Error", err));

async function startServer() {
  await client.connect();
  console.log("Connected to Redis");

  const exists = await client.exists("pixel_grid");
  if (!exists) {
    console.log("Initializing new grid in Redis...");
  }

  const userCooldowns = new Map();

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.id}`);
    const rawGrid = await client.hGetAll("pixel_grid");

    const gridArray = Array(TOTAL_PIXELS).fill(null);
    Object.keys(rawGrid).forEach((index) => {
      gridArray[parseInt(index)] = JSON.parse(rawGrid[index]);
    });

    socket.emit("init", gridArray);
    socket.emit("leaderboard_update", calculateLeaderboard(gridArray));

    socket.on("capture", async ({ index, color }) => {
      const now = Date.now();
      const lastMove = userCooldowns.get(socket.id) || 0;

      if (now - lastMove < COOLDOWN_MS) return;
      if (index < 0 || index >= TOTAL_PIXELS) return;

      const pixelData = JSON.stringify({ owner: socket.id, color });

      await client.hSet("pixel_grid", index.toString(), pixelData);

      userCooldowns.set(socket.id, now);

      io.emit("pixel_update", { index, color, owner: socket.id });
    });
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
  });
}
function calculateLeaderboard(grid) {
  const scores = {};
  grid.forEach((cell) => {
    if (cell) {
      if (!scores[cell.owner])
        scores[cell.owner] = { id: cell.owner, color: cell.color, score: 0 };
      scores[cell.owner].score += 1;
    }
  });
  return Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

startServer();
