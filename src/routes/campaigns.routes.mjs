import express from 'express';
import Campaign from '../models/Campaign.mjs';
import User from '../models/User.mjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'funderr-secret-key';

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Create a new campaign
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, goal, category, imageKey } = req.body;
    const campaign = new Campaign({
      title,
      description,
      goal,
      category,
      imageKey,
      creatorId: req.user._id,
      creatorName: req.user.name,
      status: 'pending',
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error });
  }
});

// List campaigns (optionally filter by status)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const campaigns = await Campaign.find(filter).sort({ dateCreated: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error });
  }
});

// Approve a campaign (admin only)
router.put('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: '' },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error approving campaign', error });
  }
});

// Reject a campaign (admin only)
router.put('/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || 'Not approved by admin' },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting campaign', error });
  }
});

// Get campaigns for a specific user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creatorId: req.params.userId });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user campaigns', error });
  }
});

export default router;
