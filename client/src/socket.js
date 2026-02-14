import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? "https://pixelwars-backend.onrender.com"
    : "http://localhost:3001";

export const socket = io(URL);
