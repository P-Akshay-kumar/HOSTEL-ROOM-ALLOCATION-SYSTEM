import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main id="mainContent">
      <section id="landingPage">
        <div className="landing-hero">
            <div className="container">
                <h1>Hostel Room <span>Allocation</span> System</h1>
                <p>A comprehensive web-based solution for managing hostel accommodation. Streamline the allocation
                    process with transparency, fairness, and efficiency.</p>
                <div className="action-buttons">
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/login?tab=studentLogin')}>
                        <i className="fas fa-user-graduate"></i> Student Login
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login?tab=adminLogin')}>
                        <i className="fas fa-user-tie"></i> Admin Login
                    </button>
                    <button className="btn btn-outline-light btn-lg" onClick={() => navigate('/login?tab=studentRegistration')}>
                        <i className="fas fa-user-plus"></i> Register
                    </button>
                </div>
                <div className="stats-bar">
                    <div className="stat-item"><span className="stat-number">120</span><span
                            className="stat-label">Total Rooms</span></div>
                    <div className="stat-item"><span className="stat-number">350</span><span
                            className="stat-label">Students Housed</span></div>
                    <div className="stat-item"><span className="stat-number">12</span><span
                            className="stat-label">Facilities</span></div>
                </div>
            </div>
        </div>

        <div className="features-section">
            <div className="container">
                <div className="section-title">
                    <h2>System Features</h2>
                    <p>Everything you need for seamless hostel management</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card"><i className="fas fa-user-check"></i>
                        <h3>Role-Based Access</h3>
                        <p>Separate secure interfaces for students and administrators with appropriate permissions.</p>
                    </div>
                    <div className="feature-card"><i className="fas fa-th-large"></i>
                        <h3>Visual Room Selection</h3>
                        <p>Interactive color-coded room grid showing availability, partial occupancy, and eligibility.</p>
                    </div>
                    <div className="feature-card"><i className="fas fa-chart-line"></i>
                        <h3>Real-Time Tracking</h3>
                        <p>Track your allocation status, payment status, and requests in real-time.</p>
                    </div>
                    <div className="feature-card"><i className="fas fa-exchange-alt"></i>
                        <h3>Room Change System</h3>
                        <p>Request room changes with automatic approval for available rooms.</p>
                    </div>
                    <div className="feature-card"><i className="fas fa-credit-card"></i>
                        <h3>Payment Integration</h3>
                        <p>Complete hostel fee payment online with instant confirmation.</p>
                    </div>
                    <div className="feature-card"><i className="fas fa-mobile-alt"></i>
                        <h3>Responsive Design</h3>
                        <p>Works seamlessly on desktop, tablet, and mobile devices.</p>
                    </div>
                </div>
            </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '60px 0' }}>
            <div className="container">
                <div className="section-title">
                    <h2>Quick Links</h2>
                    <p>Explore hostel information and resources</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                    <div className="feature-card" onClick={() => navigate('/facilities')} style={{cursor:'pointer'}}>
                        <i className="fas fa-dumbbell"></i><h3>Facilities</h3>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/rules')} style={{cursor:'pointer'}}>
                        <i className="fas fa-gavel"></i><h3>Rules</h3>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/faq')} style={{cursor:'pointer'}}>
                        <i className="fas fa-question-circle"></i><h3>FAQ</h3>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/contact')} style={{cursor:'pointer'}}>
                        <i className="fas fa-phone-alt"></i><h3>Contact</h3>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/staff')} style={{cursor:'pointer'}}>
                        <i className="fas fa-id-badge"></i><h3>Staff</h3>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/gallery')} style={{cursor:'pointer'}}>
                        <i className="fas fa-images"></i><h3>Gallery</h3>
                    </div>
                </div>
            </div>
        </div>

        <footer className="footer" id="mainFooter">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>HostelAlloc</h3>
                        <p>A comprehensive solution for educational institutions to manage hostel accommodations
                            efficiently and transparently.</p>
                    </div>
                    <div className="footer-section">
                        <h3>Contact Us</h3>
                        <p><i className="fas fa-envelope"></i> support@hostelalloc.edu</p>
                        <p><i className="fas fa-phone"></i> +91 98765 43210</p>
                    </div>
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/');}}>Home</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login?tab=studentLogin');}}>Student Login</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login?tab=adminLogin');}}>Admin Login</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/faq');}}>FAQ</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 HostelAlloc — Hostel Room Allocation System. All rights reserved.</p>
                </div>
            </div>
        </footer>
      </section>
    </main>
  );
};

export default LandingPage;
