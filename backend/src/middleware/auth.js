const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'sneakerhub-secret-key';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/'
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, COOKIE_OPTIONS);
};

const clearTokenCookie = (res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
};

const authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please login.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Not authorized. Token invalid.' });
  }
};

const authorizeAdmin = async (req, res, next) => {
  try {
    await authenticate(req, res, async () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(403).json({ message: 'Not authorized as admin.' });
  }
};

module.exports = { 
  authenticate, 
  authorizeAdmin, 
  generateToken, 
  setTokenCookie,
  clearTokenCookie,
  JWT_SECRET 
};