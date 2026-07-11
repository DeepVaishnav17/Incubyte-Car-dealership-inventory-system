import { Globe,  Car, Mail, Phone, MapPin } from 'lucide-react';

const LINKS = {
    Inventory: ['Browse Cars', 'New Arrivals', 'Featured Deals', 'Compare Models'],
    Company: ['About Us', 'Careers', 'Press', 'Contact'],
    Support: ['Help Center', 'Financing', 'Test Drive', 'Warranty'],
};

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            marginTop: '4rem',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Animated top divider */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 30%, rgba(139,92,246,0.4) 70%, transparent 100%)',
                animation: 'shimmer-line 3s ease-in-out infinite',
            }} />

            <div style={{
                maxWidth: '1280px', margin: '0 auto',
                padding: '3rem 2rem 2rem',
            }}>
                {/* Main footer grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '2.5rem',
                    marginBottom: '3rem',
                }}>
                    {/* Brand column */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(59,130,246,0.25)',
                                flexShrink: 0,
                            }}>
                                <Car size={20} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#f1f5f9' }}>
                                    Incubyte
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                    Dealership
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                            Premium vehicles, exceptional service. Your dream car is just a click away.
                        </p>
                        {/* Contact info */}
                        {[
                            { icon: MapPin, text: 'Mumbai, Maharashtra, India' },
                            { icon: Phone, text: '+91 98765 43210' },
                            { icon: Mail, text: 'hello@incubyte.co' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '0.5rem',
                                fontSize: '0.8125rem', color: '#475569',
                            }}>
                                <Icon size={13} style={{ flexShrink: 0 }} />
                                {text}
                            </div>
                        ))}
                    </div>

                    {/* Link columns */}
                    {Object.entries(LINKS).map(([title, links]) => (
                        <div key={title}>
                            <h4 style={{
                                fontSize: '0.6875rem', fontWeight: 700,
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                color: '#64748b', marginBottom: '1rem',
                            }}>
                                {title}
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {links.map(link => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            onClick={e => e.preventDefault()}
                                            style={{
                                                fontSize: '0.875rem', color: '#475569',
                                                textDecoration: 'none',
                                                transition: 'color 0.2s',
                                                display: 'inline-block',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '1rem',
                }}>
                    <p style={{ fontSize: '0.8125rem', color: '#334155' }}>
                        © {year} Incubyte Dealership. All rights reserved. Built with ❤️ by Incubyte.
                    </p>

                    {/* Social icons
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                        {[
                            { icon: Globe, label: 'Website', href: '#' },
                            { icon: Twitter, label: 'Twitter', href: '#' },
                            { icon: Linkedin, label: 'LinkedIn', href: '#' },
                        ].map(({ icon: Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                onClick={e => e.preventDefault()}
                                style={{
                                    width: '34px', height: '34px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '9px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: '#475569',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = '#475569';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                }}
                            >
                                <Icon size={15} />
                            </a>
                        ))}
                    </div> */}
                </div>
            </div>

            <style>{`
                @keyframes shimmer-line {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </footer>
    );
}
