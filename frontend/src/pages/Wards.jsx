import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Layout, Plus, CheckCircle, AlertCircle, Settings, Home, Activity } from 'lucide-react';

const Wards = () => {
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWardModal, setShowWardModal] = useState(false);
    const [newWard, setNewWard] = useState({
        name: '',
        type: 'General',
        departmentId: '',
        capacity: 10
    });

    const fetchData = async () => {
        try {
            const [wardsRes, deptRes] = await Promise.all([
                api.get('/wards'),
                api.get('/departments')
            ]);
            setWards(wardsRes.data);
            setDepartments(deptRes.data);
        } catch (err) {
            console.error('Failed to fetch ward data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateWard = async (e) => {
        e.preventDefault();
        try {
            await api.post('/wards', newWard);
            setShowWardModal(false);
            fetchData();
            setNewWard({ name: '', type: 'General', departmentId: '', capacity: 10 });
        } catch (err) {
            alert('Failed to create ward');
        }
    };

    const getBedStatusColor = (status) => {
        switch (status) {
            case 'Available': return '#10b981';
            case 'Occupied': return '#ef4444';
            case 'Maintenance': return '#f59e0b';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="wards-page">
            <header className="page-header">
                <div>
                    <h1>Ward Management</h1>
                    <p>Manage hospital beds and occupancy rates</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowWardModal(true)}>
                    <Plus size={18} /> Add New Ward
                </button>
            </header>

            <div className="ward-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {wards.map(ward => (
                    <div key={ward.id} className="card ward-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <div className="badge">{ward.type} Ward</div>
                                <h3 style={{ marginTop: '0.5rem' }}>{ward.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ward.department?.name}</p>
                            </div>
                            <Settings size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                        </div>

                        <div className="bed-statistics" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="stat-pill">
                                <span className="label">Available</span>
                                <span className="value" style={{ color: '#10b981' }}>{ward.beds.filter(b => b.status === 'Available').length}</span>
                            </div>
                            <div className="stat-pill">
                                <span className="label">Occupied</span>
                                <span className="value" style={{ color: '#ef4444' }}>{ward.beds.filter(b => b.status === 'Occupied').length}</span>
                            </div>
                        </div>

                        <div className="bed-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {ward.beds.map(bed => (
                                <div
                                    key={bed.id}
                                    className="bed-icon"
                                    title={`Bed ${bed.bedNumber} - ${bed.status}`}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--bg-dark)',
                                        border: `2px solid ${getBedStatusColor(bed.status)}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold',
                                        color: getBedStatusColor(bed.status)
                                    }}
                                >
                                    <Activity size={14} />
                                    <span>{bed.bedNumber}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showWardModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Establish New Ward</h2>
                            <button className="icon-btn" onClick={() => setShowWardModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateWard}>
                            <div className="form-group">
                                <label>Ward Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newWard.name}
                                    onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                                    placeholder="e.g. Ward A - Surgery"
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    required
                                    value={newWard.departmentId}
                                    onChange={(e) => setNewWard({ ...newWard, departmentId: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ward Type</label>
                                    <select
                                        value={newWard.type}
                                        onChange={(e) => setNewWard({ ...newWard, type: e.target.value })}
                                    >
                                        <option value="General">General</option>
                                        <option value="ICU">ICU</option>
                                        <option value="Maternity">Maternity</option>
                                        <option value="Pediatrics">Pediatrics</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bed Capacity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={newWard.capacity}
                                        onChange={(e) => setNewWard({ ...newWard, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Deploy Infrastructure</button>
                                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowWardModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .stat-pill { background: var(--bg-dark); padding: 8px 15px; border-radius: 20px; border: 1px solid var(--border); display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
                .stat-pill .label { color: var(--text-muted); }
                .stat-pill .value { font-weight: 700; }
                .ward-card { transition: all 0.3s ease; border-top: 4px solid var(--primary); }
                .ward-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                .bed-icon { cursor: pointer; transition: 0.2s; }
                .bed-icon:hover { transform: scale(1.1); filter: brightness(1.2); }
            `}</style>
        </div>
    );
};

export default Wards;
