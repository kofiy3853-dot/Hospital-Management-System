import { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Search, Edit2, Trash2, X, Eye, Microscope } from 'lucide-react';

const Registration = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewPatient, setViewPatient] = useState(null);
    const [showPrescribeModal, setShowPrescribeModal] = useState(false);
    const [prescribePatient, setPrescribePatient] = useState(null);
    const [labHistory, setLabHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        otherName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: 'Male',
        address: '',
        town: '',
        district: '',
        religion: '',
        maritalStatus: 'Single',
        education: '',
        occupation: '',
        nationalId: '',
        hospitalNumber: '',
        nextOfKinName: '',
        nextOfKinPhone: '',
        nextOfKinAddress: '',
        nextOfKinRelation: '',
        insuranceProvider: '',
        insuranceNumber: '',
        insuranceStatus: 'Active',
        insuranceSerial: '',
        insuranceExpiry: '',
        isNHIS: false,
        nhisNumber: '',
        patientInfo: {
            bloodGroup: '',
            emergencyContact: '',
            attendanceDate: new Date().toISOString().split('T')[0],
            relationship: 'Self',
            numVisits: 1,
            printCard: true,
            insuranceType: 'National',
            corporateInsurance: { company: '', memberNo: '', expiryDate: '', premium: '' },
            nonInsured: { receiptNo: '', zeroPatientData: '' },
            claimsPreparation: {
                claimNumber: '',
                checkCode: '',
                referralCode: '',
                attendance: '',
                visitType: '',
                serviceType: '',
                firstVisit: '',
                secondVisit: '',
                specialty: ''
            }
        },
        serviceAssignment: {
            sendToService: false,
            doctorId: '',
            visitReason: 'General Consultation'
        }
    });

    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', otherName: '', email: '', phoneNumber: '',
            dateOfBirth: '', gender: 'Male', address: '',
            town: '', district: '', religion: '', maritalStatus: 'Single',
            education: '', occupation: '', nationalId: '', hospitalNumber: '',
            nextOfKinName: '', nextOfKinPhone: '', nextOfKinAddress: '', nextOfKinRelation: '',
            insuranceProvider: '', insuranceNumber: '', insuranceStatus: 'Active',
            isNHIS: false, nhisNumber: '',
            patientInfo: {
                bloodGroup: '',
                emergencyContact: '',
                attendanceDate: new Date().toISOString().split('T')[0],
                relationship: 'Self',
                numVisits: 1,
                printCard: true,
                insuranceType: 'National',
                corporateInsurance: { company: '', memberNo: '', expiryDate: '', premium: '' },
                nonInsured: { receiptNo: '', zeroPatientData: '' },
                claimsPreparation: {
                    claimNumber: '', checkCode: '', referralCode: '', attendance: '',
                    visitType: '', serviceType: '', firstVisit: '', secondVisit: '', specialty: ''
                }
            },
            serviceAssignment: {
                sendToService: false,
                doctorId: '',
                visitReason: 'General Consultation'
            }
        });
        setEditingId(null);
    };

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/patients');
            setRegistrations(data);
        } catch (err) {
            setError('Failed to load patients. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/doctors');
            setDoctors(data);
        } catch (err) {
            console.error('Failed to fetch doctors');
        }
    };

    useEffect(() => {
        fetchPatients();
        fetchDoctors();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                const newData = { ...prev };
                let current = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = { ...current[keys[i]] };
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return newData;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEdit = (patient) => {
        setEditingId(patient.id);
        setFormData({
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            otherName: patient.patientInfo?.otherName || '',
            email: patient.email || '',
            phoneNumber: patient.phoneNumber || '',
            dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
            gender: patient.gender || 'Male',
            address: patient.address || '',
            town: patient.patientInfo?.town || '',
            district: patient.patientInfo?.district || '',
            religion: patient.patientInfo?.religion || '',
            maritalStatus: patient.patientInfo?.maritalStatus || 'Single',
            education: patient.patientInfo?.education || '',
            occupation: patient.patientInfo?.occupation || '',
            nationalId: patient.patientInfo?.nationalId || '',
            hospitalNumber: patient.patientInfo?.hospitalNumber || '',
            nextOfKinName: patient.emergencyContact?.name || '',
            nextOfKinPhone: patient.emergencyContact?.phone || '',
            nextOfKinAddress: patient.emergencyContact?.address || '',
            nextOfKinRelation: patient.emergencyContact?.relation || '',
            insuranceProvider: patient.insuranceProvider || '',
            insuranceNumber: patient.insurancePolicyNumber || '',
            insuranceStatus: patient.patientInfo?.insurance?.status || 'Active',
            insuranceSerial: patient.patientInfo?.insuranceDetails?.serialNumber || '',
            insuranceExpiry: patient.patientInfo?.insuranceDetails?.expiryDate ? patient.patientInfo.insuranceDetails.expiryDate.split('T')[0] : '',
            isNHIS: patient.isNHIS || false,
            nhisNumber: patient.nhisNumber || '',
            patientInfo: {
                bloodGroup: patient.patientInfo?.bloodGroup || '',
                emergencyContact: patient.patientInfo?.emergencyContact || '',
                attendanceDate: patient.patientInfo?.attendanceDate || '',
                relationship: patient.patientInfo?.relationship || 'Self',
                numVisits: patient.patientInfo?.numVisits || 1,
                printCard: patient.patientInfo?.printCard !== undefined ? patient.patientInfo.printCard : true,
                insuranceType: patient.patientInfo?.insuranceType || 'National',
                corporateInsurance: patient.patientInfo?.corporateInsurance || { company: '', memberNo: '', expiryDate: '', premium: '' },
                nonInsured: patient.patientInfo?.nonInsured || { receiptNo: '', zeroPatientData: '' },
                claimsPreparation: patient.patientInfo?.claimsPreparation || {
                    claimNumber: '', checkCode: '', referralCode: '', attendance: '',
                    visitType: '', serviceType: '', firstVisit: '', secondVisit: '', specialty: ''
                }
            },
            serviceAssignment: {
                sendToService: false,
                doctorId: '',
                visitReason: 'General Consultation'
            }
        });
        setShowModal(true);
    };

    const handlePrescribe = (patient) => {
        setPrescribePatient(patient);
        setShowPrescribeModal(true);
    };

    const fetchLabHistory = async (patientId) => {
        try {
            setLoadingHistory(true);
            const { data } = await api.get(`/lab/patient/${patientId}`);
            setLabHistory(data);
        } catch (err) {
            console.error('Failed to fetch lab history');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleView = (patient) => {
        setViewPatient(patient);
        fetchLabHistory(patient.id);
        setShowViewModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this patient record?')) {
            try {
                await api.delete(`/patients/${id}`);
                fetchPatients();
            } catch (err) {
                alert('Failed to delete patient');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            insuranceProvider: formData.insuranceProvider,
            insurancePolicyNumber: formData.insuranceNumber,
            isNHIS: formData.isNHIS,
            nhisNumber: formData.nhisNumber,
            patientInfo: {
                ...formData.patientInfo,
                otherName: formData.otherName,
                hospitalNumber: formData.hospitalNumber,
                nationalId: formData.nationalId,
                town: formData.town,
                district: formData.district,
                religion: formData.religion,
                maritalStatus: formData.maritalStatus,
                education: formData.education,
                occupation: formData.occupation,
                insuranceDetails: {
                    serialNumber: formData.insuranceSerial,
                    expiryDate: formData.insuranceExpiry
                }
            },
            emergencyContact: {
                name: formData.nextOfKinName,
                phone: formData.nextOfKinPhone,
                address: formData.nextOfKinAddress,
                relation: formData.nextOfKinRelation
            }
        };

        try {
            if (editingId) {
                await api.put(`/patients/${editingId}`, payload);
            } else {
                const { data: newPatient } = await api.post('/patients', payload);
                
                // Handle Automated Queuing
                if (formData.serviceAssignment.sendToService && formData.serviceAssignment.doctorId) {
                    await api.post('/appointments', {
                        patientId: newPatient.id,
                        doctorId: formData.serviceAssignment.doctorId,
                        dateTime: new Date().toISOString(),
                        reason: formData.serviceAssignment.visitReason,
                        status: 'Confirmed'
                    });
                }
            }
            setShowModal(false);
            fetchPatients();
            resetForm();
            if (formData.serviceAssignment.sendToService) {
                alert('Patient registered and successfully queued for consultation.');
            }
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'register'} patient`);
        }
    };

    return (
        <div className="patients-page">
            <header className="page-header">
                <div>
                    <h1>Registration Records</h1>
                    <p>Manage and view all hospital registrations</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <UserPlus size={18} />
                    New Registration
                </button>
            </header>

            {/* Patient Detail View Modal */}
            {showViewModal && viewPatient && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="profile-header">
                            <div className="avatar-lg" style={{ background: '#ecfdf5', color: '#10b981' }}>
                                {viewPatient.firstName[0]}{viewPatient.lastName[0]}
                            </div>
                            <div className="profile-info">
                                <h2>{viewPatient.firstName} {viewPatient.lastName}</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <span className="badge">{viewPatient.gender}</span>
                                    <span className="badge" style={{ background: '#eff6ff', color: '#3b82f6' }}>{viewPatient.patientInfo?.bloodGroup || 'Blood Group N/A'}</span>
                                    {viewPatient.isNHIS && <span className="badge" style={{ background: '#10b981', color: 'white' }}>NHIS</span>}
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hospital No: {viewPatient.patientInfo?.hospitalNumber || 'NEW-RECORD'}</p>
                            </div>
                            <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => setShowViewModal(false)}><X size={24} /></button>
                        </div>

                        <div className="detail-section">
                            <h3 className="section-title">Registration Details</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Hospital No</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.hospitalNumber || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">First Name</span>
                                    <span className="detail-value">{viewPatient.firstName}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Surname</span>
                                    <span className="detail-value">{viewPatient.lastName}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Sex</span>
                                    <span className="detail-value">{viewPatient.gender}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Date of Birth</span>
                                    <span className="detail-value">{viewPatient.dateOfBirth ? new Date(viewPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Age</span>
                                    <span className="detail-value">{viewPatient.dateOfBirth ? Math.floor((new Date() - new Date(viewPatient.dateOfBirth)) / 31557600000) : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Marital Status</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.maritalStatus || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Education</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.education || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Occupation</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.occupation || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">National ID</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.nationalId || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Attendance Date</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.attendanceDate || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Relationship</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.relationship || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Total Visits</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.numVisits || '1'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Print Card</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.printCard ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Address</span>
                                    <span className="detail-value">{viewPatient.address}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Religion</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.religion || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Town</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.town || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">District</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.district || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{viewPatient.phoneNumber}</span>
                                </div>
                            </div>

                            <h3 className="section-title">Relative Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Relative Name</span>
                                    <span className="detail-value">{viewPatient.emergencyContact?.name || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Relationship</span>
                                    <span className="detail-value">{viewPatient.emergencyContact?.relation || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{viewPatient.emergencyContact?.phone || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Address</span>
                                    <span className="detail-value">{viewPatient.emergencyContact?.address || 'N/A'}</span>
                                </div>
                            </div>

                            <h3 className="section-title">Insurance & Claims</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Insurance Type</span>
                                    <span className="detail-value">{viewPatient.patientInfo?.insuranceType || 'Non-Insured'}</span>
                                </div>
                                {viewPatient.patientInfo?.insuranceType === 'National' && (
                                    <>
                                        <div className="detail-item">
                                            <span className="detail-label">Scheme</span>
                                            <span className="detail-value">{viewPatient.insuranceProvider || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Member No</span>
                                            <span className="detail-value">{viewPatient.insurancePolicyNumber || 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                                {viewPatient.patientInfo?.insuranceType === 'Corporate' && (
                                    <>
                                        <div className="detail-item">
                                            <span className="detail-label">Company</span>
                                            <span className="detail-value">{viewPatient.patientInfo.corporateInsurance?.company || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Member No</span>
                                            <span className="detail-value">{viewPatient.patientInfo.corporateInsurance?.memberNo || 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {viewPatient.patientInfo?.claimsPreparation?.claimNumber && (
                                <>
                                    <h3 className="section-title" style={{ marginTop: '1.5rem' }}>Claims Preparation</h3>
                                    <div className="detail-grid" style={{ marginBottom: '1rem' }}>
                                        <div className="detail-item">
                                            <span className="detail-label">Claim Number</span>
                                            <span className="detail-value">{viewPatient.patientInfo.claimsPreparation.claimNumber}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Check Code</span>
                                            <span className="detail-value">{viewPatient.patientInfo.claimsPreparation.checkCode || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Referral Code</span>
                                            <span className="detail-value">{viewPatient.patientInfo.claimsPreparation.referralCode || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Visit Type</span>
                                            <span className="detail-value">{viewPatient.patientInfo.claimsPreparation.visitType || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Attendance</span>
                                            <span className="detail-value">{viewPatient.patientInfo.claimsPreparation.attendance || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Service Type</span>
                                            <span className="detail-value">{viewPatient.patientInfo.claimsPreparation.serviceType || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <h3 className="section-title">Claims Table</h3>
                                    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                                        <table className="data-table" style={{ fontSize: '0.8rem' }}>
                                            <thead>
                                                <tr>
                                                    <th>Claim Number</th>
                                                    <th>Type of Visit</th>
                                                    <th>Attendance</th>
                                                    <th>Type</th>
                                                    <th>First Visit</th>
                                                    <th>Second Visit</th>
                                                    <th>Specialty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.claimNumber}</td>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.visitType}</td>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.attendance}</td>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.serviceType}</td>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.firstVisit}</td>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.secondVisit}</td>
                                                    <td>{viewPatient.patientInfo.claimsPreparation.specialty || 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            <h3 className="section-title">Visit History</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">First Visit</span>
                                    <span className="detail-value">{new Date(viewPatient.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Last Visit</span>
                                    <span className="detail-value">{viewPatient.updatedAt ? new Date(viewPatient.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Number of Visits</span>
                                </div>
                            </div>
                        </div>

                        <div className="history-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <h3 className="section-title">Lab Test History</h3>
                            {loadingHistory ? (
                                <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
                            ) : labHistory.length > 0 ? (
                                <table className="data-table" style={{ fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Test Name</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labHistory.map((test) => (
                                            <tr key={test.id}>
                                                <td>{test.testName}</td>
                                                <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge`} style={{
                                                        background: test.status === 'Completed' ? 'var(--success)' :
                                                            test.status === 'Pending' ? 'var(--warning)' : 'var(--primary)'
                                                     }}>{test.status}</span>
                                                </td>
                                                <td>{test.result ? JSON.stringify(test.result).slice(0, 30) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No lab tests recorded.</p>
                            )}
                        </div>

                        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setShowViewModal(false); handleEdit(viewPatient); }}>Update Records</button>
                            <button className="btn" style={{ flex: 1, border: '1px solid var(--border)' }} onClick={() => setShowViewModal(false)}>Close Summary</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem' }}>{editingId ? 'Edit Patient Details' : 'Patient Registration'}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>{editingId ? 'Update clinical and demographic information' : 'Enter complete demographic and clinical details'}</p>
                            </div>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <h3 className="section-title">Registration Details</h3>
                            <div className="form-grid">
                                <FormInput label="Hospital No" name="hospitalNumber" value={formData.hospitalNumber} onChange={handleChange} placeholder="Auto-generated if empty" />
                                <FormInput label="Surname" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                <FormInput label="Other Name" name="otherName" value={formData.otherName} onChange={handleChange} />
                                <FormInput label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                                <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                                <FormInput label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                                <FormInput label="National ID" name="nationalId" value={formData.nationalId} onChange={handleChange} />
                                <FormSelect label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={['Single', 'Married', 'Divorced', 'Widowed']} />
                                <FormInput label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                                <FormInput label="Education" name="education" value={formData.education} onChange={handleChange} placeholder="Highest level" />
                                <FormInput label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
                                <FormInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
                                <FormInput label="Attendance Date" type="date" name="patientInfo.attendanceDate" value={formData.patientInfo.attendanceDate} onChange={handleChange} />
                                <FormSelect label="Relationship" name="patientInfo.relationship" value={formData.patientInfo.relationship} onChange={handleChange} options={['Self', 'Spouse', 'Child', 'Parent', 'Other']} />
                                <FormInput label="Number of Visits" type="number" name="patientInfo.numVisits" value={formData.patientInfo.numVisits} onChange={handleChange} readOnly />
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
                                    <input type="checkbox" name="patientInfo.printCard" checked={formData.patientInfo.printCard} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, printCard: e.target.checked } }))} style={{ width: '20px', height: '20px' }} />
                                    <label style={{ margin: 0 }}>Print Card</label>
                                </div>
                            </div>

                            <h4 className="subsection-title" style={{ marginTop: '1rem' }}>Address</h4>
                            <div className="form-grid">
                                <FormInput label="Town/Village" name="town" value={formData.town} onChange={handleChange} required />
                                <FormInput label="District" name="district" value={formData.district} onChange={handleChange} required />
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Residential Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                                </div>
                            </div>

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            <h3 className="section-title">Family Details (Next of Kin)</h3>
                            <div className="form-grid">
                                <FormInput label="Relative Name" name="nextOfKinName" value={formData.nextOfKinName} onChange={handleChange} required />
                                <FormSelect label="Relationship" name="nextOfKinRelation" value={formData.nextOfKinRelation} onChange={handleChange} options={['Spouse', 'Parent', 'Sibling', 'Child', 'Other']} />
                                <FormInput label="Relative Phone" name="nextOfKinPhone" value={formData.nextOfKinPhone} onChange={handleChange} required />
                                <FormInput label="Relative Address" name="nextOfKinAddress" value={formData.nextOfKinAddress} onChange={handleChange} />
                            </div>

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            <h3 className="section-title">Insurance Details</h3>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                {['National', 'Corporate', 'Non-Insured'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`btn ${formData.patientInfo.insuranceType === type ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, insuranceType: type } }))}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {formData.patientInfo.insuranceType === 'National' && (
                                <div className="form-grid">
                                    <FormInput label="Scheme" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} placeholder="e.g. NHIA" />
                                    <FormInput label="Member No" name="insuranceNumber" value={formData.insuranceNumber} onChange={handleChange} />
                                    <FormInput label="Expiry Date" type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange} />
                                    <FormInput label="Serial No" name="insuranceSerial" value={formData.insuranceSerial} onChange={handleChange} placeholder="For NHIA cards" />
                                </div>
                            )}

                            {formData.patientInfo.insuranceType === 'Corporate' && (
                                <div className="form-grid">
                                    <FormInput label="Company" name="patientInfo.corporateInsurance.company" value={formData.patientInfo.corporateInsurance.company} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, corporateInsurance: { ...prev.patientInfo.corporateInsurance, company: e.target.value } } }))} />
                                    <FormInput label="Member No" name="patientInfo.corporateInsurance.memberNo" value={formData.patientInfo.corporateInsurance.memberNo} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, corporateInsurance: { ...prev.patientInfo.corporateInsurance, memberNo: e.target.value } } }))} />
                                    <FormInput label="Expiry Date" type="date" name="patientInfo.corporateInsurance.expiryDate" value={formData.patientInfo.corporateInsurance.expiryDate} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, corporateInsurance: { ...prev.patientInfo.corporateInsurance, expiryDate: e.target.value } } }))} />
                                    <FormInput label="Premium" name="patientInfo.corporateInsurance.premium" value={formData.patientInfo.corporateInsurance.premium} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, corporateInsurance: { ...prev.patientInfo.corporateInsurance, premium: e.target.value } } }))} />
                                </div>
                            )}

                            {formData.patientInfo.insuranceType === 'Non-Insured' && (
                                <div className="form-grid">
                                    <FormInput label="Receipt No" name="patientInfo.nonInsured.receiptNo" value={formData.patientInfo.nonInsured.receiptNo} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, nonInsured: { ...prev.patientInfo.nonInsured, receiptNo: e.target.value } } }))} />
                                    <FormInput label="Zero Patient Data" name="patientInfo.nonInsured.zeroPatientData" value={formData.patientInfo.nonInsured.zeroPatientData} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, nonInsured: { ...prev.patientInfo.nonInsured, zeroPatientData: e.target.value } } }))} />
                                </div>
                            )}

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            <h3 className="section-title">Claims Preparation</h3>
                            <div className="form-grid">
                                <FormInput label="Claim Number" name="patientInfo.claimsPreparation.claimNumber" value={formData.patientInfo.claimsPreparation.claimNumber} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, claimNumber: e.target.value } } }))} />
                                <FormInput label="Claim Check Code" name="patientInfo.claimsPreparation.checkCode" value={formData.patientInfo.claimsPreparation.checkCode} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, checkCode: e.target.value } } }))} />
                                <FormInput label="Referral Code" name="patientInfo.claimsPreparation.referralCode" value={formData.patientInfo.claimsPreparation.referralCode} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, referralCode: e.target.value } } }))} />
                                <FormInput label="Attendance" name="patientInfo.claimsPreparation.attendance" value={formData.patientInfo.claimsPreparation.attendance} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, attendance: e.target.value } } }))} />
                                <FormInput label="Visit Type" name="patientInfo.claimsPreparation.visitType" value={formData.patientInfo.claimsPreparation.visitType} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, visitType: e.target.value } } }))} />
                                <FormInput label="Service Type" name="patientInfo.claimsPreparation.serviceType" value={formData.patientInfo.claimsPreparation.serviceType} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, serviceType: e.target.value } } }))} />
                                <FormInput label="First Visit / Admission" type="date" name="patientInfo.claimsPreparation.firstVisit" value={formData.patientInfo.claimsPreparation.firstVisit} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, firstVisit: e.target.value } } }))} />
                                <FormInput label="Second Visit / Discharge" type="date" name="patientInfo.claimsPreparation.secondVisit" value={formData.patientInfo.claimsPreparation.secondVisit} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, secondVisit: e.target.value } } }))} />
                                <FormInput label="Specialty" name="patientInfo.claimsPreparation.specialty" value={formData.patientInfo.claimsPreparation.specialty} onChange={(e) => setFormData(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, claimsPreparation: { ...prev.patientInfo.claimsPreparation, specialty: e.target.value } } }))} />
                            </div>

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            <h3 className="section-title">Claims Table</h3>
                            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Claim Number</th>
                                            <th>Type of Visit</th>
                                            <th>Attendance</th>
                                            <th>Type</th>
                                            <th>First Visit</th>
                                            <th>Second Visit</th>
                                            <th>Specialty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.patientInfo.claimsPreparation.claimNumber ? (
                                            <tr>
                                                <td>{formData.patientInfo.claimsPreparation.claimNumber}</td>
                                                <td>{formData.patientInfo.claimsPreparation.visitType}</td>
                                                <td>{formData.patientInfo.claimsPreparation.attendance}</td>
                                                <td>{formData.patientInfo.claimsPreparation.serviceType}</td>
                                                <td>{formData.patientInfo.claimsPreparation.firstVisit}</td>
                                                <td>{formData.patientInfo.claimsPreparation.secondVisit}</td>
                                                <td>{formData.patientInfo.claimsPreparation.specialty || 'N/A'}</td>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', opacity: 0.5 }}>No current claim data entered</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            {!editingId && (
                                <div className="service-assignment-section" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h3 className="section-title" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                        <Microscope size={20} /> Service Assignment / Queuing
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Automate the consulting process by queuing this patient for a doctor immediately.</p>
                                    
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', color: 'var(--text)' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.serviceAssignment.sendToService}
                                                onChange={(e) => setFormData({...formData, serviceAssignment: {...formData.serviceAssignment, sendToService: e.target.checked}})}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            Send to Consulting Room / Doctor Queue
                                        </label>
                                    </div>

                                    {formData.serviceAssignment.sendToService && (
                                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600' }}>Select Doctor</label>
                                                <select 
                                                    value={formData.serviceAssignment.doctorId}
                                                    onChange={(e) => setFormData({...formData, serviceAssignment: {...formData.serviceAssignment, doctorId: e.target.value}})}
                                                    required={formData.serviceAssignment.sendToService}
                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                >
                                                    <option value="">-- Choose Assigned Doctor --</option>
                                                    {doctors.map(doc => (
                                                        <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600' }}>Visit Reason / Service Details</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.serviceAssignment.visitReason}
                                                    onChange={(e) => setFormData({...formData, serviceAssignment: {...formData.serviceAssignment, visitReason: e.target.value}})}
                                                    placeholder="e.g. Chronic Headache, New Patient Scan"
                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                                    {editingId ? 'Save Changes' : 'Register Patient'}
                                </button>
                                <button type="button" className="btn" style={{ padding: '0.8rem 2rem', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPrescribeModal && prescribePatient && (
                <PrescribeTestModal
                    patient={prescribePatient}
                    onClose={() => setShowPrescribeModal(false)}
                    onSuccess={() => { setShowPrescribeModal(false); alert('Test request sent to specific laboratory.'); }}
                />
            )}

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Blood Group</th>
                                    <th>Status</th>
                                    <th>Contact</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.length > 0 ? registrations.map((patient) => (
                                    <tr key={patient.id}>
                                        <td style={{ fontWeight: '600' }}>
                                            {patient.firstName} {patient.lastName}
                                            {patient.isNHIS && <span className="badge" style={{ marginLeft: '8px', background: '#10b981', fontSize: '10px' }}>NHIS</span>}
                                        </td>
                                        <td>{patient.gender || 'N/A'}</td>
                                        <td><span className="badge">{patient.patientInfo?.bloodGroup || 'N/A'}</span></td>
                                        <td>
                                            {patient.admissions?.some(a => a.status === 'Admitted') ? (
                                                <span className="badge" style={{ backgroundColor: '#ef4444' }}>Admitted</span>
                                            ) : (
                                                <span className="badge" style={{ backgroundColor: '#10b981' }}>Outpatient</span>
                                            )}
                                        </td>
                                        <td>{patient.phoneNumber || 'N/A'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="icon-btn" onClick={() => handleView(patient)} title="View Details">
                                                    <Eye size={16} color="var(--primary)" />
                                                </button>
                                                <button className="icon-btn" onClick={() => handlePrescribe(patient)} title="Prescribe Lab Test">
                                                    <Microscope size={16} color="var(--warning)" />
                                                </button>
                                                <button className="icon-btn" onClick={() => handleEdit(patient)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="icon-btn" onClick={() => handleDelete(patient.id)} title="Delete">
                                                    <Trash2 size={16} color="var(--danger)" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
                .subsection-title { font-size: 0.9rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
};

const FormInput = ({ label, type = "text", ...props }) => (
    <div className="form-group">
        <label>{label} {props.required && '*'}</label>
        <input type={type} {...props} />
    </div>
);

const FormSelect = ({ label, options, ...props }) => (
    <div className="form-group">
        <label>{label}</label>
        <select {...props}>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const PrescribeTestModal = ({ patient, onClose, onSuccess }) => {
    const [testName, setTestName] = useState('');
    const [category, setCategory] = useState('General');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/lab/request', {
                patientId: patient.id,
                testName,
                testCategory: category,
                notes
            });
            onSuccess();
        } catch (err) {
            alert('Failed to submit test request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card" style={{ maxWidth: '500px', width: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3>Prescribe Lab Test</h3>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: 0 }}><strong>Patient:</strong> {patient.firstName} {patient.lastName}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>ID: {patient.patientInfo?.hospitalNumber || 'N/A'}</p>
                </div>
                <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <FormInput label="Test Name" value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g. Malaria RDT, FBC, Lipid Profile" required />
                    <FormSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={['General', 'Hematology', 'Microbiology', 'Chemical Pathology', 'Radiology']} />
                    <div className="form-group">
                        <label>Clinical Notes</label>
                        <textarea
                            className="input-field"
                            rows="3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Reason for test / Suspected diagnosis..."
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
                        {submitting ? 'Sending Request...' : 'Send to Laboratory'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Registration;
