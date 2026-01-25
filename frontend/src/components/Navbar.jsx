import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, ClipboardList, Package, Activity, LogOut, TrendingUp, Microscope, DollarSign, Settings, UserCog, Shield, Layout, UserPlus, Bell, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Navbar = () => {
    const location = useLocation();
    const { logout, user, hasRole } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.slice(0, 5));
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={16} color="#10b981" />;
            case 'WARNING': return <AlertTriangle size={16} color="#f59e0b" />;
            case 'DANGER': return <XCircle size={16} color="#ef4444" />;
            default: return <Info size={16} color="#3b82f6" />;
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <Home size={20} />, roles: ['all'] },

        { name: 'Emergency', path: '/emergency', icon: <AlertTriangle size={20} />, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
        { name: 'Registration', path: '/registration', icon: <Users size={20} />, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
        { name: 'Appointments', path: '/appointments', icon: <Calendar size={20} />, roles: ['admin', 'receptionist', 'patient', 'doctor', 'nurse'] },
        { name: 'Records', path: '/records', icon: <ClipboardList size={20} />, roles: ['admin', 'doctor', 'nurse'] },
        { name: 'Pharmacy', path: '/pharmacy', icon: <Package size={20} />, roles: ['admin', 'pharmacist'] },
        { name: 'Inventory', path: '/inventory', icon: <Package size={20} />, roles: ['admin', 'pharmacist'] },
        { name: 'Vitals', path: '/vitals', icon: <Activity size={20} />, roles: ['admin', 'nurse'] },
        { name: 'Reports', path: '/reports', icon: <TrendingUp size={20} />, roles: ['admin', 'super_admin'] },
        { name: 'Laboratory', path: '/laboratory', icon: <Microscope size={20} />, roles: ['admin', 'lab_tech', 'doctor'] },
        { name: 'Billing', path: '/billing', icon: <DollarSign size={20} />, roles: ['admin', 'accountant'] },
        { name: 'User Management', path: '/users', icon: <UserCog size={20} />, roles: ['admin', 'super_admin'] },
        { name: 'Audit Trail', path: '/audit', icon: <Shield size={20} />, roles: ['admin'] },
        { name: 'Wards', path: '/wards', icon: <Layout size={20} />, roles: ['admin', 'doctor', 'nurse'] },
        { name: 'Admissions', path: '/admissions', icon: <UserPlus size={20} />, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
        { name: 'Backup & Recovery', path: '/backup', icon: <Shield size={20} />, roles: ['admin', 'super_admin'] },
        { name: 'My Portal', path: '/patient-portal', icon: <Settings size={20} />, roles: ['patient'] },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (hasRole('doctor')) {
            return item.name === 'Dashboard';
        }
        if (item.roles.includes('all')) return true;
        return item.roles.some(role => hasRole(role));
    });

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <Activity color="#2563eb" size={32} />
                <span>HMS Pro</span>
            </div>

            <div className="nav-links">
                {filteredNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="nav-footer">
                <div className="notif-wrapper" style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
                    <button
                        className={`nav-item ${showNotif ? 'active' : ''}`}
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                        onClick={() => setShowNotif(!showNotif)}
                    >
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="notif-badge">{unreadCount}</span>
                            )}
                            <span>Notifications</span>
                        </div>
                    </button>

                    {showNotif && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <span>Recent Notifications</span>
                                <Link to="/notifications" onClick={() => setShowNotif(false)}>View All</Link>
                            </div>
                            <div className="notif-dropdown-content">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`notif-dropdown-item ${n.isRead ? 'read' : 'unread'}`}
                                            onClick={() => !n.isRead && markAsRead(n.id)}
                                        >
                                            <div className="notif-icon-small">{getNotifIcon(n.type)}</div>
                                            <div className="notif-info">
                                                <div className="notif-title-small">{n.title}</div>
                                                <div className="notif-time-small">{new Date(n.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notif-empty">No new alerts</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile" style={{ marginBottom: '1rem', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user?.firstName}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</span>
                        </div>
                    </div>
                </div>

                <button className="nav-item logout-btn" onClick={logout} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            <style>{`
                .notif-badge {
                    position: absolute;
                    top: -8px;
                    left: 12px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    padding: 1px 5px;
                    border-radius: 10px;
                    font-weight: bold;
                    border: 2px solid var(--navbar-bg);
                }
                .notif-dropdown {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    width: 250px;
                    background: var(--card-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                    z-index: 1000;
                    margin-bottom: 0.5rem;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                }
                .notif-dropdown-header {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                    font-weight: bold;
                    color: var(--text-main);
                }
                .notif-dropdown-header a { color: var(--primary); text-decoration: none; font-size: 0.75rem; }
                
                .notif-dropdown-content { max-height: 300px; overflow-y: auto; }
                .notif-dropdown-item {
                    padding: 0.8rem 1rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    gap: 0.8rem;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-align: left;
                }
                .notif-dropdown-item:hover { background: rgba(255,255,255,0.05); }
                .notif-dropdown-item.unread { background: rgba(59, 130, 246, 0.05); }
                
                .notif-icon-small { flex-shrink: 0; margin-top: 2px; }
                .notif-info { flex: 1; }
                .notif-title-small { font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 2px; }
                .notif-time-small { font-size: 0.7rem; color: var(--text-muted); }
                .notif-empty { padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </nav>
    );
};

export default Navbar;
