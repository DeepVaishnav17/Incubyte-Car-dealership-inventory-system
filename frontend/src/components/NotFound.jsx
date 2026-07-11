import { useEffect, useState } from 'react';
import { Home, RotateCcw } from 'lucide-react';

export default function NotFound({ onGoHome }) {
    const [headlightsOn, setHeadlightsOn] = useState(false);
    const [floatY, setFloatY] = useState(0);

    // Blinking headlights
    useEffect(() => {
        const interval = setInterval(() => {
            setHeadlightsOn(v => !v);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    // Floating animation
    useEffect(() => {
        let frame;
        let start = null;
        const animate = (ts) => {
            if (!start) start = ts;
            const t = (ts - start) / 1000;
            setFloatY(Math.sin(t * 0.8) * 10);
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem', textAlign: 'center', position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glows */}
            <div style={{
                position: 'fixed', top: '30%', left: '20%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '20%', right: '15%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* 404 giant text behind car */}
            <div style={{
                position: 'absolute',
                fontSize: 'clamp(120px, 25vw, 240px)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                userSelect: 'none',
                lineHeight: 1,
                pointerEvents: 'none',
            }}>
                404
            </div>

            {/* Floating Car */}
            <div style={{
                transform: `translateY(${floatY}px)`,
                transition: 'transform 0.05s ease',
                marginBottom: '1rem',
                position: 'relative', zIndex: 1,
            }}>
                {/* Headlight beams */}
                {headlightsOn && (
                    <div style={{ position: 'absolute', right: '-20px', top: '30%' }}>
                        <div style={{
                            width: '0', height: '0',
                            borderTop: '30px solid transparent',
                            borderBottom: '30px solid transparent',
                            borderLeft: '120px solid rgba(255,240,150,0.08)',
                            filter: 'blur(4px)',
                            transform: 'rotate(-10deg)',
                            position: 'absolute', top: '-30px', left: '10px',
                        }} />
                        <div style={{
                            width: '0', height: '0',
                            borderTop: '20px solid transparent',
                            borderBottom: '20px solid transparent',
                            borderLeft: '80px solid rgba(255,240,150,0.12)',
                            filter: 'blur(3px)',
                            position: 'absolute', top: '-20px', left: '10px',
                        }} />
                    </div>
                )}

                <svg viewBox="0 0 320 120" width="320" height="120" fill="none">
                    {/* Shadow */}
                    <ellipse cx="160" cy="112" rx="90" ry="6"
                        fill="rgba(0,0,0,0.3)"
                        style={{ filter: 'blur(4px)' }} />

                    {/* Car body */}
                    <path d="M30 75 Q38 48 90 40 L120 32 L200 32 L235 40 Q270 48 280 75 Z"
                        fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

                    {/* Roof/cabin */}
                    <path d="M100 40 Q118 18 160 14 Q200 18 218 40 Z"
                        fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

                    {/* Windshield */}
                    <path d="M106 39 Q122 20 160 16 Q196 20 210 39 Z"
                        fill="#1d4ed8" opacity="0.5" />

                    {/* Undercarriage */}
                    <rect x="32" y="75" width="248" height="12" rx="3" fill="#0f172a" />

                    {/* Left wheel */}
                    <circle cx="85" cy="87" r="20" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                    <circle cx="85" cy="87" r="10" fill="#0f172a" />
                    <circle cx="85" cy="87" r="4" fill="#3b82f6" />
                    {[0, 60, 120, 180, 240, 300].map(a => (
                        <line key={a}
                            x1={85 + 4 * Math.cos(a * Math.PI / 180)}
                            y1={87 + 4 * Math.sin(a * Math.PI / 180)}
                            x2={85 + 10 * Math.cos(a * Math.PI / 180)}
                            y2={87 + 10 * Math.sin(a * Math.PI / 180)}
                            stroke="#3b82f6" strokeWidth="1.5" />
                    ))}

                    {/* Right wheel */}
                    <circle cx="235" cy="87" r="20" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                    <circle cx="235" cy="87" r="10" fill="#0f172a" />
                    <circle cx="235" cy="87" r="4" fill="#3b82f6" />
                    {[0, 60, 120, 180, 240, 300].map(a => (
                        <line key={a}
                            x1={235 + 4 * Math.cos(a * Math.PI / 180)}
                            y1={87 + 4 * Math.sin(a * Math.PI / 180)}
                            x2={235 + 10 * Math.cos(a * Math.PI / 180)}
                            y2={87 + 10 * Math.sin(a * Math.PI / 180)}
                            stroke="#3b82f6" strokeWidth="1.5" />
                    ))}

                    {/* Headlights */}
                    <ellipse cx="274" cy="62" rx="7" ry="4"
                        fill={headlightsOn ? 'rgba(255,250,200,0.95)' : '#334155'}
                        style={{
                            filter: headlightsOn ? 'drop-shadow(0 0 8px rgba(255,240,150,1))' : 'none',
                            transition: 'fill 0.3s',
                        }} />
                    <ellipse cx="274" cy="72" rx="5" ry="3"
                        fill={headlightsOn ? 'rgba(255,250,200,0.7)' : '#334155'}
                        style={{
                            filter: headlightsOn ? 'drop-shadow(0 0 6px rgba(255,240,150,0.8))' : 'none',
                            transition: 'fill 0.3s',
                        }} />

                    {/* Tail lights */}
                    <ellipse cx="36" cy="62" rx="6" ry="3.5" fill="#ef4444" opacity="0.8" />
                    <ellipse cx="36" cy="72" rx="4" ry="2.5" fill="#ef4444" opacity="0.5" />

                    {/* Door lines */}
                    <line x1="150" y1="40" x2="150" y2="75" stroke="#334155" strokeWidth="0.8" />
                    <line x1="120" y1="40" x2="115" y2="75" stroke="#334155" strokeWidth="0.8" />

                    {/* Spoiler */}
                    <rect x="32" y="56" width="6" height="12" rx="1" fill="#1e293b" />
                    <rect x="22" y="53" width="18" height="3" rx="1" fill="#334155" />
                </svg>
            </div>

            {/* Text content */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
                <h1 style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                    fontWeight: 800, letterSpacing: '-0.04em',
                    marginBottom: '0.75rem',
                    background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Lost on the road?
                </h1>
                <p style={{
                    color: '#64748b', fontSize: '1rem',
                    lineHeight: 1.6, marginBottom: '2rem',
                }}>
                    The page you're looking for took a wrong turn. Let's get you back to the dealership.
                </p>

                <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={onGoHome}
                        style={{ padding: '0.875rem 1.75rem', fontSize: '0.9375rem' }}
                    >
                        <Home size={18} /> Return Home
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.875rem 1.5rem', border: '1px solid var(--border)' }}
                    >
                        <RotateCcw size={16} /> Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
