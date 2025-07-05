import { io } from "socket.io-client";

const SOCKET_URL = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

// Create socket instance but don't connect immediately
const socket = io(SOCKET_URL, {
  autoConnect: false
});

socket.on("connect", () => {
    console.log("Connected to backend with id:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

export default socket;