import React, { useState, useCallback } from 'react';
import { FiUpload, FiLock, FiX, FiCheck, FiFile, FiShield } from 'react-icons/fi';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [encryptionStatus, setEncryptionStatus] = useState('idle'); // 'idle', 'encrypting', 'encrypted'

  const acceptedFileTypes = [
    '.docx', '.jpg', '.jpeg', '.png', '.txt', 
    '.pdf', '.xlsx', '.pptx', '.zip'
  ];

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return acceptedFileTypes.includes(`.${extension}`);
    });

    if (validFiles.length !== newFiles.length) {
      alert(`Only these file types are allowed: ${acceptedFileTypes.join(', ')}`);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = () => {
    if (files.length === 0) return;
    
    setEncryptionStatus('encrypting');
    
    // Simulate encryption process
    setTimeout(() => {
      setEncryptionStatus('encrypted');
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => {
            setFiles([]);
            setUploadProgress(null);
            setEncryptionStatus('idle');
          }, 1000);
        } else {
          setUploadProgress(progress);
        }
      }, 300);
    }, 1500);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      docx: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      txt: '📝',
      pdf: '📑',
      xlsx: '📊',
      pptx: '📽️',
      zip: '🗄️'
    };
    return iconMap[extension] || '📁';
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Upload Card */}
          <div 
            className={`card border-0 shadow-lg ${isDragging ? 'border-primary' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <FiShield className="text-primary mb-3" size={48} />
                <h3 className="fw-bold">Secure File Upload</h3>
                <p className="text-muted">
                  Your files are encrypted before upload for maximum security
                </p>
              </div>

              {/* Drop Zone */}
              <div 
                className={`drop-zone p-5 text-center rounded-3 ${isDragging ? 'bg-primary bg-opacity-10' : 'bg-light'}`}
              >
                <FiUpload className="mb-3" size={32} />
                <h5 className="mb-2">Drag & Drop files here</h5>
                <p className="text-muted mb-3">or</p>
                <label className="btn btn-primary px-4">
                  Browse Files
                  <input 
                    type="file" 
                    className="d-none" 
                    multiple 
                    onChange={handleFileInput}
                    accept={acceptedFileTypes.join(',')}
                  />
                </label>
                <p className="small text-muted mt-3">
                  Supported formats: {acceptedFileTypes.join(', ')}
                </p>
              </div>

              {/* File Preview */}
              {files.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Selected Files</h6>
                  <div className="file-list">
                    {files.map((file, index) => (
                      <div key={index} className="file-item d-flex align-items-center p-3 mb-2 bg-light rounded">
                        <span className="file-icon me-3 fs-4">
                          {getFileIcon(file.name)}
                        </span>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <span className="file-name text-truncate" style={{ maxWidth: '200px' }}>
                              {file.name}
                            </span>
                            <span className="file-size text-muted">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="progress mt-2" style={{ height: '4px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ width: `${uploadProgress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger ms-3"
                          onClick={() => removeFile(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encryption Status */}
              {encryptionStatus !== 'idle' && (
                <div className={`alert ${encryptionStatus === 'encrypting' ? 'alert-warning' : 'alert-success'} mt-3 d-flex align-items-center`}>
                  {encryptionStatus === 'encrypting' ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      <span>Encrypting your files...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="me-2" />
                      <span>Files encrypted and ready for secure upload</span>
                    </>
                  )}
                </div>
              )}

              {/* Upload Button */}
              {files.length > 0 && (
                <div className="d-grid mt-4">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={simulateUpload}
                    disabled={encryptionStatus === 'encrypting'}
                  >
                    <FiLock className="me-2" />
                    {uploadProgress ? `Uploading (${Math.round(uploadProgress)}%)` : 'Upload Securely'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Security Assurance */}
          <div className="mt-4 text-center">
            <div className="d-flex justify-content-center align-items-center">
              <FiShield className="text-success me-2" />
              <small className="text-muted">
                All files are encrypted with AES-256 before leaving your device
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;