import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Upload,
  FileSpreadsheet,
  Zap,
  Shield,
  Users,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <BarChart3 className="nav-icon" />
            {/* <span className="nav-title"></span> */}
            <Link to="/" className="nav-title">
              Excel Analytics
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link nav-link-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your Excel Data Into
              <span className="hero-highlight"> Beautiful Charts</span>
            </h1>
            <p className="hero-description">
              Upload Excel files, analyze data with interactive visualizations,
              and generate professional reports. Complete with admin management
              and user analytics.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Analyzing
                <Sparkles className="btn-icon" />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
            <div className="hero-demo">
              <p className="demo-text">Try our demo accounts:</p>
              <div className="demo-accounts">
                <span className="demo-account">
                  Admin: admin@demo.com / admin123
                </span>
                <span className="demo-account">
                  User: user@demo.com / user123
                </span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-chart">
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "80%" }}></div>
                <div className="chart-bar" style={{ height: "45%" }}></div>
                <div className="chart-bar" style={{ height: "90%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Everything you need to analyze and visualize your Excel data
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Upload />
              </div>
              <h3 className="feature-title">Easy Upload</h3>
              <p className="feature-description">
                Drag and drop Excel files (.xls, .xlsx) with automatic parsing
                and validation
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 />
              </div>
              <h3 className="feature-title">Interactive Charts</h3>
              <p className="feature-description">
                Generate 2D and 3D charts with Chart.js and Three.js. Select any
                columns as X/Y axes
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Download />
              </div>
              <h3 className="feature-title">Export Options</h3>
              <p className="feature-description">
                Download your charts as PNG or PDF files for presentations and
                reports
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FileSpreadsheet />
              </div>
              <h3 className="feature-title">Analysis History</h3>
              <p className="feature-description">
                Keep track of all your uploads and analyses with detailed
                history and metadata
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3 className="feature-title">Admin Panel</h3>
              <p className="feature-description">
                Complete admin dashboard to manage users, view uploads, and
                delete files
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                JWT authentication, role-based access control, and secure file
                handling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="how-it-works-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Upload Excel File</h3>
                <p className="step-description">
                  Select and upload your Excel file (.xls or .xlsx). We'll
                  automatically parse it and show you the structure.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Choose Columns</h3>
                <p className="step-description">
                  Select which columns to use for X and Y axes. Preview your
                  data before generating charts.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Generate Charts</h3>
                <p className="step-description">
                  Create beautiful 2D or 3D interactive charts. Customize
                  colors, labels, and chart types.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Download & Share</h3>
                <p className="step-description">
                  Export your charts as PNG or PDF files. All analyses are saved
                  in your dashboard history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Analyze Your Data?</h2>
            <p className="cta-description">
              Join thousands of users who trust Excel Analytics for their data visualization needs
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Free Today
                <Zap className="btn-icon" />
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          {/* Brand + About Section */}
          <div className="footer-content">
            <div className="footer-brand">
              <BarChart3 className="footer-icon" />
              <span className="footer-title">Excel Analytics</span>
            </div>
            <p className="footer-description">
              Professional Excel data analysis and visualization platform
              helping you convert complex sheets into meaningful insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4 className="footer-heading">Quick Links</h4>
            <ul>
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/login">Login</a>
              </li>
              <li>
                <a href="/register">Register</a>
              </li>
              {/* <li>
                <a href="/forgot-password">Forgot Password</a>
              </li> */}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-services">
            <h4 className="footer-heading">Services</h4>
            <ul>
              <li>Excel Data Cleaning</li>
              <li>Custom Dashboards</li>
              <li>Data Visualization</li>
              <li>Charts & Reports</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h4 className="footer-heading">Contact Us</h4>
            <p>
              Email:{" "}
              <a href="mailto:support@excelanalytics.com">
                support@excelanalytics.com
              </a>
            </p>
            <p>Phone: +91-8707297320</p>
            <div className="footer-social">
              <a href="#" className="social-link">
                Instagram
              </a>{" "}
              |
              <a href="#" className="social-link">
                {" "}
                LinkedIn
              </a>{" "}
              |
              <a href="#" className="social-link">
                {" "}
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Excel Analytics Platform. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
