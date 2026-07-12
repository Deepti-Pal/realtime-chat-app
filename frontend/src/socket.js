import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// autoConnect is false so App can control exactly when the socket connects
// (i.e. only after the user has picked a username).
export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default socket;
