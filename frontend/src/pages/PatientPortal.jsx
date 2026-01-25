import { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Calendar, FileText, DollarSign, Pill, Activity, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const PatientPortal = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [bills, setBills] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPatientData();
        }
    }, [user]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const [apptRes, recordsRes, billsRes] = await Promise.all([
                api.get('/appointments'),
                api.get(`/medical-records/patient/${user.id}`),
                api.get(`/billing/patient/${user.id}`)
            ]);

            setAppointments(apptRes.data.filter(a => a.patientId === user.id));
            setRecords(recordsRes.data);
            setBills(billsRes.data);
        } catch (err) {
            console.error('Failed to fetch patient data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-portal">
            <header className="page-header">
                <div>
                    <h1>Welcome, {user?.firstName}!</h1>
                    <p>Your personal health dashboard</p>
                </div>
            </header>

            <div className="portal-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card stat-card-ui">
                    <Calendar color="var(--primary)" size={24} />
                    <div className="stat-info">
                        <h3>{appointments.filter(a => a.status !== 'Completed').length}</h3>
                        <p>Upcoming Appointments</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <FileText color="var(--success)" size={24} />
                    <div className="stat-info">
                        <h3>{records.length}</h3>
                        <p>Medical Records</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <DollarSign color="var(--warning)" size={24} />
                    <div className="stat-info">
                        <h3>{bills.filter(b => b.status === 'pending').length}</h3>
                        <p>Pending Bills</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} /> Upcoming Appointments
                    </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : appointments.filter(a => a.status !== 'Completed').length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {appointments.filter(a => a.status !== 'Completed').map(apt => (
                                <div key={apt.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>Dr. {apt.doctor?.lastName}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                            <Clock size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                            {new Date(apt.dateTime).toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="badge" style={{ background: apt.status === 'Confirmed' ? 'var(--success)' : 'var(--warning)' }}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No upcoming appointments</p>
                    )}
                </div>
            </div>

            {/* Recent Medical Records */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> Recent Medical Records
                    </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : records.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {records.slice(0, 5).map(record => (
                                <div key={record.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>{new Date(record.createdAt).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dr. {record.doctor?.lastName}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <strong>Diagnosis:</strong> {record.diagnosis || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No medical records found</p>
                    )}
                </div>
            </div>

            {/* Billing Summary */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20} /> Billing Summary
                    </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : bills.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {bills.slice(0, 5).map(bill => (
                                <div key={bill.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>${bill.amount}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="badge" style={{
                                        background: bill.status === 'paid' ? 'var(--success)' :
                                            bill.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                                    }}>
                                        {bill.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No billing records found</p>
                    )}
                </div>
            </div>

            <style>{`
                .stat-card-ui { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; }
                .stat-info h3 { margin: 0; font-size: 1.5rem; }
                .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }
            `}</style>
        </div>
    );
};

export default PatientPortal;
