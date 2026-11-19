// Login.jsx — Nextern Design System
import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, GraduationCap,
  Moon, Sun, ShieldCheck, Building2, Users, UserCheck, Sparkles
} from 'lucide-react'
import { Alert } from '../components/ui'

const DEMO_ROLES = [
  {
    role: 'ORG_ADMIN',
    name: 'Sarah Jenkins',
    badge: 'Company Admin',
    desc: 'Manage programs, review applicants & provision mentors',
    color: '#2563eb',
    icon: Building2,
    route: '/admin/dashboard'
  },
  {
    role: 'MENTOR',
    name: 'David Chen',
    badge: 'Staff Mentor',
    desc: 'Assign tasks, grade submissions & evaluate skills',
    color: '#0d9488',
    icon: Users,
    route: '/mentor/dashboard'
  },
  {
    role: 'INTERN',
    name: 'Marcus Vance',
    badge: 'Active Intern',
    desc: 'Submit deliverables, view ratings & check certificate',
    color: '#f59e0b',
    icon: GraduationCap,
    route: '/intern/dashboard'
  },
  {
    role: 'STUDENT',
    name: 'Elena Rostova',
    badge: 'Candidate',
    desc: 'Browse programs, bookmark & submit applications',
    color: '#10b981',
    icon: UserCheck,
    route: '/student/dashboard'
  },
  {
    role: 'SUPERADMIN',
    name: 'Alex Mercer',
    badge: 'Platform Owner',
    desc: 'Full workspace approvals & platform growth metrics',
    color: '#8b5cf6',
    icon: ShieldCheck,
    route: '/superadmin/dashboard'
  }
]

