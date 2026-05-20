import { io } from "socket.io-client";

let socket;
const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

export const initializeSocketConnection = () => {
    if (!socket) {
        socket = io(socketUrl, {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection failed:", error.message);
        });
    }

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const disconnectSocketConnection = () => {
    if (socket) {
        socket.disconnect();
    }
};

export const getSocket = () => socket;
