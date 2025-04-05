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
import http from 'http'; // To create HTTP server for Socket.IO
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import listingsRoute from './routes/listings.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your frontend domain if hosted elsewhere
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
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);

// Test endpoint
app.get('/testlamang', (req, res) => {
  res.send('Server is running!');
});

// Socket.IO functionality
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join a chat room for a specific sender and recipient
  socket.on('joinRoom', ({ senderId, recipientId }) => {
    const roomId = [senderId, recipientId].sort().join('-'); // Use a consistent room ID format
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
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