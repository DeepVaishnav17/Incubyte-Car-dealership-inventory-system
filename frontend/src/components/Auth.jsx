import { useState } from 'react';
import { login, register } from '../api';
import { toast } from './Toast';
import { LogIn, UserPlus, Eye, EyeOff, Car, ChevronRight } from 'lucide-react';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const data = await login(email, password);
                localStorage.setItem('token', data.token);
                toast.success('Welcome back! 🚗', { title: 'Signed In' });
                onLogin();
            } else {
                await register(email, password);
                const data = await login(email, password);
                localStorage.setItem('token', data.token);
                toast.success('Account created successfully!', { title: 'Welcome' });
                onLogin();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
        }}>
            {/* Background glow orbs */}
            <div style={{
                position: 'fixed', top: '20%', left: '10%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '20%', right: '10%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%', maxWidth: '460px',
                animation: 'slideUp 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '1.75rem', fontWeight: 800,
                        letterSpacing: '-0.04em', marginBottom: '0.375rem',
                        background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Incubyte Dealership
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isLogin ? 'Welcome back — sign in to continue' : 'Create your account to get started'}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-panel" style={{ padding: '2.25rem' }}>
                    {/* Toggle Tabs */}
                    <div style={{
                        display: 'flex', gap: '0.375rem', marginBottom: '2rem',
                        background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '0.25rem',
                    }}>
                        {['Sign In', 'Sign Up'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => { setIsLogin(i === 0); setError(''); }}
                                style={{
                                    flex: 1, padding: '0.625rem',
                                    borderRadius: '9px', border: 'none',
                                    cursor: 'pointer', fontWeight: 600,
                                    fontSize: '0.875rem', fontFamily: 'var(--font)',
                                    transition: 'all 0.25s ease',
                                    background: (i === 0) === isLogin
                                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                        : 'transparent',
                                    color: (i === 0) === isLogin ? '#fff' : 'var(--text-muted)',
                                    boxShadow: (i === 0) === isLogin ? '0 2px 12px rgba(59,130,246,0.3)' : 'none',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {error && <div className="error-message" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input
                                type="email"
                                className="glass-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="glass-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '0.875rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', display: 'flex',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.9375rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                    Processing...
                                </span>
                            ) : (
                                <>
                                    {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Admin hint */}
                    <div style={{
                        marginTop: '1.5rem', padding: '0.875rem 1rem',
                        background: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: '10px',
                        fontSize: '0.8125rem', color: 'var(--text-muted)',
                        lineHeight: 1.6,
                    }}>
                        <span style={{ color: 'var(--accent-bright)', fontWeight: 600 }}>Admin demo:</span>
                        {' '}admin@example.com / admin123
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
                    © 2025 Incubyte Dealership. All rights reserved.
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
