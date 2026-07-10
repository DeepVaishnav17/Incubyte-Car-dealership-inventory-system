import { useState, useEffect } from 'react';
import { getVehicles, searchVehicles, addVehicle, sellVehicle } from '../api';
import VehicleModal from './VehicleModal';
import { Search, Plus, LogOut, Car, Tag } from 'lucide-react';

export default function Dashboard({ onLogout }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMake, setSearchMake] = useState('');
    const [searchModel, setSearchModel] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await getVehicles();
            setVehicles(data);
        } catch (err) {
            setError('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchVehicles(searchMake, searchModel, '');
            setVehicles(data);
        } catch (err) {
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async (vehicleData) => {
        await addVehicle(vehicleData);
        fetchInventory();
    };

    const handleSell = async (id) => {
        try {
            await sellVehicle(id);
            fetchInventory();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="container">
            <nav className="flex justify-between items-center mb-8 glass-panel" style={{ padding: '1rem 2rem' }}>
                <h1 className="text-gradient flex items-center gap-4" style={{ margin: 0 }}>
                    <Car /> Dealership Admin
                </h1>
                <button className="btn btn-ghost" onClick={onLogout}>
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div className="glass-panel mb-8" style={{ padding: '1.5rem' }}>
                <form onSubmit={handleSearch} className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <input className="glass-input" placeholder="Search Make..." value={searchMake} onChange={e => setSearchMake(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <input className="glass-input" placeholder="Search Model..." value={searchModel} onChange={e => setSearchModel(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <Search size={18} /> Search
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setSearchMake(''); setSearchModel(''); fetchInventory(); }}>
                        Clear
                    </button>
                </form>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2>Current Inventory</h2>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Restock Vehicle
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
            ) : (
                <div className="dashboard-grid">
                    {vehicles.map(v => (
                        <div key={v.id} className="glass-panel vehicle-card">
                            <div className="vehicle-header">
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{v.year} {v.make}</h3>
                                <span className={`badge ${v.status}`}>{v.status}</span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '1.1rem', margin: 0 }}>{v.model}</p>
                            
                            <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)' }}>
                                    ${v.price.toLocaleString()}
                                </span>
                                {v.status === 'AVAILABLE' && (
                                    <button className="btn btn-danger" onClick={() => handleSell(v.id)}>
                                        <Tag size={16} /> Sell
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {vehicles.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }} className="glass-panel text-muted">
                            No vehicles found.
                        </div>
                    )}
                </div>
            )}

            <VehicleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleAddVehicle} 
            />
        </div>
    );
}
