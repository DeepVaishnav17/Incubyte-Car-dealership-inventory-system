import { useState, useEffect } from 'react';
import {
    getVehicles, searchVehicles, addVehicle, purchaseVehicle,
    restockVehicle, updateVehicle, deleteVehicle, getUserRole
} from '../api';
import { toast } from './Toast';
import VehicleModal from './VehicleModal';
import {
    Search, Plus, LogOut, Car, ShoppingCart, ArchiveRestore,
    Edit, Trash2, X, SlidersHorizontal, Zap
} from 'lucide-react';

function SkeletonCard() {
    return (
        <div className="glass-panel skeleton-card" style={{ overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '180px' }} />
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton" style={{ height: '20px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '20px', width: '20%', borderRadius: '999px' }} />
                </div>
                <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                    <div className="skeleton" style={{ height: '32px', flex: 1 }} />
                    <div className="skeleton" style={{ height: '32px', flex: 1 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                    <div className="skeleton" style={{ height: '28px', width: '30%' }} />
                    <div className="skeleton" style={{ height: '38px', width: '38%', borderRadius: '8px' }} />
                </div>
            </div>
        </div>
    );
}

const CAR_EMOJIS = { 'SUV': '🚙', 'Sedan': '🚗', 'Sports': '🏎️', 'Truck': '🚚', 'Van': '🚐', 'Coupe': '🏎️', 'default': '🚘' };

export default function Dashboard({ onLogout }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMake, setSearchMake] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchMinPrice, setSearchMinPrice] = useState('');
    const [searchMaxPrice, setSearchMaxPrice] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [error, setError] = useState('');
    const [purchasing, setPurchasing] = useState(null);

    const role = getUserRole();
    const isAdmin = role === 'ADMIN';

    const fetchInventory = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getVehicles();
            setVehicles(data);
        } catch {
            setError('Failed to load inventory. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInventory(); }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchVehicles(searchMake, searchCategory, searchMinPrice, searchMaxPrice);
            setVehicles(data);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchMake(''); setSearchCategory('');
        setSearchMinPrice(''); setSearchMaxPrice('');
        fetchInventory();
    };

    const handleSaveVehicle = async (vehicleData) => {
        if (editingVehicle) await updateVehicle(editingVehicle.id, vehicleData);
        else await addVehicle(vehicleData);
        fetchInventory();
    };

    const handlePurchase = async (id) => {
        setPurchasing(id);
        try {
            await purchaseVehicle(id);
            fetchInventory();
            toast.success('Purchase successful! 🎉', { title: 'Vehicle Purchased' });
        } catch (err) {
            toast.error(err.message || 'Purchase failed', { title: 'Purchase Failed' });
        } finally {
            setPurchasing(null);
        }
    };

    const handleRestock = async (id) => {
        const amount = prompt('Enter amount to restock:', '5');
        if (!amount || isNaN(amount)) return;
        try {
            await restockVehicle(id, parseInt(amount));
            fetchInventory();
            toast.success(`Restocked +${amount} units successfully`, { title: 'Stock Updated' });
        } catch (err) {
            toast.error(err.message || 'Restock failed', { title: 'Error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle? This action cannot be undone.')) return;
        try {
            await deleteVehicle(id);
            fetchInventory();
            toast.success('Vehicle removed from inventory', { title: 'Deleted' });
        } catch (err) {
            toast.error(err.message || 'Delete failed', { title: 'Error' });
        }
    };

    const availableCount = vehicles.filter(v => v.quantity > 0).length;

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="navbar-logo">
                        <Car size={18} color="white" />
                    </div>
                    <div>
                        <div className="navbar-title">Incubyte Dealership</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isAdmin && (
                        <span className="badge badge-accent" style={{ gap: '0.35rem' }}>
                            <Zap size={10} /> Admin
                        </span>
                    )}
                    <button className="btn btn-ghost" onClick={onLogout} style={{ gap: '0.5rem' }}>
                        <LogOut size={16} />
                        <span style={{ display: 'none' }} className="show-md">Logout</span>
                    </button>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: '2rem' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em',
                        background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        {isAdmin ? 'Fleet Management' : 'Vehicle Inventory'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem', fontSize: '0.9rem' }}>
                        {isAdmin
                            ? `Managing ${vehicles.length} vehicles — ${availableCount} available`
                            : `Browse ${availableCount} available vehicles`}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="stats-grid">
                    {[
                        { label: 'Total Listings', value: vehicles.length, color: '#60a5fa' },
                        { label: 'Available', value: availableCount, color: '#10b981' },
                        { label: 'Out of Stock', value: vehicles.length - availableCount, color: '#ef4444' },
                        { label: 'Brands', value: [...new Set(vehicles.map(v => v.make))].length, color: '#a78bfa' },
                    ].map(stat => (
                        <div key={stat.label} className="glass-panel stat-card">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <SlidersHorizontal size={16} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            Filter
                        </span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
                    {[
                        { ph: 'Brand (e.g. Toyota)', val: searchMake, set: setSearchMake },
                        { ph: 'Category (e.g. SUV)', val: searchCategory, set: setSearchCategory },
                        { ph: 'Min price', val: searchMinPrice, set: setSearchMinPrice, type: 'number' },
                        { ph: 'Max price', val: searchMaxPrice, set: setSearchMaxPrice, type: 'number' },
                    ].map(f => (
                        <input
                            key={f.ph}
                            type={f.type || 'text'}
                            className="glass-input"
                            placeholder={f.ph}
                            value={f.val}
                            onChange={e => f.set(e.target.value)}
                            style={{ flex: '1 1 140px', minWidth: 0 }}
                        />
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                        <Search size={16} /> Search
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={handleClear} style={{ flexShrink: 0 }}>
                        <X size={16} />
                    </button>
                </form>

                {/* Section Header */}
                <div className="section-header">
                    <div>
                        <div className="section-title">Current Inventory</div>
                        {!loading && (
                            <div className="section-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found</div>
                        )}
                    </div>
                    {isAdmin && (
                        <button className="btn btn-primary" onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}>
                            <Plus size={16} /> Add Vehicle
                        </button>
                    )}
                </div>

                {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                {/* Vehicle Grid */}
                <div className="dashboard-grid">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : vehicles.length === 0 ? (
                        <div className="glass-panel empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <div className="empty-state-title">No vehicles found</div>
                            <div className="empty-state-subtitle">Try adjusting your search filters</div>
                            <button className="btn btn-outline" onClick={handleClear} style={{ marginTop: '0.5rem' }}>
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        vehicles.map(v => {
                            const inStock = v.quantity > 0;
                            const carEmoji = CAR_EMOJIS[v.category] || CAR_EMOJIS.default;
                            return (
                                <div key={v.id} className="glass-panel vehicle-card animate-fade-in">
                                    {/* Image Area */}
                                    <div className="vehicle-card-image">
                                        <div className="vehicle-card-icon">{carEmoji}</div>
                                        {/* Year tag */}
                                        <div style={{
                                            position: 'absolute', top: '1rem', left: '1rem',
                                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                            padding: '0.25rem 0.625rem', borderRadius: '999px',
                                            fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}>
                                            {v.year}
                                        </div>
                                        {/* Stock badge */}
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                            <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>
                                                {inStock ? `${v.quantity} left` : 'Sold Out'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="vehicle-card-body">
                                        <div className="vehicle-card-header">
                                            <div>
                                                <div className="vehicle-card-title">{v.make} {v.model}</div>
                                                <div className="vehicle-card-subtitle">{v.category}</div>
                                            </div>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                    <button
                                                        className="action-btn success"
                                                        onClick={() => handleRestock(v.id)}
                                                        title="Restock"
                                                    >
                                                        <ArchiveRestore size={14} />
                                                    </button>
                                                    <button
                                                        className="action-btn accent"
                                                        onClick={() => { setEditingVehicle(v); setIsModalOpen(true); }}
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        className="action-btn danger"
                                                        onClick={() => handleDelete(v.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="vehicle-card-meta">
                                            <div className="vehicle-meta-item">
                                                <div className="vehicle-meta-label">Category</div>
                                                <div className="vehicle-meta-value">{v.category}</div>
                                            </div>
                                            <div className="vehicle-meta-item">
                                                <div className="vehicle-meta-label">Stock</div>
                                                <div className="vehicle-meta-value" style={{ color: inStock ? 'var(--success)' : 'var(--danger)' }}>
                                                    {v.quantity}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="vehicle-card-footer">
                                            <div className="vehicle-price">${v.price.toLocaleString()}</div>
                                            <button
                                                className={`btn ${inStock ? 'btn-primary' : 'btn-ghost'}`}
                                                onClick={() => handlePurchase(v.id)}
                                                disabled={!inStock || purchasing === v.id}
                                                style={{ fontSize: '0.8125rem', padding: '0.625rem 1.125rem' }}
                                            >
                                                {purchasing === v.id ? (
                                                    <span style={{
                                                        width: '14px', height: '14px',
                                                        border: '2px solid rgba(255,255,255,0.3)',
                                                        borderTopColor: '#fff', borderRadius: '50%',
                                                        animation: 'spin 0.7s linear infinite', display: 'inline-block',
                                                    }} />
                                                ) : (
                                                    <ShoppingCart size={14} />
                                                )}
                                                {inStock ? 'Purchase' : 'Unavailable'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <VehicleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }}
                onSave={handleSaveVehicle}
                initialData={editingVehicle}
            />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
