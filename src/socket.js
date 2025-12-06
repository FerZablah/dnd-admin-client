// src/socket.js
import { io } from "socket.io-client";

// For Vite, set VITE_BACKEND_WS_URL in .env if you want
const URL = import.meta.env.VITE_BACKEND_WS_URL || "http://localhost:3000";

const socket = io(URL, {
  // optional but usually fine
  transports: ["websocket"],
});

export default socket;
