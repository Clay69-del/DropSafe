import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../context/UserContext';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser({
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture
    });
     localStorage.setItem('userEmail', decoded.email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
      <div className="container-fluid">
       
        <Link className="navbar-brand" to="/">
          <h1> DropSafe</h1>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link custom-nav-link" to="/">Home</Link>
            </li>  
            <li className="nav-item">
              <Link className="nav-link custom-nav-link" to="/upload">Upload File</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link custom-nav-link" to="/yourfile">Your Files</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link custom-nav-link" to="/blog">Blogs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link custom-nav-link" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link custom-nav-link" to="/contact">Contact</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-3">
            {!user ? (
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
              />
            ) : (
              <>
                <img
                  src={user.picture}
                  alt="Profile"
                  className="rounded-circle me-2"
                  style={{ width: '40px', height: '40px' }}
                />
                
                <span className="text-white me-2">{user.name}</span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;