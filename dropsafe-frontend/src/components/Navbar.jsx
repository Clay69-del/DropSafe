import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../context/UserContext';

const Navbar = () => {
const { user, setUser } = useContext(UserContext);

const handleLoginSuccess = async (credentialResponse) => {
  const decoded = jwtDecode(credentialResponse.credential);

  try {
    // ✅ Send token to backend
    const res = await fetch('http://localhost:5000/api/auth/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Store JWT token for future requests (important!)
      localStorage.setItem('token', data.token);

      // ✅ Store user in context
      setUser({
        name: data.user.name,
        email: data.user.email,
        picture: data.user.picture,
      });

      // Optional: save user separately for quick load
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      console.error('Login failed:', data.message);
    }
  } catch (err) {
    console.error('Error logging in:', err);
  }
};
const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // remove JWT token too
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