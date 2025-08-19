import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, 
  FileSpreadsheet, 
  Shield, 
  TrendingUp, 
  Trash2, 
  Eye,
  LogOut,
  BarChart3,
  AlertTriangle,
  Calendar,
  Download
} from 'lucide-react';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users')
      ]);
      
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  const fetchUserFiles = async (userId) => {
    try {
      const response = await axios.get(`/admin/users/${userId}/files`);
      setUserFiles(response.data.files);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user files:', error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their files and cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchAdminData();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
        setUserFiles([]);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`/admin/files/${fileId}`);
      alert('File deleted successfully');
      fetchAdminData();
      if (selectedUser) {
        fetchUserFiles(selectedUser._id);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
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
    return <div className="loading-spinner">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            <Shield className="dashboard-brand-icon" />
            <h1 className="dashboard-title">Admin Dashboard</h1>
          </div>
          <div className="dashboard-user">
            <span className="admin-badge">Admin</span>
            <span className="user-welcome">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn btn-outline btn-small">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={16} />
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            User Management
          </button>
          {selectedUser && (
            <button
              className={`tab-button ${activeTab === 'user-files' ? 'active' : ''}`}
              onClick={() => setActiveTab('user-files')}
            >
              <FileSpreadsheet size={16} />
              {selectedUser.name}'s Files
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-overview">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-primary">
                  <Users />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats?.stats?.totalUsers || 0}</h3>
                  <p className="stat-label">Total Users</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-success">
                  <FileSpreadsheet />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats?.stats?.totalFiles || 0}</h3>
                  <p className="stat-label">Total Files</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-warning">
                  <Shield />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats?.stats?.totalAdmins || 0}</h3>
                  <p className="stat-label">Admin Users</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-info">
                  <TrendingUp />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats?.stats?.regularUsers || 0}</h3>
                  <p className="stat-label">Regular Users</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <div className="activity-section">
                <h3 className="section-title">Recent Files</h3>
                <div className="activity-list">
                  {stats?.recentFiles?.map((file) => (
                    <div key={file._id} className="activity-item">
                      <div className="activity-icon">
                        <FileSpreadsheet size={16} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{file.originalName}</p>
                        <p className="activity-meta">
                          Uploaded by {file.userId?.name} • {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-section">
                <h3 className="section-title">Recent Users</h3>
                <div className="activity-list">
                  {stats?.recentUsers?.map((user) => (
                    <div key={user._id} className="activity-item">
                      <div className="activity-icon">
                        <Users size={16} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{user.name}</p>
                        <p className="activity-meta">
                          {user.email} • Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="section-header">
              <h2 className="section-title">User Management</h2>
              <p className="section-description">
                Manage all users and their file uploads
              </p>
            </div>

            <div className="users-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Files</th>
                    <th>Joined</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="user-name">{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.fileCount || 0}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatDate(user.lastLogin)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-outline btn-small"
                            onClick={() => {
                              fetchUserFiles(user._id);
                              setActiveTab('user-files');
                            }}
                          >
                            <Eye size={14} />
                            View Files
                          </button>
                          {user._id !== user._id && (
                            <button
                              className="btn btn-outline btn-small btn-danger"
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              disabled={user.role === 'admin'}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Files Tab */}
        {activeTab === 'user-files' && selectedUser && (
          <div className="admin-user-files">
            <div className="section-header">
              <h2 className="section-title">{selectedUser.name}'s Files</h2>
              <p className="section-description">
                {selectedUser.email} • {userFiles.length} files uploaded
              </p>
            </div>

            {userFiles.length === 0 ? (
              <div className="empty-state">
                <FileSpreadsheet className="empty-icon" />
                <h3 className="empty-title">No files uploaded</h3>
                <p className="empty-description">
                  This user hasn't uploaded any files yet
                </p>
              </div>
            ) : (
              <div className="files-grid">
                {userFiles.map((file) => (
                  <div key={file._id} className="file-card">
                    <div className="file-header">
                      <div className="file-icon">
                        <FileSpreadsheet />
                      </div>
                      <div className="file-actions">
                        <button
                          onClick={() => handleDeleteFile(file._id)}
                          className="btn btn-outline btn-small btn-danger"
                        >
                          <Trash2 size={14} />
                          Delete
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;