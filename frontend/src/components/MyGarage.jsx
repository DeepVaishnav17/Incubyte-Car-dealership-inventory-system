import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Download, Eye, Heart, Clock, Calendar,
    ShieldCheck, Package, Star, ChevronRight, Plus, Zap
} from 'lucide-react';

// ─── Placeholder garage data ─────────────────────────────────────
const MOCK_OWNED = [
    {
        id: 1, emoji: '🏎️', make: 'Porsche', model: '911 GT3',
        category: 'Sports', year: 2024, price: 115000,
        purchaseDate: '2025-06-15', warrantyStatus: 'Active',
        orderStatus: 'delivered', color: '#ef4444',
    },
    {
        id: 2, emoji: '🚙', make: 'BMW', model: 'X5 M',
        category: 'SUV', year: 2023, price: 87500,
        purchaseDate: '2025-05-20', warrantyStatus: 'Active',
        orderStatus: 'delivered', color: '#3b82f6',
    },
];

const MOCK_WISHLIST = [
    { id: 3, emoji: '⚡', make: 'Tesla', model: 'Model S Plaid', category: 'Electric', year: 2024, price: 94990 },
    { id: 4, emoji: '🚗', make: 'Audi', model: 'RS7', category: 'Sedan', year: 2024, price: 118000 },
    { id: 5, emoji: '🏎️', make: 'Ferrari', model: 'Roma', category: 'Sports', year: 2024, price: 230000 },
];

const MOCK_RECOMMENDED = [
    { id: 6, emoji: '🚙', make: 'Mercedes', model: 'GLE 63 S', category: 'SUV', year: 2024, price: 108000, rating: 4.9 },
    { id: 7, emoji: '🚗', make: 'Lamborghini', model: 'Urus', category: 'SUV', year: 2024, price: 245000, rating: 5.0 },
    { id: 8, emoji: '⚡', make: 'Rivian', model: 'R1T', category: 'Electric', year: 2024, price: 73000, rating: 4.7 },
];

