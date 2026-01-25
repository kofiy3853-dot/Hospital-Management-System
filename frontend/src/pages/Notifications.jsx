import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2,
    CheckCheck, Clock, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={20} color="#10b981" />;
            case 'WARNING': return <AlertTriangle size={20} color="#f59e0b" />;
            case 'DANGER': return <XCircle size={20} color="#ef4444" />;
            default: return <Info size={20} color="#3b82f6" />;
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Updating alerts...</div>;

    return (
        <div className="notifications-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={18} /></Link>
                        <h1>Your Notifications</h1>
                    </div>
                    <p>Stay updated with the latest hospital activities and alerts.</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={markAllAsRead}
                    disabled={!notifications.some(n => !n.isRead)}
                >
                    <CheckCheck size={18} /> Mark all as read
                </button>
            </header>

            <div className="card" style={{ padding: 0 }}>
                {notifications.length > 0 ? (
                    <div className="notification-list">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                                onClick={() => !n.isRead && markAsRead(n.id)}
                            >
                                <div className="notif-icon">
                                    {getTypeIcon(n.type)}
                                </div>
                                <div className="notif-content">
                                    <div className="notif-header">
                                        <h4>{n.title}</h4>
                                        <span className="notif-time">
                                            <Clock size={12} /> {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p>{n.message}</p>
                                    {n.link && (
                                        <Link to={n.link} className="notif-link">View Details</Link>
                                    )}
                                </div>
                                {!n.isRead && <div className="unread-dot"></div>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No notifications found.</p>
                    </div>
                )}
            </div>

            <style>{`
                .notification-list { display: flex; flexDirection: column; }
                .notification-item { 
                    display: flex; 
                    gap: 1.5rem; 
                    padding: 1.5rem; 
                    border-bottom: 1px solid var(--border); 
                    transition: background 0.2s;
                    cursor: pointer;
                    position: relative;
                }
                .notification-item:last-child { border-bottom: none; }
                .notification-item.unread { background: rgba(59, 130, 246, 0.05); }
                .notification-item:hover { background: var(--bg-dark); }
                
                .notif-icon { 
                    width: 40px; 
                    height: 40px; 
                    border-radius: 50%; 
                    background: var(--bg-light); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    flex-shrink: 0;
                }
                
                .notif-content { flex: 1; }
                .notif-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
                .notif-header h4 { margin: 0; font-size: 1rem; color: var(--text-main); }
                .notif-time { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }
                
                .notif-content p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; margin-bottom: 0.8rem; }
                .notif-link { font-size: 0.85rem; color: var(--primary); font-weight: 600; text-decoration: none; }
                .notif-link:hover { text-decoration: underline; }
                
                .unread-dot { 
                    width: 8px; 
                    height: 8px; 
                    background: var(--primary); 
                    border-radius: 50%; 
                    position: absolute; 
                    top: 1.5rem; 
                    right: 0.5rem; 
                }
            `}</style>
        </div>
    );
};

export default Notifications;
