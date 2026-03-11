import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
    const location = useLocation()
    const isLanding = location.pathname === '/'

    // Landing has its own full nav – on inner pages show a minimal top bar
    if (isLanding) return null

    const navItems = [
        { to: '/voice', label: 'Voice Test' },
        { to: '/typing', label: 'Typing Test' },
        { to: '/dashboard', label: 'Dashboard' },
    ]

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', height: '64px',
            background: 'rgba(20,20,20,0.94)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
        }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div style={{
                    width: 32, height: 32,
                    background: 'var(--yellow)', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#000', fontFamily: 'var(--font-mono)',
                    letterSpacing: -1,
                }}>NS</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.3px' }}>
                    NeuraScan
                </span>
            </Link>

            {/* Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {navItems.map(({ to, label }) => (
                    <Link
                        key={to}
                        to={to}
                        style={{
                            display: 'flex', alignItems: 'center',
                            padding: '6px 14px', borderRadius: 'var(--radius)',
                            textDecoration: 'none', fontSize: 13, fontWeight: 500,
                            color: location.pathname === to ? 'var(--yellow)' : 'var(--text-dim)',
                            background: location.pathname === to ? 'var(--yellow-dim)' : 'transparent',
                            border: `1px solid ${location.pathname === to ? 'rgba(212,245,60,0.2)' : 'transparent'}`,
                            transition: 'all 0.15s',
                        }}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <Link to="/voice" className="btn-primary" style={{ padding: '6px 18px', fontSize: 13 }}>
                Start Testing →
            </Link>
        </nav>
    )
}
