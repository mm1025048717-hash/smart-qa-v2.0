import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Connect to database
connectDB();

// --- App Initialization ---
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(helmet()); // Basic security headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON
app.use(morgan('dev')); // Logger for development

// --- Routes ---
// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Innofusion API is up and running!',
  });
});

// Use Auth Routes
app.use('/api/auth', authRoutes);

// Use Project Routes
app.use('/api/projects', projectRoutes);

// Use AI Routes
app.use('/api/ai', aiRoutes);

// --- Socket.IO Connection ---
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project room ${projectId}`);
  });

  socket.on('leaveProject', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.id} left project room ${projectId}`);
  });

  socket.on('canvasUpdate', (data) => {
    // Broadcast to all clients in the project room except the sender
    socket.to(data.projectId).emit('canvasUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// --- Server Start ---
httpServer.listen(port, () => {
  console.log(`🚀 Server with WebSocket is listening on port ${port}`);
});

export default app;


