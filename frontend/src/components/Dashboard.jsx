import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getVehicles, searchVehicles, addVehicle, purchaseVehicle,
    restockVehicle, updateVehicle, deleteVehicle, getUserRole
} from '../api';
import { toast } from './Toast';
import VehicleModal from './VehicleModal';
import PurchasesSection from './PurchasesSection';
import MyGarage from './MyGarage';
import {
    Search, Plus, LogOut, Car, ShoppingCart, ArchiveRestore,
    Edit, Trash2, X, SlidersHorizontal, Zap, LayoutGrid,
    TrendingUp, Package, Users, DollarSign, BarChart2,
    Sparkles, HelpCircle
} from 'lucide-react';

// ─── Animated Counter Hook ──────────────────────────────────────
function useCountUp(target, duration = 1000) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!target) return setCount(0);
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return count;
}

// ─── Sparkline Component ─────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }) {
    if (!data || data.length < 2) return null;
    const W = 72, H = 28;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 4) - 2;
        return `${x},${y}`;
    });
    const areaPoints = `0,${H} ${pts.join(' ')} ${W},${H}`;
    return (
        <svg width={W} height={H} style={{ overflow: 'visible', opacity: 0.85 }}>
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#sg-${color.replace('#', '')})`} />
            <polyline points={pts.join(' ')} fill="none" stroke={color}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, glow, prefix = '', suffix = '', spark, delay = 0 }) {
    const count = useCountUp(typeof value === 'number' ? value : 0);
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: 'easeOut' }}
            className="glass-panel stat-card"
            style={{ position: 'relative', overflow: 'hidden' }}
            whileHover={{ y: -4, boxShadow: `0 16px 36px rgba(0,0,0,0.5), 0 0 0 1px ${color}30` }}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)`
            }} />
            <div style={{
                position: 'absolute', top: '-15px', right: '-15px',
                width: '60px', height: '60px', borderRadius: '50%',
                background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${glow}`, border: `1px solid ${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color
                }}>
                    <Icon size={16} />
                </div>
                {spark && <Sparkline data={spark} color={color} />}
            </div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginTop: '0.25rem' }}>
                {prefix}{typeof value === 'number' ? count.toLocaleString() : value}{suffix}
            </div>
        </motion.div>
    );
}

// ─── Skeleton Card ───────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="glass-panel" style={{ overflow: 'hidden', height: '360px' }}>
            <div className="skeleton" style={{ height: '180px' }} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="skeleton" style={{ height: '20px', width: '70%' }} />
                <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div className="skeleton" style={{ height: '48px', borderRadius: '8px', flex: 1 }} />
                    <div className="skeleton" style={{ height: '48px', borderRadius: '8px', flex: 1 }} />
                </div>
            </div>
        </div>
    );
}

const CAR_EMOJIS = { SUV: '🚙', Sedan: '🚗', Sports: '🏎️', Electric: '⚡', Truck: '🚚', Coupe: '🏎️', Hatchback: '🚘', default: '🚘' };
const SPARK_SAMPLES = [[2,5,3,7,6,9,7,10], [4,3,6,5,8,7,9,10], [1,3,2,6,4,7,8,10], [6,4,8,5,9,7,10,9]];

// ─── Hero Section ────────────────────────────────────────────────
function HeroSection({ isAdmin, totalListings, availableCount }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: 'var(--radius)',
                padding: '2.25rem 2.25rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 50%, rgba(16,185,129,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.06)'
            }}
        >
            <div style={{
                position: 'absolute', top: '-40px', right: '10%',
                width: '280px', height: '280px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 75%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-40px', left: '5%',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 75%)',
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span className="badge badge-accent">
                            <Sparkles size={10} /> {isAdmin ? 'ADMIN PORTAL' : 'MEMBER EXCLUSIVE'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {availableCount} Models Available to Drive
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                        fontWeight: 900, letterSpacing: '-0.04em',
                        background: 'linear-gradient(135deg, #fff 40%, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem', lineHeight: 1.1
                    }}>
                        {isAdmin ? 'Elevate Fleet Strategy' : 'Discover Performance'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '460px', lineHeight: 1.6 }}>
                        {isAdmin
                            ? 'Configure brand listings, track operations, restock quantities, and monitor dealership metrics from a unified panel.'
                            : 'Explore state-of-the-art sports cars, electric, and luxury SUVs. Complete your acquisition instantly.'}
                    </p>
                </div>
                <div style={{
                    fontSize: '5.5rem', opacity: 0.16,
                    animation: 'floatHeroCar 4s ease-in-out infinite',
                    userSelect: 'none', flexShrink: 0
                }}>
                    🏎️
                </div>
            </div>
            <style>{`
                @keyframes floatHeroCar {
                    0%, 100% { transform: translateY(0px) rotate(-4deg); }
                    50% { transform: translateY(-8px) rotate(-1deg); }
                }
            `}</style>
        </motion.div>
    );
}

// ─── Vehicle Card ────────────────────────────────────────────────
function VehicleCard({ v, isAdmin, onEdit, onDelete, onRestock, onPurchase, purchasing, index }) {
    const inStock = v.quantity > 0;
    const emoji = CAR_EMOJIS[v.category] || CAR_EMOJIS.default;
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="glass-panel vehicle-card"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -6 }}
            style={{
                boxShadow: hovered
                    ? '0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.25), 0 0 20px rgba(99,102,241,0.06)'
                    : undefined,
                borderColor: hovered ? 'rgba(99,102,241,0.25)' : undefined
            }}
        >
            {/* Visual Container */}
            <div className="vehicle-card-image" style={{
                height: '180px', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #090912 0%, #15152a 100%)'
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: hovered ? 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(6,182,212,0.03))' : 'transparent',
                    transition: 'background 0.3s'
                }} />

                {/* Reflection Sweep Effect */}
                <div style={{
                    position: 'absolute', inset: 0, overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-50%', left: '-100%',
                        width: '50%', height: '200%',
                        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 65%)',
                        transform: hovered ? 'translateX(400%)' : 'translateX(0%)',
                        transition: 'transform 0.75s ease-out'
                    }} />
                </div>

                <div className="vehicle-card-icon" style={{
                    fontSize: '5rem',
                    opacity: hovered ? 0.35 : 0.18,
                    transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(-2deg)'
                }}>
                    {emoji}
                </div>

                <div style={{ position: 'absolute', top: '0.875rem', left: '0.875rem' }}>
                    <span style={{
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                        padding: '0.2rem 0.5rem', borderRadius: '999px',
                        fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        {v.year}
                    </span>
                </div>
                <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem' }}>
                    <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>
                        {inStock ? `${v.quantity} Units` : 'Sold Out'}
                    </span>
                </div>
            </div>

            {/* Description Body */}
            <div className="vehicle-card-body">
                <div className="vehicle-card-header">
                    <div>
                        <div className="vehicle-card-title">{v.make} {v.model}</div>
                        <div className="vehicle-card-subtitle">{v.category}</div>
                    </div>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                            <button className="action-btn success" onClick={() => onRestock(v.id)} title="Restock"><ArchiveRestore size={13} /></button>
                            <button className="action-btn accent" onClick={() => onEdit(v)} title="Edit"><Edit size={13} /></button>
                            <button className="action-btn danger" onClick={() => onDelete(v.id)} title="Delete"><Trash2 size={13} /></button>
                        </div>
                    )}
                </div>

                <div className="vehicle-card-meta">
                    <div className="vehicle-meta-item">
                        <div className="vehicle-meta-label">Brand</div>
                        <div className="vehicle-meta-value">{v.make}</div>
                    </div>
                    <div className="vehicle-meta-item">
                        <div className="vehicle-meta-label">Category</div>
                        <div className="vehicle-meta-value">{v.category}</div>
                    </div>
                    <div className="vehicle-meta-item">
                        <div className="vehicle-meta-label">Availability</div>
                        <div className="vehicle-meta-value" style={{ color: inStock ? 'var(--success)' : 'var(--danger)' }}>
                            {inStock ? 'In Stock' : 'None'}
                        </div>
                    </div>
                </div>

                <div className="vehicle-card-footer">
                    <div className="vehicle-price">${v.price.toLocaleString()}</div>
                    <motion.button
                        className={`btn ${inStock ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => onPurchase(v.id)}
                        disabled={!inStock || purchasing === v.id}
                        style={{ fontSize: '0.8125rem', padding: '0.625rem 1.125rem' }}
                        whileTap={{ scale: 0.96 }}
                    >
                        {purchasing === v.id ? (
                            <span style={{
                                width: '14px', height: '14px',
                                border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                                display: 'inline-block'
                            }} />
                        ) : <ShoppingCart size={14} />}
                        {inStock ? 'Purchase' : 'Unavailable'}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Dashboard Component ─────────────────────────────────────
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
    const [activeTab, setActiveTab] = useState(''); // will default based on role
    const [searchFocused, setSearchFocused] = useState(false);
    const [restockVehicleId, setRestockVehicleId] = useState(null);
    const [restockAmount, setRestockAmount] = useState('5');

    const role = getUserRole();
    const isAdmin = role === 'ADMIN';

    // Auto-select first tab based on role
    useEffect(() => {
        setActiveTab(isAdmin ? 'inventory' : 'garage');
    }, [isAdmin]);

    const fetchInventory = async () => {
        setLoading(true); setError('');
        try {
            const data = await getVehicles();
            setVehicles(data);
        } catch {
            setError('Failed to fetch catalog.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInventory(); }, []);

    const handleSearch = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const data = await searchVehicles(searchMake, searchCategory, searchMinPrice, searchMaxPrice);
            setVehicles(data);
        } catch {
            setError('Filter search failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchMake(''); setSearchCategory('');
        setSearchMinPrice(''); setSearchMaxPrice('');
        fetchInventory();
    };

    const handleSaveVehicle = async (data) => {
        try {
            if (editingVehicle) await updateVehicle(editingVehicle.id, data);
            else await addVehicle(data);
            toast.success(editingVehicle ? 'Vehicle details updated.' : 'Added to inventory.', { title: 'Fleet Updated' });
            fetchInventory();
            setIsModalOpen(false);
            setEditingVehicle(null);
        } catch (err) {
            toast.error(err.message || 'Operation failed', { title: 'Error' });
        }
    };

    const handlePurchase = async (id) => {
        setPurchasing(id);
        try {
            await purchaseVehicle(id);
            fetchInventory();
            toast.success('Acquisition complete! Check My Garage.', { title: 'Vehicle Purchased' });
        } catch (err) {
            toast.error(err.message || 'Purchase failed', { title: 'Purchase Failed' });
        } finally {
            setPurchasing(null);
        }
    };

    const handleRestockClick = (id) => {
        setRestockVehicleId(id);
        setRestockAmount('5');
    };

    const submitRestock = async () => {
        if (!restockAmount || isNaN(restockAmount)) return;
        try {
            await restockVehicle(restockVehicleId, parseInt(restockAmount));
            fetchInventory();
            toast.success(`Added +${restockAmount} units to availability.`, { title: 'Inventory Restocked' });
            setRestockVehicleId(null);
        } catch (err) {
            toast.error(err.message || 'Restock failed', { title: 'Error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await deleteVehicle(id);
            fetchInventory();
            toast.success('Listing deleted from catalog.', { title: 'Item Removed' });
        } catch (err) {
            toast.error(err.message || 'Delete failed', { title: 'Error' });
        }
    };

    const availableCount = vehicles.filter(v => v.quantity > 0).length;
    const brandsCount = [...new Set(vehicles.map(v => v.make))].length;
    const totalValue = vehicles.reduce((s, v) => s + v.price * v.quantity, 0);

    const TABS = isAdmin
        ? [
            { id: 'inventory', label: 'Fleet Inventory', icon: LayoutGrid },
            { id: 'purchases', label: 'Client Purchases', icon: BarChart2 },
        ]
        : [
            { id: 'garage', label: 'My Garage', icon: Car },
            { id: 'inventory', label: 'Acquire Vehicles', icon: LayoutGrid },
        ];

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Top Navigation */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="navbar-logo"><Car size={16} color="white" /></div>
                    <div className="navbar-title">Incubyte Dealership</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isAdmin && <span className="badge badge-accent"><Zap size={10} /> Dealer Admin</span>}
                    <motion.button
                        className="btn btn-ghost"
                        onClick={onLogout}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{ height: '36px', padding: '0 0.875rem' }}
                    >
                        <LogOut size={14} /> Logout
                    </motion.button>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: '2.5rem' }}>
                {/* Visual Header */}
                <HeroSection isAdmin={isAdmin} totalListings={vehicles.length} availableCount={availableCount} />

                {/* Metrics */}
                <div className="stats-grid" style={{ marginBottom: '2.25rem' }}>
                    <StatCard label="Total Catalog" value={vehicles.length} icon={Car} color="#6366f1" glow="rgba(99,102,241,0.15)" spark={SPARK_SAMPLES[0]} delay={0} />
                    <StatCard label="Models Available" value={availableCount} icon={Package} color="#06b6d4" glow="rgba(6,182,212,0.15)" spark={SPARK_SAMPLES[1]} delay={0.05} />
                    <StatCard label="Out Of Stock" value={vehicles.length - availableCount} icon={TrendingUp} color="#f43f5e" glow="rgba(244,63,94,0.15)" spark={SPARK_SAMPLES[2]} delay={0.1} />
                    <StatCard label="Unique Brands" value={brandsCount} icon={Users} color="#a78bfa" glow="rgba(139,92,246,0.15)" spark={SPARK_SAMPLES[3]} delay={0.15} />
                    {isAdmin && <StatCard label="Assets Valuation" value={Math.round(totalValue / 1000)} prefix="$" suffix="K" icon={DollarSign} color="#f59e0b" glow="rgba(245,158,11,0.15)" spark={SPARK_SAMPLES[0]} delay={0.2} />}
                </div>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex', gap: '0.25rem',
                    background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                    padding: '0.25rem', marginBottom: '2.25rem',
                    width: 'fit-content', border: '1px solid var(--border)'
                }}>
                    {TABS.map(t => {
                        const Icon = t.icon;
                        const isSelected = activeTab === t.id;
                        return (
                            <motion.button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1.125rem', borderRadius: '9px',
                                    border: 'none', cursor: 'pointer',
                                    fontFamily: 'var(--font-display)', fontWeight: 600,
                                    fontSize: '0.875rem',
                                    background: isSelected ? 'linear-gradient(135deg, var(--accent), #4f46e5)' : 'transparent',
                                    color: isSelected ? '#fff' : 'var(--text-muted)',
                                    boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                                whileHover={{ scale: isSelected ? 1 : 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Icon size={14} />
                                {t.label}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Dynamic Content Panels */}
                <AnimatePresence mode="wait">
                    {activeTab === 'inventory' && (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Search Filters */}
                            <form onSubmit={handleSearch} className="search-bar" style={{
                                marginBottom: '2rem',
                                boxShadow: searchFocused ? '0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.4)' : undefined,
                                transition: 'box-shadow 0.3s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <SlidersHorizontal size={14} />
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter</span>
                                </div>
                                <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
                                {[
                                    { ph: 'Brand (e.g. Porsche)', val: searchMake, set: setSearchMake },
                                    { ph: 'Category (e.g. Sports)', val: searchCategory, set: setSearchCategory },
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
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                        style={{ flex: '1 1 150px', minWidth: 0 }}
                                    />
                                ))}
                                <motion.button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Search size={15} /> Search
                                </motion.button>
                                <button type="button" className="btn btn-ghost" onClick={handleClear} style={{ flexShrink: 0, padding: '0.5rem' }}>
                                    <X size={15} />
                                </button>
                            </form>

                            {/* Section Title */}
                            <div className="section-header">
                                <div>
                                    <div className="section-title">Current Listings</div>
                                    {!loading && <div className="section-subtitle">{vehicles.length} Models matched</div>}
                                </div>
                                {isAdmin && (
                                    <motion.button
                                        className="btn btn-primary"
                                        onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
                                        whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Plus size={15} /> Add Vehicle
                                    </motion.button>
                                )}
                            </div>

                            {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                            {/* Grid View */}
                            <div className="dashboard-grid">
                                {loading
                                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                                    : vehicles.length === 0
                                        ? (
                                            <motion.div className="glass-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 2rem', textAlign: 'center' }}
                                            >
                                                <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem', animation: 'floatEmpty 3s ease-in-out infinite' }}>🚘</div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Dealership showroom is empty</h3>
                                                <p style={{ color: 'var(--text-muted)', maxWidth: '340px', lineHeight: 1.6 }}>
                                                    {isAdmin ? 'Configure the initial fleet by creating new vehicle profiles.' : 'No listings match the filter query. Reset search parameters.'}
                                                </p>
                                                {isAdmin ? (
                                                    <motion.button className="btn btn-primary" style={{ marginTop: '0.5rem' }}
                                                        onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
                                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                        <Plus size={15} /> Register First Vehicle
                                                    </motion.button>
                                                ) : (
                                                    <button className="btn btn-outline" onClick={handleClear} style={{ marginTop: '0.5rem' }}>Reset Filters</button>
                                                )}
                                                <style>{`@keyframes floatEmpty { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }`}</style>
                                            </motion.div>
                                        )
                                        : vehicles.map((v, i) => (
                                            <VehicleCard
                                                key={v.id}
                                                v={v}
                                                index={i}
                                                isAdmin={isAdmin}
                                                onEdit={vehicle => { setEditingVehicle(vehicle); setIsModalOpen(true); }}
                                                onDelete={handleDelete}
                                                onRestock={handleRestockClick}
                                                onPurchase={handlePurchase}
                                                purchasing={purchasing}
                                            />
                                        ))
                                }
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'purchases' && isAdmin && (
                        <motion.div key="purchases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                            <PurchasesSection />
                        </motion.div>
                    )}

                    {activeTab === 'garage' && !isAdmin && (
                        <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                            <MyGarage vehicles={vehicles} onBrowse={() => setActiveTab('inventory')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <VehicleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }}
                onSave={handleSaveVehicle}
                initialData={editingVehicle}
            />

            {/* Restock Quantity Modal */}
            <AnimatePresence>
                {restockVehicleId && (
                    <div className="modal-overlay" onClick={() => setRestockVehicleId(null)}>
                        <motion.div
                            className="glass-panel modal-box"
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#070712',
                                border: '1px solid rgba(99,102,241,0.3)',
                                boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 40px rgba(99,102,241,0.08)',
                                borderRadius: '16px',
                                maxWidth: '380px',
                                width: '100%',
                            }}
                        >
                            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem' }}>
                                <div className="modal-title" style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 700 }}>Restock Vehicle</div>
                                <button className="btn btn-ghost btn-icon" onClick={() => setRestockVehicleId(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>✕</button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    Specify the number of new units to add to this vehicle listing's current stock.
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ color: 'var(--accent-bright)', fontWeight: 700 }}>Quantity to Add</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ background: '#02020a', border: '1px solid var(--border)', padding: '0.75rem', fontSize: '1.125rem', color: '#fff' }}
                                        value={restockAmount}
                                        onChange={e => setRestockAmount(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.125rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setRestockVehicleId(null)} style={{ flex: 1, justifyContent: 'center' }}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={submitRestock} style={{ flex: 1, justifyContent: 'center' }}>
                                    Update Stock
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
