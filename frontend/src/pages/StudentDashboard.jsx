import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sTabOverview');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [history, setHistory] = useState({ passes: [], guests: [], swaps: [], complaints: [] });
    const [swapRooms, setSwapRooms] = useState([]);
    const [swapTarget, setSwapTarget] = useState('');
    const [myApps, setMyApps] = useState([]);

    // Dynamic system date for date-picker constraints (preventing past dates)
    const today = new Date().toISOString().split('T')[0];

    // Derived application state
    const approvedApp = myApps.find(a => a.status === 'Approved');
    const pendingApp = myApps.find(a => a.status === 'Pending');
    const rejectionCount = myApps.filter(a => a.status === 'Rejected').length;
    const isBlocked = rejectionCount >= 3;
    const canApply = !approvedApp && !pendingApp && !isBlocked;

    useEffect(() => {
        if (user && user.id) {
            fetchHistory();
            fetchMyApps();
        }
        if (activeTab === 'sTabRoomChange' && user?.year) {
            axios.get(`http://localhost:5001/api/rooms/swap-eligible?year=${user.year}`)
                .then(res => setSwapRooms(res.data))
                .catch(err => console.error('Failed to load swap rooms', err));
        }
    }, [user, activeTab]);

    const fetchMyApps = async () => {
        if (!user?.id) return;
        try {
            const res = await axios.get(`http://localhost:5001/api/rooms/my-applications/${user.id}`);
            setMyApps(res.data);
        } catch (err) {
            console.error("Error fetching applications", err);
        }
    };

    const fetchHistory = async () => {
        if (!user?.id) return;
        try {
            const [pRes, gRes, sRes, cRes] = await Promise.all([
                axios.get(`http://localhost:5001/api/requests/pass/${user.id}`),
                axios.get(`http://localhost:5001/api/requests/guest/${user.id}`),
                axios.get(`http://localhost:5001/api/requests/room-change/${user.id}`),
                axios.get(`http://localhost:5001/api/requests/complaint/${user.id}`)
            ]);
            setHistory({ passes: pRes.data, guests: gRes.data, swaps: sRes.data, complaints: cRes.data });
        } catch (err) {
            console.error("Error fetching history", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchRooms = async (block) => {
        if (!block) {
            setRooms([]);
            return;
        }
        try {
            const res = await axios.get(`http://localhost:5001/api/rooms?block=${block}&year=${user?.year}`);
            setRooms(res.data);
            setSelectedRoom(null);
        } catch (err) {
            console.error("Error fetching rooms", err);
        }
    };

    const handleRoomClick = (room) => {
        if (room.computedStatus === 'occupied') return;
        setSelectedRoom(room);
    };

    const applyForRoom = async () => {
        if (!selectedRoom) return;
        try {
            const res = await axios.post('http://localhost:5001/api/rooms/apply', {
                userId: user.id,
                roomId: selectedRoom._id
            });
            alert(res.data.message);
            fetchMyApps();
            setActiveTab('sTabOverview');
        } catch (err) {
            alert(err.response?.data?.message || 'Error applying for room');
        }
    };

    return (
        <main id="mainContent">
            <section id="studentDashboard">
                <div className="container mt-30">
                    <div className="mb-20" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>Welcome, <span style={{color: 'var(--secondary)'}}>{user?.name || 'Student'}</span></h1>
                            <p style={{color: 'var(--text-secondary)'}}>Manage your hostel accommodation, requests, and payments</p>
                        </div>
                        <button className="btn btn-outline" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
                    </div>
                    
                    <div className="dashboard-cards">
                        <div className="dashboard-card"><i className="fas fa-clipboard-list"></i>
                            <div className="count" style={{color: approvedApp ? '#2e7d32' : pendingApp ? '#f57f17' : isBlocked ? '#c62828' : 'inherit'}}>
                                {approvedApp ? 'Approved' : pendingApp ? 'Pending' : isBlocked ? 'Blocked' : 'Not Applied'}
                            </div>
                            <div className="label">Application Status</div>
                        </div>
                        <div className="dashboard-card"><i className="fas fa-building"></i>
                            <div className="count">{approvedApp ? approvedApp.room?.block : '-'}</div>
                            <div className="label">Hostel Block</div>
                        </div>
                        <div className="dashboard-card"><i className="fas fa-door-closed"></i>
                            <div className="count">{approvedApp ? approvedApp.room?.roomNumber : '-'}</div>
                            <div className="label">Room Number</div>
                        </div>
                        <div className="dashboard-card"><i className="fas fa-layer-group"></i>
                            <div className="count">{approvedApp ? `Floor ${approvedApp.room?.floor}` : '-'}</div>
                            <div className="label">Floor</div>
                        </div>
                    </div>

                    <div className="tabs" id="studentTabs">
                        <button className={`tab-btn ${activeTab === 'sTabOverview' ? 'active' : ''}`} onClick={() => setActiveTab('sTabOverview')}><i className="fas fa-home"></i> Overview</button>
                        <button className={`tab-btn ${activeTab === 'sTabRoomSelect' ? 'active' : ''}`} onClick={() => setActiveTab('sTabRoomSelect')}><i className="fas fa-th-large"></i> Room Selection</button>
                        <button className={`tab-btn ${activeTab === 'sTabRoomChange' ? 'active' : ''}`} onClick={() => setActiveTab('sTabRoomChange')}><i className="fas fa-exchange-alt"></i> Room Change</button>
                        <button className={`tab-btn ${activeTab === 'sTabGuest' ? 'active' : ''}`} onClick={() => setActiveTab('sTabGuest')}><i className="fas fa-user-friends"></i> Guest</button>
                        <button className={`tab-btn ${activeTab === 'sTabGatePass' ? 'active' : ''}`} onClick={() => setActiveTab('sTabGatePass')}><i className="fas fa-sign-out-alt"></i> Gate Pass</button>
                        <button className={`tab-btn ${activeTab === 'sTabPayment' ? 'active' : ''}`} onClick={() => setActiveTab('sTabPayment')}><i className="fas fa-credit-card"></i> Payment</button>
                        <button className={`tab-btn ${activeTab === 'sTabComplaint' ? 'active' : ''}`} onClick={() => setActiveTab('sTabComplaint')}><i className="fas fa-exclamation-triangle"></i> Complaints</button>
                        <button className={`tab-btn ${activeTab === 'sTabProfile' ? 'active' : ''}`} onClick={() => setActiveTab('sTabProfile')}><i className="fas fa-user"></i> Profile</button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'sTabOverview' && (
                        <div className="tab-content active" id="sTabOverview">
                            {approvedApp ? (
                                <div className="card" style={{borderLeft: '5px solid #4caf50'}}>
                                    <h2 className="card-header" style={{color:'#2e7d32'}}><i className="fas fa-check-circle"></i> Room Allocated!</h2>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                                        <p><strong>Room:</strong> {approvedApp.room?.roomNumber}</p>
                                        <p><strong>Block:</strong> {approvedApp.room?.block}</p>
                                        <p><strong>Floor:</strong> {approvedApp.room?.floor}</p>
                                        <p><strong>Capacity:</strong> {approvedApp.room?.capacity} beds</p>
                                    </div>
                                    <p style={{marginTop:'15px', color:'var(--text-secondary)'}}>Your room has been officially allocated. Please proceed to the Payment tab to finalize.</p>
                                </div>
                            ) : pendingApp ? (
                                <div className="card" style={{borderLeft: '5px solid #ff9800'}}>
                                    <h2 className="card-header" style={{color:'#e65100'}}><i className="fas fa-clock"></i> Application Pending</h2>
                                    <p style={{marginTop:'10px'}}>Your application for room <strong>{pendingApp.room?.roomNumber}</strong> ({pendingApp.room?.block}, Floor {pendingApp.room?.floor}) is awaiting admin approval.</p>
                                    <p style={{marginTop:'10px', color:'var(--text-secondary)'}}>You cannot submit another application until this one is reviewed.</p>
                                </div>
                            ) : isBlocked ? (
                                <div className="card" style={{borderLeft: '5px solid #c62828'}}>
                                    <h2 className="card-header" style={{color:'#c62828'}}><i className="fas fa-ban"></i> Applications Blocked</h2>
                                    <p style={{marginTop:'10px'}}>Your room applications have been rejected {rejectionCount} times. You are temporarily blocked from submitting new applications.</p>
                                    <p style={{marginTop:'10px'}}><strong>Please contact the hostel administration directly:</strong></p>
                                    <p>📧 admin.hostel@university.edu &nbsp;|&nbsp; 📞 +91 98765 00003</p>
                                </div>
                            ) : (
                                <div className="card">
                                    <h2 className="card-header"><i className="fas fa-clipboard-list"></i> No Active Application</h2>
                                    <p style={{marginTop:'10px'}}>You have not applied for a room yet. Go to the <strong>Room Selection</strong> tab to browse and apply.</p>
                                    {rejectionCount > 0 && (
                                        <p style={{marginTop:'10px', color:'#c62828'}}>⚠️ You have {rejectionCount}/3 rejections. After 3 rejections you will be blocked.</p>
                                    )}
                                    <button className="btn btn-primary mt-16" onClick={() => setActiveTab('sTabRoomSelect')}>
                                        <i className="fas fa-th-large"></i> Go to Room Selection
                                    </button>
                                </div>
                            )}

                            {/* Application History */}
                            {myApps.length > 0 && (
                                <div className="card mt-20">
                                    <h3 style={{marginBottom:'15px'}}>Application History</h3>
                                    <table className="data-table">
                                        <thead><tr><th>Date</th><th>Room</th><th>Block</th><th>Floor</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {myApps.map(a => (
                                                <tr key={a._id}>
                                                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                                                    <td>{a.room?.roomNumber}</td>
                                                    <td>{a.room?.block}</td>
                                                    <td>{a.room?.floor}</td>
                                                    <td><strong style={{color: a.status === 'Approved' ? '#2e7d32' : a.status === 'Rejected' ? '#c62828' : '#f57f17'}}>{a.status}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Room Selection Tab */}
                    {activeTab === 'sTabRoomSelect' && (
                        <div className="tab-content active" id="sTabRoomSelect">
                            {!canApply ? (
                                <div className="card">
                                    <h2 className="card-header"><i className="fas fa-th-large"></i> Room Selection</h2>
                                    {approvedApp && <p style={{marginTop:'10px', color:'#2e7d32'}}>✅ You already have an approved room: <strong>{approvedApp.room?.roomNumber}</strong></p>}
                                    {pendingApp && <p style={{marginTop:'10px', color:'#e65100'}}>⏳ You have a pending application for room <strong>{pendingApp.room?.roomNumber}</strong>. Wait for admin review.</p>}
                                    {isBlocked && <p style={{marginTop:'10px', color:'#c62828'}}>🚫 You've been rejected 3 times. Please contact admin directly.</p>}
                                </div>
                            ) : (
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-th-large"></i> Intelligent Room Selection</h2>
                                <p className="mb-16" style={{color: 'var(--text-secondary)'}}>
                                    Rooms are automatically filtered by your year of study ({user?.year}). Select a block to view available eligible rooms.
                                </p>
                                
                                <div className="form-row mb-20">
                                    <div className="form-group"><label className="form-label">Select Block</label>
                                        <select className="form-select" onChange={(e) => fetchRooms(e.target.value)}>
                                            <option value="">Choose Block</option>
                                            <option value="A">Block A</option>
                                            <option value="B">Block B</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="room-legend">
                                    <div className="legend-item"><div className="legend-color legend-available"></div>Available</div>
                                    <div className="legend-item"><div className="legend-color legend-partial"></div>Partially Filled</div>
                                    <div className="legend-item"><div className="legend-color legend-occupied"></div>Fully Occupied</div>
                                    <div className="legend-item"><div className="legend-color legend-ineligible"></div>Not Eligible</div>
                                </div>

                                <div className="room-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '20px' }}>
                                    {rooms.length === 0 ? (
                                         <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                             <i className="fas fa-building"></i>
                                             <h3>Select a Block</h3>
                                             <p>Choose a block above to see available rooms</p>
                                         </div>
                                    ) : (
                                        rooms.map(room => (
                                            <div 
                                                key={room._id} 
                                                onClick={() => handleRoomClick(room)}
                                                style={{
                                                     padding: '15px', 
                                                     borderRadius: '8px', 
                                                     textAlign: 'center', 
                                                     cursor: room.computedStatus === 'occupied' ? 'not-allowed' : 'pointer',
                                                     border: selectedRoom?._id === room._id ? '3px solid var(--primary)' : '1px solid #ddd',
                                                     background: room.computedStatus === 'available' ? '#e8f5e9' : 
                                                                room.computedStatus === 'partial' ? '#fff8e1' : '#ffebee'
                                                }}>
                                                <h4>{room.roomNumber}</h4>
                                                <small>{room.occupancy}/{room.capacity} Beds</small>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedRoom && (
                                    <div className="mt-20 card" style={{background: '#f8fafc', border: '2px solid var(--secondary)'}}>
                                        <h3 style={{color: 'var(--secondary)'}}><i className="fas fa-check-circle"></i> Selected Room</h3>
                                        <p className="mt-10">Room <strong>{selectedRoom.roomNumber}</strong> ({selectedRoom.block}, Floor {selectedRoom.floor}). Available beds: {selectedRoom.capacity - selectedRoom.occupancy}</p>
                                        <button className="btn btn-success mt-16" onClick={applyForRoom}>
                                            Confirm & Apply
                                        </button>
                                    </div>
                                )}
                            </div>
                            )}
                        </div>
                    )}

                    {/* Room Change Tab */}
                    {activeTab === 'sTabRoomChange' && (
                        <div className="tab-content active" id="sTabRoomChange">
                             <div className="card mb-20">
                                 <h2 className="card-header"><i className="fas fa-exchange-alt"></i> Room Change Request</h2>
                                 <form onSubmit={async (e) => { 
                                     e.preventDefault(); 
                                     if (!swapTarget) { alert('Please select a target room'); return; }
                                     try {
                                         const res = await axios.post('http://localhost:5001/api/requests/room-change', {
                                             student: user.id,
                                             currentRoom: null,
                                             requestedRoom: swapTarget,
                                             reason: e.target.swapReason.value,
                                             year: user.year
                                         });
                                         alert(res.data.message);
                                         fetchHistory();
                                         e.target.reset();
                                         setSwapTarget('');
                                     } catch (err) {
                                         alert(err.response?.data?.message || 'Error submitting request');
                                     }
                                 }}>
                                     <div className="form-row mb-20">
                                         <div className="form-group"><label className="form-label">Target Room</label>
                                             <select className="form-select" value={swapTarget} onChange={(e) => setSwapTarget(e.target.value)} required>
                                                 <option value="">Select a room ({swapRooms.length} available)</option>
                                                 {swapRooms.map(r => (
                                                     <option key={r._id} value={r._id}>
                                                         {r.roomNumber} — {r.block} Floor {r.floor} ({r.occupancy}/{r.capacity} beds used)
                                                     </option>
                                                 ))}
                                             </select>
                                         </div>
                                         <div className="form-group"><label className="form-label">Reason</label><input type="text" id="swapReason" className="form-control" placeholder="Reason for change" required /></div>
                                     </div>
                                     <button type="submit" className="btn btn-primary mt-10">Submit Request</button>
                                 </form>
                             </div>
                             
                             <div className="card">
                                 <h3 style={{marginBottom:'15px'}}>Swap History</h3>
                                 <table className="data-table">
                                     <thead><tr><th>Created At</th><th>Reason</th><th>Status</th></tr></thead>
                                     <tbody>
                                         {history.swaps.map(s => (
                                             <tr key={s._id}>
                                                 <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                                 <td>{s.reason}</td>
                                                 <td><strong style={{color: s.status === 'Approved' ? '#2e7d32' : s.status === 'Rejected' ? '#c62828' : '#f57f17'}}>{s.status}</strong></td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                    )}

                    {/* Guest Accommodation Tab */}
                    {activeTab === 'sTabGuest' && (
                        <div className="tab-content active" id="sTabGuest">
                            <div className="card mb-20">
                                <h2 className="card-header"><i className="fas fa-user-friends"></i> Guest Accommodation Request</h2>
                                <form onSubmit={async (e) => { 
                                    e.preventDefault(); 
                                    try {
                                        await axios.post('http://localhost:5001/api/requests/guest', {
                                            student: user.id,
                                            guestName: e.target.guestName.value,
                                            relation: e.target.relation.value,
                                            durationDays: 1
                                        });
                                        alert("Guest Request Submitted successfully!");
                                        fetchHistory();
                                    } catch (err) { alert("Error"); }
                                }}>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Guest Name</label><input type="text" id="guestName" className="form-control" required placeholder="Full name"/></div>
                                        <div className="form-group"><label className="form-label">Relationship</label><input type="text" id="relation" className="form-control" required placeholder="e.g. Parent, Guardian"/></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Check-in Date</label><input type="date" className="form-control" min={today} required/></div>
                                        <div className="form-group"><label className="form-label">Check-out Date</label><input type="date" className="form-control" min={today} required/></div>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit Request</button>
                                </form>
                            </div>
                            
                            <div className="card">
                                 <h3 style={{marginBottom:'15px'}}>Guest History</h3>
                                 <table className="data-table">
                                     <thead><tr><th>Guest Name</th><th>Relation</th><th>Status</th></tr></thead>
                                     <tbody>
                                         {history.guests.map(g => (
                                             <tr key={g._id}>
                                                 <td>{g.guestName}</td>
                                                 <td>{g.relation}</td>
                                                 <td><strong>{g.status}</strong></td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                    )}

                    {/* Gate Pass Tab */}
                    {activeTab === 'sTabGatePass' && (
                        <div className="tab-content active" id="sTabGatePass">
                            <div className="card mb-20">
                                <h2 className="card-header"><i className="fas fa-sign-out-alt"></i> Gate / Vacation Pass</h2>
                                <form onSubmit={async (e) => { 
                                    e.preventDefault(); 
                                    try {
                                        await axios.post('http://localhost:5001/api/requests/pass', {
                                            student: user.id,
                                            type: e.target.passType.value === 'gate' ? 'Gate Pass' : 'Vacation Pass',
                                            fromDate: e.target.fromDate.value,
                                            toDate: e.target.toDate.value,
                                            reason: e.target.reason.value
                                        });
                                        alert("Pass Request Submitted successfully!");
                                        fetchHistory();
                                    } catch (err) { alert("Error"); }
                                }}>
                                    <div className="form-group"><label className="form-label">Pass Type</label>
                                        <select className="form-select" id="passType" required>
                                            <option value="">Select</option>
                                            <option value="gate">Gate Pass (Day)</option>
                                            <option value="vacation">Vacation Pass</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">From Date</label><input type="date" id="fromDate" className="form-control" min={today} required/></div>
                                        <div className="form-group"><label className="form-label">To Date</label><input type="date" id="toDate" className="form-control" min={today} required/></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Reason</label><textarea id="reason" className="form-control" rows="2" required placeholder="Reason for leave"></textarea></div>
                                    <button type="submit" className="btn btn-primary">Submit Pass Request</button>
                                </form>
                            </div>

                            <div className="card">
                                 <h3 style={{marginBottom:'15px'}}>Pass History</h3>
                                 <table className="data-table">
                                     <thead><tr><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                                     <tbody>
                                         {history.passes.map(p => (
                                             <tr key={p._id}>
                                                 <td>{p.type}</td>
                                                 <td>{new Date(p.fromDate).toLocaleDateString()} - {new Date(p.toDate).toLocaleDateString()}</td>
                                                 <td><strong>{p.status}</strong></td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                    )}

                    {/* Complaint Tab */}
                    {activeTab === 'sTabComplaint' && (
                        <div className="tab-content active" id="sTabComplaint">
                            <div className="card mb-20">
                                <h2 className="card-header"><i className="fas fa-exclamation-triangle"></i> Submit a Complaint</h2>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await axios.post('http://localhost:5001/api/requests/complaint', {
                                            student: user.id,
                                            category: e.target.category.value,
                                            description: e.target.description.value
                                        });
                                        alert('Complaint submitted successfully!');
                                        fetchHistory();
                                        e.target.reset();
                                    } catch (err) { alert('Error submitting complaint'); }
                                }}>
                                    <div className="form-group"><label className="form-label">Category</label>
                                        <select className="form-select" id="category" required>
                                            <option value="">Select Category</option>
                                            <option value="Maintenance">Maintenance / Repair</option>
                                            <option value="Plumbing">Plumbing</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Cleanliness">Cleanliness</option>
                                            <option value="Noise">Noise Complaint</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label className="form-label">Description</label>
                                        <textarea className="form-control" id="description" rows="3" required placeholder="Describe your complaint in detail..."></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit Complaint</button>
                                </form>
                            </div>

                            <div className="card">
                                <h3 style={{marginBottom:'15px'}}>Complaint History</h3>
                                <table className="data-table">
                                    <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {history.complaints.map(c => (
                                            <tr key={c._id}>
                                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                                <td>{c.category}</td>
                                                <td>{c.description}</td>
                                                <td><strong style={{color: c.status === 'Resolved' ? '#2e7d32' : c.status === 'In Progress' ? '#f57f17' : '#1565c0'}}>{c.status}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'sTabPayment' && (
                        <div className="tab-content active" id="sTabPayment">
                             <div className="card">
                                 <h2 className="card-header"><i className="fas fa-credit-card"></i> Payment Gateway</h2>
                                 <div className="payment-card">
                                     <h3>Hostel Fee Payment</h3>
                                     <p style={{opacity: 0.8}}>Complete payment to confirm your room allocation</p>
                                     <div className="payment-amount">₹45,000</div>
                                     <div className="payment-details">
                                         <p><span>Room Fee</span><span>₹35,000</span></p>
                                         <p><span>Mess Fee</span><span>₹8,000</span></p>
                                         <p><span>Maintenance</span><span>₹2,000</span></p>
                                     </div>
                                     <button className="btn btn-primary btn-lg btn-block" onClick={() => alert("Payment Processed (Mock API)")}>
                                         <i className="fas fa-lock"></i> Pay Securely
                                     </button>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'sTabProfile' && (
                        <div className="tab-content active" id="sTabProfile">
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-user"></i> Student Profile <span style={{fontSize:'12px', color:'var(--text-light)', fontWeight:400}}>(Read-only)</span></h2>
                                <div className="table-container">
                                    <table className="data-table">
                                        <tbody>
                                            <tr><td><strong>Full Name</strong></td><td>{user?.name}</td></tr>
                                            <tr><td><strong>Roll Number</strong></td><td>{user?.rollNo}</td></tr>
                                            <tr><td><strong>Year</strong></td><td>{user?.year}</td></tr>
                                            <tr><td><strong>Role</strong></td><td>{user?.role}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default StudentDashboard;
