import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Users, Clock, Calendar, CreditCard, Search, 
    UserPlus, Activity, CheckCircle 
} from 'lucide-react';

const FrontDesk = () => {

    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayPatients: 0,
        waiting: 0,
        doctorsAvailable: 0,
        appointments: 0
    });
    const [activeTab, setActiveTab] = useState('queue'); // queue, patients, appointments, billing
    const [searchQuery, setSearchQuery] = useState('');
    const [queue, setQueue] = useState([]);


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {

            // In a real app, these would be proper endpoints. Mocking for UI structure first.
            const [aptRes, usersRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/users?role=doctor')
            ]);
            
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = aptRes.data.filter(a => a.dateTime.startsWith(today));
            const waiting = todayAppts.filter(a => a.status === 'Arrived' || a.status === 'Confirmed');

            setStats({
                todayPatients: todayAppts.length,
                waiting: waiting.length,
                doctorsAvailable: usersRes.data.length, // Simplified
                appointments: todayAppts.length
            });
            
            setQueue(waiting);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        }

    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // Implement search logic
    };

    return (
        <div className="front-desk-container">
            {/* Top Navigation / Header */}
            <header className="fd-header">
                <div>
                    <h1 className="brand-title">FrontDesk<span className="dot">.</span></h1>
                    <p className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn register" onClick={() => navigate('/registration')}>
                        <div className="icon-circle"><UserPlus size={18} /></div>
                        <span>New Patient</span>
                    </button>
                    <button className="action-btn book" onClick={() => navigate('/appointments')}>
                        <div className="icon-circle"><Calendar size={18} /></div>
                        <span>Book Appt</span>
                    </button>
                </div>
            </header>

            <main className="fd-main">
                {/* Statistics Row */}
                <div className="stats-row">
                    <div className="stat-card blue">
                        <div className="stat-icon"><Users size={22} /></div>
                        <div className="stat-data">
                            <h3>{stats.todayPatients}</h3>
                            <p>Total Patients</p>
                        </div>
                        <div className="stat-bg-shape"></div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-icon"><Clock size={22} /></div>
                        <div className="stat-data">
                            <h3>{stats.waiting}</h3>
                            <p>Waiting Now</p>
                        </div>
                        <div className="stat-bg-shape"></div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon"><Activity size={22} /></div>
                        <div className="stat-data">
                            <h3>{stats.doctorsAvailable}</h3>
                            <p>Doctors Active</p>
                        </div>
                        <div className="stat-bg-shape"></div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-icon"><Calendar size={22} /></div>
                        <div className="stat-data">
                            <h3>{stats.appointments}</h3>
                            <p>Appointments</p>
                        </div>
                        <div className="stat-bg-shape"></div>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="workspace-container glass-panel">
                    {/* Sidebar Navigation */}
                    <nav className="workspace-nav">
                        <button 
                            className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`}
                            onClick={() => setActiveTab('queue')}
                        >
                            <Clock size={20} />
                            <span>Live Queue</span>
                            {activeTab === 'queue' && <div className="active-indicator" />}
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
                            onClick={() => setActiveTab('patients')}
                        >
                            <Users size={20} />
                            <span>Patients</span>
                            {activeTab === 'patients' && <div className="active-indicator" />}
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('appointments')}
                        >
                            <Calendar size={20} />
                            <span>Schedule</span>
                            {activeTab === 'appointments' && <div className="active-indicator" />}
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
                            onClick={() => setActiveTab('billing')}
                        >
                            <CreditCard size={20} />
                            <span>Quick Bill</span>
                            {activeTab === 'billing' && <div className="active-indicator" />}
                        </button>
                    </nav>

                    {/* Dynamic Content Area */}
                    <section className="workspace-content">
                        <div className="content-header">
                            <div className="search-wrapper">
                                <Search size={18} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search patients, tokens, or doctors..." 
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="user-profile-sm">
                                <div className="avatar">FD</div>
                            </div>
                        </div>

                        <div className="content-body">
                            {activeTab === 'queue' && (
                                <div className="queue-view">
                                    <div className="section-title">
                                        <h3>Waiting Room</h3>
                                        <span className="badge-count">{queue.length} waiting</span>
                                    </div>
                                    <div className="queue-grid">
                                        {queue.length > 0 ? queue.map((patient, index) => (
                                            <div key={index} className="queue-ticket">
                                                <div className="qt-left">
                                                    <span className="qt-token">T-{100 + index + 1}</span>
                                                    <span className="qt-time">{patient.time}</span>
                                                </div>
                                                <div className="qt-main">
                                                    <h4>{patient.patient?.firstName} {patient.patient?.lastName}</h4>
                                                    <p>Dr. {patient.doctor?.lastName}</p>
                                                </div>
                                                <div className="qt-actions">
                                                    <button className="qt-btn call">Call</button>
                                                    <button className="qt-btn check">Arrived</button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="empty-state-modern">
                                                <div className="empty-icon"><CheckCircle size={40} /></div>
                                                <h3>All Caught Up</h3>
                                                <p>No patients currently waiting in queue</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'patients' && (
                                <div className="module-view fadeIn">
                                    <div className="view-header">
                                        <h3>Patient Directory</h3>
                                        <button className="btn-shine" onClick={() => navigate('/registration')}>
                                            <UserPlus size={16} /> Add New
                                        </button>
                                    </div>
                                    <div className="modern-table-container">
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Patient Name</th>
                                                    <th>Contact Info</th>
                                                    <th>Demographics</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div className="td-user">
                                                            <div className="td-avatar">JD</div>
                                                            <div>
                                                                <strong>John Doe</strong>
                                                                <span>#P-10234</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>055-123-4567</td>
                                                    <td><span className="tag-pill">Male, 45</span></td>
                                                    <td><button className="action-link">Edit Details</button></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="td-user">
                                                            <div className="td-avatar pink">SS</div>
                                                            <div>
                                                                <strong>Sarah Smith</strong>
                                                                <span>#P-10235</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>055-987-6543</td>
                                                    <td><span className="tag-pill">Female, 32</span></td>
                                                    <td><button className="action-link">Edit Details</button></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appointments' && (
                                <div className="module-view fadeIn">
                                    <div className="view-header">
                                        <h3>Today&apos;s Schedule</h3>
                                        <div className="filter-pills">
                                            <span className="pill active">All</span>
                                            <span className="pill">Scheduled</span>
                                            <span className="pill">Arrived</span>
                                        </div>
                                    </div>
                                    <div className="appt-cards-list">
                                        {queue.map((apt, idx) => (
                                            <div key={idx} className="appt-card-row">
                                                <div className="ac-time">{apt.time}</div>
                                                <div className="ac-details">
                                                    <strong>{apt.patient?.firstName} {apt.patient?.lastName}</strong>
                                                    <span>{apt.type} • Dr. {apt.doctor?.lastName}</span>
                                                </div>
                                                <div className="ac-status">
                                                    <span className={`status-dot ${apt.status.toLowerCase()}`}></span>
                                                    {apt.status}
                                                </div>
                                                <div className="ac-action">
                                                    <button className="btn-icon-soft"><CheckCircle size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="module-view fadeIn centering">
                                    <div className="billing-card">
                                        <div className="bc-header">
                                            <h3>Quick Receipt</h3>
                                            <p>Generate simple bills instantly</p>
                                        </div>
                                        <div className="bc-form">
                                            <div className="input-group">
                                                <label>Patient ID / Name</label>
                                                <input type="text" placeholder="Start typing..." />
                                                <Search size={16} className="input-icon" />
                                            </div>
                                            <div className="input-group">
                                                <label>Service</label>
                                                <select>
                                                    <option>Consultation Fee</option>
                                                    <option>Registration Card</option>
                                                    <option>Lab Request</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Amount (GHS)</label>
                                                <input type="number" defaultValue="150.00" />
                                            </div>
                                            <button className="btn-full-gradient">Generate & Print</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <style>{`
                :root {
                    --fd-bg: #f0f4f8;
                    --fd-primary: #3b82f6;
                    --fd-accent: #8b5cf6;
                    --fd-glass: rgba(255, 255, 255, 0.9);
                    --fd-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
                }

                .front-desk-container {
                    min-height: 100vh;
                    background: var(--fd-bg);
                    padding: 1.5rem 2rem;
                    font-family: 'Inter', system-ui, sans-serif;
                    color: #1e293b;
                }

                /* Header */
                .fd-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .brand-title {
                    font-size: 2rem;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                    color: #0f172a;
                    margin: 0;
                    display: flex;
                    align-items: center;
                }
                .brand-title .dot { color: var(--fd-primary); font-size: 3rem; line-height: 0.5; }
                .date-display { color: #64748b; font-weight: 500; margin-top: 0.2rem; }

                .header-actions { display: flex; gap: 1rem; }
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.6rem 1.2rem 0.6rem 0.6rem;
                    background: white;
                    border: 1px solid rgba(255,255,255,0.5);
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .action-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); }
                .action-btn .icon-circle {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: #f1f5f9; color: #334155;
                    display: flex; align-items: center; justify-content: center;
                    transition: 0.3s;
                }
                .action-btn:hover .icon-circle { background: var(--fd-primary); color: white; }
                .action-btn span { font-weight: 600; color: #334155; font-size: 0.95rem; }
                .action-btn.register:hover .icon-circle { background: #2563eb; }
                .action-btn.book:hover .icon-circle { background: #8b5cf6; }

                /* Stats Cards */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: var(--fd-shadow);
                    transition: transform 0.3s;
                }
                .stat-card:hover { transform: translateY(-3px); }
                .stat-icon {
                    width: 48px; height: 48px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem; z-index: 1;
                }
                .stat-card.blue .stat-icon { background: #eff6ff; color: #2563eb; }
                .stat-card.orange .stat-icon { background: #fff7ed; color: #f97316; }
                .stat-card.green .stat-icon { background: #f0fdf4; color: #16a34a; }
                .stat-card.purple .stat-icon { background: #f5f3ff; color: #8b5cf6; }
                
                .stat-data { z-index: 1; }
                .stat-data h3 { font-size: 1.8rem; font-weight: 800; margin: 0; color: #1e293b; line-height: 1.1; }
                .stat-data p { margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 500; }
                
                .stat-bg-shape {
                    position: absolute; right: -20px; top: -20px;
                    width: 100px; height: 100px; border-radius: 50%;
                    opacity: 0.05; background: currentColor; pointer-events: none;
                }
                .stat-card.blue { color: #2563eb; } /* for bg-shape currentColor */
                .stat-card.orange { color: #f97316; }
                .stat-card.green { color: #16a34a; }
                .stat-card.purple { color: #8b5cf6; }

                /* Workspace */
                .workspace-container {
                    display: flex;
                    background: white;
                    border-radius: 24px;
                    min-height: 600px;
                    box-shadow: 0 20px 40px -4px rgba(0,0,0,0.06);
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.7);
                }
                
                /* Sidebar Navigation */
                .workspace-nav {
                    width: 260px;
                    background: #f8fafc;
                    padding: 2rem 1rem;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }
                .nav-item {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 1rem 1.2rem;
                    border: none; background: transparent;
                    color: #64748b; font-weight: 600; font-size: 0.95rem;
                    cursor: pointer; border-radius: 12px;
                    transition: all 0.2s; position: relative;
                }
                .nav-item:hover { background: #e2e8f0; color: #1e293b; }
                .nav-item.active { background: white; color: #2563eb; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.05); }
                .active-indicator {
                    position: absolute; left: 0; top: 50%; transform: translateY(-50%);
                    width: 4px; height: 20px; background: #2563eb;
                    border-radius: 0 4px 4px 0;
                }

                /* Content Area */
                .workspace-content { flex: 1; display: flex; flex-direction: column; }
                
                .content-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .search-wrapper {
                    position: relative; width: 400px;
                }
                .search-wrapper input {
                    width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem;
                    border-radius: 12px; border: 1px solid #e2e8f0;
                    background: #f8fafc; font-size: 0.95rem;
                    transition: 0.2s; outline: none;
                }
                .search-wrapper input:focus { background: white; border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,0.1); }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                
                .user-profile-sm .avatar {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white; font-weight: 700; font-size: 0.9rem;
                    display: flex; align-items: center; justify-content: center;
                }

                .content-body { padding: 2rem; flex: 1; background: #fff; overflow-y: auto; }

                /* Queue View */
                .section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .section-title h3 { font-size: 1.4rem; font-weight: 700; margin: 0; color: #1e293b; }
                .badge-count { background: #fef3c7; color: #d97706; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
                
                .queue-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;
                }
                .queue-ticket {
                    border: 1px solid #e2e8f0; border-radius: 16px;
                    padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem;
                    position: relative; overflow: hidden;
                    transition: 0.3s; background: white;
                }
                .queue-ticket:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(0,0,0,0.08); border-color: #cbd5e1; }
                .queue-ticket::before {
                    content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%;
                    background: linear-gradient(to bottom, #3b82f6, #60a5fa);
                }
                .qt-left { display: flex; justify-content: space-between; align-items: center; }
                .qt-token { font-family: 'Monaco', monospace; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 700; color: #334155; }
                .qt-time { font-size: 0.85rem; color: #94a3b8; }
                .qt-main h4 { margin: 0 0 0.2rem 0; font-size: 1.1rem; color: #0f172a; }
                .qt-main p { margin: 0; font-size: 0.9rem; color: #64748b; }
                .qt-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: auto; }
                .qt-btn { border: none; padding: 0.6rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .qt-btn.call { background: #eff6ff; color: #2563eb; }
                .qt-btn.call:hover { background: #dbeafe; }
                .qt-btn.check { background: #0f172a; color: white; }
                .qt-btn.check:hover { background: #334155; }

                /* Empty State */
                .empty-state-modern {
                    grid-column: 1/-1; text-align: center; padding: 4rem 2rem;
                    background: #f8fafc; border-radius: 20px; border: 2px dashed #e2e8f0;
                }
                .empty-icon { color: #cbd5e1; margin-bottom: 1rem; }
                .empty-state-modern h3 { color: #64748b; margin: 0; font-weight: 600; }
                .empty-state-modern p { color: #94a3b8; }

                /* Tables */
                .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .btn-shine {
                    background: linear-gradient(135deg, #2563eb, #4f46e5);
                    color: white; border: none; padding: 0.7rem 1.4rem;
                    border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;
                    cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
                }
                .modern-table-container { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .modern-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
                .modern-table tr:last-child td { border-bottom: none; }
                .modern-table tr:hover td { background: #f8fafc; }
                
                .td-user { display: flex; align-items: center; gap: 1rem; }
                .td-avatar { width: 36px; height: 36px; border-radius: 50%; background: #bfdbfe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
                .td-avatar.pink { background: #fbcfe8; color: #be185d; }
                .tag-pill { background: #f1f5f9; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; color: #475569; font-weight: 500; }
                .action-link { background: none; border: none; color: #2563eb; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
                .action-link:hover { text-decoration: underline; }

                /* Appointments */
                .filter-pills { display: flex; gap: 0.5rem; background: #f1f5f9; padding: 0.3rem; border-radius: 10px; }
                .pill { padding: 0.4rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.2s; }
                .pill.active { background: white; color: #0f172a; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                
                .appt-card-row {
                    display: flex; align-items: center; padding: 1.2rem;
                    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
                    margin-bottom: 0.8rem; transition: 0.2s;
                }
                .appt-card-row:hover { border-color: #94a3b8; transform: translateX(5px); }
                .ac-time { font-weight: 700; color: #0f172a; width: 80px; }
                .ac-details { flex: 1; display: flex; flex-direction: column; }
                .ac-details strong { font-size: 1rem; color: #1e293b; }
                .ac-details span { font-size: 0.85rem; color: #64748b; }
                .ac-status { display: flex; align-items: center; gap: 0.5rem; width: 120px; font-size: 0.9rem; font-weight: 500; text-transform: capitalize; }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
                .status-dot.confirmed { background: #16a34a; }
                .status-dot.arrived { background: #2563eb; }
                .btn-icon-soft { width: 36px; height: 36px; border-radius: 8px; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .btn-icon-soft:hover { background: #2563eb; color: white; }

                /* Billing */
                .centering { display: flex; justify-content: center; align-items: center; height: 100%; }
                .billing-card {
                    width: 450px; background: white; border-radius: 20px;
                    padding: 2.5rem; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
                    border: 1px solid #f1f5f9;
                }
                .bc-header { text-align: center; margin-bottom: 2rem; }
                .bc-header h3 { font-size: 1.5rem; color: #0f172a; margin: 0 0 0.5rem 0; }
                .bc-header p { color: #64748b; margin: 0; }
                
                .input-group { margin-bottom: 1.2rem; position: relative; }
                .input-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
                .input-group input, .input-group select {
                    width: 100%; padding: 0.8rem 1rem; border-radius: 10px;
                    border: 1px solid #cbd5e1; font-size: 1rem; color: #1e293b; outline: none; transition: 0.2s;
                }
                .input-group input:focus, .input-group select:focus { border-color: #3b82f6; ring: 2px solid #bfdbfe; }
                .input-icon { position: absolute; right: 1rem; bottom: 0.9rem; color: #94a3b8; }
                
                .btn-full-gradient {
                    width: 100%; padding: 0.9rem; border: none; border-radius: 10px;
                    background: linear-gradient(135deg, #2563eb, #6366f1);
                    color: white; font-weight: 700; font-size: 1rem;
                    cursor: pointer; margin-top: 1rem; transition: 0.3s;
                    box-shadow: 0 10px 20px -5px rgba(37,99,235,0.4);
                }
                .btn-full-gradient:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(37,99,235,0.5); }

                /* Animations */
                .fadeIn { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default FrontDesk;
