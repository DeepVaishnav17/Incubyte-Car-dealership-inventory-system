import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';

// Toast store (global singleton)
let toastListeners = [];
let toastId = 0;

export const toast = {
    success: (msg, opts) => emit({ type: 'success', message: msg, ...opts }),
    error: (msg, opts) => emit({ type: 'error', message: msg, ...opts }),
    info: (msg, opts) => emit({ type: 'info', message: msg, ...opts }),
    warning: (msg, opts) => emit({ type: 'warning', message: msg, ...opts }),
};

function emit(payload) {
    const id = ++toastId;
    toastListeners.forEach(fn => fn({ id, ...payload }));
    return id;
}

const CONFIG = {
    success: {
        icon: CheckCircle,
        color: '#10b981',
        glow: 'rgba(16,185,129,0.25)',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
    },
    error: {
        icon: XCircle,
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.25)',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.2)',
    },
    info: {
        icon: Info,
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.25)',
        bg: 'rgba(59,130,246,0.08)',
        border: 'rgba(59,130,246,0.2)',
    },
    warning: {
        icon: AlertTriangle,
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.25)',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
    },
};

function ToastItem({ toast: t, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const cfg = CONFIG[t.type] || CONFIG.info;
    const Icon = cfg.icon;

    useEffect(() => {
        // Entry animation
        const show = setTimeout(() => setVisible(true), 10);
        // Auto dismiss
        const duration = t.duration ?? 4000;
        const dismiss = setTimeout(() => handleRemove(), duration);
        return () => { clearTimeout(show); clearTimeout(dismiss); };
    }, []);

    const handleRemove = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onRemove(t.id), 350);
    }, [t.id, onRemove]);

    return (
        <div
            role="alert"
            aria-live="polite"
            onClick={handleRemove}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                padding: '1rem 1.125rem',
                background: 'rgba(5,5,8,0.92)',
                backdropFilter: 'blur(24px) saturate(200%)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                border: `1px solid ${cfg.border}`,
                borderRadius: '14px',
                boxShadow: `0 0 0 1px ${cfg.border}, 0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${cfg.glow}`,
                cursor: 'pointer',
                minWidth: '300px', maxWidth: '400px',
                transform: visible && !leaving
                    ? 'translateX(0) scale(1)'
                    : 'translateX(100%) scale(0.95)',
                opacity: visible && !leaving ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
                position: 'relative', overflow: 'hidden',
            }}
        >
            {/* Left color bar */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '3px', background: cfg.color, borderRadius: '14px 0 0 14px',
            }} />

            {/* Icon */}
            <div style={{
                flexShrink: 0, marginTop: '1px',
                color: cfg.color,
                filter: `drop-shadow(0 0 6px ${cfg.color})`,
            }}>
                <Icon size={20} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                    <div style={{
                        fontWeight: 700, fontSize: '0.875rem',
                        color: '#f1f5f9', marginBottom: '0.25rem',
                        letterSpacing: '-0.01em',
                    }}>
                        {t.title}
                    </div>
                )}
                <div style={{
                    fontSize: t.title ? '0.8125rem' : '0.875rem',
                    color: t.title ? '#94a3b8' : '#e2e8f0',
                    lineHeight: 1.5,
                    fontWeight: t.title ? 400 : 500,
                }}>
                    {t.message}
                </div>
            </div>

            {/* Close */}
            <button
                onClick={e => { e.stopPropagation(); handleRemove(); }}
                aria-label="Dismiss"
                style={{
                    flexShrink: 0, background: 'none', border: 'none',
                    color: '#475569', cursor: 'pointer', padding: '0.125rem',
                    display: 'flex', transition: 'color 0.2s',
                    marginTop: '1px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
                <X size={15} />
            </button>

            {/* Progress bar */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0,
                height: '2px', background: cfg.color,
                borderRadius: '0 0 14px 14px',
                opacity: 0.5,
                animation: `toast-progress ${t.duration ?? 4000}ms linear forwards`,
            }} />
        </div>
    );
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (t) => setToasts(prev => [...prev, t]);
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter(fn => fn !== listener);
        };
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <>
            <style>{`
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
            <div
                aria-label="Notifications"
                style={{
                    position: 'fixed', top: '1.25rem', right: '1.25rem',
                    zIndex: 9000,
                    display: 'flex', flexDirection: 'column', gap: '0.625rem',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map(t => (
                    <div key={t.id} style={{ pointerEvents: 'all' }}>
                        <ToastItem toast={t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </>
    );
}
