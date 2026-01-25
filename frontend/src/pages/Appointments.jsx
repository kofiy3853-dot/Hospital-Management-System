import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Plus, Clock, User, UserCheck, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        dateTime: '',
        reason: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [aptRes, docRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/doctors')
            ]);
            setAppointments(aptRes.data);
            setDoctors(docRes.data);

            if (user?.role !== 'patient') {
                const patRes = await api.get('/patients');
                setPatients(patRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch appointment data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user && loading) return;
        fetchData();
    }, [user, loading, fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', formData);
            setShowModal(false);
            fetchData();
            setFormData({ patientId: '', doctorId: '', dateTime: '', reason: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to schedule appointment');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'var(--success)';
            case 'Confirmed': return 'var(--primary)';
            case 'Cancelled': return 'var(--danger)';
            default: return 'var(--warning)';
        }
    };

    return (
        <div className="appointments-page">
            <header className="page-header">
                <div>
                    <h1>Appointments</h1>
                    <p>Schedule and manage consultations</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Schedule New
                </button>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '500px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Schedule Appointment</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {user?.role !== 'patient' && (
                                <div className="form-group">
                                    <label>Select Member</label>
                                    <select value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} required>
                                        <option value="">-- Choose Member --</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Select Doctor</label>
                                <select value={formData.doctorId} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })} required>
                                    <option value="">-- Choose Doctor --</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input type="datetime-local" value={formData.dateTime} onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Reason for Visit</label>
                                <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows="3"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Confirm Schedule</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading schedule...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Registrant</th>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? appointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', height: '60px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                                            {apt.patient?.firstName} {apt.patient?.lastName}
                                        </td>
                                        <td>Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600' }}>{new Date(apt.dateTime).toLocaleDateString()}</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: getStatusColor(apt.status), color: 'white' }}>{apt.status}</span>
                                        </td>
                                        <td>
                                            <button className="icon-btn"><UserCheck size={16} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No appointments scheduled.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
            `}</style>
        </div>
    );
};

export default Appointments;
