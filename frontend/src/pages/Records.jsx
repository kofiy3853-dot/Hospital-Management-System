import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { FileText, Search, User, ChevronRight, Clipboard, Plus, X, Save, Upload, ExternalLink, Activity, Info, CheckCircle, Package } from 'lucide-react';

const Records = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [consultForm, setConsultForm] = useState({
        appointmentId: '',
        symptoms: '',
        soapNotes: {
            subjective: '',
            objective: '',
            assessment: '',
            plan: ''
        },
        attachments: [],
        labTest: '',
        labCategory: 'General'
    });

    const fetchPatients = async () => {
        try {
            const { data } = await api.get('/patients');
            setPatients(data);
        } catch (err) {
            console.error('Error fetching patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleViewHistory = async (patient) => {
        setSelectedPatient(patient);
        try {
            const [histRes, aptRes] = await Promise.all([
                api.get(`/medical-records/patient/${patient.id}`),
                api.get('/appointments')
            ]);
            setHistory(histRes.data);
            setAppointments(aptRes.data.filter(a => a.patientId === patient.id && a.status !== 'Completed'));
        } catch (err) {
            console.error('Error fetching history');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
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
        } finally {
            setUploading(false);
        }
    };

    const handleSoapChange = (field, value) => {
        setConsultForm(prev => ({
            ...prev,
            soapNotes: { ...prev.soapNotes, [field]: value }
        }));
    };

    const handleConsultSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...consultForm,
                symptoms: consultForm.symptoms.split(',').map(s => s.trim()),
                patientId: selectedPatient.id,
                diagnosis: consultForm.soapNotes.assessment, // Backward compatibility
                treatmentPlan: consultForm.soapNotes.plan // Backward compatibility
            };

            await api.post('/medical-records', payload);

            if (consultForm.labTest) {
                await api.post('/lab/request', {
                    patientId: selectedPatient.id,
                    appointmentId: consultForm.appointmentId,
                    testName: consultForm.labTest,
                    testCategory: consultForm.labCategory
                });
            }

            setShowConsultModal(false);
            handleViewHistory(selectedPatient);
            setConsultForm({
                appointmentId: '',
                symptoms: '',
                soapNotes: { subjective: '', objective: '', assessment: '', plan: '' },
                attachments: [],
                labTest: '',
                labCategory: 'General'
            });
            alert('Consultation saved successfully!');
        } catch (err) {
            alert('Failed to save consultation');
        }
    };

    return (
        <div className="records-page">
            <header className="page-header no-print">
                <div>
                    <h1>Advanced EMR</h1>
                    <p>Electronic Medical Records with SOAP notes and Timeline</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '350px 1fr' : '1fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Patient List */}
                <div className="card no-print" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Find registrant..." style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        </div>
                    </div>
                    <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : patients.length > 0 ? patients.map(p => (
                            <div
                                key={p.id}
                                className={`patient-item ${selectedPatient?.id === p.id ? 'active' : ''}`}
                                onClick={() => handleViewHistory(p)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div className="avatar-sm"><User size={14} /></div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.firstName} {p.lastName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.patientInfo?.hospitalNumber || 'No ID'}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                        )) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No registrants found.</div>
                        )}
                    </div>
                </div>

                {/* Patient History Detail */}
                {selectedPatient ? (
                    <div className="history-detail">
                        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div className="avatar-lg"><User size={35} /></div>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', margin: '0' }}>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                            <span><strong>Gender:</strong> {selectedPatient.gender}</span>
                                            <span><strong>Age:</strong> {Math.floor((new Date() - new Date(selectedPatient.dateOfBirth)) / 31557600000)} Yrs</span>
                                            <span><strong>Blood:</strong> {selectedPatient.patientInfo?.bloodGroup || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button className="btn btn-outline" onClick={() => {
                                        const details = document.getElementById('patient-profile-details');
                                        details.style.display = details.style.display === 'none' ? 'block' : 'none';
                                    }}>
                                        <Info size={16} style={{ marginRight: '5px' }} /> Profile Info
                                    </button>
                                    <button className="btn btn-primary" onClick={() => setShowConsultModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Plus size={18} /> New Visit
                                    </button>
                                </div>
                            </div>

                            <div id="patient-profile-details" style={{ display: 'none', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
                                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hospital No</span>
                                        <span className="detail-value" style={{ fontWeight: '600' }}>{selectedPatient.patientInfo?.hospitalNumber || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Other Names</span>
                                        <span className="detail-value">{selectedPatient.patientInfo?.otherName || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendance Date</span>
                                        <span className="detail-value">{selectedPatient.patientInfo?.attendanceDate || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relationship</span>
                                        <span className="detail-value">{selectedPatient.patientInfo?.relationship || 'Self'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Number of Visits</span>
                                        <span className="detail-value">{selectedPatient.patientInfo?.numVisits || '1'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Religion</span>
                                        <span className="detail-value">{selectedPatient.patientInfo?.religion || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residential Address</span>
                                        <span className="detail-value">{selectedPatient.address || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Town/District</span>
                                        <span className="detail-value">{selectedPatient.patientInfo?.town || 'N/A'}, {selectedPatient.patientInfo?.district || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Insurance Type</span>
                                        <span className="detail-value" style={{ fontWeight: '600', color: 'var(--primary)' }}>{selectedPatient.patientInfo?.insuranceType || 'Non-Insured'}</span>
                                    </div>
                                    {selectedPatient.patientInfo?.insuranceType === 'National' && (
                                        <>
                                            <div className="detail-item">
                                                <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NHIS No</span>
                                                <span className="detail-value">{selectedPatient.nhisNumber || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Serial No</span>
                                                <span className="detail-value">{selectedPatient.patientInfo?.insuranceDetails?.serialNumber || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}
                                    {selectedPatient.patientInfo?.insuranceType === 'Corporate' && (
                                        <>
                                            <div className="detail-item">
                                                <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Company</span>
                                                <span className="detail-value">{selectedPatient.patientInfo.corporateInsurance?.company || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member No</span>
                                                <span className="detail-value">{selectedPatient.patientInfo.corporateInsurance?.memberNo || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}
                                    {selectedPatient.patientInfo?.claimsPreparation?.claimNumber && (
                                        <div className="detail-item" style={{ gridColumn: 'span 3', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                            <span className="detail-label" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem' }}>ACTIVE CLAIM PREPARATION</span>
                                            <table className="data-table" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)' }}>
                                                <thead>
                                                  <tr>
                                                    <th>Claim Item</th>
                                                    <th>Value</th>
                                                    <th>Claim Item</th>
                                                    <th>Value</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  <tr>
                                                    <td><strong>Claim Number</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.claimNumber}</td>
                                                    <td><strong>Check Code</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.checkCode || 'N/A'}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>Referral Code</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.referralCode || 'N/A'}</td>
                                                    <td><strong>Visit Type</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.visitType || 'N/A'}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>Attendance</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.attendance || 'N/A'}</td>
                                                    <td><strong>Service Type</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.serviceType || 'N/A'}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>First Visit</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.firstVisit || 'N/A'}</td>
                                                    <td><strong>Second Visit</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.secondVisit || 'N/A'}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>Specialty</strong></td><td>{selectedPatient.patientInfo.claimsPreparation.specialty || 'N/A'}</td>
                                                    <td></td><td></td>
                                                  </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timeline Visualization */}
                        <div className="visit-timeline">
                            {history.length > 0 ? history.map((rec, idx) => (
                                <div key={rec.id} className="visit-card card">
                                    <div className="visit-marker">
                                        <div className="marker-dot"></div>
                                        {idx !== history.length - 1 && <div className="marker-line"></div>}
                                    </div>

                                    <div className="visit-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="visit-date">{new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="badge">Consultation</span>
                                        </div>
                                        <div className="doctor-tag">
                                            <Activity size={12} />
                                            <span>Dr. {rec.doctor?.lastName}</span>
                                        </div>
                                    </div>

                                    <div className="visit-content">
                                        {/* Vitals Summary */}
                                        {rec.vitals && Object.keys(rec.vitals).length > 0 && (
                                            <div className="vitals-row">
                                                {Object.entries(rec.vitals).map(([k, v]) => (
                                                    <div key={k} className="vital-tag">
                                                        <span className="vital-label">{k}:</span>
                                                        <span className="vital-value">{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* SOAP Display */}
                                        <div className="soap-display">
                                            <div className="soap-col">
                                                <h6>Subjective (S)</h6>
                                                <p>{rec.soapNotes?.subjective || rec.symptoms?.join(', ') || 'None'}</p>
                                            </div>
                                            <div className="soap-col">
                                                <h6>Objective (O)</h6>
                                                <p>{rec.soapNotes?.objective || 'Clinical observations not recorded.'}</p>
                                            </div>
                                            <div className="soap-col">
                                                <h6>Assessment (A)</h6>
                                                <p style={{ fontWeight: '500', color: 'var(--primary)' }}>{rec.soapNotes?.assessment || rec.diagnosis || 'Pending'}</p>
                                            </div>
                                            <div className="soap-col">
                                                <h6>Plan (P)</h6>
                                                <p>{rec.soapNotes?.plan || rec.treatmentPlan || 'Routine follow-up.'}</p>
                                            </div>
                                        </div>

                                        {/* Attachments */}
                                        {rec.attachments && rec.attachments.length > 0 && (
                                            <div className="attachments-section">
                                                <label><Package size={14} /> Reports & Images ({rec.attachments.length})</label>
                                                <div className="attachments-grid">
                                                    {rec.attachments.map((file, fIdx) => (
                                                        <a key={fIdx} href={`http://localhost:5000${typeof file === 'string' ? file : file.url}`} target="_blank" rel="noreferrer" className="attachment-link">
                                                            <FileText size={16} />
                                                            <span>{typeof file === 'string' ? 'View Report' : file.name}</span>
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="card" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                    <Clipboard size={64} style={{ marginBottom: '1.5rem', opacity: 0.15 }} />
                                    <h3>Clinical Journal Empty</h3>
                                    <p>Start a new consultation to begin the record timeline.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '600px', flexDirection: 'column', color: 'var(--text-muted)' }}>
                        <div className="pulse-icon"><FileText size={48} /></div>
                        <h3 style={{ marginTop: '1.5rem' }}>Select a Registrant</h3>
                        <p>Access advanced EMR data and visit history</p>
                    </div>
                )}
            </div>

            {/* Advanced Consultation Modal (SOAP) */}
            {showConsultModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '900px', width: '95%', maxHeight: '95vh', overflowY: 'auto' }}>
                        <div className="modal-header-pro">
                            <div>
                                <h2>End-to-End Consultation</h2>
                                <p>Recording visit for {selectedPatient.firstName} {selectedPatient.lastName}</p>
                            </div>
                            <button className="icon-btn" onClick={() => setShowConsultModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleConsultSubmit} className="soap-form">
                            {/* Linking Appointment */}
                            <div className="form-group mb-2">
                                <label>Visit Connection</label>
                                <select value={consultForm.appointmentId} onChange={(e) => setConsultForm({ ...consultForm, appointmentId: e.target.value })} style={{ width: '100%', padding: '0.8rem' }}>
                                    <option value="">-- Direct Patient Entry (Unlinked) --</option>
                                    {appointments.map(a => <option key={a.id} value={a.id}>{new Date(a.dateTime).toLocaleString()} ({a.treatment || 'Checkup'})</option>)}
                                </select>
                            </div>

                            <div className="soap-grid">
                                <div className="form-group soap-box subjective">
                                    <label>Subjective (S) - Patient Complaints</label>
                                    <textarea
                                        placeholder="Chief complaints, history of present illness..."
                                        value={consultForm.soapNotes.subjective}
                                        onChange={(e) => handleSoapChange('subjective', e.target.value)}
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="form-group soap-box objective">
                                    <label>Objective (O) - Clinical Findings</label>
                                    <textarea
                                        placeholder="Physical exam results, vital signs, lab reviews..."
                                        value={consultForm.soapNotes.objective}
                                        onChange={(e) => handleSoapChange('objective', e.target.value)}
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="form-group soap-box assessment">
                                    <label>Assessment (A) - Diagnosis</label>
                                    <textarea
                                        placeholder="Primary diagnosis, differential diagnosis..."
                                        value={consultForm.soapNotes.assessment}
                                        onChange={(e) => handleSoapChange('assessment', e.target.value)}
                                        rows="4"
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group soap-box plan">
                                    <label>Plan (P) - Treatment</label>
                                    <textarea
                                        placeholder="Medications, referrals, follow-up instructions..."
                                        value={consultForm.soapNotes.plan}
                                        onChange={(e) => handleSoapChange('plan', e.target.value)}
                                        rows="4"
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <div className="emr-footer-grid">
                                {/* Lab Section */}
                                <div className="lab-request-box card-alt">
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Info size={16} /> Outpatient Lab Request
                                    </h4>
                                    <div className="form-grid-inner">
                                        <div className="form-group">
                                            <label>Test Name</label>
                                            <input type="text" value={consultForm.labTest} onChange={(e) => setConsultForm({ ...consultForm, labTest: e.target.value })} placeholder="e.g. CRP, HbA1c" />
                                        </div>
                                        <div className="form-group">
                                            <label>Test Category</label>
                                            <select value={consultForm.labCategory} onChange={(e) => setConsultForm({ ...consultForm, labCategory: e.target.value })}>
                                                <option value="General">General</option>
                                                <option value="Blood Work">Blood Work</option>
                                                <option value="Imaging">Imaging</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Attachment Section */}
                                <div className="attachment-upload-box card-alt">
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Upload size={16} /> Attach Reports (PDF/Images)
                                    </h4>
                                    <div
                                        className="dropzone"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                                        {uploading ? 'Processing file...' : 'Click to Browse Reports'}
                                    </div>
                                    <div className="uploaded-list">
                                        {consultForm.attachments.map((f, i) => (
                                            <div key={i} className="mini-file">
                                                <FileText size={12} />
                                                <span>{f.name}</span>
                                                <CheckCircle size={12} color="#10b981" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                                    <Save size={20} style={{ marginRight: '8px' }} /> Commit to EMR
                                </button>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)' }} onClick={() => setShowConsultModal(false)}>Discard Draft</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .records-page { animation: fadeIn 0.4s ease; }
                .patient-item { padding: 1.2rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-bottom: 1px solid var(--border); transition: all 0.3s; }
                .patient-item:hover { background: rgba(255,255,255,0.03); transform: translateX(5px); }
                .patient-item.active { background: rgba(var(--primary-rgb), 0.15); border-left: 5px solid var(--primary); }
                
                .visit-timeline { margin-top: 3rem; position: relative; }
                .visit-card { margin-bottom: 2.5rem; position: relative; padding-left: 3.5rem !important; border-radius: 12px; transition: transform 0.2s; }
                .visit-card:hover { transform: scale(1.01); }
                .visit-marker { position: absolute; left: 1rem; top: 1.5rem; height: 100%; display: flex; flex-direction: column; align-items: center; }
                .marker-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--primary); border: 2px solid white; box-shadow: 0 0 10px var(--primary); z-index: 5; }
                .marker-line { width: 2px; flex: 1; background: var(--border); margin: 5px 0; }
                
                .visit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.8rem; }
                .visit-date { font-size: 1.1rem; fontWeight: 700; color: var(--text); }
                .doctor-tag { display: flex; alignItems: center; gap: 6px; padding: 4px 10px; background: rgba(var(--primary-rgb), 0.1); border-radius: 20px; font-size: 0.8rem; color: var(--primary); font-weight: 600; }
                
                .soap-display { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin: 1.5rem 0; }
                .soap-col h6 { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
                .soap-col p { font-size: 0.9rem; line-height: 1.6; margin: 0; }
                
                .vitals-row { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
                .vital-tag { background: var(--bg-dark); padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border); font-size: 0.85rem; }
                .vital-label { color: var(--text-muted); margin-right: 5px; }
                
                .attachments-section { border-top: 1px solid var(--border); padding-top: 1rem; }
                .attachments-section label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--text-muted); display: flex; items-center; gap: 6px; }
                .attachments-grid { display: flex; gap: 10px; flex-wrap: wrap; }
                .attachment-link { display: flex; align-items: center; gap: 8px; padding: 8px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; font-size: 0.85rem; text-decoration: none; transition: 0.2s; }
                .attachment-link:hover { background: #f1f5f9; border-color: var(--primary); color: var(--primary); }
                
                .modal-header-pro { padding-bottom: 1.5rem; border-bottom: 1px dashed var(--border); margin-bottom: 2rem; display: flex; justify-content: space-between; }
                .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .soap-box textarea { width: 100%; border-radius: 12px; padding: 1rem; font-family: inherit; resize: vertical; margin-top: 0.5rem; border: 1.5px solid var(--border); background: #fafafa; color: #333; }
                .soap-box textarea:focus { border-color: var(--primary); background: #fff; }
                .soap-box label { font-size: 0.85rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
                
                .emr-footer-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; margin-top: 2rem; }
                .card-alt { background: #f1f5f9; padding: 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
                .dropzone { border: 2px dashed #cbd5e1; padding: 1rem; border-radius: 8px; text-align: center; color: #64748b; cursor: pointer; transition: 0.2s; }
                .dropzone:hover { border-color: var(--primary); background: #fff; }
                .uploaded-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
                .mini-file { display: flex; align-items: center; gap: 5px; background: #fff; padding: 4px 10px; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 0.75rem; }
                
                .pulse-icon { animation: pulse 2s infinite; opacity: 0.2; }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Records;
