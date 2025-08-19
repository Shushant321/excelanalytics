import mongoose from 'mongoose';

const FileUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  analysisHistory: [{
    chartType: String,
    xAxis: String,
    yAxis: String,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    chartData: mongoose.Schema.Types.Mixed
  }]
});

export default mongoose.model('FileUpload', FileUploadSchema);