import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({ title, icon, children }) => {
    const navigate = useNavigate();
    return (
        <main id="mainContent">
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div className="card" style={{ padding: '40px' }}>
                        <div className="flex-between mb-20">
                            <h2><i className={`fas ${icon}`} style={{color: 'var(--primary)', marginRight: '10px'}}></i> {title}</h2>
                            <button className="btn btn-outline" onClick={() => navigate('/')}>
                                <i className="fas fa-arrow-left"></i> Back to Home
                            </button>
                        </div>
                        <div className="page-content" style={{ marginTop: '20px', lineHeight: '1.8' }}>
                            {children}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export const FacilitiesPage = () => (
    <PageLayout title="Hostel Facilities" icon="fa-dumbbell">
        <h3 style={{color: 'var(--secondary)'}}>Boys Hostel</h3>
        <ul>
            <li>High-speed Wi-Fi in all rooms</li>
            <li>Fully equipped Gymnasium</li>
            <li>Indoor sports room (Table Tennis, Carrom)</li>
            <li>24/7 Library / Study Room</li>
        </ul>
        <h3 style={{color: 'var(--secondary)', marginTop: '20px'}}>Girls Hostel</h3>
        <ul>
            <li>High-speed Wi-Fi in all rooms</li>
            <li>In-house Beauty/Salon Services</li>
            <li>Dedicated Yoga & Aerobics Room</li>
            <li>24/7 Library / Study Room</li>
        </ul>
    </PageLayout>
);

export const RulesPage = () => (
    <PageLayout title="Rules & Regulations" icon="fa-gavel">
        <h3>General Conduct</h3>
        <p>All students are expected to behave appropriately and respect the rights of others. Noise levels must be kept to a minimum after 10 PM. Ragging in any form is strictly prohibited and will lead to immediate expulsion.</p>
        <h3 style={{marginTop:'20px'}}>Curfew</h3>
        <p>The hostel gate closes exactly at 9:30 PM. Late entries are strictly monitored and will be reported to the disciplinary committee.</p>
    </PageLayout>
);

export const FAQPage = () => (
    <PageLayout title="Frequently Asked Questions" icon="fa-question-circle">
        <h4>1. Can I change my room after allocation?</h4>
        <p>Yes, you can request a room change via the student dashboard. It will be auto-approved if the target room has availability.</p>
        
        <h4 style={{marginTop:'15px'}}>2. What is the process for guest accommodation?</h4>
        <p>Students must submit a Guest Request via the dashboard at least 24 hours prior to the check-in date. Charges apply.</p>

        <h4 style={{marginTop:'15px'}}>3. How do I report a maintenance issue?</h4>
        <p>Use the complaints section in your dashboard. Urgent electrical or plumbing issues are generally resolved within 12 hours.</p>
    </PageLayout>
);

export const ContactPage = () => (
    <PageLayout title="Contact & Emergency" icon="fa-phone-alt">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ background: '#fff8e1' }}>
                <h4>Emergency Numbers</h4>
                <p><strong>Campus Security:</strong> +91 98765 00001</p>
                <p><strong>Emergency Medical:</strong> +91 98765 00002</p>
                <p><strong>Fire Safety:</strong> 101</p>
            </div>
            <div className="card" style={{ background: '#e3f2fd' }}>
                <h4>Hostel Administration</h4>
                <p><strong>Chief Warden:</strong> +91 98765 00003</p>
                <p><strong>Maintenance Dept:</strong> +91 98765 00004</p>
                <p><strong>Email:</strong> admin.hostel@university.edu</p>
            </div>
        </div>
    </PageLayout>
);

export const StaffPage = () => (
    <PageLayout title="Staff & Security Details" icon="fa-id-badge">
        <p>Our hostel is protected by a 3-tier security system operating 24/7.</p>
        <ul>
            <li><strong>Head of Security:</strong> Mr. Raghavendra Singh</li>
            <li><strong>Chief Warden (Boys):</strong> Dr. A. K. Sharma</li>
            <li><strong>Chief Warden (Girls):</strong> Dr. Meena Kumari</li>
        </ul>
    </PageLayout>
);

export const GalleryPage = () => (
    <PageLayout title="Hostel Image Gallery" icon="fa-images">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[
                { src: '/images/hostel_building.png', title: 'Main Hostel Building' },
                { src: '/images/hostel_room.png', title: 'Standard 3-Sharing Room' },
                { src: '/images/hostel_mess.png', title: 'Dining Hall & Mess' },
                { src: '/images/hostel_gym.png', title: 'Student Fitness Center' },
                { src: '/images/hostel_study.png', title: '24/7 Library & Study Hall' },
                { src: '/images/hostel_garden.png', title: 'Hostel Courtyard & Garden' }
            ].map((img, idx) => (
                <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                        <img 
                            src={img.src} 
                            alt={img.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    </div>
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0', fontSize: '1rem', color: 'var(--text-main)' }}>{img.title}</h4>
                    </div>
                </div>
            ))}
        </div>
    </PageLayout>
);
