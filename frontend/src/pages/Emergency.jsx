import { useState, useEffect } from 'react';
import api from '../api/axios';
import { AlertTriangle, Plus, Clock, User, X, Activity } from 'lucide-react';

const Emergency = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        triageLevel: 'Normal',
        reason: '',
        status: 'Triage'
    });

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/emergency/active');
            setRecords(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            console.error('Failed to fetch emergency records');
            setError('Could not connect to emergency queue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        const interval = setInterval(fetchRecords, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/emergency', formData);
            setShowModal(false);
            fetchRecords();
            setFormData({ firstName: '', lastName: '', phoneNumber: '', triageLevel: 'Normal', reason: '', status: 'Triage' });
        } catch (err) {
            alert('Failed to register emergency case');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/emergency/${id}/triage`, { status });
            fetchRecords();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const triageColors = {
        'Critical': '#ef4444',
        'Urgent': '#f59e0b',
        'Normal': '#10b981'
    };

    return (
        <div className="emergency-page">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--danger)', padding: '0.8rem', borderRadius: '12px', color: 'white' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h1>Emergency / Triage</h1>
                        <p>Real-time emergency patient tracking and priority management</p>
                    </div>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger)', border: 'none' }} onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Rapid Registration
                </button>
            </header>

            <div className="emergency-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card stat-card-ui" style={{ borderLeft: '4px solid #ef4444' }}>
                    <Activity color="#ef4444" size={24} />
                    <div className="stat-info">
                        <h3>{records.filter(r => r.triageLevel === 'Critical').length}</h3>
                        <p>Critical Cases</p>
                    </div>
                </div>
                <div className="card stat-card-ui" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <Clock color="#f59e0b" size={24} />
                    <div className="stat-info">
                        <h3>{records.filter(r => r.triageLevel === 'Urgent').length}</h3>
                        <p>Urgent Cases</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <User color="#10b981" size={24} />
                    <div className="stat-info">
                        <h3>{records.length}</h3>
                        <p>Total in ER</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.1rem' }}>Active Triage Queue</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge" style={{ background: '#ef4444', fontSize: '10px' }}>RED: Critical</span>
                        <span className="badge" style={{ background: '#f59e0b', fontSize: '10px' }}>AMBER: Urgent</span>
                        <span className="badge" style={{ background: '#10b981', fontSize: '10px' }}>GREEN: Normal</span>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', margin: '1rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {loading && records.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Updating Queue...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Priority</th>
                                    <th>Reason / Complaint</th>
                                    <th>Arrival</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map((record) => (
                                    <tr key={record.id} style={{ borderLeft: `6px solid ${triageColors[record.triageLevel] || 'var(--border)'}` }}>
                                        <td style={{ fontWeight: '600' }}>
                                            {record.firstName} {record.lastName}
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>{record.phoneNumber}</div>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: triageColors[record.triageLevel] }}>
                                                {record.triageLevel}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>{record.reason}</td>
                                        <td>{new Date(record.arrivalTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>
                                            <select 
                                                value={record.status} 
                                                onChange={(e) => updateStatus(record.id, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)' }}
                                            >
                                                <option value="Triage">Triage</option>
                                                <option value="Active">Under Treatment</option>
                                                <option value="Stable">Stable</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => updateStatus(record.id, 'Discharged')}>Discharge</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No active emergency cases.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '500px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--danger)' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> ER Rapid Entry</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
                                <label>Priority / Triage Level</label>
                                <select 
                                    value={formData.triageLevel} 
                                    onChange={(e) => setFormData({ ...formData, triageLevel: e.target.value })}
                                    style={{ border: `2px solid ${triageColors[formData.triageLevel]}` }}
                                >
                                    <option value="Normal">Normal (Green)</option>
                                    <option value="Urgent">Urgent (Amber)</option>
                                    <option value="Critical">Critical (Red)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Primary Complaint / Reason for ER</label>
                                <textarea rows="3" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required placeholder="e.g. Chest pain, High fever, Accident"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Contact (Optional)</label>
                                <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Relative/Patient phone" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', background: 'var(--danger)', border: 'none' }}>SEND TO TRIAGE</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
                .stat-card-ui { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; }
                .stat-info h3 { margin: 0; font-size: 1.8rem; font-weight: 800; }
                .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
};

export default Emergency;
