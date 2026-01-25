import { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Search, Bed, LogOut, Clock, Filter, Box, Activity } from 'lucide-react';

const Admissions = () => {
    const [admissions, setAdmissions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [selectedWard, setSelectedWard] = useState(null);
    const [admitForm, setAdmitForm] = useState({
        patientId: '',
        bedId: '',
        reason: '',
        diagnosis: ''
    });

    const fetchData = async () => {
        try {
            const [admRes, patRes, wardRes] = await Promise.all([
                api.get('/admissions?status=Admitted'),
                api.get('/patients'),
                api.get('/wards')
            ]);
            setAdmissions(admRes.data);
            setPatients(patRes.data);
            setWards(wardRes.data);
        } catch (err) {
            console.error('Failed to fetch admission data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admissions', admitForm);
            setShowAdmitModal(false);
            fetchData();
            setAdmitForm({ patientId: '', bedId: '', reason: '', diagnosis: '' });
            setSelectedWard(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to admit patient');
        }
    };

    const handleDischarge = async (admissionId) => {
        if (!confirm('Are you sure you want to discharge this patient?')) return;
        try {
            await api.put(`/admissions/${admissionId}/discharge`);
            fetchData();
        } catch (err) {
            alert('Failed to discharge patient');
        }
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            <p style={{ marginTop: '1rem' }}>Preparing admission records...</p>
        </div>
    );

    return (
        <div className="admissions-page">
            <header className="page-header">
                <div>
                    <h1>Admission Portal</h1>
                    <p>Track hospitalized registrations and bed allocation</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdmitModal(true)}>
                    <UserPlus size={18} /> Admit New Registration
                </button>
            </header>

            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search admissions..." style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <button className="filter-btn"><Filter size={16} /> Filters</button>
                </div>

                <div className="admission-list" style={{ minHeight: '400px' }}>
                    {admissions.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Registrant</th>
                                    <th>Ward / Bed</th>
                                    <th>Joined</th>
                                    <th>Admission Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admissions.map(adm => (
                                    <tr key={adm.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="avatar-sm"><Bed size={14} /></div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{adm.patient?.firstName} {adm.patient?.lastName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{adm.patient?.gender} • {Math.floor((new Date() - new Date(adm.patient?.dateOfBirth)) / 31557600000)} Yrs</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span className="badge">{adm.bed?.ward?.name}</span>
                                                <span style={{ fontWeight: 'bold' }}>Bed {adm.bed?.bedNumber}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <Clock size={14} />
                                                {new Date(adm.admissionDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>
                                            <div style={{ fontSize: '0.85rem' }}>{adm.reason}</div>
                                            <div style={{ fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.7 }}>Dx: {adm.diagnosis || 'Pending'}</div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDischarge(adm.id)}
                                                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                            >
                                                <LogOut size={14} style={{ marginRight: '5px' }} /> Discharge
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Box size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No currently admitted members in the system.</p>
                        </div>
                    )}
                </div>
            </div>

            {showAdmitModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <div>
                                <h2>Admission</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Register a member into the hospital facility</p>
                            </div>
                            <button className="icon-btn" onClick={() => setShowAdmitModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAdmit}>
                            <div className="form-group">
                                <label>Member to Admit</label>
                                <select
                                    required
                                    value={admitForm.patientId}
                                    onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                                >
                                    <option value="">Select Member</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)}
                                </select>
                            </div>

                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-group">
                                    <label>Ward Selection</label>
                                    <select
                                        required
                                        onChange={(e) => setSelectedWard(wards.find(w => w.id === e.target.value))}
                                    >
                                        <option value="">Select Ward</option>
                                        {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Available Bed</label>
                                    <select
                                        required
                                        disabled={!selectedWard}
                                        value={admitForm.bedId}
                                        onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                                    >
                                        <option value="">Choose Bed</option>
                                        {selectedWard?.beds.filter(b => b.status === 'Available').map(b => (
                                            <option key={b.id} value={b.id}>Bed {b.bedNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Clinical Diagnosis / Reason for Admission</label>
                                <textarea
                                    required
                                    rows="1"
                                    style={{ borderRadius: '8px' }}
                                    value={admitForm.reason}
                                    onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Additional Notes</label>
                                <textarea
                                    rows="2"
                                    style={{ borderRadius: '8px' }}
                                    value={admitForm.diagnosis}
                                    onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
                                    Confirm Admission
                                </button>
                                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowAdmitModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
                .filter-btn { display: flex; align-items: center; gap: 8px; padding: 0.6rem 1.2rem; border-radius: 8px; border: 1px solid var(--border); background: #ffffff; cursor: pointer; }
                .admission-list tr:hover { background-color: #f9fafb; }
            `}</style>
        </div>
    );
};

export default Admissions;
