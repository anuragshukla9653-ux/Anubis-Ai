import { Server } from "socket.io";

let io;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
].filter(Boolean);

function isAllowedOrigin(origin) {
    return !origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
}

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin(origin, callback) {
                if (isAllowedOrigin(origin)) {
                    return callback(null, true);
                }

                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
        }
    })

    console.log("Server.io server is Running")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}
