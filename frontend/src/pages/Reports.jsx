import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Calendar, Package, AlertCircle, TrendingUp, DollarSign, Activity, Activity as ClinicalIcon } from 'lucide-react';

const Reports = () => {
    const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, lowStock: 0 });
    const [revenueData, setRevenueData] = useState([]);
    const [clinicalData, setClinicalData] = useState({ diagnoses: [], topDrugs: [] });
    const [patientTrends, setPatientTrends] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, revenueRes, clinicalRes, patientsRes, inventoryRes] = await Promise.all([
                api.get('/reports/stats'),
                api.get('/reports/revenue'),
                api.get('/reports/clinical'),
                api.get('/reports/patients'),
                api.get('/reports/inventory')
            ]);
            setStats(statsRes.data);
            setRevenueData(revenueRes.data);
            setClinicalData(clinicalRes.data);
            setPatientTrends(patientsRes.data);
            setInventoryData(inventoryRes.data);
        } catch (err) {
            console.error('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Generating Advanced Analytics...</div>;

    return (
        <div className="reports-page">
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Hospital Analytics</h1>
                    <p>Real-time clinical, financial, and operational performance metrics</p>
                </div>
                <button className="btn btn-primary" onClick={fetchData}>Refresh Data</button>
            </header>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard icon={<Users />} label="Active Patients" value={stats.patients} color="#2563eb" />
                <StatCard icon={<DollarSign />} label="30D Revenue" value={`$${revenueData.reduce((acc, curr) => acc + Number(curr.revenue), 0).toLocaleString()}`} color="#10b981" />
                <StatCard icon={<ClinicalIcon />} label="Critical Alerts" value={stats.lowStock} color="#ef4444" />
                <StatCard icon={<Calendar />} label="Total Activity" value={stats.appointments} color="#f59e0b" />
            </div>

            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

                {/* Revenue Trend Chart */}
                <div className="card chart-card">
                    <h3>Financial Performance (Revenue Trend)</h3>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `$${val}`} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Patient Registration Trends */}
                <div className="card chart-card">
                    <h3>Patient Growth (Daily Registrations)</h3>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={patientTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Illnesses Pie Chart */}
                <div className="card chart-card">
                    <h3>Top 5 Diagnoses (Disease Burden)</h3>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={clinicalData.diagnoses}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="diagnosis"
                                >
                                    {clinicalData.diagnoses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Drugs Bar Chart */}
                <div className="card chart-card">
                    <h3>Most Prescribed Medications</h3>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clinicalData.topDrugs} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={100} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .chart-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-main); }
                .stat-card-ui { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; transition: transform 0.2s; }
                .stat-card-ui:hover { transform: translateY(-5px); }
                .stat-icon-ui { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; }
                .stat-content-ui h4 { margin: 0; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
                .stat-content-ui p { margin: 0; font-size: 1.6rem; font-weight: 800; color: var(--text-main); }
                .recharts-legend-item-text { color: var(--text-muted) !important; font-size: 12px; }
            `}</style>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="card stat-card-ui">
        <div className="stat-icon-ui" style={{ background: color, boxShadow: `0 8px 16px ${color}33` }}>{icon}</div>
        <div className="stat-content-ui">
            <h4>{label}</h4>
            <p>{value}</p>
        </div>
    </div>
);

export default Reports;