const Login = () => {
  const navigate = useNavigate()
  const { setAuthData } = useContext(AuthContext)
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  // Demo 1-click loading state
  const [demoLoadingRole, setDemoLoadingRole] = useState(null)
  const [demoError, setDemoError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setIsPending(false); setIsRejected(false); setDemoError('')
    setIsSubmitting(true)
    try {
      const { data } = await axios.post('/auth/login', { email, password })
      setAuthData(data.token, data.user)
      const role = (data.user.role || '').toUpperCase()
      const routes = {
        SUPERADMIN: '/superadmin/dashboard',
        ORG_ADMIN:  '/admin/dashboard',
        MENTOR:     '/mentor/dashboard',
        INTERN:     '/intern/dashboard',
        STUDENT:    '/student/dashboard',
      }
      navigate(routes[role] || '/login')
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.message || ''
      if (status === 403) {
        if (msg.includes('pending') || msg.includes('approval')) setIsPending(true)
        else if (msg.includes('rejected')) setIsRejected(true)
        else setError(msg || 'Access denied.')
      } else {
        setError(msg || 'Invalid email or password.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1-Click Demo Login right on the page (no popups)
  const handleDemoLaunch = async (roleKey) => {
    setError('')
    setDemoError('')
    setDemoLoadingRole(roleKey)
    try {
      const { data } = await axios.post('/auth/demo-login', { role: roleKey })
      setAuthData(data.token, data.user)

      const role = (data.user.role || '').toUpperCase()
      const routes = {
        SUPERADMIN: '/superadmin/dashboard',
        ORG_ADMIN:  '/admin/dashboard',
        MENTOR:     '/mentor/dashboard',
        INTERN:     '/intern/dashboard',
        STUDENT:    '/student/dashboard',
      }
      navigate(data.defaultRoute || routes[role] || '/login')
    } catch (err) {
      console.error('Demo launch error:', err)
      setDemoError(err.response?.data?.message || 'Failed to authenticate demo account. Please try again.')
    } finally {
      setDemoLoadingRole(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Left Panel — branding */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 50%, #4F46E5 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 48, position: 'relative', overflow: 'hidden'
      }} className="hide-on-mobile">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '10%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 400 }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <GraduationCap size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>
            Nextern
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            The modern internship management platform for organizations and talent.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 32 }}>
            {['Multi-tenant SaaS', 'Role-Based Access', 'Verified Certificates', 'Evaluations'].map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.15)'
              }}>{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — form + in-page demo logins */}
      <div className="login-right-panel" style={{
        width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '40px 32px', background: 'var(--bg-card)',
        position: 'relative', overflowY: 'auto'
      }}>
        {/* Top row */}
        <div style={{ position: 'absolute', top: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}
            className="nx-btn nx-btn-ghost nx-btn-sm">
            <ArrowLeft size={13} /> Back to home
          </Link>
          <button onClick={toggleTheme} className="nx-btn nx-btn-ghost nx-btn-icon nx-btn-sm" title="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 420, margin: '24px auto 0' }}
        >
          {/* Mobile logo */}
          <div className="show-on-mobile" style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <GraduationCap size={24} color="white" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Nextern</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Sign in to your Nextern workspace
            </p>
          </div>

          {/* Alerts */}
          {isPending && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="warning" title="Workspace pending approval">
                Your organization is awaiting review by a Nextern administrator. You'll receive an email once approved.
              </Alert>
            </div>
          )}
          {isRejected && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="danger" title="Registration rejected">
                This workspace registration was denied. Please contact support for more information.
              </Alert>
            </div>
          )}
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="danger">{error}</Alert>
            </div>
          )}
          {demoError && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="danger">{demoError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div className="nx-form-group">
              <label className="nx-label nx-label-required">Email address</label>
              <div className="nx-input-icon-wrapper">
                <span className="nx-input-icon"><Mail size={14} /></span>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="nx-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="nx-form-group">
              <label className="nx-label nx-label-required">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
                  <Lock size={14} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="nx-input"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  autoComplete="current-password"
                />
                <button
                  type="button" onClick={() => setShowPw(s => !s)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', padding: 2
                  }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <Link to="/forgot-password" style={{
                fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500
              }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={isSubmitting || !!demoLoadingRole}
              className="nx-btn nx-btn-primary nx-btn-lg"
              style={{ width: '100%', marginTop: 2 }}
            >
              {isSubmitting ? (
                <span className="nx-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              ) : (
                <><span>Sign in</span><ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* ── IN-PAGE 1-CLICK DEMO LOGIN (BELOW LOGIN FORM) ── */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                <Sparkles size={12} color="var(--color-primary)" />
                <span>Or 1-Click Demo Login</span>
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ROLES.map((demo) => {
                const RoleIcon = demo.icon
                const isLoading = demoLoadingRole === demo.role

                return (
                  <button
                    key={demo.role}
                    type="button"
                    disabled={isSubmitting || !!demoLoadingRole}
                    onClick={() => handleDemoLaunch(demo.role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      width: '100%',
                      boxSizing: 'border-box',
                      opacity: demoLoadingRole && !isLoading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!demoLoadingRole) {
                        e.currentTarget.style.borderColor = demo.color
                        e.currentTarget.style.background = 'var(--bg-card)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!demoLoadingRole) {
                        e.currentTarget.style.borderColor = 'var(--border-default)'
                        e.currentTarget.style.background = 'var(--bg-subtle)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${demo.color}18`, color: demo.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <RoleIcon size={16} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {demo.name}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                            background: `${demo.color}20`, color: demo.color, flexShrink: 0
                          }}>
                            {demo.badge}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 11, color: 'var(--text-muted)', marginTop: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {demo.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, paddingLeft: 8 }}>
                      {isLoading ? (
                        <span className="nx-spin" style={{
                          width: 14, height: 14,
                          border: `2px solid ${demo.color}`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          display: 'inline-block'
                        }} />
                      ) : (
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: demo.color,
                          display: 'flex', alignItems: 'center', gap: 2
                        }}>
                          <span>Login</span>
                          <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Need an organization account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Register workspace
              </Link>
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
        @media (max-width: 480px) {
          .login-right-panel {
            padding: 32px 16px !important;
          }
        }
        .show-on-mobile { display: none; }
      `}</style>
    </div>
  )
}

export default Login
