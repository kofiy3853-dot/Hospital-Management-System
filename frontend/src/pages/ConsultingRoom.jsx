import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { 
    Users, Clock, Activity, X, Save, FileText,
    ExternalLink, CheckCircle, Microscope,
    Stethoscope, Pill, UserPlus, Search,
    ChevronRight, Heart, Thermometer, Weight, Clipboard,
    Phone, Calendar, Hash, Home
} from 'lucide-react';

const ConsultingRoom = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApt, setSelectedApt] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [labResults, setLabResults] = useState([]);
    const [activeRecord, setActiveRecord] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('notes'); // notes, orders, history

    // Form States
    const [consultForm, setConsultForm] = useState({
        symptoms: '',
        soapNotes: {
            subjective: '',
            objective: '',
            assessment: '',
            plan: ''
        },
        prescriptions: [],
        labOrders: [],
        decision: 'discharge', // discharge, admit, refer
        attachments: []
    });

    const [newMed, setNewMed] = useState({ name: '', dosage: '', duration: '' });
    const [newLab, setNewLab] = useState({ testName: '', category: 'General' });

    const fetchQueue = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/appointments');
            // Filter: Confirmed/Arrived status and assigned to this doctor
            const doctorQueue = data.filter(a => 
                (a.status === 'Confirmed' || a.status === 'Arrived') && 
                a.doctorId === user?.id
            );
            setQueue(doctorQueue);
        } catch (err) {
            console.error('Failed to fetch queue');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchQueue();
    }, [user?.id, fetchQueue]);

    const handleSelectPatient = async (apt) => {
        setSelectedApt(apt);
        setActiveTab('notes'); // Reset to notes tab
        setLoading(true);
        try {
            const [histRes, recordRes, labRes] = await Promise.all([
                api.get(`/medical-records/patient/${apt.patientId}`),
                api.get(`/medical-records/appointment/${apt.id}`),
                api.get(`/lab/patient/${apt.patientId}`)
            ]);
            setPatientHistory(histRes.data);
            setActiveRecord(recordRes.data);
            setLabResults(labRes.data);
            
            // Pre-fill form if record already exists (e.g. vitals recorded)
            if (recordRes.data) {
                setConsultForm(prev => ({
                    ...prev,
                    soapNotes: {
                        ...prev.soapNotes,
                        objective: recordRes.data.vitals ? 
                            `T: ${recordRes.data.vitals.temperature}°C, BP: ${recordRes.data.vitals.bloodPressure}, P: ${recordRes.data.vitals.pulseRate}` : ''
                    }
                }));
            }
        } catch (err) {
            console.error('Failed to fetch patient data');
        } finally {
            setLoading(false);
        }
    };

    const handleSoapChange = (field, value) => {
        setConsultForm(prev => ({
            ...prev,
            soapNotes: { ...prev.soapNotes, [field]: value }
        }));
    };

    const addPrescription = () => {
        if (!newMed.name || !newMed.dosage) return;
        setConsultForm(prev => ({
            ...prev,
            prescriptions: [...prev.prescriptions, { ...newMed, id: Date.now() }]
        }));
        setNewMed({ name: '', dosage: '', duration: '' });
    };

    const addLabOrder = () => {
        if (!newLab.testName) return;
        setConsultForm(prev => ({
            ...prev,
            labOrders: [...prev.labOrders, { ...newLab, id: Date.now() }]
        }));
        setNewLab({ testName: '', category: 'General' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/medical-records/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setConsultForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, { name: file.name, url: data.url, type: file.type }]
            }));
        } catch (err) {
            alert('Failed to upload file');
        }
    };



    const endConsultation = async () => {
        try {
            const payload = {
                patientId: selectedApt.patientId,
                appointmentId: selectedApt.id,
                vitals: activeRecord?.vitals || {}, // Keep existing vitals
                symptoms: consultForm.symptoms.split(',').map(s => s.trim()),
                diagnosis: consultForm.soapNotes.assessment,
                treatmentPlan: consultForm.soapNotes.plan,
                soapNotes: consultForm.soapNotes,
                prescriptions: consultForm.prescriptions,
                labOrders: consultForm.labOrders,
                attachments: consultForm.attachments,
                status: 'Completed'
            };

            // Update or Create Record
            if (activeRecord) {
                await api.put(`/medical-records/${activeRecord.id}`, payload);
            } else {
                await api.post('/medical-records', payload);
            }

            // Mark Appointment as Completed
            await api.put(`/appointments/${selectedApt.id}/status`, { status: 'Completed' });

            // Handle Admissions if needed
            if (consultForm.decision === 'admit') {
                navigate('/admissions', { state: { patient: selectedApt.patient, reason: consultForm.soapNotes.assessment } });
            } else {
                setSelectedApt(null);
                fetchQueue();
                alert('Consultation completed successfully!');
            }
        } catch (err) {
            alert('Failed to end consultation');
        }
    };

    const filteredQueue = queue.filter(apt => {
        const fullName = `${apt.patient?.firstName} ${apt.patient?.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    if (loading && !selectedApt) return <div className="loading-state">Initializing Clinical Portal...</div>;

    return (
        <div className="consulting-room">
            {/* Sidebar Queue */}
            <aside className="clinical-sidebar">
                <div className="sidebar-header">
                    <h3><Users size={20} /> Today&apos;s Queue</h3>
                    <span className="badge">{filteredQueue.length} Waiting</span>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="queue-list">
                    {filteredQueue.length > 0 ? filteredQueue.map(apt => (
                        <div 
                            key={apt.id} 
                            className={`queue-item ${selectedApt?.id === apt.id ? 'active' : ''}`}
                            onClick={() => handleSelectPatient(apt)}
                        >
                            <div className="patient-avatar">
                                {apt.patient?.firstName?.charAt(0)}{apt.patient?.lastName?.charAt(0)}
                            </div>
                            <div className="patient-info">
                                <span className="name">{apt.patient?.firstName} {apt.patient?.lastName}</span>
                                <span className="time">{new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <ChevronRight size={16} />
                        </div>
                    )) : (
                        <div className="empty-queue">
                            <Clock size={32} />
                            <p>No patients in queue</p>
                        </div>
                    )}
                </div>
                <button className="call-next-btn btn btn-primary" onClick={() => queue[0] && handleSelectPatient(queue[0])}>
                    Call Next Patient
                </button>
            </aside>

            {/* Main Clinical Panel */}
            <main className="clinical-panel">
                {selectedApt ? (
                    <div className="active-consultation">
                        {/* Enhanced Patient Header */}
                        <header className="patient-header-modern">
                            <div className="patient-info-grid">
                                {/* Patient Name Section */}
                                <div className="patient-name-card">
                                    <h1>{selectedApt.patient?.firstName} {selectedApt.patient?.lastName}</h1>
                                    <div className="patient-quick-info">
                                        <span className="info-badge gender">{selectedApt.patient?.gender}</span>
                                        <span className="info-badge age">{selectedApt.patient?.age || 'N/A'} years</span>
                                    </div>
                                </div>

                                {/* Patient Details Cards */}
                                <div className="patient-details-cards">
                                    <div className="detail-card">
                                        <Hash size={16} />
                                        <div className="detail-content">
                                            <span className="detail-label">Hospital No</span>
                                            <span className="detail-value">#{selectedApt.patient?.id?.slice(-8) || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <Home size={16} />
                                        <div className="detail-content">
                                            <span className="detail-label">Room No</span>
                                            <span className="detail-value">{selectedApt.patient?.roomNumber || 'Outpatient'}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <Calendar size={16} />
                                        <div className="detail-content">
                                            <span className="detail-label">Date of Birth</span>
                                            <span className="detail-value">
                                                {selectedApt.patient?.dateOfBirth 
                                                    ? new Date(selectedApt.patient.dateOfBirth).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })
                                                    : 'N/A'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <Phone size={16} />
                                        <div className="detail-content">
                                            <span className="detail-label">Contact</span>
                                            <span className="detail-value">{selectedApt.patient?.phone || selectedApt.patient?.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vitals Section */}
                            <div className="vitals-section">
                                <h3 className="vitals-title">Vital Signs</h3>
                                <div className="vitals-modern">
                                    {activeRecord?.vitals ? (
                                        <>
                                            <div className="vital-card temp">
                                                <Thermometer size={18} />
                                                <div className="vital-data">
                                                    <span className="vital-value">{activeRecord.vitals.temperature}°C</span>
                                                    <span className="vital-label">Temperature</span>
                                                </div>
                                            </div>
                                            <div className="vital-card bp">
                                                <Heart size={18} />
                                                <div className="vital-data">
                                                    <span className="vital-value">{activeRecord.vitals.bloodPressure}</span>
                                                    <span className="vital-label">Blood Pressure</span>
                                                </div>
                                            </div>
                                            <div className="vital-card pulse">
                                                <Activity size={18} />
                                                <div className="vital-data">
                                                    <span className="vital-value">{activeRecord.vitals.pulseRate} bpm</span>
                                                    <span className="vital-label">Pulse Rate</span>
                                                </div>
                                            </div>
                                            <div className="vital-card weight">
                                                <Weight size={18} />
                                                <div className="vital-data">
                                                    <span className="vital-value">{activeRecord.vitals.weight} kg</span>
                                                    <span className="vital-label">Weight</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : <span className="no-vitals">⚠️ Vitals not recorded</span>}
                                </div>
                            </div>
                        </header>

                        {/* Tabbed Interface */}
                        <div className="tabs-container">
                            <div className="tabs-header">
                                <button 
                                    className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('notes')}
                                >
                                    <Clipboard size={16} />
                                    Clinical Notes
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('orders')}
                                >
                                    <Pill size={16} />
                                    Orders
                                    {(consultForm.prescriptions.length + consultForm.labOrders.length) > 0 && (
                                        <span className="tab-badge">{consultForm.prescriptions.length + consultForm.labOrders.length}</span>
                                    )}
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <FileText size={16} />
                                    History & Results
                                </button>
                            </div>

                            <div className="tab-content">
                                {/* Clinical Notes Tab */}
                                {activeTab === 'notes' && (
                                     <div className="tab-panel">
                                        <div className="soap-notes-modern">
                                            <div className="form-group-modern">
                                                <label><Stethoscope size={16} /> Chief Complaint / Symptoms</label>
                                                <textarea 
                                                    placeholder="Enter patient symptoms (comma-separated)..." 
                                                    value={consultForm.symptoms}
                                                    onChange={(e) => setConsultForm(prev => ({ ...prev, symptoms: e.target.value }))}
                                                    rows="2"
                                                />
                                            </div>
                                            <div className="soap-grid">
                                                <div className="form-group-modern">
                                                    <label>S - Subjective</label>
                                                    <textarea 
                                                        placeholder="Patient describes their symptoms and concerns..." 
                                                        value={consultForm.soapNotes.subjective}
                                                        onChange={(e) => handleSoapChange('subjective', e.target.value)}
                                                        rows="4"
                                                    />
                                                </div>
                                                <div className="form-group-modern">
                                                    <label>O - Objective</label>
                                                    <textarea 
                                                        placeholder="Physical examination findings, vitals..." 
                                                        value={consultForm.soapNotes.objective}
                                                        onChange={(e) => handleSoapChange('objective', e.target.value)}
                                                        rows="4"
                                                    />
                                                </div>
                                                <div className="form-group-modern">
                                                    <label>A - Assessment</label>
                                                    <textarea 
                                                        placeholder="Clinical diagnosis or impression..." 
                                                        value={consultForm.soapNotes.assessment}
                                                        onChange={(e) => handleSoapChange('assessment', e.target.value)}
                                                        rows="4"
                                                    />
                                                </div>
                                                <div className="form-group-modern">
                                                    <label>P - Plan</label>
                                                    <textarea 
                                                        placeholder="Treatment plan and next steps..." 
                                                        value={consultForm.soapNotes.plan}
                                                        onChange={(e) => handleSoapChange('plan', e.target.value)}
                                                        rows="4"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* File Attachments Section */}
                                            <div className="form-group-modern">
                                                <label><FileText size={16} /> Medical Attachments</label>
                                                <div className="file-upload-container">
                                                    <input 
                                                        type="file" 
                                                        id="file-upload"
                                                        onChange={handleFileUpload}
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="file-upload" className="file-upload-btn">
                                                        <FileText size={18} />
                                                        Upload Document
                                                    </label>
                                                    <span className="file-upload-hint">PDF, Images, or Word documents</span>
                                                </div>
                                                {consultForm.attachments.length > 0 && (
                                                    <div className="attachments-list">
                                                        {consultForm.attachments.map((att, idx) => (
                                                            <div key={idx} className="attachment-item">
                                                                <FileText size={16} />
                                                                <span className="attachment-name">{att.name}</span>
                                                                <button 
                                                                    className="remove-attachment"
                                                                    onClick={() => setConsultForm(prev => ({
                                                                        ...prev,
                                                                        attachments: prev.attachments.filter((_, i) => i !== idx)
                                                                    }))}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Orders Tab */}
                                {activeTab === 'orders' && (
                                    <div className="tab-panel">
                                        <div className="orders-grid">
                                            <div className="order-section">
                                                <h3><Pill size={18} /> Prescriptions</h3>
                                                <div className="order-input-modern">
                                                    <input type="text" placeholder="Medication Name" value={newMed.name} onChange={(e) => setNewMed({...newMed, name: e.target.value})} />
                                                    <div className="input-row">
                                                        <input type="text" placeholder="Dosage" value={newMed.dosage} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})} />
                                                        <input type="text" placeholder="Duration" value={newMed.duration} onChange={(e) => setNewMed({...newMed, duration: e.target.value})} />
                                                    </div>
                                                    <button className="btn btn-primary" onClick={addPrescription}>Add Prescription</button>
                                                </div>
                                                <div className="items-list">
                                                    {consultForm.prescriptions.map(p => (
                                                        <div key={p.id} className="item-card">
                                                            <div className="item-info">
                                                                <strong>{p.name}</strong>
                                                                <span>{p.dosage} • {p.duration}</span>
                                                            </div>
                                                            <button className="remove-btn" onClick={() => setConsultForm(prev => ({ ...prev, prescriptions: prev.prescriptions.filter(i => i.id !== p.id)}))}>
                                                                <X size={16}/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {consultForm.prescriptions.length === 0 && <p className="empty-state">No prescriptions added</p>}
                                                </div>
                                            </div>

                                            <div className="order-section">
                                                <h3><Microscope size={18} /> Lab Tests</h3>
                                                <div className="order-input-modern">
                                                    <input type="text" placeholder="Test Name" value={newLab.testName} onChange={(e) => setNewLab({...newLab, testName: e.target.value})} />
                                                    <button className="btn btn-primary" onClick={addLabOrder}>Order Lab Test</button>
                                                </div>
                                                <div className="items-list">
                                                    {consultForm.labOrders.map(l => (
                                                        <div key={l.id} className="item-card">
                                                            <div className="item-info">
                                                                <strong>{l.testName}</strong>
                                                            </div>
                                                            <button className="remove-btn" onClick={() => setConsultForm(prev => ({ ...prev, labOrders: prev.labOrders.filter(i => i.id !== l.id)}))}>
                                                                <X size={16}/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {consultForm.labOrders.length === 0 && <p className="empty-state">No lab tests ordered</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* History & Results Tab */}
                                {activeTab === 'history' && (
                                    <div className="tab-panel">
                                        <div className="history-grid">
                                            <div className="history-section">
                                                <h3><FileText size={18} /> Clinical History</h3>
                                                <div className="history-timeline">
                                                    {patientHistory.length > 0 ? patientHistory.map(record => (
                                                        <div key={record.id} className="history-card">
                                                            <div className="history-header">
                                                                <strong>{new Date(record.createdAt).toLocaleDateString()}</strong>
                                                                <span>Dr. {record.doctor?.lastName}</span>
                                                            </div>
                                                            <div className="history-diagnosis">{record.diagnosis}</div>
                                                            <div className="history-plan">{record.treatmentPlan}</div>
                                                        </div>
                                                    )) : <p className="empty-state">First visit - No previous records</p>}
                                                </div>
                                            </div>

                                            <div className="history-section">
                                                <h3><Microscope size={18} /> Lab Results</h3>
                                                <div className="lab-timeline">
                                                    {labResults.length > 0 ? labResults.map(lab => (
                                                        <div key={lab.id} className="lab-card">
                                                            <div className="lab-header">
                                                                <strong>{lab.testName}</strong>
                                                                <span className={`status-badge ${lab.status.toLowerCase()}`}>{lab.status}</span>
                                                            </div>
                                                            <div className="lab-date">{new Date(lab.createdAt).toLocaleDateString()}</div>
                                                            {lab.status === 'Completed' && lab.result && (
                                                                <div className="lab-results">
                                                                    {Object.entries(lab.result).map(([k, v]) => (
                                                                        <div key={k} className="result-item">
                                                                            <span>{k}:</span>
                                                                            <strong>{v}</strong>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )) : <p className="empty-state">No lab tests on record</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Decision Panel */}
                        <div className="decision-panel-modern">
                            <div className="decision-options">
                                <button 
                                    className={`decision-btn discharge ${consultForm.decision === 'discharge' ? 'active' : ''}`} 
                                    onClick={() => setConsultForm({...consultForm, decision: 'discharge'})}
                                >
                                    <CheckCircle size={20} />
                                    <span>Discharge</span>
                                </button>
                                <button 
                                    className={`decision-btn admit ${consultForm.decision === 'admit' ? 'active' : ''}`} 
                                    onClick={() => setConsultForm({...consultForm, decision: 'admit'})}
                                >
                                    <UserPlus size={20} />
                                    <span>Admit</span>
                                </button>
                                <button 
                                    className={`decision-btn refer ${consultForm.decision === 'refer' ? 'active' : ''}`} 
                                    onClick={() => setConsultForm({...consultForm, decision: 'refer'})}
                                >
                                    <ExternalLink size={20} />
                                    <span>Refer</span>
                                </button>
                            </div>
                            <button className="btn-end-consultation" onClick={endConsultation}>
                                <Save size={20} />
                                End Consultation
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-panel">
                        <Stethoscope size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                        <h3>Professional Clinical Workspace</h3>
                        <p>Select a patient from the queue to start a consultation</p>
                    </div>
                )}
            </main>

            <style>{`
                .consulting-room { display: flex; height: calc(100vh - 40px); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow: hidden; }
                
                /* Sidebar */
                .clinical-sidebar { width: 340px; background: white; border-right: none; display: flex; flex-direction: column; padding: 1.5rem; box-shadow: 4px 0 24px rgba(0,0,0,0.1); }
                .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .sidebar-header h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin: 0; }
                .badge { background: linear-gradient(135deg, var(--primary), #667eea); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
                
                .search-box { position: relative; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1rem; border: 2px solid #e5e7eb; border-radius: 12px; background: #f9fafb; transition: all 0.3s; }
                .search-box:focus-within { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1); }
                .search-box input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.9rem; }
                .search-box svg { color: var(--text-muted); }
                .clear-search { border: none; background: none; cursor: pointer; color: var(--text-muted); padding: 0; display: flex; align-items: center; transition: color 0.2s; }
                .clear-search:hover { color: var(--danger); }
                
                .queue-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6rem; padding-right: 0.5rem; }
                .queue-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 14px; cursor: pointer; border: 2px solid transparent; transition: all 0.3s; background: #f9fafb; }
                .queue-item:hover { background: #f3f4f6; transform: translateX(4px); }
                .queue-item.active { background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(102, 126, 234, 0.15)); border-color: var(--primary); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2); }
                .patient-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #667eea); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; }
                .patient-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
                .patient-info .name { font-weight: 600; font-size: 0.95rem; color: #111827; }
                .patient-info .time { font-size: 0.8rem; color: var(--text-muted); }
                .call-next-btn { margin-top: 1rem; width: 100%; padding: 1rem; font-weight: 600; border-radius: 12px; }
                .empty-queue { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; color: var(--text-muted); opacity: 0.5; }
                
                /* Main Panel */
                .clinical-panel { flex: 1; overflow-y: auto; padding: 2rem; background: #f8f9fa; }
                .active-consultation { max-width: 1400px; margin: 0 auto; }
                
                /* Modern Patient Header */
                .patient-header-modern { background: white; border-radius: 20px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                
                .patient-info-grid { margin-bottom: 2rem; }
                .patient-name-card { margin-bottom: 1.5rem; }
                .patient-name-card h1 { font-size: 2.2rem; font-weight: 700; color: #111827; margin: 0 0 0.8rem 0; }
                .patient-quick-info { display: flex; gap: 0.8rem; }
                .info-badge { padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
                .info-badge.gender { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af; }
                .info-badge.age { background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #9f1239; }
                
                .patient-details-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .detail-card { display: flex; align-items: center; gap: 1rem; padding: 1.2rem; background: linear-gradient(135deg, #f8f9fa, #ffffff); border: 1px solid #e5e7eb; border-radius: 12px; transition: all 0.3s; }
                .detail-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .detail-card svg { color: var(--primary); flex-shrink: 0; }
                .detail-content { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
                .detail-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                .detail-value { font-size: 0.95rem; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                
                .vitals-section { }
                .vitals-title { font-size: 1rem; font-weight: 600; color: #374151; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .vitals-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
                .vital-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 12px; background: linear-gradient(135deg, #f8f9fa, #ffffff); border: 1px solid #e5e7eb; }
                .vital-card svg { color: var(--primary); }
                .vital-data { display: flex; flex-direction: column; }
                .vital-value { font-size: 1.1rem; font-weight: 700; color: #111827; }
                .vital-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .no-vitals { color: #f59e0b; font-weight: 600; font-size: 0.9rem; }
                
                /* Tabs */
                .tabs-container { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 2rem; }
                .tabs-header { display: flex; border-bottom: 2px solid #f3f4f6; background: #fafbfc; }
                .tab { flex: 1; padding: 1.2rem 1.5rem; border: none; background: transparent; cursor: pointer; font-weight: 600; color: var(--text-muted); transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; position: relative; }
                .tab:hover { background: rgba(var(--primary-rgb), 0.05); color: var(--primary); }
                .tab.active { color: var(--primary); background: white; }
                .tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: var(--primary); }
                .tab-badge { background: var(--primary); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; font-weight: 700; }
                
                .tab-content { padding: 2rem; min-height: 500px; }
                .tab-panel { animation: fadeIn 0.3s ease; }
                
                /* SOAP Notes */
                .soap-notes-modern { }
                .form-group-modern { margin-bottom: 1.5rem; }
                .form-group-modern label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; font-size: 0.95rem; }
                .form-group-modern textarea { width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; font-family: inherit; resize: vertical; transition: all 0.3s; }
                .form-group-modern textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1); }
                .soap-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                
                /* Orders */
                .orders-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
                .order-section h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin-bottom: 1rem; color: #111827; }
                .order-input-modern { background: #f9fafb; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; }
                .order-input-modern input { width: 100%; padding: 0.8rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; margin-bottom: 0.5rem; }
                .order-input-modern input:focus { outline: none; border-color: var(--primary); }
                .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
                .order-input-modern button { width: 100%; margin-top: 0.5rem; padding: 0.8rem; border-radius: 8px; font-weight: 600; }
                
                .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .item-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; transition: all 0.2s; }
                .item-card:hover { background: #f3f4f6; }
                .item-info { display: flex; flex-direction: column; gap: 0.2rem; }
                .item-info strong { color: #111827; font-size: 0.95rem; }
                .item-info span { color: var(--text-muted); font-size: 0.85rem; }
                .remove-btn { border: none; background: #fee2e2; color: #dc2626; padding: 0.5rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
                .remove-btn:hover { background: #fecaca; }
                
                /* History */
                .history-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
                .history-section h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin-bottom: 1rem; color: #111827; }
                .history-timeline, .lab-timeline { display: flex; flex-direction: column; gap: 1rem; }
                .history-card, .lab-card { padding: 1.5rem; background: #f9fafb; border-left: 4px solid var(--primary); border-radius: 10px; }
                .history-header, .lab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .history-header strong, .lab-header strong { color: #111827; font-size: 0.95rem; }
                .history-diagnosis { font-weight: 600; color: #374151; margin: 0.5rem 0; }
                .history-plan { color: var(--text-muted); font-size: 0.9rem; }
                .lab-date { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem; }
                .status-badge { padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-badge.completed { background: #d1fae5; color: #065f46; }
                .status-badge.pending { background: #fef3c7; color: #92400e; }
                .lab-results { margin-top: 1rem; padding: 1rem; background: white; border-radius: 8px; }
                .result-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; }
                .result-item:last-child { border-bottom: none; }
                
                /* Decision Panel */
                .decision-panel-modern { background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .decision-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
                .decision-btn { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem; border: 2px solid #e5e7eb; border-radius: 14px; background: white; cursor: pointer; font-weight: 600; transition: all 0.3s; }
                .decision-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .decision-btn.active { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.05); color: var(--primary); }
                .decision-btn.discharge.active { border-color: #10b981; background: rgba(16, 185, 129, 0.05); color: #10b981; }
                .decision-btn.admit.active { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); color: #f59e0b; }
                .decision-btn.refer.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); color: #3b82f6; }
                
                .btn-end-consultation { width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.8rem; transition: all 0.3s; }
                .btn-end-consultation:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
                
                .empty-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; opacity: 0.5; }
                .empty-state { text-align: center; color: var(--text-muted); padding: 2rem; font-style: italic; }
                
                /* File Upload Styles */
                .file-upload-container { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
                .file-upload-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, var(--primary), #667eea); color: white; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s; border: none; }
                .file-upload-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); }
                .file-upload-hint { color: var(--text-muted); font-size: 0.85rem; font-style: italic; }
                
                .attachments-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
                .attachment-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; transition: all 0.2s; }
                .attachment-item:hover { background: #f3f4f6; }
                .attachment-item svg { color: var(--primary); }
                .attachment-name { flex: 1; font-size: 0.9rem; color: #374151; font-weight: 500; }
                .remove-attachment { border: none; background: #fee2e2; color: #dc2626; padding: 0.4rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .remove-attachment:hover { background: #fecaca; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                /* Scrollbar */
                .queue-list::-webkit-scrollbar, .clinical-panel::-webkit-scrollbar { width: 6px; }
                .queue-list::-webkit-scrollbar-track, .clinical-panel::-webkit-scrollbar-track { background: transparent; }
                .queue-list::-webkit-scrollbar-thumb, .clinical-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .queue-list::-webkit-scrollbar-thumb:hover, .clinical-panel::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default ConsultingRoom;
