// YourFile.jsx
import React, { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiTrash2, FiSearch, FiGrid, FiList, FiMoreVertical, FiShield, FiClock, FiFile } from 'react-icons/fi';
import { saveAs } from 'file-saver';

const YourFiles = () => {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      try {
        const res = await fetch('http://localhost:5000/api/files/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: user.email })
        });
        const data = await res.json();

        const parsed = data.map((file, index) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size, // Already formatted by backend
          uploaded: file.uploaded,
          encrypted: file.encrypted,
          thumbnail: `https://via.placeholder.com/80/888888/ffffff?text=${file.type.toUpperCase()}`
        }));

        setFiles(parsed);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (file) => {
    saveAs(file.thumbnail, file.name);
  };

  const handleDelete = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  const getFileIcon = (type) => {
    const icons = {
      docx: '📄', pdf: '📑', jpg: '🖼️', png: '🖼️', pptx: '📽️', zip: '🗄️', txt: '📝'
    };
    return icons[type] || '📁';
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold">Your Files</h2>
          <p className="text-muted">Access all your encrypted files securely</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end">
          <div className="btn-group" role="group">
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid className="me-1" />
              Grid
            </button>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              <FiList className="me-1" />
              List
            </button>
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-5">
          <FiFile size={48} className="text-muted mb-3" />
          <h5>No files found</h5>
          <p className="text-muted">Try adjusting your search or upload new files</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredFiles.map(file => (
            <div key={file.id} className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-img-top bg-light text-center p-4" style={{ height: '180px' }}>
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <img 
                      src={file.thumbnail} 
                      alt={file.name} 
                      className="img-fluid" 
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div className="card-body">
                  <h6 className="card-title text-truncate">{file.name}</h6>
                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>{file.size}</span>
                    <span><FiClock className="me-1" />{file.uploaded}</span>
                  </div>
                  {file.encrypted && (
                    <div className="d-flex align-items-center small text-success mb-3">
                      <FiShield className="me-1" />
                      <span>Encrypted</span>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white border-0 d-flex justify-content-between">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handlePreview(file)}
                  >
                    <FiEye className="me-1" />
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleDownload(file)}
                  >
                    <FiDownload className="me-1" />
                    Download
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(file.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2 fs-5">{getFileIcon(file.type)}</span>
                        <span>{file.name}</span>
                      </div>
                    </td>
                    <td className="text-uppercase">{file.type}</td>
                    <td>{file.size}</td>
                    <td><FiClock className="me-1" />{file.uploaded}</td>
                    <td>
                      {file.encrypted ? (
                        <span className="badge bg-success bg-opacity-10 text-success">
                          <FiShield className="me-1" />
                          Encrypted
                        </span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-10 text-warning">
                          Unencrypted
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex">
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handlePreview(file)}
                        >
                          <FiEye />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => handleDownload(file)}
                        >
                          <FiDownload />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(file.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPreviewModal && selectedFile && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedFile.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPreviewModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-4" style={{ minHeight: '400px' }}>
                  <img 
                    src={selectedFile.thumbnail} 
                    alt={selectedFile.name} 
                    className="img-fluid" 
                    style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-start">
                    <p className="small text-muted mb-1">File Type</p>
                    <p className="fw-bold text-uppercase">{selectedFile.type}</p>
                  </div>
                  <div className="text-start">
                    <p className="small text-muted mb-1">File Size</p>
                    <p className="fw-bold">{selectedFile.size}</p>
                  </div>
                  <div className="text-start">
                    <p className="small text-muted mb-1">Uploaded</p>
                    <p className="fw-bold"><FiClock className="me-1" />{selectedFile.uploaded}</p>
                  </div>
                  <div className="text-start">
                    <p className="small text-muted mb-1">Status</p>
                    <p className="fw-bold">
                      {selectedFile.encrypted ? (
                        <span className="text-success">
                          <FiShield className="me-1" />
                          Encrypted
                        </span>
                      ) : (
                        <span className="text-warning">Unencrypted</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    handleDownload(selectedFile);
                    setShowPreviewModal(false);
                  }}
                >
                  <FiDownload className="me-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default YourFiles;
