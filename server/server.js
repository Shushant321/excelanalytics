import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware: Enable CORS for frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // set frontend URL in .env ideally
  credentials: true,
}));

// Middleware: parse JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);     // Authentication: login, register, forgot/reset password
app.use('/api/files', fileRoutes);    // File uploads, processing routes
app.use('/api/admin', adminRoutes);   // Admin-specific routes (protected)
app.use('/api/users', userRoutes);    // User profile management

// MongoDB connection & demo data creation
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');

    // Create demo admin and user accounts if they don't exist already
    await createDemoData();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Create demo users for quick start/testing
const createDemoData = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const bcrypt = (await import('bcryptjs')).default;

    // Demo Admin
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      const hashedPass = await bcrypt.hash('admin123', 12);
      await new User({
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: hashedPass,
        role: 'admin'
      }).save();
      console.log('✅ Demo admin created: admin@demo.com / admin123');
    }

    // Demo User
    const userExists = await User.findOne({ email: 'user@demo.com' });
    if (!userExists) {
      const hashedPass = await bcrypt.hash('user123', 12);
      await new User({
        name: 'Demo User',
        email: 'user@demo.com',
        password: hashedPass,
        role: 'user'
      }).save();
      console.log('✅ Demo user created: user@demo.com / user123');
    }
  } catch (err) {
    console.error('Error creating demo data:', err);
  }
};

// Connect DB, then start server
connectDB();

// Global error handler (optional enhancement)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


app.use(express.static(path.join(__dirname, 'dist'))); // agar folder dist hai
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Server start karna
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});