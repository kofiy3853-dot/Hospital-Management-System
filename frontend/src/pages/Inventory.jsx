import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Search, AlertCircle, ShoppingCart, X } from 'lucide-react';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        itemName: '',
        category: 'Medication',
        quantity: '',
        unit: 'Pcs',
        price: '',
        isNHISCovered: false
    });

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/pharmacy/inventory');
            setItems(data);
        } catch (err) {
            console.error('Error fetching inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy/inventory', formData);
            setShowModal(false);
            fetchInventory();
            setFormData({ itemName: '', category: 'Medication', quantity: '', unit: 'Pcs', price: '', isNHISCovered: false });
        } catch (err) {
            alert('Failed to update inventory');
        }
    };

    return (
        <div className="inventory-page">
            <header className="page-header">
                <div>
                    <h1>Medical Inventory</h1>
                    <p>Monitor stock levels and manage supplies</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Stock
                </button>
            </header>

            <div className="card" style={{ marginTop: '2rem', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search inventory..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading inventory...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Stock Level</th>
                                    <th>Unit Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? items.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: '600' }}>{item.itemName}</td>
                                        <td>{item.category}</td>
                                        <td>{item.quantity} {item.unit}</td>
                                        <td>
                                            ${item.price}
                                            {item.isNHISCovered && <span className="badge" style={{ marginLeft: '8px', background: '#2563eb', fontSize: '10px' }}>NHIS</span>}
                                        </td>
                                        <td>
                                            {item.quantity <= 10 ? (
                                                <span className="badge" style={{ background: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content' }}>
                                                    <AlertCircle size={12} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="badge" style={{ background: 'var(--success)' }}>In Stock</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No items in inventory.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '450px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Add/Update Stock</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input type="text" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Medication">Medication</option>
                                    <option value="Supplies">Supplies</option>
                                    <option value="Equipment">Equipment</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="Pcs">Pcs</option>
                                        <option value="Box">Box</option>
                                        <option value="Vial">Vial</option>
                                        <option value="Mg">Mg</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Price per Unit ($)</label>
                                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={formData.isNHISCovered} onChange={(e) => setFormData({ ...formData, isNHISCovered: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                <label style={{ margin: 0 }}>Covered by NHIS</label>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Update Inventory</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px; background: rgba(255,255,255,0.05); color: var(--text); }
            `}</style>
        </div>
    );
};

export default Inventory;
