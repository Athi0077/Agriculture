import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import aiReportRoutes from './routes/aiReportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { initCronJobs } from './jobs/aiReportJob.js';

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files for uploaded images

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai-reports', aiReportRoutes);
app.use('/api/notifications', notificationRoutes);

// Initialize Background Cron Jobs
initCronJobs();

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// trigger nodemon restart
