import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  Calendar, 
  MoreHorizontal,
  Eye,
  Trash2,
  LogOut,
  BarChart3,
  Plus
} from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchFiles();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/users/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/files/my-files');
      setFiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/)) {
      alert('Please select a valid Excel file (.xls or .xlsx)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await axios.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('File uploaded successfully!');
      fetchFiles();
      fetchDashboardData();
      
      // Navigate to analysis page
      navigate(`/analyze/${response.data.fileId}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`/files/${fileId}`);
      fetchFiles();
      fetchDashboardData();
      alert('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting file');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            <BarChart3 className="dashboard-brand-icon" />
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <div className="dashboard-user">
            <span className="user-welcome">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn btn-outline btn-small">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileSpreadsheet />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{dashboardData?.stats?.totalFiles || 0}</h3>
              <p className="stat-label">Files Uploaded</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{dashboardData?.stats?.totalAnalyses || 0}</h3>
              <p className="stat-label">Analyses Created</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Calendar />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">
                {dashboardData?.stats?.joinedDate ? 
                  Math.floor((new Date() - new Date(dashboardData.stats.joinedDate)) / (1000 * 60 * 60 * 24)) 
                  : 0
                }
              </h3>
              <p className="stat-label">Days Active</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="section-header">
            <h2 className="section-title">Upload New File</h2>
            <p className="section-description">
              Upload your Excel files (.xls, .xlsx) to start analyzing data
            </p>
          </div>
          
          <div className="upload-area">
            <input
              type="file"
              id="fileUpload"
              accept=".xls,.xlsx"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <label htmlFor="fileUpload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
              <div className="upload-content">
                {uploading ? (
                  <>
                    <div className="upload-spinner"></div>
                    <p>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="upload-icon" />
                    <p className="upload-text">Click to select Excel file</p>
                    <p className="upload-subtext">Supports .xls and .xlsx files up to 10MB</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Files Section */}
        <div className="files-section">
          <div className="section-header">
            <h2 className="section-title">Your Files</h2>
            <p className="section-description">
              Manage and analyze your uploaded Excel files
            </p>
          </div>

          {files.length === 0 ? (
            <div className="empty-state">
              <FileSpreadsheet className="empty-icon" />
              <h3 className="empty-title">No files uploaded yet</h3>
              <p className="empty-description">
                Upload your first Excel file to start creating beautiful charts and analyses
              </p>
            </div>
          ) : (
            <div className="files-grid">
              {files.map((file) => (
                <div key={file._id} className="file-card">
                  <div className="file-header">
                    <div className="file-icon">
                      <FileSpreadsheet />
                    </div>
                    <div className="file-menu">
                      <button className="menu-button">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="file-info">
                    <h3 className="file-name" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <p className="file-meta">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </p>
                    <p className="file-analyses">
                      {file.analysisHistory?.length || 0} analyses created
                    </p>
                  </div>

                  <div className="file-actions">
                    <Link
                      to={`/analyze/${file._id}`}
                      className="btn btn-primary btn-small"
                    >
                      <Eye size={16} />
                      Analyze
                    </Link>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="btn btn-outline btn-small btn-danger"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;