import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? "https://socket-5ezz.onrender.com"
    : "http://localhost:3001";

export const socket = io(URL);
