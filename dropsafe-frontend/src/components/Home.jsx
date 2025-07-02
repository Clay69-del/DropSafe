import React from 'react';

const Home = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column justify-content-between">
      {/* Hero Section */}
      <div className="py-5 bg-white text-center shadow-sm">
        <h1 className="display-4 fw-bold text-dark">Welcome to DropSafe</h1>
        <p className="lead text-muted">
          Secure, encrypted cloud file storage with Google login.
        </p>
       
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <div className="row text-center g-4">
          <div className="col-md-4">
            <h4>🔐 End-to-End Encryption</h4>
            <p>Your files are encrypted before they touch the server.</p>
          </div>
          <div className="col-md-4">
            <h4>☁️ Cloud Access</h4>
            <p>Access your encrypted documents anywhere, anytime.</p>
          </div>
          <div className="col-md-4">
            <h4>🔒 Google Sign-In</h4>
            <p>Login safely with your existing Google account.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
