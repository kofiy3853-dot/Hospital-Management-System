import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Microscope, Search, Beaker, CheckCircle, Clock, X } from 'lucide-react';

const Laboratory = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);
    const [activeTab, setActiveTab] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [resultData, setResultData] = useState({ status: 'Completed', result: {}, notes: '' });

    const fetchTests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/lab/tests');
            setTests(data);
        } catch (err) {
            console.error('Failed to fetch lab tests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const filteredTests = tests.filter(test => {
        const matchesTab = activeTab === 'All' || test.status === activeTab;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            test.testName.toLowerCase().includes(searchLower) ||
            test.patient?.firstName.toLowerCase().includes(searchLower) ||
            test.patient?.lastName.toLowerCase().includes(searchLower) ||
            test.testCategory.toLowerCase().includes(searchLower);
        return matchesTab && matchesSearch;
    });

    const handleUpdateResult = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/lab/result/${selectedTest.id}`, resultData);
            setSelectedTest(null);
            fetchTests();
            alert('Lab results updated successfully.');
        } catch (err) {
            alert('Failed to update lab results');
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const tabs = ['Pending', 'In Progress', 'Completed', 'All'];

    return (
        <div className="lab-page">
            <header className="page-header">
                <div>
                    <h1>Laboratory Module</h1>
                    <p>Manage diagnostic requests and patient results</p>
                </div>
            </header>

            <div className="lab-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card stat-card-ui" onClick={() => setActiveTab('Pending')} style={{ cursor: 'pointer', border: activeTab === 'Pending' ? '2px solid var(--warning)' : 'none' }}>
                    <Clock color="var(--warning)" size={24} />
                    <div className="stat-info">
                        <h3>{tests.filter(t => t.status === 'Pending').length}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="card stat-card-ui" onClick={() => setActiveTab('In Progress')} style={{ cursor: 'pointer', border: activeTab === 'In Progress' ? '2px solid var(--primary)' : 'none' }}>
                    <Beaker color="var(--primary)" size={24} />
                    <div className="stat-info">
                        <h3>{tests.filter(t => t.status === 'In Progress').length}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
                <div className="card stat-card-ui" onClick={() => setActiveTab('Completed')} style={{ cursor: 'pointer', border: activeTab === 'Completed' ? '2px solid var(--success)' : 'none' }}>
                    <CheckCircle color="var(--success)" size={24} />
                    <div className="stat-info">
                        <h3>{tests.filter(t => t.status === 'Completed').length}</h3>
                        <p>Completed Tests</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                <div className="queue-controls" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="tabs" style={{ display: 'flex', gap: '0.5rem' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search by patient or test..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'inherit' }} 
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading queue...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Test Name</th>
                                    <th>Requested By</th>
                                    <th>Requested At</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTests.length > 0 ? filteredTests.map((test) => (
                                    <tr key={test.id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{test.patient?.firstName} {test.patient?.lastName}</div>
                                            <small style={{ color: 'var(--text-muted)' }}>
                                                {test.patient?.dateOfBirth ? `Age: ${calculateAge(test.patient.dateOfBirth)}` : ''}
                                                {test.patient?.gender ? ` | ${test.patient.gender}` : ''}
                                            </small>
                                        </td>
                                        <td>{test.testName} <br /><small style={{ color: 'var(--text-muted)' }}>{test.testCategory}</small></td>
                                        <td>Dr. {test.doctor?.lastName}</td>
                                        <td>{new Date(test.createdAt).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge`} style={{
                                                background: test.status === 'Pending' ? 'var(--warning)' :
                                                    test.status === 'In Progress' ? 'var(--primary)' : 'var(--success)',
                                                color: '#fff',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td>
                                            {test.status !== 'Completed' ? (
                                                <button className="btn btn-sm btn-primary" onClick={() => {
                                                    setSelectedTest(test);
                                                    setResultData({ status: test.status === 'Pending' ? 'In Progress' : 'Completed', result: test.result || {}, notes: test.notes || '' });
                                                }}>Process</button>
                                            ) : (
                                                <button className="btn btn-sm btn-outline" onClick={() => setSelectedTest(test)}>View Details</button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <Microscope size={48} style={{ opacity: 0.2 }} />
                                                <p>No tests found in the {activeTab} queue.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedTest && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '500px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Process Lab Result</h2>
                            <button className="icon-btn" onClick={() => setSelectedTest(null)}><X size={20} /></button>
                        </div>
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <p><strong>Patient:</strong> {selectedTest.patient?.firstName} {selectedTest.patient?.lastName}</p>
                            <small style={{ color: 'var(--text-muted)' }}>
                                {selectedTest.patient?.dateOfBirth ? `Age: ${calculateAge(selectedTest.patient.dateOfBirth)}` : ''}
                                {selectedTest.patient?.gender ? ` | ${selectedTest.patient.gender}` : ''}
                            </small>
                            <p style={{marginTop: '0.5rem'}}><strong>Test:</strong> {selectedTest.testName}</p>
                        </div>
                        <form onSubmit={handleUpdateResult} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={resultData.status} onChange={(e) => setResultData({ ...resultData, status: e.target.value })}>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Internal Notes / Findings</label>
                                <textarea
                                    rows="4"
                                    className="input-field"
                                    value={resultData.notes}
                                    onChange={(e) => setResultData({ ...resultData, notes: e.target.value })}
                                    placeholder="Enter findings and observations here..."
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Result Data (JSON Format - Optional)</label>
                                <textarea
                                    rows="3"
                                    className="input-field"
                                    placeholder='e.g. {"hemoglobin": "14.5", "unit": "g/dL"}'
                                    onChange={(e) => {
                                        try {
                                            const json = JSON.parse(e.target.value);
                                            setResultData({ ...resultData, result: json });
                                        } catch (err) { 
                                            console.error('JSON Parse error:', err);
                                        }
                                    }}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Results</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .stat-card-ui { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; }
                .stat-info h3 { margin: 0; font-size: 1.5rem; }
                .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-field { padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; background: rgba(255,255,255,0.05); color: var(--text); outline: none; transition: border-color 0.2s; }
                .input-field:focus { border-color: var(--primary); }
            `}</style>
        </div>
    );
};

export default Laboratory;
