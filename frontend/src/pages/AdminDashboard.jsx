import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('aTabRooms');
    const [requests, setRequests] = useState({ passes: [], guests: [], swapp: [], complaints: [], applications: [] });
    const [adminRooms, setAdminRooms] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState('');
    const [stats, setStats] = useState({ totalStudents: 0, totalRooms: 0, allocated: 0, vacant: 0 });

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (selectedBlock) {
            fetchAdminRooms(selectedBlock);
        }
    }, [selectedBlock]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/requests/admin/all');
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching admin requests", err);
        }
    };

    const fetchAdminRooms = async (block) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/rooms/admin/all?block=${block}`);
            setAdminRooms(res.data);
            
            // Calculate stats
            const total = res.data.length;
            const occupied = res.data.filter(r => r.computedStatus === 'occupied').length;
            const partial = res.data.filter(r => r.computedStatus === 'partial').length;
            const available = res.data.filter(r => r.computedStatus === 'available').length;
            setStats({
                totalRooms: total,
                allocated: occupied,
                vacant: available,
                totalStudents: res.data.reduce((sum, r) => sum + r.occupancy, 0)
            });
        } catch (err) {
            console.error("Error fetching rooms", err);
        }
    };

    const handleUpdateStatus = async (type, id, newStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/requests/admin/update/${type}/${id}`, { status: newStatus });
            fetchRequests();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Group rooms by floor for the visual grid
    const roomsByFloor = {};
    adminRooms.forEach(room => {
        if (!roomsByFloor[room.floor]) roomsByFloor[room.floor] = [];
        roomsByFloor[room.floor].push(room);
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' };
            case 'partial': return { bg: '#fff8e1', border: '#ff9800', text: '#e65100' };
            case 'occupied': return { bg: '#ffebee', border: '#f44336', text: '#c62828' };
            default: return { bg: '#f5f5f5', border: '#ddd', text: '#666' };
        }
    };

    return (
        <main id="mainContent">
            <section id="adminDashboard">
                <div className="container mt-30">
                    <div className="mb-20" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>Admin <span style={{color: 'var(--secondary)'}}>Dashboard</span></h1>
                            <p style={{color: 'var(--text-secondary)'}}>Manage rooms, applications, allocations, and student requests</p>
                        </div>
                        <button className="btn btn-outline" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="dashboard-cards">
                        <div className="dashboard-card"><i className="fas fa-users"></i>
                            <div className="count">{stats.totalStudents}</div>
                            <div className="label">Total Students</div>
                        </div>
                        <div className="dashboard-card"><i className="fas fa-building"></i>
                            <div className="count">{stats.totalRooms}</div>
                            <div className="label">Total Rooms</div>
                        </div>
                        <div className="dashboard-card"><i className="fas fa-check-circle"></i>
                            <div className="count">{stats.allocated}</div>
                            <div className="label">Fully Occupied</div>
                        </div>
                        <div className="dashboard-card"><i className="fas fa-bed"></i>
                            <div className="count">{stats.vacant}</div>
                            <div className="label">Vacant</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs" id="adminTabs">
                        <button className={`tab-btn ${activeTab === 'aTabRooms' ? 'active' : ''}`} onClick={() => setActiveTab('aTabRooms')}><i className="fas fa-building"></i> Rooms</button>
                        <button className={`tab-btn ${activeTab === 'aTabApplications' ? 'active' : ''}`} onClick={() => setActiveTab('aTabApplications')}><i className="fas fa-clipboard-list"></i> Applications</button>
                        <button className={`tab-btn ${activeTab === 'aTabPasses' ? 'active' : ''}`} onClick={() => setActiveTab('aTabPasses')}><i className="fas fa-sign-out-alt"></i> Passes</button>
                        <button className={`tab-btn ${activeTab === 'aTabGuests' ? 'active' : ''}`} onClick={() => setActiveTab('aTabGuests')}><i className="fas fa-user-friends"></i> Guests</button>
                        <button className={`tab-btn ${activeTab === 'aTabSwaps' ? 'active' : ''}`} onClick={() => setActiveTab('aTabSwaps')}><i className="fas fa-exchange-alt"></i> Swaps</button>
                        <button className={`tab-btn ${activeTab === 'aTabComplaints' ? 'active' : ''}`} onClick={() => setActiveTab('aTabComplaints')}><i className="fas fa-exclamation-triangle"></i> Complaints</button>
                    </div>

                    {/* ===== ROOMS TAB ===== */}
                    {activeTab === 'aTabRooms' && (
                        <div className="tab-content active">
                            <div className="card mb-20">
                                <h2 className="card-header"><i className="fas fa-th-large"></i> Room Allocation Grid</h2>
                                <p style={{color: 'var(--text-secondary)', marginBottom: '15px'}}>
                                    Select a block to view the full color-coded room layout across all 12 floors.
                                </p>

                                <div className="form-row mb-20">
                                    <div className="form-group">
                                        <select className="form-select" value={selectedBlock} onChange={(e) => setSelectedBlock(e.target.value)}>
                                            <option value="">Choose Block</option>
                                            <option value="A">Block A</option>
                                            <option value="B">Block B</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Color Legend */}
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#e8f5e9', border: '2px solid #4caf50' }}></div>
                                        <span>Available</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#fff8e1', border: '2px solid #ff9800' }}></div>
                                        <span>Partially Filled</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#ffebee', border: '2px solid #f44336' }}></div>
                                        <span>Fully Occupied</span>
                                    </div>
                                </div>

                                {/* Floor-by-Floor Grid */}
                                {Object.keys(roomsByFloor).sort((a, b) => Number(a) - Number(b)).map(floor => (
                                    <div key={floor} style={{ marginBottom: '20px' }}>
                                        <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>
                                            <i className="fas fa-layer-group"></i> Floor {floor}
                                            <span style={{ fontSize: '12px', marginLeft: '10px', color: '#888' }}>
                                                ({roomsByFloor[floor][0]?.yearRestriction?.join(', ') || 'All years'})
                                            </span>
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                                            {roomsByFloor[floor].map(room => {
                                                const colors = getStatusColor(room.computedStatus);
                                                return (
                                                    <div key={room._id}
                                                        style={{
                                                            padding: '12px 8px',
                                                            borderRadius: '8px',
                                                            textAlign: 'center',
                                                            background: colors.bg,
                                                            border: `2px solid ${colors.border}`,
                                                            transition: 'transform 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <h4 style={{ color: colors.text, fontSize: '14px' }}>{room.roomNumber}</h4>
                                                        <small style={{ color: colors.text }}>{room.occupancy}/{room.capacity}</small>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {adminRooms.length === 0 && (
                                    <div className="empty-state">
                                        <i className="fas fa-building"></i>
                                        <h3>Select a Block</h3>
                                        <p>Choose Block A or Block B above to visualize the live room occupancy grid</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== PASSES TAB ===== */}
                    {activeTab === 'aTabPasses' && (
                        <div className="tab-content active">
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-sign-out-alt"></i> Gate & Vacation Pass Requests</h2>
                                <table className="data-table">
                                    <thead><tr><th>Student</th><th>Roll No</th><th>Year</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {requests.passes.map(p => (
                                            <tr key={p._id}>
                                                <td>{p.student?.name}</td>
                                                <td>{p.student?.rollNo}</td>
                                                <td>{p.student?.year}</td>
                                                <td>{p.type}</td>
                                                <td>{new Date(p.fromDate).toLocaleDateString()} – {new Date(p.toDate).toLocaleDateString()}</td>
                                                <td>{p.reason}</td>
                                                <td><strong style={{color: p.status === 'Approved' ? '#2e7d32' : p.status === 'Rejected' ? '#c62828' : '#f57f17'}}>{p.status}</strong></td>
                                                <td>
                                                    {p.status === 'Pending' && (<>
                                                        <button className="btn btn-success" style={{padding:'5px 10px', fontSize:'12px', marginRight:'5px'}} onClick={() => handleUpdateStatus('pass', p._id, 'Approved')}>Approve</button>
                                                        <button className="btn btn-danger" style={{padding:'5px 10px', fontSize:'12px'}} onClick={() => handleUpdateStatus('pass', p._id, 'Rejected')}>Reject</button>
                                                    </>)}
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.passes.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', color:'var(--text-secondary)'}}>No pass requests yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===== GUESTS TAB ===== */}
                    {activeTab === 'aTabGuests' && (
                        <div className="tab-content active">
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-user-friends"></i> Guest Accommodation Requests</h2>
                                <table className="data-table">
                                    <thead><tr><th>Student</th><th>Roll No</th><th>Guest Name</th><th>Relation</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {requests.guests.map(g => (
                                            <tr key={g._id}>
                                                <td>{g.student?.name}</td>
                                                <td>{g.student?.rollNo}</td>
                                                <td>{g.guestName}</td>
                                                <td>{g.relation}</td>
                                                <td><strong style={{color: g.status === 'Approved' ? '#2e7d32' : g.status === 'Rejected' ? '#c62828' : '#f57f17'}}>{g.status}</strong></td>
                                                <td>
                                                    {g.status === 'Pending' && (<>
                                                        <button className="btn btn-success" style={{padding:'5px 10px', fontSize:'12px', marginRight:'5px'}} onClick={() => handleUpdateStatus('guest', g._id, 'Approved')}>Approve</button>
                                                        <button className="btn btn-danger" style={{padding:'5px 10px', fontSize:'12px'}} onClick={() => handleUpdateStatus('guest', g._id, 'Rejected')}>Reject</button>
                                                    </>)}
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.guests.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', color:'var(--text-secondary)'}}>No guest requests yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===== ROOM SWAPS TAB ===== */}
                    {activeTab === 'aTabSwaps' && (
                        <div className="tab-content active">
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-exchange-alt"></i> Room Swap Requests</h2>
                                <p style={{marginBottom: '10px', color: 'var(--text-secondary)'}}>
                                    Requests that were auto-approved show instantly. Pending swaps need manual review (e.g. room was full).
                                </p>
                                <table className="data-table">
                                    <thead><tr><th>Student</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {requests.swapp.map(s => (
                                            <tr key={s._id}>
                                                <td>{s.student?.name}</td>
                                                <td>{s.reason}</td>
                                                <td><strong style={{color: s.status === 'Approved' ? '#2e7d32' : s.status === 'Rejected' ? '#c62828' : '#f57f17'}}>{s.status}</strong></td>
                                                <td>
                                                    {s.status === 'Pending' && (<>
                                                        <button className="btn btn-success" style={{padding:'5px 10px', fontSize:'12px', marginRight:'5px'}} onClick={() => handleUpdateStatus('swap', s._id, 'Approved')}>Force Approve</button>
                                                        <button className="btn btn-danger" style={{padding:'5px 10px', fontSize:'12px'}} onClick={() => handleUpdateStatus('swap', s._id, 'Rejected')}>Reject</button>
                                                    </>)}
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.swapp.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', color:'var(--text-secondary)'}}>No swap requests yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===== APPLICATIONS TAB ===== */}
                    {activeTab === 'aTabApplications' && (
                        <div className="tab-content active">
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-clipboard-list"></i> Room Applications</h2>
                                <p style={{marginBottom: '10px', color: 'var(--text-secondary)'}}>Students who applied for rooms via the Intelligent Selection grid.</p>
                                <table className="data-table">
                                    <thead><tr><th>Student</th><th>Roll No</th><th>Year</th><th>Room</th><th>Block</th><th>Floor</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {(requests.applications || []).map(a => (
                                            <tr key={a._id}>
                                                <td>{a.student?.name}</td>
                                                <td>{a.student?.rollNo}</td>
                                                <td>{a.student?.year}</td>
                                                <td>{a.room?.roomNumber}</td>
                                                <td>{a.room?.block}</td>
                                                <td>{a.room?.floor}</td>
                                                <td><strong style={{color: a.status === 'Approved' ? '#2e7d32' : a.status === 'Rejected' ? '#c62828' : '#f57f17'}}>{a.status}</strong></td>
                                                <td>
                                                    {a.status === 'Pending' && (<>
                                                        <button className="btn btn-success" style={{padding:'5px 10px', fontSize:'12px', marginRight:'5px'}} onClick={() => handleUpdateStatus('application', a._id, 'Approved')}>Approve</button>
                                                        <button className="btn btn-danger" style={{padding:'5px 10px', fontSize:'12px'}} onClick={() => handleUpdateStatus('application', a._id, 'Rejected')}>Reject</button>
                                                    </>)}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!requests.applications || requests.applications.length === 0) && <tr><td colSpan="8" style={{textAlign:'center', color:'var(--text-secondary)'}}>No room applications yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===== COMPLAINTS TAB ===== */}
                    {activeTab === 'aTabComplaints' && (
                        <div className="tab-content active">
                            <div className="card">
                                <h2 className="card-header"><i className="fas fa-exclamation-triangle"></i> Student Complaints</h2>
                                <table className="data-table">
                                    <thead><tr><th>Student</th><th>Roll No</th><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {(requests.complaints || []).map(c => (
                                            <tr key={c._id}>
                                                <td>{c.student?.name}</td>
                                                <td>{c.student?.rollNo}</td>
                                                <td>{c.category}</td>
                                                <td>{c.description}</td>
                                                <td><strong style={{color: c.status === 'Resolved' ? '#2e7d32' : c.status === 'In Progress' ? '#f57f17' : '#1565c0'}}>{c.status}</strong></td>
                                                <td>
                                                    {c.status !== 'Resolved' && (<>
                                                        <button className="btn btn-warning" style={{padding:'5px 10px', fontSize:'12px', marginRight:'5px'}} onClick={() => handleUpdateStatus('complaint', c._id, 'In Progress')}>In Progress</button>
                                                        <button className="btn btn-success" style={{padding:'5px 10px', fontSize:'12px'}} onClick={() => handleUpdateStatus('complaint', c._id, 'Resolved')}>Resolve</button>
                                                    </>)}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!requests.complaints || requests.complaints.length === 0) && <tr><td colSpan="6" style={{textAlign:'center', color:'var(--text-secondary)'}}>No complaints yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AdminDashboard;
