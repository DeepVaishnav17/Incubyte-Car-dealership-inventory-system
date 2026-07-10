import { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function VehicleModal({ isOpen, onClose, onSave }) {
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await onSave({ 
                make, 
                model, 
                year: parseInt(year), 
                price: parseFloat(price) 
            });
            
            // Reset and close
            setMake(''); setModel(''); setYear(''); setPrice('');
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <div className="flex justify-between items-center mb-8">
                    <h2>Restock Vehicle</h2>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input className="glass-input" placeholder="Make (e.g. Toyota)" value={make} onChange={e => setMake(e.target.value)} required />
                    <input className="glass-input" placeholder="Model (e.g. Camry)" value={model} onChange={e => setModel(e.target.value)} required />
                    <input className="glass-input" type="number" placeholder="Year (e.g. 2024)" value={year} onChange={e => setYear(e.target.value)} required min="1886" />
                    <input className="glass-input" type="number" step="0.01" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required min="0" />
                    
                    <div className="flex justify-between mt-4">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Save size={18} /> Save Vehicle</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
