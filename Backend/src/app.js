import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

function isAllowedOrigin(origin) {
  return !origin ||
    allowedOrigins.includes(origin) ||
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /\.onrender\.com$/.test(origin);
}

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Serve static assets from public folder
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

// Wildcard route to serve index.html for client-side routing
app.get('*', (req, res) => {
  // Do not serve index.html for API requests
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

export default app;
