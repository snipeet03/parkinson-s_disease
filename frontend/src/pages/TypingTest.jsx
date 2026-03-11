import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { typingAPI, predictAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const S = {
    page: { minHeight: '100vh', background: 'var(--bg)', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 },
    center: { maxWidth: 720, margin: '0 auto' },
    iconBox: { width: 56, height: 56, background: 'var(--yellow-dim)', border: '1px solid rgba(212,245,60,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 18px' },
    h1: { fontSize: 28, fontWeight: 800, color: 'var(--white)', marginBottom: 10, letterSpacing: -1, textAlign: 'center' },
    sub: { fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, textAlign: 'center', marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' },
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 16 },
    labelSmall: { fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 },
}

export default function TypingTest() {
    const [testText, setTestText] = useState('')
    const [typedText, setTypedText] = useState('')
    const [keystrokes, setKeystrokes] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [endTime, setEndTime] = useState(null)
    const [testState, setTestState] = useState('loading')
    const [analysisResult, setAnalysisResult] = useState(null)
    const [predicting, setPredicting] = useState(false)
    const [predResult, setPredResult] = useState(null)
    const [voiceAnalysisId] = useState(null)

    const inputRef = useRef(null)
    const navigate = useNavigate()

    const loadTestText = useCallback(async () => {
        setTestState('loading')
        try {
            const res = await typingAPI.getTestText()
            setTestText(res.data.text)
            setTestState('ready')
            setTypedText(''); setKeystrokes([]); setStartTime(null); setEndTime(null)
            setAnalysisResult(null); setPredResult(null)
        } catch { toast.error('Failed to load test text') }
    }, [])

    useEffect(() => { loadTestText() }, [loadTestText])

    const handleKeyDown = e => {
        const now = performance.now()
        if (testState === 'ready') { setStartTime(now); setTestState('typing') }
        setKeystrokes(prev => [...prev, { key: e.key, press_time: now, release_time: now }])
    }

    const handleKeyUp = e => {
        const now = performance.now()
        setKeystrokes(prev => {
            const updated = [...prev]
            for (let i = updated.length - 1; i >= 0; i--) {
                if (updated[i].key === e.key && updated[i].release_time === updated[i].press_time) {
                    updated[i] = { ...updated[i], release_time: now }; break
                }
            }
            return updated
        })
    }

    const handleInput = e => {
        const value = e.target.value
        setTypedText(value)
        if (value.length >= testText.length && testState === 'typing') setEndTime(performance.now())
    }

    const submitTypingTest = async () => {
        if (keystrokes.length < 5) { toast.error('Please type more to collect enough data'); return }
        setTestState('done')
        try {
            const res = await typingAPI.analyze({
                keystrokes: keystrokes.map(k => ({ key: k.key, press_time: k.press_time, release_time: k.release_time })),
                target_text: testText, typed_text: typedText,
                start_time: startTime || 0, end_time: endTime || performance.now(),
            })
            setAnalysisResult(res.data)
            toast.success('Typing analysis complete!')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed')
            setTestState('typing')
        }
    }

    const runPrediction = async () => {
        if (!analysisResult) return
        setPredicting(true)
        try {
            const res = await predictAPI.predict({
                voice_analysis_id: voiceAnalysisId || null,
                typing_analysis_id: analysisResult.id,
                // Pass features inline so prediction works even when DB is unavailable
                // (UUID-format IDs can't be looked up via ObjectId in MongoDB)
                typing_features: analysisResult.features,
            })
            setPredResult(res.data)
            toast.success('AI prediction complete!')
            setTestState('analyzed')
        } catch (err) { toast.error(err.response?.data?.detail || 'Prediction failed') }
        finally { setPredicting(false) }
    }

    const progress = Math.min((typedText.length / (testText.length || 1)) * 100, 100)
    const correct = typedText.split('').filter((c, i) => c === testText[i]).length
    const accuracy = typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 100
    const wordCount = typedText.trim() ? typedText.trim().split(/\s+/).length : 0
    const targetWords = testText.trim().split(/\s+/).length

    const riskStyle = level => ({
        Low: { background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' },
        Medium: { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' },
        High: { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' },
    }[level] || {})

    return (
        <div style={S.page}>
            <div style={S.center}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={S.iconBox}>⌨️</div>
                    <h1 style={S.h1}>Typing Dynamics Test</h1>
                    <p style={S.sub}>Type the paragraph below. We capture keystroke timing to analyze fine motor coordination.</p>
                </div>

                {/* Loading */}
                {testState === 'loading' && (
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 13 }}>
                        <div style={{ width: 20, height: 20, border: '2px solid var(--yellow)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        Loading test text...
                    </div>
                )}

                {/* Target Text display */}
                {testText && testState !== 'analyzed' && (
                    <div style={S.card}>
                        <div style={S.labelSmall}>Type this paragraph:</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.9 }}>
                            {testText.split('').map((char, i) => {
                                let color = 'var(--text-dim)'
                                let bg = 'transparent'
                                if (i < typedText.length) {
                                    color = typedText[i] === char ? 'var(--yellow)' : '#f87171'
                                    bg = typedText[i] === char ? 'transparent' : 'rgba(248,113,113,0.12)'
                                } else if (i === typedText.length) {
                                    bg = 'var(--border2)'
                                }
                                return <span key={i} style={{ color, background: bg, borderRadius: 2 }}>{char}</span>
                            })}
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {(testState === 'typing' || testState === 'done') && (
                    <div style={S.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                                <span style={{ color: 'var(--text-dim)' }}>Progress: <span style={{ color: 'var(--white)', fontWeight: 700 }}>{Math.round(progress)}%</span></span>
                                <span style={{ color: 'var(--text-dim)' }}>Accuracy: <span style={{ color: accuracy > 90 ? 'var(--yellow)' : '#fbbf24', fontWeight: 700 }}>{accuracy}%</span></span>
                                <span style={{ color: 'var(--text-dim)' }}>Words: <span style={{ color: 'var(--white)', fontWeight: 700 }}>{wordCount}/{targetWords}</span></span>
                            </div>
                            {testState === 'typing' && (
                                <button onClick={submitTypingTest} className="btn-primary" style={{ padding: '5px 14px', fontSize: 12 }}>Submit</button>
                            )}
                        </div>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--yellow)', borderRadius: 2, transition: 'width 0.3s' }} />
                        </div>
                    </div>
                )}

                {/* Textarea */}
                {(testState === 'ready' || testState === 'typing') && (
                    <div style={{ ...S.card, padding: 4 }}>
                        <textarea
                            ref={inputRef}
                            value={typedText}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            placeholder={testState === 'ready' ? 'Start typing here...' : ''}
                            rows={4}
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            style={{
                                width: '100%', background: 'transparent', border: 0,
                                outline: 'none', resize: 'none', color: 'var(--text)',
                                padding: 16, fontFamily: 'var(--font-mono)', fontSize: 14,
                            }}
                        />
                    </div>
                )}

                {/* Ready hint */}
                {testState === 'ready' && (
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg2)', border: '1px solid var(--border)', padding: '6px 16px', borderRadius: 20 }}>
                            <div style={{ width: 6, height: 6, background: 'var(--yellow)', borderRadius: '50%', animation: 'pulse 1.5s ease infinite' }} />
                            Click on the typing area to begin
                        </div>
                    </div>
                )}

                {/* Live keystroke stats */}
                {testState === 'typing' && keystrokes.length > 5 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                        {[
                            { label: 'Keystrokes', value: keystrokes.length },
                            { label: 'Backspaces', value: keystrokes.filter(k => k.key === 'Backspace').length },
                            { label: 'Avg Key Time', value: `${Math.round(keystrokes.reduce((a, k) => a + (k.release_time - k.press_time), 0) / keystrokes.length)}ms` },
                        ].map(({ label, value }) => (
                            <div key={label} className="metric-card" style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
                                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--yellow)', letterSpacing: -0.5 }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Analysis result */}
                {analysisResult && (
                    <div>
                        <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            ✓ <strong>Typing Analysis Complete</strong>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                            {[
                                { label: 'Typing Speed', value: `${analysisResult.features.typing_speed_wpm?.toFixed(1)} WPM` },
                                { label: 'Dwell Time', value: `${analysisResult.features.mean_dwell_time?.toFixed(0)}ms` },
                                { label: 'Error Rate', value: `${(analysisResult.features.error_rate * 100)?.toFixed(1)}%` },
                                { label: 'Rhythm', value: `${(analysisResult.features.rhythm_consistency * 100)?.toFixed(0)}%` },
                            ].map(({ label, value }) => (
                                <div key={label} className="metric-card">
                                    <span style={{ fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--yellow)', letterSpacing: -0.5 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        {!predResult && (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={loadTestText} className="btn-secondary" style={{ flex: 1 }}>↩ Retake</button>
                                <button onClick={runPrediction} disabled={predicting} className="btn-primary" style={{ flex: 1 }}>
                                    {predicting
                                        ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: 8 }} />Analyzing...</>
                                        : '→ Get AI Prediction'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Prediction result */}
                {predResult && (
                    <div style={{ ...S.card, borderColor: 'rgba(212,245,60,0.2)', marginTop: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 14 }}>Preliminary Result</h3>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 700, marginBottom: 16, ...riskStyle(predResult.result.risk_level) }}>
                            {predResult.result.risk_level === 'Low' ? '✓' : '⚠'} {predResult.result.classification} — {predResult.result.risk_level} Risk
                            <span style={{ opacity: 0.7 }}>({predResult.result.confidence}% confidence)</span>
                        </div>
                        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            View Full Dashboard →
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}