const STATUS_CFG = {
    delivered: { label: 'Delivered', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    processing: { label: 'Processing', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    shipped: { label: 'Shipped', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    'Active': { label: 'Active ✓', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    'Expired': { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
};

function StatusPill({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.processing;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: '999px',
            fontSize: '0.6875rem', fontWeight: 700,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color }} />
            {cfg.label}
        </span>
    );
}

// ─── Owned Car Card ──────────────────────────────────────────────
function OwnedCarCard({ car, index }) {
    const [showInvoice, setShowInvoice] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="glass-panel"
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            whileHover={{ y: -5, boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.2)' }}
        >
            {/* Image area */}
            <div style={{
                height: '180px', position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f172a 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {/* Colored glow based on car color */}
                <div style={{
                    position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
                    width: '120px', height: '60px', borderRadius: '50%',
                    background: `radial-gradient(ellipse, ${car.color}30 0%, transparent 70%)`,
                    filter: 'blur(12px)',
                }} />
                <div style={{
                    fontSize: '5.5rem', opacity: 0.28,
                    filter: `drop-shadow(0 0 20px ${car.color}60)`,
                    animation: 'floatCar 4s ease-in-out infinite',
                }}>
                    {car.emoji}
                </div>

                {/* Tags */}
                <div style={{ position: 'absolute', top: '0.875rem', left: '0.875rem' }}>
                    <span style={{
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                        padding: '0.2rem 0.6rem', borderRadius: '999px',
                        fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {car.year}
                    </span>
                </div>
                <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem' }}>
                    <StatusPill status={car.orderStatus} />
                </div>

                {/* Owned badge */}
                <div style={{
                    position: 'absolute', bottom: '0.875rem', left: '0.875rem',
                    background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(8px)',
                    padding: '0.2rem 0.6rem', borderRadius: '999px',
                    fontSize: '0.6875rem', fontWeight: 700, color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                    <ShieldCheck size={10} /> Owned
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.375rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
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
                                background: 'rgba(255,255,255,0.03)',
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
                        className="btn btn-outline"
                        style={{ flex: 1, fontSize: '0.8125rem' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowInvoice(true)}
                    >
                        <Download size={14} /> Invoice
                    </motion.button>
                    <motion.button
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.8125rem' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Eye size={14} /> Details
                    </motion.button>
                </div>
            </div>

            {/* Invoice modal */}
            <AnimatePresence>
                {showInvoice && (
                    <div className="modal-overlay" onClick={() => setShowInvoice(false)}>
                        <motion.div
                            className="glass-panel-bright modal-box"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-title">📄 Invoice #{car.id.toString().padStart(6, '0')}</div>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowInvoice(false)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        ['Vehicle', `${car.year} ${car.make} ${car.model}`],
                                        ['Category', car.category],
                                        ['Purchase Date', car.purchaseDate],
                                        ['Amount', `$${car.price.toLocaleString()}`],
                                        ['Status', 'PAID'],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{k}</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: k === 'Amount' ? '#10b981' : k === 'Status' ? '#10b981' : 'var(--text)' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-ghost" onClick={() => setShowInvoice(false)}>Cancel</button>
                                <button className="btn btn-primary"><Download size={15} /> Download PDF</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Wishlist Card ───────────────────────────────────────────────
function WishlistCard({ car, index, onBrowse }) {
    const [hearted, setHearted] = useState(true);
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.07 }}
            className="glass-panel"
            style={{ padding: '1.125rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
            whileHover={{ x: 4, background: 'rgba(255,255,255,0.05)' }}
            onClick={onBrowse}
        >
            <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', flexShrink: 0,
            }}>
                {car.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {car.make} {car.model}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{car.category} · {car.year}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#10b981' }}>${(car.price / 1000).toFixed(0)}K</div>
                <motion.button
                    onClick={e => { e.stopPropagation(); setHearted(!hearted); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: hearted ? '#ef4444' : 'var(--text-muted)', display: 'flex' }}
                    whileTap={{ scale: 1.3 }}
                >
                    <Heart size={16} fill={hearted ? '#ef4444' : 'none'} />
                </motion.button>
            </div>
        </motion.div>
    );
}

// ─── Recommended Card ────────────────────────────────────────────
function RecommendedCard({ car, index, onBrowse }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-panel"
            style={{ padding: '1.125rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15)' }}
            onClick={onBrowse}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.625rem', flexShrink: 0,
                }}>
                    {car.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{car.make} {car.model}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{car.category} · {car.year}</div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981' }}>${car.price.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: '#f59e0b', fontWeight: 600 }}>
                    <Star size={13} fill="#f59e0b" /> {car.rating}
                </div>
            </div>
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a78bfa', background: 'rgba(139,92,246,0.12)', padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(139,92,246,0.2)' }}>
                    For You
                </span>
            </div>
        </motion.div>
    );
}

// ─── My Garage main component ────────────────────────────────────
export default function MyGarage({ vehicles = [], onBrowse }) {
    const [garageTab, setGarageTab] = useState('owned');

    const GARAGE_TABS = [
        { id: 'owned', label: `My Cars (${MOCK_OWNED.length})`, icon: Car },
        { id: 'wishlist', label: `Wishlist (${MOCK_WISHLIST.length})`, icon: Heart },
        { id: 'recommended', label: 'Recommended', icon: Star },
    ];

    return (
        <div>
            {/* Garage tab bar */}
            <div style={{
                display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                marginBottom: '1.5rem',
            }}>
                {GARAGE_TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = garageTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setGarageTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', borderRadius: '10px',
                                border: active ? '1px solid rgba(59,130,246,0.35)' : '1px solid var(--border)',
                                cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600,
                                fontSize: '0.875rem',
                                background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                                color: active ? 'var(--accent-bright)' : 'var(--text-muted)',
                                transition: 'all 0.2s ease',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Icon size={14} /> {tab.label}
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {/* ── Owned cars ────────────────────────────── */}
                {garageTab === 'owned' && (
                    <motion.div key="owned" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        {MOCK_OWNED.length === 0 ? (
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
                                {MOCK_OWNED.map((car, i) => <OwnedCarCard key={car.id} car={car} index={i} />)}
                            </div>
                        )}

                        {/* Upcoming test drives placeholder */}
                        <div style={{ marginTop: '2rem' }}>
                            <div className="section-title" style={{ marginBottom: '1rem' }}>Upcoming Test Drives</div>
                            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                <Clock size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
                                <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No upcoming test drives</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                                    Book a test drive for any vehicle in our inventory.
                                </div>
                                <button className="btn btn-outline" onClick={onBrowse} style={{ fontSize: '0.8125rem' }}>
                                    <ChevronRight size={14} /> Browse & Book
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Wishlist ───────────────────────────────── */}
                {garageTab === 'wishlist' && (
                    <motion.div key="wishlist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {MOCK_WISHLIST.map((car, i) => (
                                <WishlistCard key={car.id} car={car} index={i} onBrowse={onBrowse} />
                            ))}
                            <motion.button
                                className="glass-panel btn btn-ghost"
                                style={{ padding: '1rem', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', color: 'var(--text-muted)', width: '100%', gap: '0.5rem' }}
                                whileHover={{ borderColor: 'rgba(59,130,246,0.35)', color: 'var(--accent-bright)' }}
                                onClick={onBrowse}
                            >
                                <Plus size={16} /> Add to Wishlist
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ── Recommended ───────────────────────────── */}
                {garageTab === 'recommended' && (
                    <motion.div key="recommended" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={14} style={{ color: 'var(--accent-bright)' }} />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                Curated based on your preferences and purchase history
                            </span>
                        </div>
                        <div className="dashboard-grid">
                            {MOCK_RECOMMENDED.map((car, i) => (
                                <RecommendedCard key={car.id} car={car} index={i} onBrowse={onBrowse} />
                            ))}
                        </div>
                    </motion.div>
                )}
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
