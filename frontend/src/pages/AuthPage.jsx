import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('studentLogin');
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [location]);

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        const rollNo = e.target.studentRollNumber.value;
        const password = e.target.studentPassword.value;
        
        const res = await login(rollNo, password);
        if (res.success) {
            navigate(`/${res.role}-dashboard`);
        } else {
            setErrorMsg(res.message);
        }
    };

    const [regRole, setRegRole] = useState('student');

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        const username = e.target.adminUsername.value;
        const password = e.target.adminPassword.value;
        
        const res = await login(username, password);
        if (res.success && res.role === 'admin') {
            navigate('/admin-dashboard');
        } else {
            setErrorMsg(res.message || 'Access denied. Administrator privileges required.');
        }
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        const name = e.target.fullName.value;
        const rollNo = e.target.rollNumber.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPass = e.target.confirmPassword.value;
        const year = regRole === 'admin' ? 'Admin' : e.target.year.options[e.target.year.selectedIndex].text;
        const adminSecret = e.target.adminSecret?.value || '';

        if (regRole === 'student' && !year) {
            setErrorMsg('Please select a year of study');
            return;
        }

        if (password !== confirmPass) {
            setErrorMsg('Passwords do not match');
            return;
        }

        const res = await register(name, rollNo, password, year, regRole, adminSecret);
        if (res.success) {
            setActiveTab(regRole === 'admin' ? 'adminLogin' : 'studentLogin');
            setErrorMsg('');
            alert('Registration successful! Please login.');
        } else {
            setErrorMsg(res.message);
        }
    };

    return (
        <main id="mainContent">
            {activeTab === 'studentRegistration' && (
                <section id="studentRegistration">
                    <div className="auth-container">
                        <div className="auth-card card">
                            <h2 className="card-header"><i className="fas fa-user-plus"></i> {regRole === 'admin' ? 'Admin' : 'Student'} Registration</h2>
                            {errorMsg && <div className="alert alert-danger" style={{marginBottom: '10px'}}>{errorMsg}</div>}
                            <form onSubmit={handleRegistration}>
                                <div className="form-group" style={{marginBottom: '20px'}}>
                                    <label className="form-label" style={{display:'block', marginBottom:'10px'}}>Account Type</label>
                                    <div style={{display: 'flex', gap: '20px'}}>
                                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                                            <input type="radio" name="regRole" value="student" checked={regRole === 'student'} onChange={() => setRegRole('student')} /> Student
                                        </label>
                                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                                            <input type="radio" name="regRole" value="admin" checked={regRole === 'admin'} onChange={() => setRegRole('admin')} /> Administrator
                                        </label>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group"><label className="form-label" htmlFor="fullName">Full Name</label><input
                                            type="text" id="fullName" name="fullName" className="form-control" 
                                            pattern="^[A-Za-z\s\.]+$" title="Only letters and spaces allowed"
                                            maxLength="30" required/>
                                    </div>
                                    <div className="form-group"><label className="form-label" htmlFor="rollNumber">{regRole === 'admin' ? 'Username' : 'Roll Number'}</label><input
                                            type="text" id="rollNumber" name="rollNumber" className="form-control" 
                                            maxLength="15" required/>
                                    </div>
                                </div>
                                <div className="form-group"><label className="form-label" htmlFor="email">Email Address</label><input
                                        type="email" id="email" name="email" className="form-control" required/>
                                </div>

                                {regRole === 'student' ? (
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label" htmlFor="year">Year of Study</label>
                                            <select id="year" name="year" className="form-select" required>
                                                <option value="">Select</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="adminSecret">Admin Secret Code</label>
                                        <input type="password" id="adminSecret" name="adminSecret" className="form-control" placeholder="Enter security key to register as admin" required />
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-group"><label className="form-label" htmlFor="password">Password</label><input
                                            type="password" id="password" name="password" className="form-control" 
                                            minLength="12" required/>
                                    </div>
                                    <div className="form-group"><label className="form-label" htmlFor="confirmPassword">Confirm Password</label><input 
                                            type="password" id="confirmPassword" name="confirmPassword" className="form-control" 
                                            minLength="12" required/>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-block btn-lg">Create Account</button>
                                <div className="text-center mt-20">
                                    <p>Already registered? <a href="#" onClick={(e)=>{e.preventDefault();setActiveTab(regRole === 'admin' ? 'adminLogin' : 'studentLogin');}}>Login here</a></p>
                                    <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/');}}>← Back to Home</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'studentLogin' && (
                <section id="studentLogin">
                    <div className="auth-container">
                        <div className="auth-card card">
                            <h2 className="card-header"><i className="fas fa-user-graduate"></i> Student Login</h2>
                            {errorMsg && <div className="alert alert-danger" style={{marginBottom: '10px'}}>{errorMsg}</div>}
                            <form onSubmit={handleStudentLogin}>
                                <div className="form-group"><label className="form-label" htmlFor="studentRollNumber">Roll Number</label><input type="text" id="studentRollNumber" className="form-control" required/></div>
                                <div className="form-group"><label className="form-label" htmlFor="studentPassword">Password</label><input
                                        type="password" id="studentPassword" className="form-control" required/></div>
                                <button type="submit" className="btn btn-primary btn-block btn-lg">Login</button>
                                <div className="text-center mt-20">
                                    <p>Don't have an account? <a href="#" onClick={(e)=>{e.preventDefault();setActiveTab('studentRegistration');}}>Register here</a></p>
                                    <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/');}}>← Back to Home</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'adminLogin' && (
                <section id="adminLogin">
                    <div className="auth-container">
                        <div className="auth-card card">
                            <h2 className="card-header"><i className="fas fa-user-tie"></i> Administrator Login</h2>
                            {errorMsg && <div className="alert alert-danger" style={{marginBottom: '10px'}}>{errorMsg}</div>}
                            <form onSubmit={handleAdminLogin}>
                                <div className="form-group"><label className="form-label" htmlFor="adminUsername">Username</label><input
                                        type="text" id="adminUsername" className="form-control" placeholder="admin" required/></div>
                                <div className="form-group"><label className="form-label" htmlFor="adminPassword">Password</label><input
                                        type="password" id="adminPassword" className="form-control" placeholder="admin123" required/>
                                </div>
                                <button type="submit" className="btn btn-secondary btn-block btn-lg">Login as Admin</button>
                                <div className="text-center mt-20">
                                    <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/');}}>← Back to Home</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default AuthPage;
