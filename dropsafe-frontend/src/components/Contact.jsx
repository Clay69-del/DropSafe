import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageSquare, FiUser, FiMap, FiPhoneCall } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically make an API call to send the form data
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Contact Information Section */}
      <section className="py-5 my-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="mb-4">Get in Touch</h3>
                  <div className="d-flex align-items-center mb-4">
                    <FiPhoneCall className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Phone</h5>
                      <p className="text-muted mb-0">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <FiMail className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Email</h5>
                      <p className="text-muted mb-0">support@securecloud.com</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <FiMapPin className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Location</h5>
                      <p className="text-muted mb-0">123 Secure Street, Cyber City, CA 90210</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="mb-4">Send us a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="name">Your Name</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="email">Email address</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="subject"
                            name="subject"
                            placeholder="Subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="subject">Subject</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating">
                          <textarea
                            className="form-control"
                            placeholder="Leave a message here"
                            id="message"
                            name="message"
                            style={{ height: '150px' }}
                            value={formData.message}
                            onChange={handleChange}
                            required
                          ></textarea>
                          <label htmlFor="message">Message</label>
                        </div>
                      </div>
                      <div className="col-12">
                        {submitSuccess ? (
                          <div className="alert alert-success">
                            <FiCheckCircle className="me-2" />
                            Your message has been sent successfully!
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <FiLoader className="me-2" style={{ animation: 'spin 1s linear infinite' }} />
                                Sending...
                              </>
                            ) : (
                              'Send Message'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours Section */}
      <section className="py-5 my-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="mb-4">Business Hours</h3>
                  <div className="d-flex align-items-center mb-3">
                    <FiClock className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Monday - Friday</h5>
                      <p className="text-muted mb-0">9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FiClock className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Saturday</h5>
                      <p className="text-muted mb-0">10:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <FiClock className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Sunday</h5>
                      <p className="text-muted mb-0">Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="mb-4">Contact Preferences</h3>
                  <div className="d-flex align-items-center mb-3">
                    <FiMessageSquare className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Email Support</h5>
                      <p className="text-muted mb-0">Available 24/7</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FiPhone className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Phone Support</h5>
                      <p className="text-muted mb-0">Available during business hours</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <FiUser className="text-primary me-3" size={24} />
                    <div>
                      <h5 className="mb-1">Live Chat</h5>
                      <p className="text-muted mb-0">Available Monday - Friday, 9 AM - 5 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Contact;