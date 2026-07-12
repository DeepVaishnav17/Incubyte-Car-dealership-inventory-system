import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPurchases } from '../api';
import {
    DollarSign, ShoppingBag, CheckCircle, Clock,
    Eye, ArrowUpRight, Calendar, Mail, X,
    TrendingUp, User
} from 'lucide-react';

const CAR_EMOJIS = { Electric: '⚡', SUV: '🚙', Sports: '🏎️', Sedan: '🚗', Truck: '🚚', Coupe: '🏎️', Hatchback: '🚘', default: '🚘' };

const STATUS_CFG = {
    PAID:       { label: 'Paid',       color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
    PENDING:    { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
    CONFIRMED:  { label: 'Confirmed',  color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)' },
    PROCESSING: { label: 'Processing', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)' },
    SHIPPED:    { label: 'Shipped',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
    DELIVERED:  { label: 'Delivered',  color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.2)'  },
};

function StatusPill({ status = 'PENDING' }) {
    const cfg = STATUS_CFG[status.toUpperCase()] || STATUS_CFG.PENDING;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.22rem 0.65rem', borderRadius: '999px',
            fontSize: '0.6875rem', fontWeight: 700,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color }} />
            {cfg.label}
        </span>
    );
}

function SkeletonRow() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            {[60, 50, 30, 20, 20, 20, 14].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%` }} />
            ))}
        </div>
    );
}

function CustomerModal({ p, onClose }) {
    const emoji = CAR_EMOJIS[p.vehicle?.category] || CAR_EMOJIS.default;
    const dateStr = p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div className="glass-panel-bright modal-box"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
            >
                <div className="modal-header">
                    <div>
                        <div className="modal-title">Customer Details</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{p.user?.email}</div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'Total Spent',    value: `$${p.purchasePrice?.toLocaleString()}` },
                            { label: 'Cars Purchased', value: '1' },
                            { label: 'Payment',        value: p.paymentStatus },
                        ].map(s => (
                            <div key={s.label} className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-bright)' }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Customer card */}
                    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {p.user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700 }}>{p.user?.email}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                                <Mail size={12} /> {p.user?.email}
                            </div>
                        </div>
                    </div>

                    {/* Purchase timeline */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Purchase Timeline
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)', flexShrink: 0 }} />
                            <div style={{ width: '1px', height: '50px', background: 'var(--border)' }} />
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{emoji} {p.vehicle?.make} {p.vehicle?.model}</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Calendar size={11} /> {dateStr}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981' }}>${p.purchasePrice?.toLocaleString()}</div>
                                    <StatusPill status={p.paymentStatus} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Close</button>
                </div>
            </motion.div>
        </div>
    );
}

export default function PurchasesSection() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        getPurchases()
            .then(data => setPurchases(data || []))
            .catch(e => setError(e.message || 'Failed to load purchases'))
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = purchases.reduce((s, p) => s + (p.purchasePrice || 0), 0);
    const paid = purchases.filter(p => p.paymentStatus === 'PAID').length;
    const pending = purchases.length - paid;

    const summaryCards = [
        { label: 'Total Purchases', value: purchases.length,                      icon: ShoppingBag,  color: '#60a5fa', glow: 'rgba(59,130,246,0.15)',   raw: false },
        { label: 'Total Revenue',   value: `$${(totalRevenue/1000).toFixed(1)}K`, icon: DollarSign,   color: '#10b981', glow: 'rgba(16,185,129,0.15)',   raw: true  },
        { label: 'Paid Orders',     value: paid,                                  icon: CheckCircle,  color: '#a78bfa', glow: 'rgba(139,92,246,0.15)',   raw: false },
        { label: 'Pending',         value: pending,                               icon: Clock,        color: '#f59e0b', glow: 'rgba(245,158,11,0.15)',   raw: false },
    ];

    return (
        <div>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {summaryCards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <motion.div key={c.label} className="glass-panel stat-card"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -4, boxShadow: `0 20px 40px rgba(0,0,0,0.5),0 0 0 1px ${c.glow}` }}
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${c.color},transparent)` }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: c.glow, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                                    <Icon size={18} />
                                </div>
                                <ArrowUpRight size={14} style={{ color: c.color, opacity: 0.7 }} />
                            </div>
                            <div className="stat-label">{c.label}</div>
                            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, letterSpacing: '-0.04em', lineHeight: 1, marginTop: '0.25rem' }}>
                                {c.raw ? c.value : c.value}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="section-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <div className="section-title">All Purchases</div>
                    <div className="section-subtitle">{loading ? 'Loading…' : `${purchases.length} transaction${purchases.length !== 1 ? 's' : ''}`}</div>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem 1.5rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.875rem' }}>
                    ⚠️ {error} — Make sure the backend is running at port 8080.
                </div>
            )}

            <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '16px' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <div>Vehicle</div><div>Customer</div><div>Date</div><div>Price</div><div>Payment</div><div>Status</div><div />
                </div>

                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    : purchases.length === 0
                        ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <ShoppingBag size={36} style={{ margin: '0 auto 1rem', opacity: 0.25, display: 'block' }} />
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No purchases yet</div>
                                <div style={{ fontSize: '0.875rem' }}>Purchases will appear here once users buy vehicles.</div>
                            </div>
                        )
                        : purchases.map((p, i) => {
                            const emoji = CAR_EMOJIS[p.vehicle?.category] || CAR_EMOJIS.default;
                            const dateStr = p.purchaseDate
                                ? new Date(p.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—';
                            return (
                                <motion.div key={p.id}
                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < purchases.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', alignItems: 'center', transition: 'background 0.2s' }}
                                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                                    onClick={() => setSelected(p)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{emoji}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.vehicle?.make} {p.vehicle?.model}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.vehicle?.category} · {p.vehicle?.year}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                            {p.user?.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.user?.email}</div>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{dateStr}</div>
                                    <div style={{ fontWeight: 700, color: '#10b981' }}>${p.purchasePrice?.toLocaleString()}</div>
                                    <StatusPill status={p.paymentStatus || 'PENDING'} />
                                    <StatusPill status={p.orderStatus  || 'CONFIRMED'} />
                                    <button className="action-btn accent" title="View" onClick={e => { e.stopPropagation(); setSelected(p); }}><Eye size={13} /></button>
                                </motion.div>
                            );
                        })
                }
            </div>

            <AnimatePresence>
                {selected && <CustomerModal p={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
}
