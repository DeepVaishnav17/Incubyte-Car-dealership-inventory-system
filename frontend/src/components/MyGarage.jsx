import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPurchases } from '../api';
import {
    Car, Calendar, ShieldCheck, Package, Clock, ChevronRight
} from 'lucide-react';

const CAR_EMOJIS_G = { Electric: '⚡', SUV: '🚙', Sports: '🏎️', Sedan: '🚗', Truck: '🚚', Coupe: '🏎️', Hatchback: '🚘', default: '🚘' };
const CAR_COLORS = ['#6366f1', '#f43f5e', '#10b981', '#a78bfa', '#f59e0b', '#06b6d4'];

// ─── Owned Car Card ──────────────────────────────────────────────
function OwnedCarCard({ car, index }) {
    const [showInvoice, setShowInvoice] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="glass-panel"
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            whileHover={{ y: -5, boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)' }}
        >
            {/* Image area */}
            <div style={{
                height: '180px', position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, #070714 0%, #121226 50%, #070714 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {/* Colored glow based on car color */}
                <div style={{
                    position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
                    width: '120px', height: '60px', borderRadius: '50%',
                    background: `radial-gradient(ellipse, ${car.color}25 0%, transparent 70%)`,
                    filter: 'blur(12px)',
                }} />
                <div style={{
                    fontSize: '5.5rem', opacity: 0.28,
                    filter: `drop-shadow(0 0 20px ${car.color}50)`,
                    animation: 'floatCar 4s ease-in-out infinite',
                }}>
                    {car.emoji}
                </div>

                {/* Tags */}
                <div style={{ position: 'absolute', top: '0.875rem', left: '0.875rem' }}>
                    <span style={{
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        padding: '0.2rem 0.6rem', borderRadius: '999px',
                        fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {car.year}
                    </span>
                </div>

                {/* Owned badge */}
                <div style={{
                    position: 'absolute', bottom: '0.875rem', left: '0.875rem',
                    background: 'rgba(16,185,129,0.12)', backdropFilter: 'blur(8px)',
                    padding: '0.22rem 0.65rem', borderRadius: '999px',
                    fontSize: '0.6875rem', fontWeight: 700, color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.22)',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                    <ShieldCheck size={10} /> Owned
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.375rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
                        {car.make} {car.model}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {car.category}
                    </div>
                </div>

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                        { label: 'Purchase Date', value: car.purchaseDate, icon: Calendar },
                        { label: 'Paid', value: `$${car.price.toLocaleString()}`, icon: Package },
                        { label: 'Warranty', value: car.warrantyStatus, icon: ShieldCheck },
                        { label: 'Category', value: car.category, icon: Car },
                    ].map(m => {
                        const Icon = m.icon;
                        return (
                            <div key={m.label} style={{
                                padding: '0.75rem', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                                    <Icon size={11} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {m.label}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: m.label === 'Paid' ? '#10b981' : 'var(--text)' }}>
                                    {m.value}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.625rem', marginTop: 'auto' }}>
                    <motion.button
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.8125rem', justifyContent: 'center' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowInvoice(true)}
                    >
                        View Acquisition Details
                    </motion.button>
                </div>
            </div>

            {/* Acquisition details modal */}
            <AnimatePresence>
                {showInvoice && (
                    <div className="modal-overlay" onClick={() => setShowInvoice(false)}>
                        <motion.div
                            className="glass-panel modal-box"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#070712',
                                border: '1px solid rgba(99,102,241,0.3)',
                                boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 40px rgba(99,102,241,0.08)',
                                borderRadius: '16px',
                                maxWidth: '460px',
                                width: '100%',
                            }}
                        >
                            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem' }}>
                                <div className="modal-title" style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 700 }}>Acquisition Details</div>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowInvoice(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>✕</button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    ['Vehicle model', `${car.year} ${car.make} ${car.model}`],
                                    ['Category type', car.category],
                                    ['Acquisition date', car.purchaseDate],
                                    ['Acquisition amount', `$${car.price.toLocaleString()}`],
                                    ['Warranty policy', car.warrantyStatus],
                                    ['Delivery status', car.orderStatus],
                                ].map(([k, v]) => (
                                    <div key={k} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.9rem 1.1rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text-muted)' }}>{k}</span>
                                        <span style={{
                                            fontSize: '0.875rem', fontWeight: 700,
                                            color: k === 'Acquisition amount' ? '#10b981' : k === 'Delivery status' ? '#6366f1' : '#fff'
                                        }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.125rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-ghost" onClick={() => {
                                    alert("Cancellation request sent to dealership admin.");
                                    setShowInvoice(false);
                                }} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                                    Cancel Acquisition
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowInvoice(false)} style={{ flex: 1, justifyContent: 'center' }}>
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── My Garage main component ────────────────────────────────────
export default function MyGarage({ vehicles = [], onBrowse }) {
    const [purchases, setPurchases] = useState([]);
    const [loadingPurchases, setLoadingPurchases] = useState(true);

    useEffect(() => {
        getPurchases()
            .then(data => setPurchases(data || []))
            .catch(() => setPurchases([]))
            .finally(() => setLoadingPurchases(false));
    }, []);

    // Map real purchase records to the OwnedCarCard format
    const ownedCars = purchases.map((p, idx) => ({
        id: p.id,
        emoji: CAR_EMOJIS_G[p.vehicle?.category] || CAR_EMOJIS_G.default,
        make: p.vehicle?.make || '—',
        model: p.vehicle?.model || '—',
        category: p.vehicle?.category || '—',
        year: p.vehicle?.year || '—',
        price: p.purchasePrice || p.vehicle?.price || 0,
        purchaseDate: p.purchaseDate
            ? new Date(p.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
        warrantyStatus: 'Active',
        orderStatus: p.orderStatus || 'CONFIRMED',
        color: CAR_COLORS[idx % CAR_COLORS.length],
    }));

    return (
        <div>
            <AnimatePresence mode="wait">
                <motion.div key="owned" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    {loadingPurchases ? (
                        <div className="dashboard-grid">
                            {[1, 2].map(i => (
                                <div key={i} className="glass-panel" style={{ overflow: 'hidden' }}>
                                    <div className="skeleton" style={{ height: '180px' }} />
                                    <div style={{ padding: '1.375rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div className="skeleton" style={{ height: '18px', width: '60%' }} />
                                        <div className="skeleton" style={{ height: '14px', width: '35%' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            {[1, 2, 3, 4].map(j => <div key={j} className="skeleton" style={{ height: '56px', borderRadius: '10px' }} />)}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div className="skeleton" style={{ height: '38px', flex: 1 }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : ownedCars.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '5rem', opacity: 0.15, animation: 'floatCar 3s ease-in-out infinite' }}>🏎️</div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Your garage is empty</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>You haven't purchased any vehicles yet. Browse our inventory to find your dream car.</p>
                            <motion.button className="btn btn-primary" onClick={onBrowse} whileHover={{ scale: 1.04 }} style={{ marginTop: '0.5rem' }}>
                                <Car size={16} /> Browse Cars
                            </motion.button>
                        </div>
                    ) : (
                        <div className="dashboard-grid">
                            {ownedCars.map((car, i) => <OwnedCarCard key={car.id} car={car} index={i} />)}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <style>{`
                @keyframes floatCar {
                    0%, 100% { transform: translateY(0px) rotate(-3deg); }
                    50% { transform: translateY(-10px) rotate(0deg); }
                }
            `}</style>
        </div>
    );
}
