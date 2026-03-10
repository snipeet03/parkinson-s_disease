import { useState, useEffect, useRef, useCallback } from 'react'
import { Keyboard, CheckCircle, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { typingAPI, predictAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'

export default function TypingTest() {
  const [testText, setTestText]           = useState('')
  const [typedText, setTypedText]         = useState('')
  const [keystrokes, setKeystrokes]       = useState([])
  const [startTime, setStartTime]         = useState(null)
  const [endTime, setEndTime]             = useState(null)
  const [testState, setTestState]         = useState('loading')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [predicting, setPredicting]       = useState(false)
  const [predResult, setPredResult]       = useState(null)
  const [voiceAnalysisId]                 = useState(null)   // no localStorage

  const inputRef  = useRef(null)
  const navigate  = useNavigate()

  const loadTestText = useCallback(async () => {
    setTestState('loading')
    try {
      const res = await typingAPI.getTestText()
      setTestText(res.data.text)
      setTestState('ready')
      setTypedText('')
      setKeystrokes([])
      setStartTime(null)
      setEndTime(null)
      setAnalysisResult(null)
      setPredResult(null)
    } catch {
      toast.error('Failed to load test text')
    }
  }, [])

  useEffect(() => { loadTestText() }, [loadTestText])

  const handleKeyDown = (e) => {
    const now = performance.now()
    if (testState === 'ready') {
      setStartTime(now)
      setTestState('typing')
    }
    setKeystrokes(prev => [...prev, { key: e.key, press_time: now, release_time: now }])
  }

  const handleKeyUp = (e) => {
    const now = performance.now()
    setKeystrokes(prev => {
      const updated = [...prev]
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].key === e.key && updated[i].release_time === updated[i].press_time) {
          updated[i] = { ...updated[i], release_time: now }
          break
        }
      }
      return updated
    })
  }

  const handleInput = (e) => {
    const value = e.target.value
    setTypedText(value)
    if (value.length >= testText.length && testState === 'typing') {
      setEndTime(performance.now())
    }
  }

  const submitTypingTest = async () => {
    if (keystrokes.length < 5) { toast.error('Please type more to collect enough data'); return }
    setTestState('done')
    try {
      const res = await typingAPI.analyze({
        keystrokes:  keystrokes.map(k => ({ key: k.key, press_time: k.press_time, release_time: k.release_time })),
        target_text: testText,
        typed_text:  typedText,
        start_time:  startTime || 0,
        end_time:    endTime || performance.now(),
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
        voice_analysis_id:  voiceAnalysisId || null,
        typing_analysis_id: analysisResult.id,
      })
      setPredResult(res.data)
      toast.success('AI prediction complete!')
      setTestState('analyzed')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Prediction failed')
    } finally {
      setPredicting(false)
    }
  }

  const wordCount   = typedText.trim() ? typedText.trim().split(/\s+/).length : 0
  const targetWords = testText.trim().split(/\s+/).length
  const progress    = Math.min((typedText.length / (testText.length || 1)) * 100, 100)
  const correct     = typedText.split('').filter((c, i) => c === testText[i]).length
  const accuracy    = typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 100

  const getRiskClass = (level) =>
    level === 'Low' ? 'risk-low border' : level === 'Medium' ? 'risk-medium border' : 'risk-high border'

  return (
    <div className="min-h-screen grid-bg mesh-bg pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Keyboard size={28} className="text-blue-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">Typing Dynamics Test</h1>
          <p className="text-white/50 max-w-md mx-auto">
            Type the paragraph below. We capture keystroke timing to analyze fine motor coordination.
          </p>
        </div>

        {testText && testState !== 'analyzed' && (
          <div className="glass-card p-6 mb-6">
            <p className="text-white/30 text-xs font-mono uppercase mb-3">Type this paragraph:</p>
            <div className="font-mono text-base leading-relaxed">
              {testText.split('').map((char, i) => {
                let color = 'text-white/60'
                if (i < typedText.length)        color = typedText[i] === char ? 'text-primary-400' : 'text-red-400 bg-red-400/15 rounded'
                else if (i === typedText.length)  color = 'text-white bg-white/20 rounded'
                return <span key={i} className={color}>{char}</span>
              })}
            </div>
          </div>
        )}

        {(testState === 'typing' || testState === 'done') && (
          <div className="glass-card p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4 text-sm">
                <span className="text-white/40">Progress: <span className="text-white font-mono">{Math.round(progress)}%</span></span>
                <span className="text-white/40">Accuracy: <span className={`font-mono ${accuracy > 90 ? 'text-primary-400' : 'text-yellow-400'}`}>{accuracy}%</span></span>
                <span className="text-white/40">Words: <span className="text-white font-mono">{wordCount}/{targetWords}</span></span>
              </div>
              {testState === 'typing' && (
                <button onClick={submitTypingTest} className="btn-primary text-sm px-4 py-1.5">Submit</button>
              )}
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-600 to-emerald-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {(testState === 'ready' || testState === 'typing') && (
          <div className="glass-card p-2 mb-6">
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              placeholder={testState === 'ready' ? 'Start typing here...' : ''}
              rows={4}
              autoFocus
              className="w-full bg-transparent border-0 outline-none resize-none text-white p-4 font-mono text-base placeholder-white/20"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        )}

        {testState === 'ready' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-white/40 text-sm bg-white/5 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Click on the typing area above to begin
            </div>
          </div>
        )}

        {testState === 'typing' && keystrokes.length > 5 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Keystrokes', value: keystrokes.length },
              { label: 'Backspaces', value: keystrokes.filter(k => k.key === 'Backspace').length },
              { label: 'Avg Key Time', value: `${Math.round(keystrokes.reduce((a, k) => a + (k.release_time - k.press_time), 0) / keystrokes.length)}ms` },
            ].map(({ label, value }) => (
              <div key={label} className="metric-card text-center">
                <span className="text-white/40 text-xs">{label}</span>
                <span className="text-white font-bold font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-primary-400">
              <CheckCircle size={18} />
              <span className="font-semibold">Typing Analysis Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Typing Speed', value: `${analysisResult.features.typing_speed_wpm?.toFixed(1)} WPM` },
                { label: 'Dwell Time',   value: `${analysisResult.features.mean_dwell_time?.toFixed(0)}ms` },
                { label: 'Error Rate',   value: `${(analysisResult.features.error_rate * 100)?.toFixed(1)}%` },
                { label: 'Rhythm',       value: `${(analysisResult.features.rhythm_consistency * 100)?.toFixed(0)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="metric-card">
                  <span className="text-white/40 text-xs font-mono uppercase">{label}</span>
                  <span className="text-white font-bold font-mono text-lg">{value}</span>
                </div>
              ))}
            </div>
            {!predResult && (
              <div className="flex gap-3">
                <button onClick={loadTestText} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> Retake
                </button>
                <button onClick={runPrediction} disabled={predicting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {predicting
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                    : <><ChevronRight size={16} /> Get AI Prediction</>}
                </button>
              </div>
            )}
          </div>
        )}

        {predResult && (
          <div className="mt-6 glass-card p-6 border border-primary-500/20">
            <h3 className="font-display font-bold text-white text-lg mb-4">Preliminary Result</h3>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-4 ${getRiskClass(predResult.result.risk_level)}`}>
              {predResult.result.risk_level === 'Low' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {predResult.result.classification} — {predResult.result.risk_level} Risk
              <span className="ml-1 opacity-70">({predResult.result.confidence}% confidence)</span>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full flex items-center justify-center gap-2">
              View Full Dashboard <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
