import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import morgan from "morgan";

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',

].filter(Boolean);

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
}

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Auth routes
app.use('/', authRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);


export default app;
