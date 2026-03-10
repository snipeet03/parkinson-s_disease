import { useState, useEffect } from 'react'
import { BarChart3, Download, Trash2, ChevronRight, Activity, AlertCircle, CheckCircle, Clock, Brain, TrendingUp } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import toast from 'react-hot-toast'
import { resultsAPI } from '../utils/api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [results,     setResults]     = useState([])
  const [selected,    setSelected]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => { fetchResults() }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await resultsAPI.getHistory()
      setResults(res.data.results)
      if (res.data.results.length > 0) setSelected(res.data.results[0])
    } catch {
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (id) => {
    setDownloading(true)
    try {
      const res = await resultsAPI.downloadReport(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href = url; a.download = `neurascan_report_${id.slice(0, 8)}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch { toast.error('Failed to generate report') }
    finally  { setDownloading(false) }
  }

  const deleteResult = async (id) => {
    if (!confirm('Delete this result?')) return
    try {
      await resultsAPI.deleteResult(id)
      const updated = results.filter(r => r.id !== id)
      setResults(updated)
      setSelected(selected?.id === id ? (updated[0] || null) : selected)
      toast.success('Result deleted')
    } catch { toast.error('Failed to delete') }
  }

  const getRiskColor = (l) => ({ Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' })[l] || '#94a3b8'
  const getRiskBg    = (l) => ({
    Low:    'bg-green-400/10  border-green-400/20  text-green-400',
    Medium: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    High:   'bg-red-400/10   border-red-400/20   text-red-400',
  })[l] || 'bg-white/10 text-white/60'

  const getRadarData = (result) => {
    if (!result) return []
    const r = result.result
    return [
      { metric: 'Voice Risk',  value: r.voice_risk_score   || 0 },
      { metric: 'Typing Risk', value: r.typing_risk_score  || 0 },
      { metric: 'Overall',     value: r.combined_risk_score || 0 },
      { metric: 'Confidence',  value: r.confidence          || 0 },
    ]
  }

  const getHistoryChartData = () =>
    results.slice().reverse().map((r, i) => ({
      test:       `T${i + 1}`,
      risk:       r.result.combined_risk_score || 0,
      confidence: r.result.confidence          || 0,
      date:       new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    }))

  const getBiomarkerData = (result) => {
    if (!result?.result) return []
    const vf = result.result.voice_features_summary  || {}
    const tf = result.result.typing_features_summary || {}
    return [
      { name: 'Jitter',     value: parseFloat(vf.jitter   || 0) * 100,              max: 5   },
      { name: 'Shimmer',    value: parseFloat(vf.shimmer  || 0) * 10,               max: 5   },
      { name: 'Error Rate', value: parseFloat(tf.error_rate || 0),                  max: 30  },
      { name: 'Rhythm',     value: parseFloat(tf.rhythm_consistency || 0),          max: 100 },
      { name: 'Speed',      value: Math.min(parseFloat(tf.typing_speed_wpm || 0), 100), max: 100 },
    ]
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-neural-800 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-white/60">{p.name}:</span>
            <span className="text-white font-medium">{parseFloat(p.value).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg mesh-bg pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">Results Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Your AI health screening history</p>
          </div>
          <Link to="/voice" className="btn-outline text-sm flex items-center gap-2 px-4 py-2">
            <Activity size={14} /> New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <Brain size={48} className="text-white/20 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-white mb-2">No assessments yet</h2>
            <p className="text-white/40 mb-6">Complete a voice or typing test to see results here.</p>
            <Link to="/voice" className="btn-primary inline-flex items-center gap-2">
              Start Assessment <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wide flex items-center gap-2">
                <Clock size={14} /> Test History ({results.length})
              </h2>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`w-full text-left glass-card p-4 transition-all duration-200 hover:border-primary-500/30
                    ${selected?.id === r.id ? 'border-primary-500/40 bg-primary-600/5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getRiskBg(r.result.risk_level)}`}>
                      {r.result.risk_level} Risk
                    </span>
                    <span className="text-white/30 text-xs">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-semibold text-white text-sm">{r.result.classification}</div>
                  <div className="text-white/40 text-xs mt-1">
                    Confidence: {r.result.confidence}% · Risk: {r.result.combined_risk_score}%
                  </div>
                  <div className="mt-2 flex gap-1">
                    {r.voice_analysis_id  && <span className="text-xs bg-primary-600/15 text-primary-400 px-2 py-0.5 rounded">Voice</span>}
                    {r.typing_analysis_id && <span className="text-xs bg-blue-600/15   text-blue-400   px-2 py-0.5 rounded">Typing</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail Panel */}
            {selected && (
              <div className="lg:col-span-2 space-y-6">

                {/* Risk Banner */}
                <div className={`glass-card p-6 border ${getRiskBg(selected.result.risk_level)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {selected.result.risk_level === 'Low'
                          ? <CheckCircle size={20} className="text-green-400" />
                          : <AlertCircle size={20} className="text-yellow-400" />}
                        <span className="font-display font-bold text-2xl text-white">{selected.result.classification}</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        {selected.result.risk_level} Risk · {selected.result.confidence}% Confidence
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadReport(selected.id)}
                        disabled={downloading}
                        className="btn-outline text-sm px-3 py-2 flex items-center gap-1.5"
                      >
                        {downloading
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Download size={14} />} PDF
                      </button>
                      <button onClick={() => deleteResult(selected.id)} className="text-red-400/60 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Voice Risk Score',    value: selected.result.voice_risk_score,    color: '#22c55e' },
                      { label: 'Typing Risk Score',   value: selected.result.typing_risk_score,   color: '#3b82f6' },
                      { label: 'Combined Risk Score', value: selected.result.combined_risk_score, color: getRiskColor(selected.result.risk_level) },
                    ].filter(x => x.value != null).map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/50">{label}</span>
                          <span className="text-white font-mono">{value?.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
                      <Brain size={14} className="text-primary-400" /> Risk Profile
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={getRadarData(selected)}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar name="Score" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
                      <Activity size={14} className="text-blue-400" /> Biomarkers
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={getBiomarkerData(selected)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {getBiomarkerData(selected).map((e, i) => (
                            <Cell key={i} fill={e.value > e.max ? '#ef4444' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {results.length > 1 && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
                      <TrendingUp size={14} className="text-yellow-400" /> Risk Score Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={getHistoryChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="risk"       stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} name="Risk Score"  />
                        <Line type="monotone" dataKey="confidence" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="Confidence"  />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {selected.result.recommendations?.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
                      <CheckCircle size={14} className="text-primary-400" /> Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {selected.result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <div className="w-5 h-5 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary-400 text-xs">{i + 1}</span>
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {selected.result.voice_features_summary && (
                    <div className="glass-card p-4">
                      <h4 className="text-primary-400 text-xs font-mono uppercase mb-3">Voice Features</h4>
                      {Object.entries(selected.result.voice_features_summary).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-white/40 capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className="text-white font-mono">{typeof v === 'number' ? v.toFixed(3) : v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selected.result.typing_features_summary && (
                    <div className="glass-card p-4">
                      <h4 className="text-blue-400 text-xs font-mono uppercase mb-3">Typing Features</h4>
                      {Object.entries(selected.result.typing_features_summary).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-white/40 capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className="text-white font-mono">{typeof v === 'number' ? v.toFixed(1) : v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-white/25 text-xs text-center">
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
