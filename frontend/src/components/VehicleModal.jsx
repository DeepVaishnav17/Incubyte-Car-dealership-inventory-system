import { useState, useEffect } from 'react';
import { X, Car, Save } from 'lucide-react';

const CATEGORIES = ['Sedan', 'SUV', 'Sports', 'Truck', 'Van', 'Coupe', 'Hatchback', 'Convertible', 'Electric', 'Other'];

export default function VehicleModal({ isOpen, onClose, onSave, initialData }) {
    const isEdit = !!initialData;
    const [form, setForm] = useState({
        make: '', model: '', year: '', category: '', price: '', quantity: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm(initialData ? {
                make: initialData.make || '',
                model: initialData.model || '',
                year: initialData.year || '',
                category: initialData.category || '',
                price: initialData.price || '',
                quantity: initialData.quantity || '',
            } : { make: '', model: '', year: '', category: '', price: '', quantity: '' });
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onSave({
                make: form.make,
                model: form.model,
                year: parseInt(form.year),
                category: form.category,
                price: parseFloat(form.price),
                quantity: parseInt(form.quantity),
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save vehicle');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: 'make', label: 'Brand / Make', placeholder: 'e.g. Toyota', type: 'text', half: true },
        { key: 'model', label: 'Model', placeholder: 'e.g. Camry', type: 'text', half: true },
        { key: 'year', label: 'Year', placeholder: 'e.g. 2024', type: 'number', half: true },
        { key: 'price', label: 'Price (USD)', placeholder: 'e.g. 35000', type: 'number', half: true },
        { key: 'quantity', label: 'Stock Quantity', placeholder: 'e.g. 5', type: 'number', half: true },
    ];

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="glass-panel-bright modal-box">
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            borderRadius: '10px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(59,130,246,0.25)',
                        }}>
                            <Car size={18} color="white" />
                        </div>
                        <div>
                            <div className="modal-title">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                {isEdit ? `Editing ${initialData.make} ${initialData.model}` : 'Add a new vehicle to the fleet'}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-message">{error}</div>}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {fields.map(f => (
                                <div key={f.key} className="form-group" style={{ gridColumn: f.half ? undefined : '1 / -1' }}>
                                    <label className="form-label">{f.label}</label>
                                    <input
                                        type={f.type}
                                        className="glass-input"
                                        placeholder={f.placeholder}
                                        value={form[f.key]}
                                        onChange={e => handleChange(f.key, e.target.value)}
                                        required
                                        min={f.type === 'number' ? '0' : undefined}
                                    />
                                </div>
                            ))}

                            {/* Category dropdown */}
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Category</label>
                                <select
                                    className="glass-input"
                                    value={form.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    required
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="" disabled>Select a category...</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Preview */}
                        {(form.make || form.model) && (
                            <div style={{
                                padding: '0.875rem 1rem',
                                background: 'rgba(59,130,246,0.05)',
                                border: '1px solid rgba(59,130,246,0.15)',
                                borderRadius: '10px',
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                            }}>
                                <span style={{ fontSize: '1.75rem' }}>🚗</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                                        {form.year && `${form.year} `}{form.make} {form.model}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {form.category || 'Category not set'} •{' '}
                                        {form.price ? `$${parseFloat(form.price).toLocaleString()}` : 'Price not set'} •{' '}
                                        Qty: {form.quantity || '—'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span style={{
                                        width: '14px', height: '14px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite', display: 'inline-block',
                                    }} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={15} />
                                    {isEdit ? 'Save Changes' : 'Add Vehicle'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
