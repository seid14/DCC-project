require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing Twilio webhook data

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const reportsRouter = require('./routes/reports');
const budgetsRouter = require('./routes/budgets');
const smsRouter = require('./routes/sms');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin'); // Add admin router

app.use('/api/reports', reportsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/sms', smsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter); // Mount admin routes

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Degahbur City Center API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Debug: Log registered routes
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log('Route registered:', middleware.route.path);
  } else if (middleware.name === 'router' && middleware.handle.stack) {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log('Mounted route:', handler.route.path, handler.route.stack[0].method);
      }
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});