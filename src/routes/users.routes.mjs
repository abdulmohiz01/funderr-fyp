import express from 'express';
import User from '../models/User.mjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Get JWT_SECRET from environment variables or use default
const JWT_SECRET = process.env.JWT_SECRET || 'funderr-secret-key';

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Check for token in the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Check if requested ID matches authenticated user
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if requested ID matches authenticated user
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { name, role, ...otherFields } = req.body;
    
    // Create update object - don't allow email/password updates through this endpoint
    const updateData = { 
      name,
      role,
      ...otherFields,
      updatedAt: new Date()
    };
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true } // Return updated user
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
