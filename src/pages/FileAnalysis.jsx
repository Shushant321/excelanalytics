import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  LineChart, 
  Settings,
  FileSpreadsheet,
  Eye,
  Loader
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function FileAnalysis() {
  const { fileId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const chartRef = useRef();

  const [fileData, setFileData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  const fetchFileData = async () => {
    try {
      const response = await axios.get(`/files/${fileId}/data`);
      setFileData(response.data);
      setColumns(response.data.columns);
      
      // Auto-select first two columns
      if (response.data.columns.length >= 2) {
        setSelectedXAxis(response.data.columns[0]);
        setSelectedYAxis(response.data.columns[1]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching file data:', error);
      setError('Error loading file data');
      setLoading(false);
    }
  };

  const generateChart = async () => {
    if (!selectedXAxis || !selectedYAxis) {
      alert('Please select both X and Y axes');
      return;
    }

    setAnalyzing(true);

    try {
      const response = await axios.post(`/files/${fileId}/analyze`, {
        chartType,
        xAxis: selectedXAxis,
        yAxis: selectedYAxis
      });

      setChartData(response.data.chartData);
    } catch (error) {
      console.error('Error generating chart:', error);
      alert('Error generating chart');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadChart = async (format) => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `chart-${selectedXAxis}-vs-${selectedYAxis}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`chart-${selectedXAxis}-vs-${selectedYAxis}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart');
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedYAxis} vs ${selectedXAxis}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: selectedXAxis,
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: selectedYAxis,
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading file data...</div>;
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="file-analysis">
      {/* Header */}
      <header className="analysis-header">
        <div className="analysis-header-content">
          <Link to="/dashboard" className="back-button">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="analysis-title">File Analysis</h1>
        </div>
      </header>

      <div className="analysis-container">
        {/* File Info */}
        <div className="file-info-card">
          <div className="file-info-header">
            <FileSpreadsheet className="file-info-icon" />
            <div className="file-info-content">
              <h2 className="file-info-title">Data Overview</h2>
              <p className="file-info-meta">
                {fileData?.totalRows} rows • {fileData?.columns?.length} columns
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="analysis-controls">
          <div className="controls-grid">
            {/* Chart Type */}
            <div className="control-group">
              <label className="control-label">Chart Type</label>
              <div className="chart-type-buttons">
                <button
                  className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 size={16} />
                  Bar Chart
                </button>
                <button
                  className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => setChartType('line')}
                >
                  <LineChart size={16} />
                  Line Chart
                </button>
              </div>
            </div>

            {/* X Axis */}
            <div className="control-group">
              <label htmlFor="xAxis" className="control-label">X-Axis</label>
              <select
                id="xAxis"
                value={selectedXAxis}
                onChange={(e) => setSelectedXAxis(e.target.value)}
                className="control-select"
              >
                <option value="">Select X-Axis</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            {/* Y Axis */}
            <div className="control-group">
              <label htmlFor="yAxis" className="control-label">Y-Axis</label>
              <select
                id="yAxis"
                value={selectedYAxis}
                onChange={(e) => setSelectedYAxis(e.target.value)}
                className="control-select"
              >
                <option value="">Select Y-Axis</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div className="control-group">
              <button
                onClick={generateChart}
                disabled={analyzing || !selectedXAxis || !selectedYAxis}
                className="btn btn-primary"
              >
                {analyzing ? (
                  <>
                    <Loader className="btn-icon spinning" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Settings className="btn-icon" />
                    Generate Chart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Chart Display */}
        {chartData && (
          <div className="chart-section">
            <div className="chart-header">
              <h3 className="chart-title">Generated Chart</h3>
              <div className="chart-actions">
                <button
                  onClick={() => downloadChart('png')}
                  className="btn btn-outline btn-small"
                >
                  <Download size={16} />
                  PNG
                </button>
                <button
                  onClick={() => downloadChart('pdf')}
                  className="btn btn-outline btn-small"
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>

            <div className="chart-container" ref={chartRef}>
              {chartType === 'bar' ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        )}

        {/* Sample Data Preview */}
        <div className="data-preview">
          <h3 className="preview-title">Data Preview</h3>
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileData?.data?.slice(0, 5).map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column}>{row[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="preview-note">
            Showing first 5 rows of {fileData?.totalRows} total rows
          </p>
        </div>
      </div>
    </div>
  );
}

export default FileAnalysis;