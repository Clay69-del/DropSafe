import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiUploadCloud, FiShield, FiGlobe, FiClock, FiUsers } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FiLock size={32} />,
      title: 'End-to-End Encryption',
      description: 'Your files are encrypted before they leave your device and can only be decrypted by you.'
    },
    {
      icon: <FiUploadCloud size={32} />,
      title: 'Easy File Management',
      description: 'Upload, organize, and manage your files with our intuitive interface.'
    },
    {
      icon: <FiShield size={32} />,
      title: 'Secure Sharing',
      description: 'Share files securely with end-to-end encrypted links and access controls.'
    },
    {
      icon: <FiGlobe size={32} />,
      title: 'Access Anywhere',
      description: 'Access your files from any device, anywhere in the world.'
    },
    {
      icon: <FiClock size={32} />,
      title: 'Version History',
      description: 'Track changes and restore previous versions of your files.'
    },
    {
      icon: <FiUsers size={32} />,
      title: 'Team Collaboration',
      description: 'Work together securely with your team on shared documents.'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Secure Cloud Storage for Your Digital Life</h1>
          <p className="hero-subtitle">
            Store, share, and collaborate on your files with end-to-end encryption and complete privacy.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              Get Started for Free
            </Link>
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose DropSafe?</h2>
          <p>Your security is our top priority</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to secure your files?</h2>
          <p>Join thousands of users who trust DropSafe with their data.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
