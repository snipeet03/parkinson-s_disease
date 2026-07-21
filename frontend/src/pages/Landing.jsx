import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Landing() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        // Fade-in on scroll
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity = '1'
                    e.target.style.transform = 'translateY(0)'
                    fadeObserver.unobserve(e.target)
                }
            })
        }, { threshold: 0.1 })

        document.querySelectorAll('.scroll-fade').forEach(el => {
            el.style.opacity = '0'
            el.style.transform = 'translateY(16px)'
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
            fadeObserver.observe(el)
        })
        return () => fadeObserver.disconnect()
    }, [])

    return (
        <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg)', minHeight: '100vh' }}>

            {/* ── NAV ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: 'rgba(20,20,20,0.92)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', height: 64, maxWidth: 1200, margin: '0 auto'
                }}>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 36, height: 36, background: 'var(--yellow)', borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 800, color: '#000', letterSpacing: -1,
                        }}>NS</div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.3px' }}>NeuraScan</span>
                    </a>

                    <ul className="hidden md:flex" style={{ alignItems: 'center', gap: 4, listStyle: 'none' }}>
                        {[
                            { href: '#how-it-works', label: 'Product' },
                            { href: '#research', label: 'Research' },
                            { href: '#team', label: 'About' },
                        ].map(({ href, label }) => (
                            <li key={label}>
                                <a href={href} style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 14px', borderRadius: 'var(--radius)',
                                    textDecoration: 'none', fontSize: 13, fontWeight: 500,
                                    color: 'var(--text-dim)', transition: 'color 0.15s',
                                    border: '1px solid transparent',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                                >{label}</a>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10 }}>
                        <a href="https://github.com" target="_blank" rel="noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px',
                            borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: 13,
                            fontWeight: 500, color: 'var(--text-dim)',
                            border: '1px solid var(--border)', background: 'var(--bg2)',
                            transition: 'all 0.15s',
                        }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02 0 2.05.14 3.01.4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 700 }}>2.1k</span>
                        </a>
                        <Link to="/voice" style={{
                            padding: '6px 18px', borderRadius: 'var(--radius)', fontSize: 13,
                            fontWeight: 700, color: '#000', background: 'var(--yellow)',
                            border: 'none', textDecoration: 'none', transition: 'all 0.15s',
                        }}>Start Testing →</Link>
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
                        {[
                            { href: '#how-it-works', label: 'Product' },
                            { href: '#research', label: 'Research' },
                            { href: '#team', label: 'About' },
                        ].map(({ href, label }) => (
                            <a
                                key={label}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center',
                                    padding: '10px 14px', borderRadius: 'var(--radius)',
                                    textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                    color: 'var(--text-dim)',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                {label}
                            </a>
                        ))}
                        <Link
                            to="/voice"
                            onClick={() => setMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px 18px',
                                borderRadius: 'var(--radius)',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#000',
                                background: 'var(--yellow)',
                                textDecoration: 'none',
                                marginTop: 4
                            }}
                        >
                            Start Testing →
                        </Link>
                    </div>
                )}
            </nav>

            {/* ── AWARDS BAR ── */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '100px 16px 0', flexWrap: 'wrap' }}>
                {[
                    { medal: '🥇', sub: 'B.TECH PROJECT', title: '#1 Final Year Project' },
                    { medal: '🥇', sub: 'MEDICAL AI', title: '#1 Detection Accuracy' },
                    { medal: '🥇', sub: 'OPEN SOURCE', title: '#1 Neural Biomarkers' },
                ].map(({ medal, sub, title }) => (
                    <div key={title} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
                        fontSize: 12, fontWeight: 600, color: 'var(--text-dim)',
                    }}>
                        <div style={{
                            width: 28, height: 28, background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, boxShadow: '0 0 12px rgba(245,158,11,0.3)',
                            flexShrink: 0,
                        }}>{medal}</div>
                        <div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{sub}</div>
                            <div style={{ fontSize: 12, color: 'var(--white)', fontWeight: 700 }}>{title}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── HERO ── */}
            <section className="px-4 py-12 md:py-20 text-center max-w-[900px] mx-auto">
                <h1 style={{
                    fontSize: 'clamp(36px,7vw,80px)', fontWeight: 800, lineHeight: 1.05,
                    letterSpacing: -2, color: 'var(--white)', marginBottom: 24,
                    animation: 'fadeUp 0.7s ease 0.2s both',
                }}>
                    NeuraScan<br />
                    <span style={{ color: 'var(--yellow)' }}>Parkinson's Detector</span>
                </h1>
                <p style={{
                    fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.7,
                    maxWidth: 580, margin: '0 auto 36px', fontWeight: 400,
                    animation: 'fadeUp 0.7s ease 0.35s both',
                }}>
                    AI-powered neurological screening that analyzes your voice and typing patterns,
                    catches early biomarkers before symptoms appear, and helps you act sooner.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20, animation: 'fadeUp 0.7s ease 0.45s both' }}>
                    <Link to="/voice" className="btn-primary" style={{ padding: '13px 28px', fontSize: 14 }}>
                        🎙 Start Voice Analysis
                    </Link>
                    <Link to="/typing" className="btn-secondary" style={{ padding: '13px 28px', fontSize: 14 }}>
                        ▶ Take Typing Test
                    </Link>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.3px', animation: 'fadeUp 0.7s ease 0.55s both' }}>
                    No login required · Free to use · Results in under 5 minutes
                </p>
            </section>

            {/* ── DEMO BLOCK ── */}
            <div style={{ maxWidth: 820, margin: '0 auto 80px', padding: '0 16px' }}>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Top bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', flexShrink: 0 }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', flexShrink: 0 }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', flexShrink: 0 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12, padding: '4px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, color: 'var(--text-dim)' }}>
                            🧠 NeuraScan Analysis — Live Demo
                        </div>
                    </div>
                    {/* Content */}
                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minHeight: 280 }}>
                        {/* Terminal */}
                        <div style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 11, lineHeight: 1.7, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-mono)' }}>
                            <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 8, letterSpacing: '1.5px', color: 'var(--text-muted)' }}>VOICE ANALYSIS</div>
                            {[
                                ['$', 'neurascan analyze --mode voice', null, 'cmd'],
                                [null, 'Loading ML model (SVM + RandomForest)...', null, 'out'],
                                [null, 'Extracting MFCC features [13 coefficients]', null, 'out'],
                                [null, 'Computing jitter:', '0.412%', 'val', '✓ normal', 'good'],
                                [null, 'Computing shimmer:', '1.623%', 'val', '✓ normal', 'good'],
                                [null, 'HNR:', '21.9 dB', 'val', '✓ normal', 'good'],
                                [null, 'Running ensemble prediction...', null, 'out'],
                                ['→', 'Classification: HEALTHY', null, 'good'],
                                ['→', 'Risk Score: 12.4% (Low)', null, 'good'],
                            ].map(([prompt, text, val, type, suffix, suffType], i) => (
                                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                                    {prompt && <span style={{ color: type === 'good' ? '#4ade80' : 'var(--yellow)', flexShrink: 0 }}>{prompt}</span>}
                                    <span style={{ color: type === 'cmd' ? '#a8d8a8' : type === 'good' ? '#4ade80' : 'var(--text-dim)' }}>
                                        {text}
                                        {val && <><span style={{ color: 'var(--yellow)' }}> {val}</span></>}
                                        {suffix && <span style={{ color: suffType === 'good' ? '#4ade80' : '#f87171' }}> &nbsp;{suffix}</span>}
                                    </span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                <span style={{ color: 'var(--yellow)' }}>$</span>
                                <span className="t-cursor" />
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 9, letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Assessment Result</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                                    ● HEALTHY — Low Risk
                                </div>
                            </div>
                            {[
                                { label: 'Voice Risk Score', value: 12.4, color: '#4ade80' },
                                { label: 'Typing Risk Score', value: 18.2, color: '#60a5fa' },
                                { label: 'Combined Risk', value: 14.8, color: 'var(--yellow)' },
                                { label: 'Confidence', value: 91.3, color: '#a78bfa' },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)' }}>
                                        <span>{label}</span><span style={{ color: 'var(--white)', fontWeight: 600 }}>{value}%</span>
                                    </div>
                                    <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, transition: 'width 1.5s ease' }} />
                                    </div>
                                </div>
                            ))}
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                Model: SVM + RF + GBoost ensemble<br />
                                Features: 31 biomarkers · Accuracy: 93%+
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DIVIDER ── */}
            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1100, margin: '0 auto' }} />

            {/* ── HOW IT WORKS ── */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 16px' }} id="how-it-works">
                <div className="section-label">How it works</div>
                <h2 className="section-title">Three steps to<br /><span className="accent">early detection</span></h2>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', maxWidth: 500, lineHeight: 1.7 }}>
                    No equipment, no account, no waiting. Open the app and start the test in seconds.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] mt-12 bg-[var(--border)] border border-[var(--border)] rounded-[10px] overflow-hidden">
                    {[
                        { num: '01', icon: '🎙', title: 'Record Your Voice', desc: 'Read a sentence aloud for 15–30 seconds. We extract jitter, shimmer, pitch variance, HNR, ZCR, and 13 MFCC coefficients — 22 voice biomarkers total.', link: '/voice', linkLabel: 'Open Voice Test →' },
                        { num: '02', icon: '⌨️', title: 'Take Typing Test', desc: 'Type a short paragraph while we silently capture keystroke timing — dwell time, flight time, rhythm consistency, and typing speed. 9 motor biomarkers.', link: '/typing', linkLabel: 'Open Typing Test →' },
                        { num: '03', icon: '📊', title: 'Get AI Results', desc: 'Our 3-model ensemble (SVM + RF + Gradient Boosting) combines all 31 biomarkers and gives a risk score, full PDF report, and recommendations.', link: '/dashboard', linkLabel: 'View Dashboard →' },
                    ].map(({ num, icon, title, desc, link, linkLabel }) => (
                        <div key={num} className="scroll-fade" style={{ background: 'var(--bg)', padding: '32px 28px', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                        >
                            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--border2)', letterSpacing: -2, lineHeight: 1, marginBottom: 16 }}>{num}</div>
                            <div style={{ width: 40, height: 40, background: 'var(--yellow-dim)', border: '1px solid rgba(212,245,60,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16 }}>{icon}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 10, letterSpacing: '-0.5px' }}>{title}</div>
                            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.7 }}>{desc}</p>
                            <Link to={link} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--yellow)', textDecoration: 'none', marginTop: 16, fontWeight: 600 }}>{linkLabel}</Link>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1100, margin: '0 auto' }} />

            {/* ── STATS ── */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 16px' }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-[var(--border)] border border-[var(--border)] rounded-[10px] overflow-hidden">
                    {[
                        { value: '93%+', label: 'Model accuracy on\ncross-validated data' },
                        { value: '31', label: 'Biomarker features\nvoice + typing combined' },
                        { value: '<5m', label: 'Full assessment time\nvoice + typing test' },
                        { value: '0', label: 'Login required\ncompletely free to use' },
                    ].map(({ value, label }) => (
                        <div key={value} className="scroll-fade" style={{ background: 'var(--bg)', padding: '24px 20px', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                        >
                            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--yellow)', letterSpacing: -2, lineHeight: 1, marginBottom: 8 }}>{value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1100, margin: '0 auto' }} />

            {/* ── FEATURES ── */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 16px' }}>
                <div className="section-label">Features</div>
                <h2 className="section-title">Everything you need<br />for <span className="accent">early screening</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-[var(--border)] border border-[var(--border)] rounded-[10px] overflow-hidden mt-12">
                    {[
                        { icon: '🧠', title: '3-Model Ensemble ML', desc: 'SVM (RBF kernel, C=50) + Random Forest (300 trees) + Gradient Boosting (200 rounds) with soft-voting. RobustScaler handles real-world recording outliers. Stratified 5-fold CV with 93%+ accuracy and 0.97 ROC-AUC.', tag: '✦ ML ENGINE', wide: true },
                        { icon: '🎚️', title: 'Voice Biomarkers', desc: 'Clinical MDVP features: jitter (%), shimmer (%), HNR (dB), pitch mean/std, ZCR, spectral centroid, bandwidth, RMS energy, and 13 MFCC coefficients.', tag: '✦ 22 FEATURES' },
                        { icon: '⌨️', title: 'Keystroke Dynamics', desc: 'Dwell time mean/std, flight time mean/std, WPM, error rate, backspace rate, pause count, and rhythm consistency — capturing fine motor tremor.', tag: '✦ 9 FEATURES' },
                        { icon: '📄', title: 'PDF Medical Report', desc: 'Auto-generated clinical report with all biomarker values, risk scores, charts, and doctor recommendations. Download instantly.' },
                        { icon: '📈', title: 'Trend Tracking', desc: 'Retake tests over time and see risk progression charts on your dashboard. Full history stored locally.' },
                        { icon: '🔓', title: 'No Login Required', desc: 'Authentication completely removed. Open the app, start testing instantly. All results stored in your local MongoDB database.' },
                    ].map(({ icon, title, desc, tag, wide }) => (
                        <div key={title} className={`scroll-fade ${wide ? 'col-span-1 md:col-span-2' : 'col-span-1'}`} style={{
                            background: 'var(--bg)', padding: '24px 20px',
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                        >
                            <div style={{ fontSize: 20, marginBottom: 14 }}>{icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 8, letterSpacing: '-0.3px' }}>{title}</div>
                            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.7 }}>{desc}</p>
                            {tag && <div className="feature-tag">{tag}</div>}
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1100, margin: '0 auto' }} />

            {/* ── RESEARCH ── */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 16px' }} id="research">
                <div className="section-label">Research</div>
                <h2 className="section-title">Built on<br /><span className="accent">peer-reviewed science</span></h2>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', maxWidth: 500, lineHeight: 1.7 }}>Every biomarker and threshold is grounded in published clinical literature.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-12">
                    {[
                        { pub: 'IEEE Access · 2022', text: 'Voice biomarkers including jitter, shimmer, and HNR distinguish Parkinson\'s patients from healthy controls with high accuracy using ML classifiers.' },
                        { pub: 'Computers in Biology · 2022', text: 'Combined voice and typing models outperform single-modality approaches. Multimodal biomarkers significantly improve sensitivity and specificity.' },
                        { pub: 'NPJ Digital Medicine · 2023', text: 'Digital biomarkers captured passively during daily activities show promise for continuous, non-invasive monitoring of Parkinson\'s progression.' },
                        { pub: 'Little et al. · IEEE Trans. 2009', text: 'Sustained phonation analysis with MDVP features yields >91% classification accuracy. Jitter and shimmer are the most discriminative voice features.' },
                        { pub: 'Giancardo et al. · 2016', text: 'Keystroke dynamics capture upper-limb motor impairment in Parkinson\'s disease. Dwell time and flight time are key discriminative features.' },
                        { pub: 'Kumar et al. · 2023', text: 'Rhythm consistency and inter-key timing variance are strongly correlated with motor symptom severity scores in PD clinical assessments.' },
                    ].map(({ pub, text }) => (
                        <div key={pub} className="scroll-fade" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 18, transition: 'border-color 0.2s, transform 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--yellow)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <div style={{ fontSize: 10, letterSpacing: '0.8px', color: 'var(--yellow)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>{pub}</div>
                            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.7 }}>{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1100, margin: '0 auto' }} />

            {/* ── CTA ── */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 80px' }}>
                <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[12px] p-6 md:p-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center relative overflow-hidden mt-16">
                    <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'radial-gradient(circle,var(--yellow-dim) 0%,transparent 70%)', pointerEvents: 'none' }} />
                    <div>
                        <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--yellow)', marginBottom: 12 }}>Get Started Free</div>
                        <h2 style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 800, color: 'var(--white)', letterSpacing: -1, lineHeight: 1.15, marginBottom: 12 }}>
                            Ready? It takes under<br />5 minutes to complete.
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                            No account. No download. No equipment.<br />Just open the app and speak or type.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, width: '100%', maxWidth: 300 }}>
                        <Link to="/voice" className="btn-primary" style={{ padding: '13px 28px', fontSize: 14, justifyContent: 'center' }}>🎙 Start Voice Test</Link>
                        <Link to="/typing" className="btn-secondary" style={{ padding: '13px 28px', fontSize: 14, justifyContent: 'center' }}>⌨️ Start Typing Test</Link>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center', lineHeight: 1.5 }}>
                            ⚠️ Screening tool only.<br />Not a medical diagnosis.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer id="team" className="border-t border-[var(--border)] py-8 px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                    <div style={{ width: 26, height: 26, background: 'var(--yellow)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000', flexShrink: 0 }}>NS</div>
                    <span>NeuraScan · GHRCEM Nagpur · B.Tech CSE 2025–26</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Guide: Dr. Minakshee Chandankhede<br />
                    Team: Meghana Kokas · Prutha Acharya · Prathmesh Rajurkar · Navneet Lonare · Rugved Salpekar
                </div>
            </footer>

        </div>
    )
}
