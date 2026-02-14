const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const GRID_SIZE = 20;
const COOLDOWN_MS = 200;

let grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
const userCooldowns = new Map();

const getLeaderboard = () => {
  const scores = {};

  grid.forEach((cell) => {
    if (cell) {
      if (!scores[cell.owner]) {
        scores[cell.owner] = { id: cell.owner, color: cell.color, score: 0 };
      }
      scores[cell.owner].score += 1;
    }
  });

  return Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 only
};

io.on("connection", (socket) => {
  socket.emit("init", grid);
  socket.emit("leaderboard_update", getLeaderboard());
  io.emit("online_count", io.engine.clientsCount);

  socket.on("capture", ({ index, color }) => {
    const now = Date.now();
    const lastMove = userCooldowns.get(socket.id) || 0;

    if (now - lastMove < COOLDOWN_MS) return;
    if (index < 0 || index >= grid.length) return;

    grid[index] = { owner: socket.id, color: color };
    userCooldowns.set(socket.id, now);

    io.emit("pixel_update", { index, color, owner: socket.id });

    io.emit("leaderboard_update", getLeaderboard());
  });

  socket.on("disconnect", () => {
    io.emit("online_count", io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
