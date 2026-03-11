import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { voiceAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const RECORDING_TEXT = "The quick brown fox jumps over the lazy dog. Please speak clearly and at a natural pace for about thirty seconds. Say this sentence multiple times if needed to reach the required duration."

const S = {
    page: { minHeight: '100vh', background: 'var(--bg)', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 },
    center: { maxWidth: 680, margin: '0 auto' },
    iconBox: { width: 56, height: 56, background: 'var(--yellow-dim)', border: '1px solid rgba(212,245,60,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 18px' },
    h1: { fontSize: 28, fontWeight: 800, color: 'var(--white)', marginBottom: 10, letterSpacing: -1, textAlign: 'center' },
    sub: { fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, textAlign: 'center', marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' },
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 20 },
    labelSmall: { fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 },
    readingText: { fontSize: 15, color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic' },
    timer: { fontSize: 32, fontWeight: 800, color: 'var(--white)', letterSpacing: -1, textAlign: 'center', marginBottom: 16, fontFamily: 'var(--font-mono)' },
    recDot: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, color: '#f87171', marginTop: 12 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
}

export default function VoiceAnalysis() {
    const [state, setState] = useState('idle')
    const [audioBlob, setAudioBlob] = useState(null)
    const [audioUrl, setAudioUrl] = useState(null)
    const [duration, setDuration] = useState(0)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [amplitude, setAmplitude] = useState(new Array(40).fill(0))

    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const timerRef = useRef(null)
    const animFrameRef = useRef(null)
    const analyserRef = useRef(null)
    const navigate = useNavigate()
    const MAX_DURATION = 60

    useEffect(() => () => {
        clearInterval(timerRef.current)
        cancelAnimationFrame(animFrameRef.current)
        if (audioUrl) URL.revokeObjectURL(audioUrl)
    }, [audioUrl])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const audioCtx = new AudioContext()
            const source = audioCtx.createMediaStreamSource(stream)
            const analyser = audioCtx.createAnalyser()
            analyser.fftSize = 64
            source.connect(analyser)
            analyserRef.current = analyser
            const update = () => {
                const data = new Uint8Array(analyser.frequencyBinCount)
                analyser.getByteFrequencyData(data)
                setAmplitude(Array.from({ length: 40 }, (_, i) => data[Math.floor(i * data.length / 40)] / 255))
                animFrameRef.current = requestAnimationFrame(update)
            }
            animFrameRef.current = requestAnimationFrame(update)
            const recorder = new MediaRecorder(stream)
            mediaRecorderRef.current = recorder
            chunksRef.current = []
            recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                stream.getTracks().forEach(t => t.stop())
                cancelAnimationFrame(animFrameRef.current)
                setState('done')
            }
            recorder.start()
            setState('recording')
            setDuration(0)
            timerRef.current = setInterval(() => {
                setDuration(d => {
                    if (d >= MAX_DURATION - 1) { stopRecording(); return MAX_DURATION }
                    return d + 1
                })
            }, 1000)
        } catch {
            toast.error('Microphone access denied.')
            setState('error')
        }
    }

    const stopRecording = () => {
        clearInterval(timerRef.current)
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    }

    const analyzeVoice = async () => {
        if (!audioBlob) return
        setState('processing')
        try {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')
            const res = await voiceAPI.analyze(formData)
            setAnalysisResult(res.data)
            toast.success('Voice analysis complete!')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed. Please try again.')
            setState('done')
        }
    }

    const reset = () => {
        setState('idle'); setAudioBlob(null); setAudioUrl(null)
        setDuration(0); setAnalysisResult(null); setAmplitude(new Array(40).fill(0))
    }

    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    return (
        <div style={S.page}>
            <div style={S.center}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={S.iconBox}>🎙</div>
                    <h1 style={S.h1}>Voice Analysis</h1>
                    <p style={S.sub}>Record for 15–30 seconds. Our AI extracts jitter, shimmer, pitch, HNR, and 13 MFCC biomarkers.</p>
                </div>

                {/* Reading Text */}
                <div style={{ ...S.card, borderLeft: '3px solid var(--yellow)' }}>
                    <div style={S.labelSmall}>Read this aloud</div>
                    <p style={S.readingText}>"{RECORDING_TEXT}"</p>
                </div>

                {/* Recorder */}
                <div style={S.card}>
                    {/* Waveform visualizer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: 64, marginBottom: 20 }}>
                        {amplitude.map((amp, i) => (
                            <div key={i} style={{
                                width: 3, borderRadius: 2,
                                height: state === 'recording' ? `${Math.max(3, amp * 56)}px` : '3px',
                                background: state === 'recording'
                                    ? `rgba(212,245,60,${0.3 + amp * 0.7})`
                                    : 'var(--border2)',
                                transition: 'height 0.08s ease',
                            }} />
                        ))}
                    </div>

                    {/* Timer */}
                    {(state === 'recording' || state === 'done') && (
                        <div style={S.timer}>
                            {fmt(duration)}
                            {state === 'recording' && <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>/ {fmt(MAX_DURATION)}</span>}
                        </div>
                    )}

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        {state === 'idle' && (
                            <button onClick={startRecording} className="btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>
                                🎙 Start Recording
                            </button>
                        )}
                        {state === 'recording' && (
                            <button onClick={stopRecording} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '12px 32px', background: 'rgba(248,113,113,0.15)',
                                color: '#f87171', border: '1px solid rgba(248,113,113,0.3)',
                                borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)',
                                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                            }}>
                                ⏹ Stop Recording
                            </button>
                        )}
                        {state === 'done' && !analysisResult && (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={reset} className="btn-secondary">↩ Re-record</button>
                                <button onClick={analyzeVoice} className="btn-primary" style={{ padding: '10px 28px' }}>
                                    ⬆ Analyze Voice
                                </button>
                            </div>
                        )}
                        {state === 'processing' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-dim)', fontSize: 13 }}>
                                <div style={{ width: 18, height: 18, border: '2px solid var(--yellow)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Extracting biomarkers...
                            </div>
                        )}
                    </div>

                    {/* Audio player */}
                    {audioUrl && state !== 'processing' && (
                        <audio src={audioUrl} controls style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto 8px' }} />
                    )}

                    {/* Rec status */}
                    {state === 'recording' && (
                        <div style={S.recDot}>
                            <div style={{ width: 8, height: 8, background: '#f87171', borderRadius: '50%', animation: 'pulse 1s ease infinite' }} />
                            Recording in progress...
                        </div>
                    )}
                </div>

                {/* Results */}
                {analysisResult && (
                    <div>
                        <div style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                            ✓ <strong>Analysis Complete</strong>
                        </div>

                        <div style={S.metricGrid}>
                            {[
                                { label: 'Jitter', value: `${analysisResult.features.jitter?.toFixed(3)}%` },
                                { label: 'Shimmer', value: `${analysisResult.features.shimmer?.toFixed(3)}%` },
                                { label: 'Pitch Mean', value: `${analysisResult.features.pitch_mean?.toFixed(1)} Hz` },
                                { label: 'HNR', value: `${analysisResult.features.hnr?.toFixed(2)} dB` },
                            ].map(({ label, value }) => (
                                <div key={label} className="metric-card">
                                    <span style={{ fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--yellow)', letterSpacing: -0.5 }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ ...S.card, marginTop: 16, borderColor: 'rgba(212,245,60,0.15)' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analysis ID saved: </span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)', fontSize: 12 }}>{analysisResult.id}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                                Duration: {analysisResult.duration?.toFixed(1)}s
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <button onClick={reset} className="btn-secondary" style={{ flex: 1 }}>New Recording</button>
                            <button onClick={() => navigate('/typing')} className="btn-primary" style={{ flex: 1 }}>
                                Next: Typing Test →
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
