import express from 'express';
import fs from 'fs';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import FileUpload from '../models/FileUpload.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get file count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const fileCount = await FileUpload.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          fileCount
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get specific user's files (admin only)
router.get('/users/:userId/files', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const files = await FileUpload.find({ userId: req.params.userId })
      .sort({ uploadedAt: -1 });

    res.json({
      user,
      files
    });
  } catch (error) {
    console.error('Error fetching user files:', error);
    res.status(500).json({ message: 'Error fetching user files' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user's files
    const userFiles = await FileUpload.find({ userId: req.params.userId });
    
    // Delete physical files
    userFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    // Delete file records
    await FileUpload.deleteMany({ userId: req.params.userId });

    // Delete user
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: `User ${user.name} and all their files deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Delete specific file (admin only)
router.delete('/files/:fileId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findById(req.params.fileId);
    
    if (!fileUpload) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    if (fs.existsSync(fileUpload.path)) {
      fs.unlinkSync(fileUpload.path);
    }

    // Delete from database
    await FileUpload.findByIdAndDelete(req.params.fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await FileUpload.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get recent activity
    const recentFiles = await FileUpload.find()
      .populate('userId', 'name email')
      .sort({ uploadedAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalFiles,
        totalAdmins,
        regularUsers: totalUsers - totalAdmins
      },
      recentFiles,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

export default router;