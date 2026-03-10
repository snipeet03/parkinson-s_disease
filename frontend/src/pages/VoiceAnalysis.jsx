import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Square, Upload, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { voiceAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const RECORDING_TEXT = "The quick brown fox jumps over the lazy dog. Please speak clearly and at a natural pace for about thirty seconds. Say this sentence multiple times if needed to reach the required duration."

export default function VoiceAnalysis() {
  const [state, setState] = useState('idle') // idle | recording | processing | done | error
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [amplitude, setAmplitude] = useState(new Array(30).fill(0))

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const animFrameRef = useRef(null)
  const analyserRef = useRef(null)
  const navigate = useNavigate()

  const MAX_DURATION = 60

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      cancelAnimationFrame(animFrameRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Audio visualizer
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const updateAmplitude = () => {
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        const bars = Array.from({ length: 30 }, (_, i) => {
          const idx = Math.floor(i * data.length / 30)
          return data[idx] / 255
        })
        setAmplitude(bars)
        animFrameRef.current = requestAnimationFrame(updateAmplitude)
      }
      animFrameRef.current = requestAnimationFrame(updateAmplitude)

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
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
          if (d >= MAX_DURATION - 1) {
            stopRecording()
            return MAX_DURATION
          }
          return d + 1
        })
      }, 1000)
    } catch (err) {
      toast.error('Microphone access denied. Please allow microphone access.')
      setState('error')
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
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
    setState('idle')
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setAnalysisResult(null)
    setAmplitude(new Array(30).fill(0))
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen grid-bg mesh-bg pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mic size={28} className="text-primary-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">Voice Analysis</h1>
          <p className="text-white/50 max-w-md mx-auto">
            Record your voice for 15–30 seconds. Our AI analyzes jitter, shimmer, pitch, and 13 MFCC features.
          </p>
        </div>

        {/* Reading Text */}
        <div className="glass-card p-6 mb-8 border-l-4 border-primary-500/50">
          <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Read this aloud:</p>
          <p className="text-white/80 leading-relaxed text-lg italic">&ldquo;{RECORDING_TEXT}&rdquo;</p>
        </div>

        {/* Recorder */}
        <div className="glass-card p-8 text-center">
          {/* Visualizer */}
          <div className="flex items-center justify-center gap-1 h-16 mb-6">
            {amplitude.map((amp, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-100"
                style={{
                  height: state === 'recording' ? `${Math.max(4, amp * 56)}px` : '4px',
                  background: state === 'recording'
                    ? `rgba(34, 197, 94, ${0.4 + amp * 0.6})`
                    : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>

          {/* Timer */}
          {(state === 'recording' || state === 'done') && (
            <div className="text-2xl font-mono font-bold text-white mb-4">
              {formatTime(duration)}
              {state === 'recording' && <span className="text-white/30 text-sm ml-2">/ {formatTime(MAX_DURATION)}</span>}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {state === 'idle' && (
              <button onClick={startRecording} className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                <Mic size={20} /> Start Recording
              </button>
            )}
            {state === 'recording' && (
              <button onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg">
                <Square size={20} fill="white" /> Stop Recording
              </button>
            )}
            {state === 'done' && !analysisResult && (
              <div className="flex gap-3">
                <button onClick={reset} className="btn-outline flex items-center gap-2">
                  <MicOff size={16} /> Re-record
                </button>
                <button onClick={analyzeVoice} className="btn-primary flex items-center gap-2 px-8">
                  <Upload size={16} /> Analyze Voice
                </button>
              </div>
            )}
            {state === 'processing' && (
              <div className="flex items-center gap-3 text-white/60">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Extracting biomarkers...
              </div>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && state !== 'processing' && (
            <audio src={audioUrl} controls className="w-full max-w-xs mx-auto mb-4"
              style={{ filter: 'invert(0.8) hue-rotate(100deg)' }} />
          )}

          {/* Status */}
          {state === 'recording' && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Recording in progress...
            </div>
          )}
        </div>

        {/* Results */}
        {analysisResult && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-primary-400">
              <CheckCircle size={18} />
              <span className="font-semibold">Analysis Complete</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Jitter', value: `${analysisResult.features.jitter?.toFixed(3)}%` },
                { label: 'Shimmer', value: `${analysisResult.features.shimmer?.toFixed(3)}%` },
                { label: 'Pitch Mean', value: `${analysisResult.features.pitch_mean?.toFixed(1)} Hz` },
                { label: 'HNR', value: `${analysisResult.features.hnr?.toFixed(2)} dB` },
              ].map(({ label, value }) => (
                <div key={label} className="metric-card">
                  <span className="text-white/40 text-xs font-mono uppercase">{label}</span>
                  <span className="text-white font-bold font-mono text-lg">{value}</span>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 bg-primary-600/5 border border-primary-500/20">
              <p className="text-white/60 text-sm mb-1">Voice Analysis ID saved:</p>
              <p className="font-mono text-primary-400 text-sm">{analysisResult.id}</p>
              <p className="text-white/40 text-xs mt-2">Duration: {analysisResult.duration?.toFixed(1)}s</p>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-outline flex-1">New Recording</button>
              <button
                onClick={() => navigate('/typing')}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Next: Typing Test <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
