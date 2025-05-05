const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// CORS configuration based on environment
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Set cookie options based on environment
app.use((req, res, next) => {
  res.cookie = (name, value, options = {}) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const defaultOptions = {
      httpOnly: true,
      secure: isProduction, // Only use secure cookies in production
      sameSite: isProduction ? 'none' : 'lax', // Must be 'none' for cross-site cookies in production
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    };
    return res.cookie(name, value, { ...defaultOptions, ...options });
  };
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});