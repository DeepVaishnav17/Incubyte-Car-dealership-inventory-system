import { useState, useEffect } from 'react';
import { getVehicles, searchVehicles, addVehicle, purchaseVehicle, restockVehicle, getUserRole } from '../api';
import VehicleModal from './VehicleModal';
import { Search, Plus, LogOut, Car, ShoppingCart, ArchiveRestore } from 'lucide-react';

export default function Dashboard({ onLogout }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMake, setSearchMake] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchMinPrice, setSearchMinPrice] = useState('');
    const [searchMaxPrice, setSearchMaxPrice] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    
    const role = getUserRole();
    const isAdmin = role === 'ADMIN';

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
            const data = await searchVehicles(searchMake, searchCategory, searchMinPrice, searchMaxPrice);
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

    const handlePurchase = async (id) => {
        try {
            await purchaseVehicle(id);
            fetchInventory();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRestock = async (id) => {
        const amount = prompt("Enter amount to restock:", "5");
        if (!amount || isNaN(amount)) return;
        try {
            await restockVehicle(id, parseInt(amount));
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
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <input className="glass-input" placeholder="Make..." value={searchMake} onChange={e => setSearchMake(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <input className="glass-input" placeholder="Category..." value={searchCategory} onChange={e => setSearchCategory(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '100px' }}>
                        <input type="number" className="glass-input" placeholder="Min $" value={searchMinPrice} onChange={e => setSearchMinPrice(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '100px' }}>
                        <input type="number" className="glass-input" placeholder="Max $" value={searchMaxPrice} onChange={e => setSearchMaxPrice(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <Search size={18} /> Search
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setSearchMake(''); setSearchCategory(''); setSearchMinPrice(''); setSearchMaxPrice(''); fetchInventory(); }}>
                        Clear
                    </button>
                </form>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2>Current Inventory</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add New Model
                    </button>
                )}
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
                                <span className={`badge`} style={{ background: v.quantity > 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: v.quantity > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                                    Stock: {v.quantity}
                                </span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '1.1rem', margin: '0.25rem 0 0 0' }}>{v.model} ({v.category})</p>
                            
                            <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)' }}>
                                    ${v.price.toLocaleString()}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {isAdmin && (
                                        <button className="btn btn-ghost" onClick={() => handleRestock(v.id)} style={{ padding: '0.5rem' }}>
                                            <ArchiveRestore size={16} />
                                        </button>
                                    )}
                                    <button className="btn btn-primary" onClick={() => handlePurchase(v.id)} disabled={v.quantity <= 0}>
                                        <ShoppingCart size={16} /> Buy
                                    </button>
                                </div>
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
