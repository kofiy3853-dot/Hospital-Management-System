import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, Thermometer, Heart, Weight, Save, CheckCircle, X } from 'lucide-react';

const Vitals = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApt, setSelectedApt] = useState(null);
    const [formData, setFormData] = useState({
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        weight: '',
        respiratoryRate: ''
    });

    const fetchConfirmed = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/appointments');
            // Filter only confirmed/arrived for vitals
            setAppointments(data.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled'));
        } catch (err) {
            console.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfirmed();
    }, []);

    const handleOpenForm = (apt) => {
        setSelectedApt(apt);
        // Reset form or fetch existing if any
        setFormData({ temperature: '', bloodPressure: '', pulseRate: '', weight: '', respiratoryRate: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Check if record already exists for this appointment
            const { data: existing } = await api.get(`/medical-records/appointment/${selectedApt.id}`);

            if (existing) {
                await api.put(`/medical-records/${existing.id}`, { vitals: formData });
            } else {
                await api.post('/medical-records', {
                    patientId: selectedApt.patientId,
                    appointmentId: selectedApt.id,
                    vitals: formData
                });
            }
            setSelectedApt(null);
            alert('Vitals recorded successfully!');
        } catch (err) {
            alert('Failed to save vitals');
        }
    };

    return (
        <div className="vitals-page">
            <header className="page-header">
                <div>
                    <h1>Patient Vitals</h1>
                    <p>Record and monitor vital signs for scheduled consultations</p>
                </div>
            </header>

            {selectedApt && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '500px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Activity color="var(--primary)" /> Record Vitals</h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Patient: {selectedApt.patient?.firstName} {selectedApt.patient?.lastName}</p>
                            </div>
                            <button className="icon-btn" onClick={() => setSelectedApt(null)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="vitals-form">
                            <div className="vitals-grid">
                                <div className="form-group">
                                    <label><Thermometer size={14} /> Temperature (°C)</label>
                                    <input type="text" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} placeholder="36.5" />
                                </div>
                                <div className="form-group">
                                    <label><Heart size={14} /> Blood Pressure</label>
                                    <input type="text" value={formData.bloodPressure} onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })} placeholder="120/80" />
                                </div>
                                <div className="form-group">
                                    <label><Activity size={14} /> Pulse Rate (bpm)</label>
                                    <input type="text" value={formData.pulseRate} onChange={(e) => setFormData({ ...formData, pulseRate: e.target.value })} placeholder="72" />
                                </div>
                                <div className="form-group">
                                    <label><Weight size={14} /> Weight (kg)</label>
                                    <input type="text" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="70" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Save size={18} /> Save Vitals
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Appointment Time</th>
                                    <th>Doctor</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? appointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>{apt.patient?.firstName} {apt.patient?.lastName}</td>
                                        <td>{new Date(apt.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                        <td>Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline" onClick={() => handleOpenForm(apt)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <CheckCircle size={14} /> Record Vitals
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No pending vitals to record.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
                .vitals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .vitals-form label { display: flex; align-items: center; gap: 0.4rem; }
                .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
                .btn-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
                .btn-outline:hover { background: var(--primary); color: white; }
            `}</style>
        </div>
    );
};

export default Vitals;
