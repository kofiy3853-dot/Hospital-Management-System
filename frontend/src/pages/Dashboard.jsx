import { useState, useEffect, useCallback } from 'react';
import ReceptionDashboard from './FrontDesk';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import {
    Users, DollarSign, Activity,
    AlertCircle, Clock, Pill, TrendingUp, UserCheck
} from 'lucide-react';

// --- Sub-components moved outside to prevent re-creation on every render ---

const StatCard = ({ icon, label, value, color }) => (
    <div className="card stat-card">
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
            {icon}
        </div>
        <div className="stat-content">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const EmptyState = ({ message }) => (
    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
        <Clock size={32} style={{ marginBottom: '0.8rem' }} />
        <p>{message}</p>
    </div>
);

const AdminDashboard = ({ data }) => (
    <div className="dashboard-content">
        <div className="dashboard-grid">
            <StatCard icon={<Users />} label="Total Registrations" value={data?.patients || 0} color="#10b981" />
            <StatCard icon={<UserCheck />} label="Hospital Staff" value={data?.staff || 0} color="#0d9488" />
            <StatCard icon={<DollarSign />} label="Net Revenue" value={`$${(data?.revenue || 0).toLocaleString()}`} color="#10b981" />
            <StatCard icon={<AlertCircle />} label="Stock Alerts" value={data?.lowStock || 0} color="#ef4444" />
        </div>
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>System Health</h3>
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                <TrendingUp size={48} color="var(--primary)" style={{ opacity: 0.5 }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Administrative insights and system reports are active.</p>
            </div>
        </div>
    </div>
);

const DoctorDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-content doctor-dashboard-center">
            <div 
                className="consulting-room-card glass-card"
                onClick={() => navigate('/consulting-room')}
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    padding: '5rem 3rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '32px',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0.02) 100%)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="icon-wrapper" style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    background: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 15px 35px rgba(var(--primary-rgb), 0.5)',
                    position: 'relative'
                }}>
                    <Activity size={60} color="white" />
                    <div className="pulse-ring"></div>
                </div>
                
                <div className="text-content">
                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Consulting Room</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                        Step into your digital workspace. Access patient records, manage consultations, and record SOAP notes with ease.
                    </p>
                </div>

                <button className="btn btn-primary" style={{ 
                    padding: '1.2rem 4rem', 
                    fontSize: '1.2rem', 
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 10px 20px rgba(var(--primary-rgb), 0.3)'
                }}>
                    Launch Portal
                </button>
                
                <div style={{ display: 'flex', gap: '3rem', marginTop: '1rem', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '1rem' }}>
                        <Clock size={18} />
                        <span>Clinical Journal</span>
                    </div>
                </div>
            </div>

            <style>{`
                .doctor-dashboard-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    animation: fadeIn 0.8s ease-out;
                }
                .consulting-room-card:hover {
                    transform: translateY(-12px) scale(1.02);
                    box-shadow: 0 40px 80px -15px rgba(0,0,0,0.6);
                    border-color: rgba(var(--primary-rgb), 0.3);
                }
                .consulting-room-card:hover .icon-wrapper {
                    transform: scale(1.1) rotate(5deg);
                }
                .icon-wrapper {
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .pulse-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: var(--primary);
                    opacity: 0.3;
                    animation: pulse 2s infinite;
                    z-index: -1;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const PharmacyDashboard = ({ data }) => (
    <div className="dashboard-content">
        <div className="dashboard-grid">
            <StatCard icon={<Pill />} label="Pending Prescriptions" value={data?.pendingPrescriptions || 0} color="#10b981" />
            <StatCard icon={<AlertCircle />} label="Critically Low Stock" value={data?.lowStockItems?.length || 0} color="#ef4444" />
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>Restock Alerts</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity Left</th>
                            <th>Alert Level</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.lowStockItems?.map(item => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: '600' }}>{item.name}</td>
                                <td style={{ color: '#ef4444' }}>{item.quantity} {item.unit}</td>
                                <td><span className="badge" style={{ background: item.quantity < 5 ? '#ef4444' : '#f59e0b' }}>Low</span></td>
                                <td><button className="btn btn-sm">Create PO</button></td>
                            </tr>
                        ))}
                        {(!data?.lowStockItems || data.lowStockItems.length === 0) && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>All inventory levels are optimal.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const LabDashboard = ({ data }) => (
    <div className="dashboard-content">
        <div className="dashboard-grid">
            <StatCard icon={<Clock />} label="Pending Requests" value={data?.pendingTestsCount || 0} color="#f59e0b" />
            <StatCard icon={<Activity />} label="In Progress" value={data?.inProgressTests?.length || 0} color="#10b981" />
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>Lab Queue</h3>
            <div style={{ padding: '1rem' }}>
                {data?.inProgressTests?.length > 0 ? (
                    data.inProgressTests.map(test => (
                        <div key={test.id} className="apt-item" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{test.testName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Patient: {test.patient?.firstName} {test.patient?.lastName} • Dr. {test.doctor?.lastName}
                                </div>
                            </div>
                            <button className="btn btn-primary btn-sm">Enter Results</button>
                        </div>
                    ))
                ) : <EmptyState message="No tests currently processing." />}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching dashboard data from API...');
            const res = await api.get('/dashboard');
            console.log('Dashboard data received:', res.data);
            setData(res.data);
        } catch (err) {
            console.error('Fetch dashboard failed:', err);
            setError('We encountered a problem loading your dashboard. Please check your connection or try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!hasRole(['doctor', 'receptionist'])) {
            fetchDashboard();
        } else {
            setLoading(false);
        }
    }, [hasRole, fetchDashboard]);

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            <p style={{ marginTop: '1rem' }}>Aggregating your clinical overview...</p>
        </div>
    );

    const isSelfContained = hasRole(['doctor', 'receptionist']);
    if (!isSelfContained && (error || !data)) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', display: 'inline-block', boxShadow: 'var(--shadow-lg)', maxWidth: '450px' }}>
                <div style={{ background: '#fef2f2', color: '#ef4444', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <AlertCircle size={32} />
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827' }}>Fetch Dashboard Failed</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'The system was unable to retrieve your dashboard data. This might be due to a server connection issue.'}</p>
                <button 
                    onClick={fetchDashboard} 
                    className="btn btn-primary" 
                    style={{ background: 'var(--primary)', width: '100%', padding: '0.8rem' }}
                >
                    Try to Refresh Data
                </button>
            </div>
        </div>
    );

    const getRoleTitle = () => {
        if (hasRole(['admin', 'super_admin'])) return 'Administrative Control';
        if (hasRole('doctor')) return 'Clinical Overview';
        if (hasRole('pharmacist')) return 'Pharmacy Management';
        if (hasRole('lab_tech')) return 'Laboratory Queue';
        return 'Hospital Portal';
    };

    return (
        <div className="dashboard-page">
            {!hasRole('doctor') && (
                <header className="page-header">
                    <div>
                        <h1>{getRoleTitle()}</h1>
                        <p>Welcome back, <strong>{user?.firstName}</strong>. System status: Online</p>
                    </div>
                </header>
            )}

            {hasRole(['admin', 'super_admin']) && <AdminDashboard data={data} />}
            {hasRole('doctor') && <DoctorDashboard />}
            {hasRole('receptionist') && <ReceptionDashboard />}
            {hasRole('pharmacist') && <PharmacyDashboard data={data} />}
            {hasRole('lab_tech') && <LabDashboard data={data} />}

            <style>{`
                .dashboard-content { animation: fadeIn 0.4s ease; }
                .stat-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; }
                .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(var(--primary-rgb), 0.1); }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); display: block; }
                .stat-value { font-size: 1.5rem; font-weight: 700; display: block; }
                
                .apt-item { display: flex; align-items: center; gap: 1.2rem; padding: 1rem; background: #f9fafb; border-radius: 10px; margin-bottom: 0.8rem; }
                .time-box { width: 70px; font-weight: 700; color: var(--primary); font-size: 0.9rem; border-right: 1px solid var(--border); }
                .badge-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--border); }
                .badge-dot.active { background: #10b981; border-color: transparent; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
