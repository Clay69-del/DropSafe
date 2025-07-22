// dropsafe-frontend/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiHome, FiUpload, FiFileText } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: contextLogout } = useContext(UserContext);

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand">
            <span className="brand-text">DropSafe</span>
          </Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <FiHome className="nav-icon" />
            <span>Home</span>
          </Link>
          
          {user && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                <FiFileText className="nav-icon" />
                <span>Dashboard</span>
              </Link>
              <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>
                <FiUpload className="nav-icon" />
                <span>Upload</span>
              </Link>
            </>
          )}
        </div>
        
        <div className="user-section">
          {user ? (
            <div className="user-info">
              <Link to="/profile" className="user-email">{user.name || user.email}</Link>
              <button onClick={handleLogout} className="logout-button">
                <FiLogOut className="logout-icon" /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Log in
              </Link>
              <Link to="/register" className="signup-button">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;