/***const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const listingsRoute = require('./routes/listings.js'); 

const app = express();*/

//server.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import listingsRoute from './routes/listings.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import AdminRoutes from './routes/Admin.js'; // Newly imported Admin routes
import auth from './middleware/auth.js'; // Import the auth middleware
import jwt from 'jsonwebtoken';
import checkoutRoutes from './routes/checkoutRoutes.js';



dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Configure body-parser with proper error handling
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({ message: 'Invalid JSON payload' });
        throw new Error('Invalid JSON');
      }
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

// Route mappings
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoute);
app.use('/api/cart', cartRoutes);
app.use('/api/inventory', inventoryRoutes);

// Mount admin routes directly at the /api/admin endpoint
app.use('/api/admin', AdminRoutes);

app.use('/api/users', auth, userRoutes); // Auth middleware applied
app.use('/api/messages', auth, messageRoutes); // Auth middleware applied
app.use('/api/cart', checkoutRoutes); // Make sure `/api/cart` maps to `checkoutRoutes`

// Test endpoint
app.get('/testlamang', (req, res) => {
  res.send('Server is running!');
});

// Socket.IO functionality
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Example of protecting Socket.IO with authentication
  socket.on('joinRoom', ({ senderId, recipientId, token }) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        socket.emit('error', 'Authentication failed');
        return;
      }
      socket.join([senderId, recipientId].sort().join('-'));
      console.log(`${socket.id} joined room ${senderId}-${recipientId}`);
    });
  });

  // Handle sending a message
  socket.on('sendMessage', ({ senderId, recipientId, content }) => {
    const roomId = [senderId, recipientId].sort().join('-');
    const messageData = {
      senderId,
      recipientId,
      content,
      timestamp: new Date(),
    };

    // Emit the message to the specific room
    io.to(roomId).emit('receiveMessage', messageData);
    console.log('Message sent:', messageData);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();