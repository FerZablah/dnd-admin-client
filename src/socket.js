// src/socket.js
import { io } from 'socket.io-client';

// Point this to your backend Socket.IO endpoint
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
});

// ✅ Named export
export { socket };

// ✅ Default export (for any old `import socket from './socket'`)
export default socket;
