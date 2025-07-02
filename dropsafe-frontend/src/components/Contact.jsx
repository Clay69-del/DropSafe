import React, { useState } from 'react';
import { FiUpload, FiLock, FiShield, FiCloud, FiUserCheck, FiArrowRight } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <FiLock size={32} className="text-primary" />,
      title: "End-to-End Encryption",
      description: "Your files are encrypted before upload with keys only you control"
    },
    {
      icon: <FaGoogle size={28} className="text-primary" />,
      title: "Secure Sign-In",
      description: "Google authentication with OAuth 2.0 and 2FA support"
    },
    {
      icon: <FiCloud size={32} className="text-primary" />,
      title: "Cloud Access",
      description: "Access your encrypted files from any device, anywhere"
    },
    {
      icon: <FiShield size={32} className="text-primary" />,
      title: "Zero-Knowledge",
      description: "We never see your unencrypted data or passwords"
    }
  ];

  const testimonials = [
    {
      quote: "Finally a cloud storage solution that takes privacy seriously.",
      author: "Sarah K., Security Consultant",
      company: "Fortune 500 Company"
    },
    {
      quote: "The encryption implementation is flawless and the UI is surprisingly intuitive.",
      author: "Michael T., CTO",
      company: "Tech Startup"
    },
    {
      quote: "Our legal team can now share sensitive documents without worrying about breaches.",
      author: "Priya M., General Counsel",
      company: "Law Firm"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section py-5 bg-dark text-white">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Your Files, <span className="text-primary">Truly Private</span></h1>
              <p className="lead mb-4">
                SecureCloud provides military-grade encryption for your files before they ever touch our servers.
                We can't see your data - only you hold the keys.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button 
                  className="btn btn-primary btn-lg px-4"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Get Started <FiArrowRight className={`ms-2 transition-all ${isHovered ? 'translate-x-1' : ''}`} />
                </button>
                <button className="btn btn-outline-light btn-lg px-4">
                  How It Works
                </button>
              </div>
              <div className="d-flex align-items-center mt-4 pt-2">
                <div className="d-flex align-items-center me-4">
                  <FiShield className="text-success me-2" size={24} />
                  <div>
                    <div className="fw-bold">4.9/5</div>
                    <small className="text-muted">Security Rating</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FiUserCheck className="text-primary me-2" size={24} />
                  <div>
                    <div className="fw-bold">250K+</div>
                    <small className="text-muted">Trusted Users</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <div className="card border-0 shadow-lg overflow-hidden">
                  <div className="card-body p-0">
                    <img 
                      src="https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Secure file upload" 
                      className="img-fluid"
                    />
                  </div>
                  <div className="position-absolute bottom-0 start-0 end-0 bg-primary bg-opacity-90 text-white p-3">
                    <div className="d-flex align-items-center">
                      <FiUpload size={24} className="me-3" />
                      <div>
                        <div className="fw-bold">Files encrypted locally before upload</div>
                        <small>AES-256 encryption with client-side key derivation</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Security You Can Trust</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Every aspect of SecureCloud is designed with your privacy as the top priority
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm-hover">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">{feature.icon}</div>
                    <h5 className="mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5 my-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Encryption process" 
                className="img-fluid rounded-3 shadow"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">How SecureCloud Protects You</h2>
              <div className="d-flex mb-4">
                <div className="me-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <span className="fw-bold">1</span>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Client-Side Encryption</h5>
                  <p className="text-muted mb-0">Files are encrypted on your device before being uploaded to our servers using AES-256 encryption.</p>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="me-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <span className="fw-bold">2</span>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Secure Key Management</h5>
                  <p className="text-muted mb-0">Encryption keys are derived from your password and never leave your device.</p>
                </div>
              </div>
              <div className="d-flex">
                <div className="me-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <span className="fw-bold">3</span>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Zero-Knowledge Architecture</h5>
                  <p className="text-muted mb-0">We have no access to your unencrypted files or passwords - only encrypted data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Trusted by Security-Conscious Users</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Organizations and individuals who prioritize privacy choose SecureCloud
            </p>
          </div>
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="mb-4">
                      <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.25 30L15.5 0H0L10.25 30ZM30.25 30L35.5 0H20L30.25 30Z" fill="var(--bs-primary)" fillOpacity="0.1"/>
                      </svg>
                    </div>
                    <p className="lead mb-4">"{testimonial.quote}"</p>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle me-3" style={{ width: '48px', height: '48px' }}></div>
                      <div>
                        <div className="fw-bold">{testimonial.author}</div>
                        <small className="text-muted">{testimonial.company}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 my-5 bg-primary text-white">
        <div className="container text-center py-4">
          <h2 className="fw-bold mb-4">Ready to Secure Your Files?</h2>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            Join thousands of users who trust SecureCloud with their sensitive data
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-light btn-lg px-4 text-primary">
              Get Started
            </button>
            <button className="btn btn-outline-light btn-lg px-4">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;