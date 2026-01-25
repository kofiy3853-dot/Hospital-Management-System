import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users as UsersIcon, Search, Plus, X, Edit2, Trash2, Shield, Eye } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewUser, setViewUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'patient',
        phoneNumber: '',
        gender: '',
        dateOfBirth: ''
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
                alert('User updated successfully');
            } else {
                await api.post('/users', formData);
                alert('User created successfully');
            }
            setShowModal(false);
            setEditingUser(null);
            fetchUsers();
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '',
            role: user.role,
            phoneNumber: user.phoneNumber || '',
            gender: user.gender || '',
            dateOfBirth: user.dateOfBirth || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
            alert('User deleted successfully');
        } catch (err) {
            alert('Failed to delete user');
        }
    };


    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'patient',
            phoneNumber: '',
            gender: '',
            dateOfBirth: ''
        });
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'var(--danger)',
            doctor: 'var(--primary)',
            nurse: 'var(--success)',
            pharmacist: 'var(--warning)',
            lab_tech: 'var(--info)',
            receptionist: 'var(--secondary)',
            accountant: 'var(--purple)',
            patient: 'var(--text-muted)'
        };
        return colors[role] || 'var(--text-muted)';
    };

    const getRoleDisplayName = (role) => {
        if (role === 'patient') return 'Registration';
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="user-management-page">
            <header className="page-header">
                <div>
                    <h1>User & Staff Management</h1>
                    <p>Manage system users, roles, and permissions</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Add User
                </button>
            </header>

            <div className="user-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div className="card stat-card-ui">
                    <Shield color="var(--danger)" size={20} />
                    <div className="stat-info">
                        <h3>{users.filter(u => u.role === 'admin').length}</h3>
                        <p>Admins</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <UsersIcon color="var(--primary)" size={20} />
                    <div className="stat-info">
                        <h3>{users.filter(u => u.role === 'doctor').length}</h3>
                        <p>Doctors</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <UsersIcon color="var(--success)" size={20} />
                    <div className="stat-info">
                        <h3>{users.filter(u => u.role === 'nurse').length}</h3>
                        <p>Nurses</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <UsersIcon color="var(--warning)" size={20} />
                    <div className="stat-info">
                        <h3>{users.filter(u => ['pharmacist', 'lab_tech', 'receptionist', 'accountant'].includes(u.role)).length}</h3>
                        <p>Staff</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem' }}>All Users</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search users..." style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading users...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Phone</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ fontWeight: '600' }}>{user.firstName} {user.lastName}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className="badge" style={{ background: getRoleBadgeColor(user.role) }}>
                                                {getRoleDisplayName(user.role)}
                                            </span>
                                        </td>
                                        <td>{user.phoneNumber || 'N/A'}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="icon-btn" onClick={() => { setViewUser(user); setShowViewModal(true); }} title="View Details">
                                                    <Eye size={16} color="var(--primary)" />
                                                </button>
                                                <button className="icon-btn" onClick={() => handleEdit(user)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="icon-btn" onClick={() => handleDelete(user.id)} title="Delete">
                                                    <Trash2 size={16} color="var(--danger)" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Profile View Modal */}
            {showViewModal && viewUser && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '800px', width: '95%' }}>
                        <div className="profile-header">
                            <div className="avatar-lg">
                                {viewUser.firstName[0]}{viewUser.lastName[0]}
                            </div>
                            <div className="profile-info">
                                <h2>{viewUser.firstName} {viewUser.lastName}</h2>
                                <span className="badge" style={{ background: getRoleBadgeColor(viewUser.role) }}>{getRoleDisplayName(viewUser.role)}</span>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Staff ID: {viewUser.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => setShowViewModal(false)}><X size={24} /></button>
                        </div>

                        <div className="detail-section">
                            <h3 className="section-title">Personal Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Email Address</span>
                                    <span className="detail-value">{viewUser.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phone Number</span>
                                    <span className="detail-value">{viewUser.phoneNumber || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Gender</span>
                                    <span className="detail-value">{viewUser.gender || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Date of Birth</span>
                                    <span className="detail-value">{viewUser.dateOfBirth ? new Date(viewUser.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <h3 className="section-title">Professional Details</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Department</span>
                                    <span className="detail-value">{viewUser.department?.name || 'General Staff'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Joined Date</span>
                                    <span className="detail-value">{new Date(viewUser.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {viewUser.address && (
                                <>
                                    <h3 className="section-title">Address</h3>
                                    <p className="detail-value" style={{ padding: '1rem', background: '#f9fafb', borderRadius: '10px' }}>{viewUser.address}</p>
                                </>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setShowViewModal(false); handleEdit(viewUser); }}>Edit Staff Record</button>
                            <button className="btn" style={{ flex: 1, border: '1px solid var(--border)' }} onClick={() => setShowViewModal(false)}>Close View</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '600px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <button className="icon-btn" onClick={() => { setShowModal(false); setEditingUser(null); }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            {!editingUser && (
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                                        <option value="patient">Registration</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="nurse">Nurse</option>
                                        <option value="pharmacist">Pharmacist</option>
                                        <option value="lab_tech">Lab Technician</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                {editingUser ? 'Update User' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .stat-card-ui { display: flex; align-items: center; gap: 0.8rem; padding: 1rem; }
                .stat-info h3 { margin: 0; font-size: 1.3rem; }
                .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.8rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; background: rgba(255,255,255,0.05); color: var(--text); outline: none; }
                .icon-btn { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; }
                .icon-btn:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
};

export default UserManagement;
