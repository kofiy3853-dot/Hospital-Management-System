import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Search, ShieldAlert, Clock, User, HardDrive } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        resourceType: '',
        limit: 50,
        offset: 0
    });

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/audit', { params: filters });
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err) {
            console.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const getActionColor = (action) => {
        switch (action) {
            case 'DELETE': return 'var(--danger)';
            case 'CREATE': return 'var(--success)';
            case 'UPDATE': return 'var(--primary)';
            case 'UPDATE_STATUS': return 'var(--warning)';
            case 'VIEW': return 'var(--text-muted)';
            default: return 'var(--border)';
        }
    };

    return (
        <div className="audit-logs-page">
            <header className="page-header">
                <div>
                    <h1>System Audit Trail</h1>
                    <p>Security logging and accountability tracking</p>
                </div>
                <div className="badge-shield">
                    <Shield size={16} />
                    <span>Compliant Layer</span>
                </div>
            </header>

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by action or resource..."
                            style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Actions</option>
                        <option value="VIEW">View</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                    </select>
                    <select
                        value={filters.resourceType}
                        onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Resources</option>
                        <option value="Patient">Patient</option>
                        <option value="MedicalRecord">Medical Record</option>
                        <option value="Billing">Billing</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Querying logs...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>IP Address</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? logs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={12} />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} color="var(--primary)" />
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{log.user?.firstName} {log.user?.lastName}</div>
                                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>{log.user?.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: getActionColor(log.action), color: '#white' }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <HardDrive size={14} color="var(--text-muted)" />
                                                <strong>{log.resourceType}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{log.resourceId?.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ipAddress}</td>
                                        <td>
                                            <button
                                                className="icon-btn"
                                                onClick={() => console.log(log.details)}
                                                title="View Raw Data"
                                            >
                                                <ShieldAlert size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No audit logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Showing {logs.length} of {total} events</span>
                    {/* Pagination could go here */}
                </div>
            </div>

            <style>{`
                .audit-logs-page { animation: fadeIn 0.3s ease; }
                .badge-shield { display: flex; align-items: center; gap: 6px; padding: 6px 15px; background: rgba(var(--primary-rgb), 0.1); border: 1px solid var(--primary); border-radius: 20px; color: var(--primary); font-size: 0.85rem; font-weight: 600; }
                .filter-select { padding: 0.6rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); outline: none; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default AuditLogs;
