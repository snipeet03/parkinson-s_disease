import { Link } from 'react-router-dom'
import { Brain, Mic, Keyboard, BarChart3, Shield, Clock, ChevronRight, Activity, Zap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen grid-bg mesh-bg">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-600/15 border border-primary-500/25 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-400 text-sm font-medium">AI-Powered Neurological Screening — No Login Required</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Detect Parkinson's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">
              Before It Progresses
            </span>
          </h1>

          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Free, non-invasive AI screening using your{' '}
            <strong className="text-white/80">voice</strong> and{' '}
            <strong className="text-white/80">typing patterns</strong> as digital biomarkers.
            No account needed — start instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voice" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              <Mic size={18} /> Start Voice Test
            </Link>
            <Link to="/typing" className="btn-outline inline-flex items-center gap-2 text-base px-8 py-4">
              <Keyboard size={18} /> Start Typing Test
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '93%+', label: 'Model Accuracy' },
              { value: '5 min', label: 'Assessment Time' },
              { value: 'Free', label: 'No Login Needed' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-bold text-primary-400">{value}</div>
                <div className="text-white/40 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">How It Works</h2>
            <p className="text-white/50 max-w-xl mx-auto">Three simple steps — no registration, no equipment.</p>
          </div>

          {/* Step cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                step: '01', icon: Mic, color: 'text-primary-400', bg: 'bg-primary-600/20', border: 'border-primary-500/20',
                title: 'Record Your Voice',
                desc: 'Read a short sentence aloud for 15–30 seconds. We extract jitter, shimmer, pitch and 13 MFCC features.',
                link: '/voice', linkLabel: 'Open Voice Test',
              },
              {
                step: '02', icon: Keyboard, color: 'text-blue-400', bg: 'bg-blue-600/20', border: 'border-blue-500/20',
                title: 'Take Typing Test',
                desc: 'Type a paragraph while we silently capture keystroke timing — dwell time, flight time, rhythm, and speed.',
                link: '/typing', linkLabel: 'Open Typing Test',
              },
              {
                step: '03', icon: BarChart3, color: 'text-yellow-400', bg: 'bg-yellow-600/20', border: 'border-yellow-500/20',
                title: 'Get AI Results',
                desc: 'Our SVM + Random Forest model combines both biomarkers and gives a risk score with full report.',
                link: '/dashboard', linkLabel: 'View Dashboard',
              },
            ].map(({ step, icon: Icon, color, bg, border, title, desc, link, linkLabel }) => (
              <div key={step} className={`glass-card p-7 border ${border} flex flex-col`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 ${bg} border ${border} rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  <span className={`font-mono text-3xl font-bold ${color} opacity-30`}>{step}</span>
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed flex-1">{desc}</p>
                <Link to={link} className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${color} hover:opacity-80 transition-opacity`}>
                  {linkLabel} <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          {/* Flow strip */}
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
              {[
                { label: 'Record Voice', icon: Mic },
                { label: 'Type Paragraph', icon: Keyboard },
                { label: 'AI Prediction', icon: Brain },
                { label: 'Download Report', icon: BarChart3 },
              ].map(({ label, icon: Icon }, i, arr) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center">
                      <Icon size={16} className="text-primary-400" />
                    </div>
                    <span className="text-white/50 text-xs">{label}</span>
                  </div>
                  {i < arr.length - 1 && <ChevronRight size={16} className="text-white/20 hidden sm:block mx-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Early Detection ───────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Why Early Detection Matters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock,    color: 'text-red-400',     bg: 'bg-red-400/10',     title: 'Often Diagnosed Too Late',   desc: 'Most patients are diagnosed only after major symptoms appear — tremors, stiffness, movement difficulties — by which time the disease is already advanced.' },
              { icon: Shield,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  title: 'Early Signs Are Subtle',      desc: 'Minor changes in voice quality, typing speed, and keystroke rhythm appear years before clinical symptoms — making them ideal AI biomarkers.' },
              { icon: Activity, color: 'text-primary-400', bg: 'bg-primary-400/10', title: 'Intervention Helps',          desc: 'Early diagnosis enables neurologists to begin treatment sooner, dramatically improving quality of life and slowing disease progression.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="glass-card p-6">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-white/60 text-sm">Research-backed</span>
          </div>
          <h2 className="section-title mb-4">Built on Peer-Reviewed Research</h2>
          <p className="text-white/50 leading-relaxed mb-10">
            Developed as a Final Year B.Tech (CSE) project at{' '}
            <strong className="text-white/70">G H Raisoni College of Engineering & Management, Nagpur</strong>{' '}
            under <strong className="text-white/70">Dr. Minakshee Chandankhede</strong>.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { pub: 'IEEE Access, 2022',              finding: 'Voice features like jitter/shimmer detect PD with high ML accuracy.' },
              { pub: 'Computers in Biology, 2022',     finding: 'Combined speech + typing models outperform single-modality systems.' },
              { pub: 'NPJ Digital Medicine, 2023',     finding: 'Multimodal digital biomarkers significantly improve early detection.' },
            ].map(({ pub, finding }) => (
              <div key={pub} className="glass-card p-4">
                <div className="text-primary-400 text-xs font-mono mb-2">{pub}</div>
                <p className="text-white/60 text-sm leading-relaxed">{finding}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="section-title mb-4">Ready? It takes under 5 minutes.</h2>
          <p className="text-white/50 mb-8">No account. No installation. Just open and test.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voice"  className="btn-primary  inline-flex items-center gap-2 px-8 py-4"><Mic size={18} />  Voice Test</Link>
            <Link to="/typing" className="btn-outline inline-flex items-center gap-2 px-8 py-4"><Keyboard size={18} /> Typing Test</Link>
          </div>
          <p className="text-white/25 text-xs mt-6">
            ⚠️ Screening tool only — not a medical diagnosis. Consult a neurologist for professional evaluation.
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Brain size={14} className="text-primary-400" />
            NeuraScan — GHRCEM Nagpur | B.Tech CSE 2025-26
          </div>
          <div className="text-white/30 text-xs text-center">
            Team: Meghana Kokas · Prutha Acharya · Prathmesh Rajurkar · Navneet Lonare · Rugved Salpekar
          </div>
        </div>
      </footer>

    </div>
  )
}
