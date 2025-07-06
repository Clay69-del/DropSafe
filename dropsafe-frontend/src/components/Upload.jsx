import React, { useState, useContext } from 'react';
import axios from 'axios';
import { FiUpload, FiX } from 'react-icons/fi';

import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  const [files, setFiles] = useState([]);

  const acceptedTypes = [
    'image/jpeg',                      // jpg, jpeg
    'image/png',                       // png
    'image/webp',                     // webp
    'application/pdf',                // pdf
    'text/plain',                    // plain text files (.txt)
    'application/msword',            // older Word docs (.doc)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // newer Word docs (.docx)
    'application/vnd.ms-excel',      // older Excel files (.xls)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // newer Excel (.xlsx)
    'application/zip',               // zip archives
    'application/x-rar-compressed'  // rar archives
  ];

  const fetchFiles = async (userEmail) => {
    try {
      const response = await axios.post('http://localhost:5000/api/files/files', { userEmail });
      setFiles(response.data);
    } catch (err) {
      setError('Failed to fetch uploaded files');
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      // Exchange Google token for JWT token
      const response = await axios.post(
        'http://localhost:5000/api/auth/google-auth',
        { credential: credentialResponse.credential },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          picture: response.data.user.picture,
          token: response.data.token
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setSuccess('Logged in successfully!');
        setError('');
        fetchFiles(userData.email);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to process Google login: ' + err.message);
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

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
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
      fetchFiles(user.email);
      
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

  React.useEffect(() => {
    if (user) {
      fetchFiles(user.email);
    }
    // eslint-disable-next-line
  }, [user]);

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

          {/* Your Uploads Section */}
          <div className="mt-4">
            <h3>Your Uploads</h3>
            {files.length === 0 ? (
              <p>No uploads yet.</p>
            ) : (
              <ul>
                {files.map(file => (
                  <li key={file.id}>
                    {file.name} ({file.size}, {file.type})
                  </li>
                ))}
              </ul>
            )}
          </div>
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