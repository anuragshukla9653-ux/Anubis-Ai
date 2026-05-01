import "dotenv/config";
import app from "./src/app.js";
import http from "http";
import connectDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Set PORT to a free port and restart the server.`);
        process.exit(1);
    }

    throw error;
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

connectDB().catch((err) => {
    console.warn("Database connection unavailable:", err.message);
    process.exit(1);
});
