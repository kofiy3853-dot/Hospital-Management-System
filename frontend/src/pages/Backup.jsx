import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, Download, RefreshCw, Trash2, ShieldAlert, CheckCircle, Clock, FileJson, AlertTriangle } from 'lucide-react';

const Backup = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/backups');
            setBackups(res.data);
        } catch (err) {
            console.error('Failed to fetch backups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const createManualBackup = async () => {
        try {
            setActionLoading('create');
            await api.post('/backups');
            fetchBackups();
            setMessage({ type: 'success', text: 'Snapshot created successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Backup failed' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestore = async (filename) => {
        if (!window.confirm(`CRITICAL WARNING: This will overwrite ALL current database records with the contents of ${filename}. This action cannot be undone. Are you absolutely sure?`)) {
            return;
        }

        try {
            setActionLoading(filename);
            await api.post(`/backups/restore/${filename}`);
            setMessage({ type: 'success', text: 'Database restored successfully. Refreshing site data...' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Restoration failed' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await api.get(`/backups/download/${filename}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed');
        }
    };

    return (
        <div className="backup-page" style={{ padding: '2rem' }}>
            <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Backup & Recovery</h1>
                    <p>Protect your hospital's digital infrastructure with automated snapshots</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={createManualBackup}
                    disabled={actionLoading === 'create'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Database size={18} />
                    {actionLoading === 'create' ? 'Creating Snapshot...' : 'Create Manual Backup'}
                </button>
            </header>

            {message && (
                <div className={`alert alert-${message.type}`} style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#10b981' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem'
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                    {message.text}
                </div>
            )}

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Clock size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>Available Snapshots</h3>
                </div>

                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                <th style={{ padding: '1.2rem' }}>File Name</th>
                                <th style={{ padding: '1.2rem' }}>Created At</th>
                                <th style={{ padding: '1.2rem' }}>File Size</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.length > 0 ? backups.map((b, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <FileJson size={18} color="var(--text-muted)" />
                                            <span>{b.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {new Date(b.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{b.size}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDownload(b.name)}
                                                title="Download Snapshot"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '6px' }}
                                                onClick={() => handleRestore(b.name)}
                                                disabled={actionLoading === b.name}
                                            >
                                                {actionLoading === b.name ? 'Restoring...' : 'Restore'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <ShieldAlert size={48} opacity={0.2} />
                                            <p>No snapshots available. Create your first backup to secure your data.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="restore-policy-card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed #ef4444', borderRadius: '12px', display: 'flex', gap: '1rem' }}>
                <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#ef4444' }}>Critical Restoration Policy</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Restoring a backup will perform a <strong>destructive overwrite</strong> of the current database. All data added since the snapshot was taken will be permanently lost. Ensure all active staff are logged out before performing a restoration.
                    </p>
                </div>
            </div>

            <style>{`
                .btn-icon {
                    background: none;
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon:hover {
                    background: rgba(255,255,255,0.05);
                    color: var(--primary);
                    border-color: var(--primary);
                }
            `}</style>
        </div>
    );
};

export default Backup;
