import React, { useState, useContext } from 'react';
import axios from 'axios';
import { FiUpload, FiX } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, setUser } = useContext(UserContext);

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const handleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        token: credentialResponse.credential
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setSuccess('Logged in successfully!');
      setError('');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to process Google login');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setFile(null);
    setPreview('');
    setSuccess('Logged out successfully');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!acceptedTypes.includes(selectedFile.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!user) {
      setError('Please login to upload files');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', user.email);

      const response = await axios.post(
        'http://localhost:5000/api/uploads', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${user.token}`
          },
          timeout: 15000
        }
      );

      setSuccess('File uploaded successfully!');
      console.log('Upload response:', response.data);
      
    } catch (err) {
      let errorMessage = 'Upload failed';
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      errorMessage;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview('');
    if (preview) URL.revokeObjectURL(preview);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <FiUpload className="me-2" />
            Secure File Upload
          </h2>
          
          {/* Authentication Section */}
          <div className="mb-4">
            {!user ? (
              <div className="text-center">
                <p className="mb-3">Please login to upload files</p>
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => setError('Google login failed')}
                  useOneTap
                />
              </div>
            ) : (
              <div className="d-flex align-items-center mb-3">
                <img 
                  src={user.picture} 
                  alt="User" 
                  className="rounded-circle me-2" 
                  width="40" 
                  height="40"
                />
                <span>{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-danger ms-auto"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">
                Select File (JPEG, PNG, WebP - Max 5MB)
              </label>
              <input
                type="file"
                id="fileInput"
                className="form-control"
                onChange={handleFileChange}
                accept={acceptedTypes.join(',')}
              />
            </div>

            {preview && (
              <div className="mb-3 position-relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="img-thumbnail d-block"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                  onClick={removeFile}
                >
                  <FiX />
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading || !file || !user}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;