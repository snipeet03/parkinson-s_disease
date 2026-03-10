import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, User, Calendar, UserCircle, Eye, EyeOff, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: ''
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { ...form, age: form.age ? parseInt(form.age) : null }

      const res = mode === 'login'
        ? await authAPI.login(payload)
        : await authAPI.register(payload)

      login(res.data.access_token, res.data.user)
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg mesh-bg flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain size={26} className="text-primary-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {mode === 'login' ? 'Sign in to access your health dashboard' : 'Start your Parkinson\'s screening today'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                  ${mode === m ? 'bg-primary-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-white/30" />
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-white/30" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-white/30" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-3.5 text-white/30" />
                  <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                    min={1} max={120}
                    className="input-field pl-10"
                  />
                </div>
                <div className="relative">
                  <UserCircle size={16} className="absolute left-3.5 top-3.5 text-white/30" />
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none"
                  >
                    <option value="" className="bg-gray-900">Gender</option>
                    <option value="male" className="bg-gray-900">Male</option>
                    <option value="female" className="bg-gray-900">Female</option>
                    <option value="other" className="bg-gray-900">Other</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-center text-white/40 text-sm">
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="text-primary-400 hover:text-primary-300 font-medium">
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          By continuing, you acknowledge this is a screening tool, not a medical diagnosis.
        </p>
      </div>
    </div>
  )
}
