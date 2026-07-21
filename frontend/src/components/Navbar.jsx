import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
    const location = useLocation()
    const isLanding = location.pathname === '/'
    const [menuOpen, setMenuOpen] = useState(false)

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
            background: 'rgba(20,20,20,0.94)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', height: '64px', maxWidth: '1200px', margin: '0 auto'
            }}>
                {/* Logo */}
                <Link to="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
                <div className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
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
                <div className="hidden md:block">
                    <Link to="/voice" className="btn-primary" style={{ padding: '6px 18px', fontSize: 13 }}>
                        Start Testing →
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex md:hidden"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        padding: 4
                    }}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden" style={{
                    background: 'var(--bg2)',
                    borderBottom: '1px solid var(--border)',
                    padding: '16px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    {navItems.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center',
                                padding: '10px 14px', borderRadius: 'var(--radius)',
                                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                color: location.pathname === to ? 'var(--yellow)' : 'var(--text-dim)',
                                background: location.pathname === to ? 'var(--yellow-dim)' : 'transparent',
                                border: `1px solid ${location.pathname === to ? 'rgba(212,245,60,0.2)' : 'var(--border)'}`,
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link
                        to="/voice"
                        onClick={() => setMenuOpen(false)}
                        className="btn-primary"
                        style={{
                            padding: '10px 18px',
                            fontSize: 14,
                            justifyContent: 'center',
                            marginTop: 4
                        }}
                    >
                        Start Testing →
                    </Link>
                </div>
            )}
        </nav>
    )
}
