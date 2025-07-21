import React, { useState, useEffect, useContext } from 'react';
import { 
  FiDownload, 
  FiEye, 
  FiTrash2, 
  FiSearch, 
  FiGrid, 
  FiList, 
  FiMoreVertical, 
  FiShield, 
  FiClock, 
  FiFile,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader
} from 'react-icons/fi';
import { saveAs } from 'file-saver';
import { fileApi } from '../utils/api';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';

const YourFiles = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { user } = useContext(UserContext);

  // Fetch files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await fileApi.getFiles();
        const filesData = response.data?.files || [];
        
        const formattedFiles = filesData.map(file => ({
          id: file.id,
          name: file.originalName || file.name,
          type: file.type || file.mimeType?.split('/').pop() || 'file',
          size: file.size,
          uploaded: file.uploaded || file.createdAt,
          encrypted: file.encrypted !== false,
          mimeType: file.mimeType,
          downloadUrl: `/api/files/view/${file.id}`,
          thumbnail: file.thumbnail || `https://via.placeholder.com/80/888888/ffffff?text=${(file.type || 'FILE').toUpperCase()}`
        }));
        
        setFiles(formattedFiles);
        setFilteredFiles(formattedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
        toast.error('Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [user]);

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = files.filter(file => 
      file.name.toLowerCase().includes(query) ||
      file.type.toLowerCase().includes(query)
    );
    
    setFilteredFiles(filtered);
  }, [searchQuery, files]);

  const handlePreview = async (file) => {
    try {
      setSelectedFile(file);
      
      // For images, we can show a preview directly
      if (file.mimeType?.startsWith('image/')) {
        const response = await fileAPI.viewFile(file.id, true);
        setSelectedFile(prev => ({
          ...prev,
          downloadUrl: URL.createObjectURL(new Blob([response.data]))
        }));
      }
      
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Could not load file preview');
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fileAPI.downloadFile(file.id);
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName || file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Downloaded ${file.name} successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download file');
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        await fileAPI.deleteFile(fileId);
        setFiles(files.filter(file => file.id !== fileId));
        toast.success('File deleted successfully');
        
        // Close preview if the deleted file is being viewed
        if (selectedFile?.id === fileId) {
          setShowPreviewModal(false);
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete file');
      }
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      docx: '📄', pdf: '📑', jpg: '🖼️', png: '🖼️', pptx: '📽️', zip: '🗄️', txt: '📝'
    };
    return icons[type] || '📁';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your files...</p>
      </div>
    );
  }

  // Empty state
  if (!isLoading && files.length === 0) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="empty-state">
          <FiFile size={48} className="text-muted mb-3" />
          <h4>No files found</h4>
          <p className="text-muted">Upload your first file to get started</p>
        </div>
      </div>
    );
  }

  // Preview modal
  const PreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">File Preview: {file.name}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              {file.mimeType?.startsWith('image/') ? (
                <img 
                  src={file.downloadUrl} 
                  alt={file.name} 
                  className="img-fluid" 
                  style={{ maxHeight: '60vh' }}
                />
              ) : (
                <div className="p-5 bg-light rounded">
                  <div className="display-1 mb-3">{getFileIcon(file.type)}</div>
                  <p className="text-muted">Preview not available for this file type</p>
                </div>
              )}
            </div>
            <div className="modal-footer justify-content-between">
              <div>
                <span className="badge bg-secondary me-2">{file.type?.toUpperCase()}</span>
                <span className="text-muted">{formatFileSize(file.size)}</span>
                {file.encrypted && (
                  <span className="ms-2" title="Encrypted">
                    <FiShield className="text-primary" />
                  </span>
                )}
              </div>
              <div>
                <button 
                  className="btn btn-outline-secondary me-2"
                  onClick={() => handleDownload(file)}
                >
                  <FiDownload className="me-1" /> Download
                </button>
                <button className="btn btn-primary" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Preview Modal */}
      {showPreviewModal && selectedFile && (
        <PreviewModal 
          file={selectedFile} 
          onClose={() => setShowPreviewModal(false)} 
        />
      )}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Your Files</h2>
              <p className="text-muted mb-0">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} found
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <FiGrid />
                </button>
                <button
                  className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {viewMode === 'grid' ? (
          // Grid View
          filteredFiles.map((file) => (
            <div key={file.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div className="file-icon mb-3">
                    <span className="display-4">{getFileIcon(file.type)}</span>
                    {file.encrypted && (
                      <span className="position-absolute top-0 end-0 m-2" title="Encrypted">
                        <FiShield className="text-primary" />
                      </span>
                    )}
                  </div>
                  <h6 className="card-title text-truncate" title={file.name}>
                    {file.name}
                  </h6>
                  <p className="card-text small text-muted">
                    {formatFileSize(file.size)} • {formatDate(file.uploaded)}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0 pt-0">
                  <div className="btn-group w-100">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handlePreview(file)}
                      title="Preview"
                    >
                      <FiEye />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleDownload(file)}
                      title="Download"
                    >
                      <FiDownload />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(file.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // List View
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => (
                      <tr key={file.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2">{getFileIcon(file.type)}</span>
                            <span className="text-truncate" style={{ maxWidth: '200px' }} title={file.name}>
                              {file.name}
                            </span>
                            {file.encrypted && (
                              <FiShield className="ms-2 text-primary" size={14} title="Encrypted" />
                            )}
                          </div>
                        </td>
                        <td className="text-uppercase">{file.type}</td>
                        <td>{formatFileSize(file.size)}</td>
                        <td>{formatDate(file.uploaded)}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handlePreview(file)}
                              title="Preview"
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleDownload(file)}
                              title="Download"
                            >
                              <FiDownload size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(file.id)}
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-3">
              <div className="row g-3 align-items-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FiSearch className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search files by name or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4 text-md-end">
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
            </div>
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
