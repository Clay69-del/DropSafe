import React from 'react';
import { FiShield, FiLock, FiUsers, FiGlobe, FiAward, FiCode } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Chen',
      role: 'Security Architect',
      bio: '10+ years in cryptographic systems and zero-knowledge protocols',
      expertise: 'End-to-End Encryption',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Cloud Infrastructure Lead',
      bio: 'Former cloud security specialist at major tech companies',
      expertise: 'Distributed Systems',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      role: 'Frontend Engineer',
      bio: 'Specializes in secure client-side applications and privacy UX',
      expertise: 'Secure Web Applications',
      photo: 'https://randomuser.me/api/portraits/men/75.jpg'
    },
    {
      id: 4,
      name: 'Priya Patel',
      role: 'Compliance Officer',
      bio: 'Ensures we meet global data protection standards',
      expertise: 'GDPR & Compliance',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  const securityFeatures = [
    {
      icon: <FiLock size={32} className="text-primary" />,
      title: "End-to-End Encryption",
      description: "Your data is encrypted before it leaves your device and only you hold the keys"
    },
    {
      icon: <FaGoogle size={28} className="text-primary" />,
      title: "Secure Authentication",
      description: "Google Sign-In integration with OAuth 2.0 and multi-factor authentication"
    },
    {
      icon: <FiShield size={32} className="text-primary" />,
      title: "Zero-Knowledge Architecture",
      description: "We never have access to your unencrypted data or passwords"
    },
    {
      icon: <FiGlobe size={32} className="text-primary" />,
      title: "Global Infrastructure",
      description: "Geo-redundant storage with 99.99% uptime guarantee"
    }
  ];

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <section className="row align-items-center mb-5">
        <div className="col-lg-6">
          <h1 className="display-5 fw-bold mb-4">Secure by Design, Private by Default</h1>
          <p className="lead text-muted mb-4">
            We built SecureCloud because we believe privacy shouldn't be optional. 
            Our platform ensures your files remain truly private with military-grade encryption 
            that even we can't access.
          </p>
          <div className="d-flex align-items-center">
            <div className="me-4">
              <div className="d-flex align-items-center">
                <FiAward className="text-warning me-2" size={24} />
                <span className="fw-bold">4.9/5</span>
              </div>
              <small className="text-muted">Security Rating</small>
            </div>
            <div className="me-4">
              <div className="d-flex align-items-center">
                <FiUsers className="text-primary me-2" size={24} />
                <span className="fw-bold">250K+</span>
              </div>
              <small className="text-muted">Trusted Users</small>
            </div>
            <div>
              <div className="d-flex align-items-center">
                <FiCode className="text-success me-2" size={24} />
                <span className="fw-bold">100%</span>
              </div>
              <small className="text-muted">Open Source Core</small>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Security visualization" 
              className="img-fluid object-fit-cover"
            />
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-5 my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Our Security Principles</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Every architectural decision begins with security first. Here's what makes SecureCloud different:
          </p>
        </div>
        <div className="row g-4">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="mb-3">{feature.icon}</div>
                  <h5 className="mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-5 my-5 bg-light rounded-3">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Trusted Technologies</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
              We leverage industry-standard cryptographic libraries and protocols
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { name: 'AES-256', description: 'Encryption standard' },
              { name: 'RSA-4096', description: 'Key exchange' },
              { name: 'TLS 1.3', description: 'Secure transport' },
              { name: 'OAuth 2.0', description: 'Authentication' },
              { name: 'SHA-3', description: 'Hashing algorithm' },
            ].map((tech, index) => (
              <div key={index} className="col-auto">
                <div className="card border-0 bg-white shadow-sm">
                  <div className="card-body text-center p-3">
                    <div className="fw-bold text-primary">{tech.name}</div>
                    <small className="text-muted">{tech.description}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5 my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Our Security Team</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Experts in cryptography, distributed systems, and privacy-preserving technologies
          </p>
        </div>
        <div className="row g-4">
          {teamMembers.map(member => (
            <div key={member.id} className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm overflow-hidden">
                <div className="card-img-top" style={{ height: '200px' }}>
                  <img 
                    src={member.photo} 
                    alt={member.name}
                    className="img-fluid h-100 w-100 object-fit-cover"
                  />
                </div>
                <div className="card-body">
                  <h5 className="mb-1">{member.name}</h5>
                  <p className="text-primary small mb-2">{member.role}</p>
                  <p className="text-muted small mb-3">{member.bio}</p>
                  <div className="d-flex align-items-center">
                    <FiShield className="me-2 text-muted" size={14} />
                    <small className="text-muted">{member.expertise}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 my-5 bg-primary bg-opacity-10 rounded-3">
        <div className="container text-center py-4">
          <h2 className="fw-bold mb-4">Ready to Experience True Security?</h2>
          <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            Join thousands of security-conscious users who trust their data with SecureCloud
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/upload" className="btn btn-primary px-4">
              Get Started
            </Link>
            <Link to="/contact" className="btn btn-outline-primary px-4">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;