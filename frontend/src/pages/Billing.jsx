import { useState, useEffect } from 'react';
import api from '../api/axios';
import { DollarSign, Search, Plus, X, CheckCircle, Clock, AlertCircle, Printer, FileText, Trash2 } from 'lucide-react';

const Billing = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [currentBill, setCurrentBill] = useState(null);
    const [formData, setFormData] = useState({
        patientId: '',
        appointmentId: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        billingType: 'Cash',
        insuranceCoveragePercentage: 0,
        items: [{ description: '', amount: '' }]
    });

    const fetchBills = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/billing');
            setBills(data);
        } catch (err) {
            console.error('Failed to fetch bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', amount: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: formData.items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
            };
            await api.post('/billing', payload);
            setShowModal(false);
            fetchBills();
            setFormData({
                patientId: '',
                appointmentId: '',
                description: '',
                dueDate: new Date().toISOString().split('T')[0],
                billingType: 'Cash',
                insuranceCoveragePercentage: 0,
                items: [{ description: '', amount: '' }]
            });
            alert('Bill created successfully');
        } catch (err) {
            alert('Failed to create bill');
        }
    };

    const handleViewInvoice = async (billId) => {
        try {
            const { data } = await api.get(`/billing/${billId}`);
            setCurrentBill(data);
            setShowInvoice(true);
        } catch (err) {
            alert('Failed to load invoice details');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const totalRevenue = bills.reduce((sum, b) => b.status === 'paid' ? sum + Number(b.amount) : sum, 0);
    const pendingCount = bills.filter(b => b.status === 'pending').length;
    const paidMonthCount = bills.filter(b => b.status === 'paid' && new Date(b.paidDate).getMonth() === new Date().getMonth()).length;

    return (
        <div className="billing-page">
            <header className="page-header no-print">
                <div>
                    <h1>Billing & Payments</h1>
                    <p>Manage invoices, payments, and financial records</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Create Bill
                </button>
            </header>

            <div className="billing-stats no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card stat-card-ui">
                    <DollarSign color="var(--success)" size={24} />
                    <div className="stat-info">
                        <h3>${totalRevenue.toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <Clock color="var(--warning)" size={24} />
                    <div className="stat-info">
                        <h3>{pendingCount}</h3>
                        <p>Pending Bills</p>
                    </div>
                </div>
                <div className="card stat-card-ui">
                    <CheckCircle color="var(--primary)" size={24} />
                    <div className="stat-info">
                        <h3>{paidMonthCount}</h3>
                        <p>Paid This Month</p>
                    </div>
                </div>
            </div>

            <div className="card no-print" style={{ marginTop: '2rem', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem' }}>All Bills</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search bills..." style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading bills...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Bill ID</th>
                                    <th>Patient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.length > 0 ? bills.map((bill) => (
                                    <tr key={bill.id}>
                                        <td style={{ fontWeight: '600' }}>#{bill.id?.slice(0, 8)}</td>
                                        <td>{bill.patient?.firstName} {bill.patient?.lastName}</td>
                                        <td>${Number(bill.amount).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge`} style={{
                                                background: bill.status === 'paid' ? 'var(--success)' :
                                                    bill.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                                            }}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleViewInvoice(bill.id)}>
                                                <FileText size={14} style={{ marginRight: '4px' }} /> Invoice
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                            <p>No bills found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Bill Modal */}
            {showModal && (
                <div className="modal-overlay no-print">
                    <div className="modal-content card" style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2>Create New Bill</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Patient ID</label>
                                    <input type="text" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} required placeholder="Enter Patient UUID" />
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Billing Type</label>
                                    <select value={formData.billingType} onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}>
                                        <option value="Cash">Cash / Private</option>
                                        <option value="Insurance">Corporate Insurance</option>
                                        <option value="NHIS">NHIS (Ghana)</option>
                                    </select>
                                </div>
                                {formData.billingType !== 'Cash' && (
                                    <div className="form-group">
                                        <label>Coverage %</label>
                                        <input type="number" min="0" max="100" value={formData.insuranceCoveragePercentage} onChange={(e) => setFormData({ ...formData, insuranceCoveragePercentage: e.target.value })} />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Description (Internal Note)</label>
                                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. General consultation and meds"></textarea>
                            </div>

                            <div className="items-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Invoice Items</h3>
                                    <button type="button" className="btn btn-sm" onClick={handleAddItem} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Plus size={14} /> Add Line
                                    </button>
                                </div>
                                {formData.items.map((item, index) => (
                                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                                        <div className="form-group">
                                            {index === 0 && <label>Description</label>}
                                            <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} required placeholder="Service/Item Name" />
                                        </div>
                                        <div className="form-group">
                                            {index === 0 && <label>Amount ($)</label>}
                                            <input type="number" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} required placeholder="0.00" />
                                        </div>
                                        <button type="button" className="icon-btn" onClick={() => handleRemoveItem(index)} style={{ color: 'var(--danger)', marginBottom: '8px' }} disabled={formData.items.length === 1}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <div style={{ textAlign: 'right', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)', marginRight: '10px' }}>Total Amount:</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        ${formData.items.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Bill & Generate Invoice</button>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invoice View Modal */}
            {showInvoice && currentBill && (
                <div className="modal-overlay">
                    <div className="modal-content card invoice-modal-content" style={{ maxWidth: '800px', width: '95%', background: '#fff', color: '#333', padding: '0' }}>
                        <div className="no-print" style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f9f9f9', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Printer size={18} /> Print Invoice
                            </button>
                            <button className="icon-btn" onClick={() => setShowInvoice(false)} style={{ color: '#666' }}><X size={24} /></button>
                        </div>

                        <div className="invoice-document" style={{ padding: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                                <div>
                                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>HMS PRO</h1>
                                    <p style={{ color: '#666' }}>123 Health Avenue, Medical City</p>
                                    <p style={{ color: '#666' }}>+1 (555) 000-1111 | contact@hmspro.com</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ fontSize: '2.5rem', margin: '0', color: '#ddd' }}>INVOICE</h2>
                                    <p style={{ fontWeight: 'bold' }}>#{currentBill.id?.slice(0, 8).toUpperCase()}</p>
                                    <p>Date: {new Date(currentBill.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                                <div>
                                    <h4 style={{ textTransform: 'uppercase', color: '#999', marginBottom: '1rem' }}>Bill To</h4>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0' }}>{currentBill.patient?.firstName} {currentBill.patient?.lastName}</p>
                                    <p style={{ margin: '0.2rem 0' }}>{currentBill.patient?.email}</p>
                                    <p style={{ margin: '0' }}>{currentBill.patient?.phoneNumber}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h4 style={{ textTransform: 'uppercase', color: '#999', marginBottom: '1rem' }}>Payment Info</h4>
                                    <p style={{ margin: '0' }}>Status: <span style={{
                                        fontWeight: 'bold',
                                        color: currentBill.status === 'paid' ? '#10b981' : '#f59e0b',
                                        textTransform: 'uppercase'
                                    }}>{currentBill.status}</span></p>
                                    <p style={{ margin: '0.2rem 0' }}>Due Date: {new Date(currentBill.dueDate).toLocaleDateString()}</p>
                                    <p style={{ margin: '0' }}>Billing: <span style={{ fontWeight: 'bold' }}>{currentBill.billingType}</span></p>
                                    {currentBill.billingType !== 'Cash' && <p style={{ margin: '0' }}>Coverage: {currentBill.insuranceCoveragePercentage}%</p>}
                                    {currentBill.paidDate && <p style={{ margin: '0' }}>Paid Date: {new Date(currentBill.paidDate).toLocaleDateString()}</p>}
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #333' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem 0' }}>Description</th>
                                        <th style={{ textAlign: 'right', padding: '1rem 0' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBill.items?.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '1rem 0' }}>{item.description}</td>
                                            <td style={{ textAlign: 'right', padding: '1rem 0' }}>${Number(item.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {(!currentBill.items || currentBill.items.length === 0) && (
                                        <tr style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '1rem 0' }}>{currentBill.description || 'General Service'}</td>
                                            <td style={{ textAlign: 'right', padding: '1rem 0' }}>${Number(currentBill.amount).toFixed(2)}</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style={{ padding: '2rem 1rem 0 0', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                                        <td style={{ padding: '2rem 0 0 0', textAlign: 'right', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>
                                            ${Number(currentBill.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div style={{ marginTop: '5rem', borderTop: '1px solid #eee', paddingTop: '2rem', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                                <p>Thank you for choosing HMS PRO Hospital Management System.</p>
                                <p>This is a computer-generated invoice and does not require a signature.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .stat-card-ui { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; }
                .stat-info h3 { margin: 0; font-size: 1.5rem; }
                .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group textarea { padding: 0.8rem; border: 1px solid var(--border); border-radius: 8px; background: rgba(255,255,255,0.05); color: var(--text); outline: none; }
                .form-group input:focus { border-color: var(--primary); }
                
                @media print {
                    body * { visibility: hidden; }
                    .invoice-document, .invoice-document * { visibility: visible; }
                    .invoice-document { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .modal-overlay { background: none; position: static; display: block; }
                    .modal-content { box-shadow: none; border: none; width: 100% !important; max-width: none !important; position: static; }
                }
            `}</style>
        </div>
    );
};

export default Billing;
