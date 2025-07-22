import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Dashboard.css';
import {
  FiDownload,
  FiTrash2,
  FiEye,
  FiGrid,
  FiList,
  FiFile,
  FiImage,
  FiUpload
} from 'react-icons/fi';

// Format bytes into human-readable strings
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Icon based on mimeType
const FileIcon = ({ mimeType, className = '' }) => {
  if (mimeType?.startsWith('image/')) {
    return <FiImage className={className} />;
  } else if (mimeType === 'application/pdf') {
    return <FiFile className={className} />;
  }
  return <FiFile className={className} />;
};

// Dynamic backend URL for production or development
const BACKEND_URL = 'http://localhost:5000';

const getProfilePicUrl = (user, picOverride) => {
  const pic = picOverride || user?.profilePicture;
  if (pic) {
    return `${BACKEND_URL}${pic}`;
  }
  if (user?.picture) return user.picture;
  return "/default-profile.jpg";
};

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch and normalize files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/files');
      let fetched = [];

      if (Array.isArray(response)) {
        fetched = response;
      } else if (response.files && Array.isArray(response.files)) {
        fetched = response.files;
      } else if (
        response.data?.files &&
        Array.isArray(response.data.files)
      ) {
        fetched = response.data.files;
      } else if (response.data && Array.isArray(response.data)) {
        fetched = response.data;
      } else {
        console.warn('Unexpected files response:', response);
      }

      // API returns size as string in MB → convert to bytes
      const normalized = fetched.map((f) => ({
        ...f,
        size: f.size ? parseFloat(f.size) * 1024 * 1024 : 0
      }));
      setFiles(normalized);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Download handler
  const handleDownload = async (file) => {
    try {
      const blob = await api.get(`/files/view/${file.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.displayName || file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this file?'
      )
    ) {
      try {
        await api.delete(`/files/${id}`);
        setFiles((fs) => fs.filter((f) => f.id !== id));
        toast.success('File deleted');
        if (selectedFile?.id === id) {
          setShowPreviewModal(false);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  // Preview handler
  const handlePreview = async (file) => {
    try {
      setSelectedFile(file);
      if (file.mimeType?.startsWith('image/') || file.mimeType === 'application/pdf') {
        const blob = await api.get(`/files/view/${file.id}`, {
          responseType: 'blob'
        });
        setSelectedFile((prev) => ({
          ...prev,
          downloadUrl: URL.createObjectURL(blob)
        }));
      } else {
        setSelectedFile((prev) => ({ ...prev, downloadUrl: null }));
      }
      setShowPreviewModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Preview failed');
    }
  };


  
  // Filtered list
  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.mimeType
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Redirect if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFiles();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Welcome */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <img
            src={getProfilePicUrl(user)}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover
              border-4 border-white shadow-lg"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600">
          Manage your secure files and account
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Upload Files
          </h3>
          <p className="text-gray-600 mb-4">
            Securely upload new files to your cloud vault
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2
              bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiUpload className="mr-2" />
            Upload Now
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Profile Settings
          </h3>
          <p className="text-gray-600 mb-4">
            Update your account details and preferences
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2
              bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            View Profile
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Storage Usage
          </h3>
          <p className="text-gray-600 mb-2">
            {files.length} files •{' '}
            {formatFileSize(
              files.reduce((acc, f) => acc + f.size, 0)
            )}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${Math.min(100, files.length * 10)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Files Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Your Files
              </h2>
              <p className="text-gray-600">
                Manage your uploaded files
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 border
                    border-gray-300 rounded-lg focus:ring-2
                    focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5
                    text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0
                      11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm'
                      : 'text-gray-500'
                  }`}
                  title="Grid view"
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm'
                      : 'text-gray-500'
                  }`}
                  title="List view"
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2
                    0 01-2-2V5a2 2 0 012-2h5.586a1
                    1 0 01.707.293l5.414 5.414a1 1
                    0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No files
              </h3>
              <p className="mt-1 text-gray-500">
                {searchQuery
                  ? 'No files match your search.'
                  : 'Get started by uploading a new file.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiUpload className="-ml-1 mr-2 h-5 w-5" />
                  Upload File
                </Link>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 truncate">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileIcon mimeType={file.mimeType} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name.length > 20
                              ? `${file.name.substring(0, 20)}...`
                              : file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.size
                              ? formatFileSize(file.size)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handlePreview(file)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FiEye className="h-4 w-4 inline mr-1" />
                        Preview
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-gray-500 hover:text-gray-700"
                          title="Download"
                        >
                          <FiDownload className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-600">
                            <FileIcon mimeType={file.mimeType} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                file.uploadedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {file.mimeType || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {file.size
                            ? formatFileSize(file.size)
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handlePreview(file)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Preview"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Download"
                          >
                            <FiDownload className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedFile.name}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {selectedFile.mimeType?.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img
                    src={selectedFile.downloadUrl}
                    alt={selectedFile.name}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                </div>
              ) : selectedFile.mimeType === 'application/pdf' && selectedFile.downloadUrl ? (
                <div className="flex justify-center" style={{ height: '70vh' }}>
                  <iframe
                    src={selectedFile.downloadUrl}
                    title={selectedFile.name}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', minHeight: '500px', maxHeight: '70vh' }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                    <FiFile className="h-8 w-8" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiDownload className="-ml-1 mr-2 h-5 w-5" />
                    Download File
                  </button>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleDownload(selectedFile)}
              >
                Download
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;