import express from 'express';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import FileUpload from '../models/FileUpload.js';

const router = express.Router();

// Upload Excel file
router.post('/upload', authenticateToken, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file info to database
    const fileUpload = new FileUpload({
      userId: req.user._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype
    });

    await fileUpload.save();

    // Parse Excel file to get column names
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const columns = jsonData[0] || [];
    const sampleData = jsonData.slice(1, 6); // Get first 5 rows as sample

    res.json({
      message: 'File uploaded successfully',
      fileId: fileUpload._id,
      originalName: req.file.originalname,
      columns: columns,
      sampleData: sampleData,
      totalRows: jsonData.length - 1
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get file data for chart generation
router.get('/:fileId/data', authenticateToken, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findOne({
      _id: req.params.fileId,
      userId: req.user._id
    });

    if (!fileUpload) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Read and parse Excel file
    const workbook = XLSX.readFile(fileUpload.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    res.json({
      data: jsonData,
      columns: Object.keys(jsonData[0] || {}),
      totalRows: jsonData.length
    });
  } catch (error) {
    console.error('Error reading file data:', error);
    res.status(500).json({ message: 'Error reading file data' });
  }
});

// Generate chart and save analysis
router.post('/:fileId/analyze', authenticateToken, async (req, res) => {
  try {
    const { chartType, xAxis, yAxis } = req.body;

    const fileUpload = await FileUpload.findOne({
      _id: req.params.fileId,
      userId: req.user._id
    });

    if (!fileUpload) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Read Excel data
    const workbook = XLSX.readFile(fileUpload.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Process data for chart
    const chartData = {
      labels: jsonData.map(row => row[xAxis]).slice(0, 50), // Limit to 50 points
      datasets: [{
        label: yAxis,
        data: jsonData.map(row => parseFloat(row[yAxis]) || 0).slice(0, 50),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };

    // Save analysis to file history
    fileUpload.analysisHistory.push({
      chartType,
      xAxis,
      yAxis,
      chartData
    });

    await fileUpload.save();

    res.json({
      message: 'Analysis completed',
      chartData,
      analysisId: fileUpload.analysisHistory[fileUpload.analysisHistory.length - 1]._id
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Error analyzing data' });
  }
});

// Get user's uploaded files
router.get('/my-files', authenticateToken, async (req, res) => {
  try {
    const files = await FileUpload.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 });

    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Delete user's file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findOne({
      _id: req.params.fileId,
      userId: req.user._id
    });

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

export default router;