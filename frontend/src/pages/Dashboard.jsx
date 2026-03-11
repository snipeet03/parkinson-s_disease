import { useState, useEffect } from 'react'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts'
import toast from 'react-hot-toast'
import { resultsAPI } from '../utils/api'
import { Link } from 'react-router-dom'

const S = {
    page: { minHeight: '100vh', background: 'var(--bg)', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 },
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 },
    labelSmall: { fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 },
}

const getRiskColor = l => ({ Low: '#4ade80', Medium: '#fbbf24', High: '#f87171' })[l] || '#888'
const getRiskStyle = l => ({
    Low: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
    Medium: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    High: { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
}[l] || { bg: 'var(--bg3)', text: 'var(--text-dim)', border: 'var(--border)' })

export default function Dashboard() {
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => { fetchResults() }, [])

    const fetchResults = async () => {
        setLoading(true)
        try {
            const res = await resultsAPI.getHistory()
            setResults(res.data.results)
            if (res.data.results.length > 0) setSelected(res.data.results[0])
        } catch { toast.error('Failed to load results') }
        finally { setLoading(false) }
    }

    const downloadReport = async id => {
        setDownloading(true)
        try {
            const res = await resultsAPI.downloadReport(id)
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
            const a = document.createElement('a')
            a.href = url; a.download = `neurascan_report_${id.slice(0, 8)}.pdf`; a.click()
            URL.revokeObjectURL(url)
            toast.success('Report downloaded!')
        } catch { toast.error('Failed to generate report') }
        finally { setDownloading(false) }
    }

    const deleteResult = async id => {
        if (!confirm('Delete this result?')) return
        try {
            await resultsAPI.deleteResult(id)
            const updated = results.filter(r => r.id !== id)
            setResults(updated)
            setSelected(selected?.id === id ? (updated[0] || null) : selected)
            toast.success('Result deleted')
        } catch { toast.error('Failed to delete') }
    }

    const getRadarData = result => {
        if (!result) return []
        const r = result.result
        return [
            { metric: 'Voice Risk', value: r.voice_risk_score || 0 },
            { metric: 'Typing Risk', value: r.typing_risk_score || 0 },
            { metric: 'Overall', value: r.combined_risk_score || 0 },
            { metric: 'Confidence', value: r.confidence || 0 },
        ]
    }

    const getHistoryChartData = () =>
        results.slice().reverse().map((r, i) => ({
            test: `T${i + 1}`,
            risk: r.result.combined_risk_score || 0,
            confidence: r.result.confidence || 0,
            date: new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        }))

    const getBiomarkerData = result => {
        if (!result?.result) return []
        const vf = result.result.voice_features_summary || {}
        const tf = result.result.typing_features_summary || {}
        return [
            { name: 'Jitter', value: parseFloat(vf.jitter || 0) * 100, max: 5 },
            { name: 'Shimmer', value: parseFloat(vf.shimmer || 0) * 10, max: 5 },
            { name: 'Error Rate', value: parseFloat(tf.error_rate || 0), max: 30 },
            { name: 'Rhythm', value: parseFloat(tf.rhythm_consistency || 0), max: 100 },
            { name: 'Speed', value: Math.min(parseFloat(tf.typing_speed_wpm || 0), 100), max: 100 },
        ]
    }

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null
        return (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
                {payload.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                        <span style={{ color: 'var(--text-dim)' }}>{p.name}:</span>
                        <span style={{ color: 'var(--white)', fontWeight: 700 }}>{parseFloat(p.value).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div style={S.page}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--white)', letterSpacing: -1 }}>Results Dashboard</h1>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Your AI health screening history</p>
                    </div>
                    <Link to="/voice" className="btn-secondary" style={{ fontSize: 13, padding: '8px 18px' }}>
                        + New Assessment
                    </Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 13 }}>
                        <div style={{ width: 24, height: 24, border: '2px solid var(--yellow)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        Loading results...
                    </div>
                ) : results.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>No assessments yet</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Complete a voice or typing test to see results here.</p>
                        <Link to="/voice" className="btn-primary">Start Assessment →</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

                        {/* Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                                Test History ({results.length})
                            </div>
                            {results.map(r => {
                                const rs = getRiskStyle(r.result.risk_level)
                                const isActive = selected?.id === r.id
                                return (
                                    <button key={r.id} onClick={() => setSelected(r)} style={{
                                        textAlign: 'left', background: isActive ? 'var(--bg3)' : 'var(--bg2)',
                                        border: `1px solid ${isActive ? 'var(--yellow)' : 'var(--border)'}`,
                                        borderRadius: 8, padding: 14, cursor: 'pointer',
                                        transition: 'all 0.15s', fontFamily: 'var(--font-mono)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: rs.bg, color: rs.text, border: `1px solid ${rs.border}` }}>
                                                {r.result.risk_level} Risk
                                            </span>
                                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                                {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 3 }}>{r.result.classification}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            Confidence: {r.result.confidence}% · Risk: {r.result.combined_risk_score}%
                                        </div>
                                        <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                                            {r.voice_analysis_id && <span style={{ fontSize: 10, background: 'var(--yellow-dim)', color: 'var(--yellow)', padding: '1px 6px', borderRadius: 3 }}>Voice</span>}
                                            {r.typing_analysis_id && <span style={{ fontSize: 10, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', padding: '1px 6px', borderRadius: 3 }}>Typing</span>}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Detail Panel */}
                        {selected && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                {/* Risk banner */}
                                {(() => {
                                    const rs = getRiskStyle(selected.result.risk_level)
                                    return (
                                        <div style={{ ...S.card, padding: 24, border: `1px solid ${rs.border}`, background: rs.bg }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                        <span style={{ fontSize: 16 }}>{selected.result.risk_level === 'Low' ? '✓' : '⚠'}</span>
                                                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', letterSpacing: -0.5 }}>{selected.result.classification}</span>
                                                    </div>
                                                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{selected.result.risk_level} Risk · {selected.result.confidence}% Confidence</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => downloadReport(selected.id)} disabled={downloading} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
                                                        {downloading ? '...' : '⬇ PDF'}
                                                    </button>
                                                    <button onClick={() => deleteResult(selected.id)} style={{ padding: '6px 10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius)', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {[
                                                    { label: 'Voice Risk Score', value: selected.result.voice_risk_score, color: '#4ade80' },
                                                    { label: 'Typing Risk Score', value: selected.result.typing_risk_score, color: '#60a5fa' },
                                                    { label: 'Combined Risk Score', value: selected.result.combined_risk_score, color: getRiskColor(selected.result.risk_level) },
                                                ].filter(x => x.value != null).map(({ label, value, color }) => (
                                                    <div key={label}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                                            <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                                                            <span style={{ color: 'var(--white)', fontWeight: 700 }}>{value?.toFixed(1)}%</span>
                                                        </div>
                                                        <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, transition: 'width 0.7s ease' }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Charts */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div style={{ ...S.card, padding: 18 }}>
                                        <div style={S.labelSmall}>Risk Profile</div>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <RadarChart data={getRadarData(selected)}>
                                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                                <Radar name="Score" dataKey="value" stroke="var(--yellow)" fill="var(--yellow)" fillOpacity={0.15} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ ...S.card, padding: 18 }}>
                                        <div style={S.labelSmall}>Biomarkers</div>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={getBiomarkerData(selected)} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} width={60} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                    {getBiomarkerData(selected).map((e, i) => (
                                                        <Cell key={i} fill={e.value > e.max ? '#f87171' : '#60a5fa'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Trend */}
                                {results.length > 1 && (
                                    <div style={{ ...S.card, padding: 18 }}>
                                        <div style={S.labelSmall}>Risk Score Over Time</div>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <LineChart data={getHistoryChartData()}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="risk" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 4 }} name="Risk Score" />
                                                <Line type="monotone" dataKey="confidence" stroke="var(--yellow)" strokeWidth={2} dot={{ fill: 'var(--yellow)', r: 4 }} name="Confidence" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {selected.result.recommendations?.length > 0 && (
                                    <div style={{ ...S.card, padding: 18 }}>
                                        <div style={S.labelSmall}>Recommendations</div>
                                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {selected.result.recommendations.map((rec, i) => (
                                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: 'var(--text-dim)' }}>
                                                    <div style={{ width: 20, height: 20, background: 'var(--yellow-dim)', border: '1px solid rgba(212,245,60,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: 'var(--yellow)', fontWeight: 700 }}>{i + 1}</div>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Feature tables */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    {selected.result.voice_features_summary && (
                                        <div style={{ ...S.card, padding: 16 }}>
                                            <div style={{ ...S.labelSmall, color: 'var(--yellow)' }}>Voice Features</div>
                                            {Object.entries(selected.result.voice_features_summary).map(([k, v]) => (
                                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <span style={{ color: 'var(--text-dim)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                                                    <span style={{ color: 'var(--white)', fontWeight: 700 }}>{typeof v === 'number' ? v.toFixed(3) : v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selected.result.typing_features_summary && (
                                        <div style={{ ...S.card, padding: 16 }}>
                                            <div style={{ ...S.labelSmall, color: '#60a5fa' }}>Typing Features</div>
                                            {Object.entries(selected.result.typing_features_summary).map(([k, v]) => (
                                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <span style={{ color: 'var(--text-dim)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                                                    <span style={{ color: 'var(--white)', fontWeight: 700 }}>{typeof v === 'number' ? v.toFixed(1) : v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                                    ⚠️ This is an AI screening result, not a medical diagnosis. Consult a neurologist for professional evaluation.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
