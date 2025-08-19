import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import FileUpload from '../models/FileUpload.js';

const router = express.Router();

// Get user dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalFiles = await FileUpload.countDocuments({ userId: req.user._id });
    
    const recentFiles = await FileUpload.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .limit(5);

    // Count total analyses
    const files = await FileUpload.find({ userId: req.user._id });
    const totalAnalyses = files.reduce((total, file) => total + file.analysisHistory.length, 0);

    res.json({
      stats: {
        totalFiles,
        totalAnalyses,
        joinedDate: req.user.createdAt
      },
      recentFiles
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

export default router;