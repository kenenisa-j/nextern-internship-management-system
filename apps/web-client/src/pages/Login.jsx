// Login.jsx — Nextern Design System
import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, GraduationCap,
  Moon, Sun, Sparkles, ShieldCheck, Building2, Users, UserCheck,
  CheckCircle2, KeyRound, ExternalLink, HelpCircle
} from 'lucide-react'
import { Alert, Modal, Button, Badge } from '../components/ui'

const DEMO_PRESETS = [
  {
    role: 'SUPERADMIN',
    name: 'Alex Mercer',
    email: 'superadmin.demo@nextern.app',
    title: 'Platform Director & System Administrator',
    badge: 'Platform Owner',
    color: '#8b5cf6',
    icon: ShieldCheck,
    description: 'Full governance across all organizations, approvals, and platform metrics.',
    accessList: [
      'Multi-tenant workspace approval & suspension controls',
      'System-wide platform analytics & monthly growth charts',
      'Global tenant registry and organization status monitoring'
    ],
    route: '/superadmin/dashboard'
  },
  {
    role: 'ORG_ADMIN',
    name: 'Sarah Jenkins',
    email: 'admin.demo@nextern.app',
    title: 'Director of Engineering & Workspace Admin',
    badge: 'Company Admin',
    color: '#2563eb',
    icon: Building2,
    description: 'Oversees programs, candidate pipelines, mentor provisioning, and company profile.',
    accessList: [
      'Create and manage company internship programs & requirements',
      'Review applicants (Applied -> Shortlisted -> Interview -> Accepted)',
      'Provision mentors and assign them to specific domain tracks',
      'Manage organization public profile & verified workspace branding'
    ],
    route: '/admin/dashboard'
  },
  {
    role: 'MENTOR',
    name: 'David Chen',
    email: 'mentor.demo@nextern.app',
    title: 'Senior Staff Engineer & Track Mentor',
    badge: 'Technical Lead',
    color: '#0d9488',
    icon: Users,
    description: 'Assigns engineering tasks, reviews code, and conducts skill evaluations.',
    accessList: [
      'Create and assign domain tasks with point values & deadlines',
      'Review intern submissions and assign grades, scores, and feedback',
      'Submit weekly and final multi-skill evaluations (technical, teamwork)',
      'Direct workspace chat communication with assigned interns'
    ],
    route: '/mentor/dashboard'
  },
  {
    role: 'INTERN',
    name: 'Marcus Vance',
    email: 'intern.demo@nextern.app',
    title: 'Full-Stack Engineering Intern',
    badge: 'Active Intern',
    color: '#f59e0b',
    icon: GraduationCap,
    description: 'Actively enrolled in a fellowship: submits code, tracks attendance, and views certificates.',
    accessList: [
      'View assigned fellowship track info & upcoming task deadlines',
      'Submit task deliverables (GitHub repository links, text, files)',
      'Review mentor evaluation scores and progress breakdowns',
      'Access verified digital Certificate of Completion with QR portal'
    ],
    route: '/intern/dashboard'
  },
  {
    role: 'STUDENT',
    name: 'Elena Rostova',
    email: 'student.demo@nextern.app',
    title: 'Prospective Student Candidate',
    badge: 'Applicant',
    color: '#10b981',
    icon: UserCheck,
    description: 'Independent candidate discovering public internships and submitting applications.',
    accessList: [
      'Explore and filter public internship listings across companies',
      'Bookmark favorite programs and submit applications with resume/links',
      'Track real-time candidate review stages across applied programs',
      'Manage global student profile, university info, and resume URL'
    ],
    route: '/student/dashboard'
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

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [demoLoadingRole, setDemoLoadingRole] = useState(null)
  const [demoError, setDemoError] = useState('')
  const [demoAccounts, setDemoAccounts] = useState(DEMO_PRESETS)

  // Fetch live demo accounts info from backend on mount if available
  useEffect(() => {
    axios.get('/auth/demo-accounts')
      .then(res => {
        if (res.data?.accounts && res.data.accounts.length > 0) {
          // Merge metadata with icons and colors
          const merged = res.data.accounts.map(acc => {
            const preset = DEMO_PRESETS.find(p => p.role === acc.role) || {}
            return { ...preset, ...acc }
          })
          setDemoAccounts(merged)
        }
      })
      .catch(() => {
        // Fallback to static preset metadata
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setIsPending(false); setIsRejected(false)
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

  // Reviewer 1-click Demo Login (does not expose passwords in frontend code)
  const handleDemoLaunch = async (roleKey) => {
    setDemoError('')
    setDemoLoadingRole(roleKey)
    try {
      const { data } = await axios.post('/auth/demo-login', { role: roleKey })
      setAuthData(data.token, data.user)
      setIsDemoModalOpen(false)

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

  // Quick fill manual credentials for reviewers who prefer testing the form
  const handleFillCredentials = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('DemoReviewer2025!')
    setIsDemoModalOpen(false)
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
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 420 }}
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
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            The enterprise internship management platform for organizations, mentors, and student talent.
          </p>

          {/* Reviewer Callout Banner */}
          <div style={{
            marginTop: 32, padding: '16px 20px', borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={16} color="#fbbf24" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Project Reviewer Demo Access</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Explore the entire multi-tenant platform with realistic pre-populated data across all 5 roles.
            </p>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 10,
                background: 'white', color: '#1e3a8a', fontWeight: 700, fontSize: 13,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <span>Explore Demo Roles</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 28 }}>
            {['Multi-tenant SaaS', 'Role-Based Access', 'Digital Certificates', 'Mentor Evaluations'].map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.15)'
              }}>{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — form */}
      <div style={{
        width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 36px', background: 'var(--bg-card)',
        position: 'relative', overflowY: 'auto'
      }}>
        {/* Top row */}
        <div style={{ position: 'absolute', top: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}
            className="nx-btn nx-btn-ghost nx-btn-sm">
            <ArrowLeft size={13} /> Back to home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="nx-btn nx-btn-sm"
              style={{
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-border)',
                fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Sparkles size={13} />
              <span>Explore Demo</span>
            </button>
            <button onClick={toggleTheme} className="nx-btn nx-btn-ghost nx-btn-icon nx-btn-sm" title="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 390, margin: '24px auto 0' }}
        >
          {/* Mobile logo */}
          <div className="show-on-mobile" style={{ marginBottom: 24, textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <GraduationCap size={24} color="white" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Nextern</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
              Sign in to your Nextern workspace
            </p>
          </div>

          {/* Quick Reviewer Banner on Mobile/Desktop */}
          <div style={{
            marginBottom: 20, padding: '12px 14px', borderRadius: 10,
            background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong>External Reviewer?</strong> Explore with 1-click accounts.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              style={{
                background: 'var(--color-primary)', color: 'white', border: 'none',
                borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              Demo Hub
            </button>
          </div>

          {/* Alerts */}
          {isPending && (
            <div style={{ marginBottom: 20 }}>
              <Alert variant="warning" title="Workspace pending approval">
                Your organization is awaiting review by a Nextern administrator. You'll receive an email once approved.
              </Alert>
            </div>
          )}
          {isRejected && (
            <div style={{ marginBottom: 20 }}>
              <Alert variant="danger" title="Registration rejected">
                This workspace registration was denied. Please contact support for more information.
              </Alert>
            </div>
          )}
          {error && (
            <div style={{ marginBottom: 20 }}>
              <Alert variant="danger">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <Link to="/forgot-password" style={{
                fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500
              }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="nx-btn nx-btn-primary nx-btn-lg"
              style={{ width: '100%', marginTop: 4 }}
            >
              {isSubmitting ? (
                <span className="nx-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              ) : (
                <><span>Sign in</span><ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Need an organization account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Register workspace
              </Link>
            </span>
          </div>

          <div style={{
            marginTop: 24, padding: '12px 14px', background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)'
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Reviewers:</strong>{' '}
              Click <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => setIsDemoModalOpen(true)}>Explore Demo</strong> at the top to test any of the 5 roles with preloaded data.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── REVIEWER DEMO ACCOUNTS MODAL ── */}
      <Modal
        open={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        size="lg"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={18} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Explore Demo Accounts
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Select a role to test its live dashboard and permissions without registering.
              </div>
            </div>
          </div>
        }
      >
        <div style={{ padding: '4px 0' }}>
          {demoError && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="danger">{demoError}</Alert>
            </div>
          )}

          <div style={{
            padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 10,
            border: '1px solid var(--border-default)', marginBottom: 20, fontSize: 13,
            color: 'var(--text-secondary)', lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              <CheckCircle2 size={15} color="var(--color-success)" />
              <span>Full Role-Based Evaluation</span>
            </div>
            Each demo account is pre-populated with realistic programs, tasks, submissions, evaluations, and digital certificates.
            Click <strong>Launch Session</strong> to sign in securely with genuine JWT authorization.
          </div>

          {/* Cards for each of the 5 implemented roles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {demoAccounts.map(demo => {
              const RoleIcon = demo.icon || GraduationCap
              const isLoading = demoLoadingRole === demo.role

              return (
                <div
                  key={demo.role}
                  style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    background: 'var(--bg-card)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${demo.color || '#2563eb'}18`,
                        color: demo.color || '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <RoleIcon size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {demo.name}
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                            background: `${demo.color || '#2563eb'}20`, color: demo.color || '#2563eb'
                          }}>
                            {demo.badge || demo.role}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {demo.title} · <code style={{ fontSize: 11, background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 4 }}>{demo.email}</code>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials(demo.email)}
                        style={{
                          background: 'none', border: '1px solid var(--border-default)',
                          borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                        title="Fill into manual login form"
                      >
                        Fill Form
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDemoLaunch(demo.role)}
                        style={{
                          background: demo.color || 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {isLoading ? (
                          <span className="nx-spin" style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                        ) : (
                          <>
                            <span>Launch Session</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {demo.description}
                  </p>

                  {demo.accessList && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 6, paddingTop: 4
                    }}>
                      {demo.accessList.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: demo.color || '#2563eb' }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{
            marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Password for all demo accounts: <code style={{ fontWeight: 600, color: 'var(--text-primary)' }}>DemoReviewer2025!</code>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="nx-btn nx-btn-secondary nx-btn-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
        .show-on-mobile { display: none; }
      `}</style>
    </div>
  )
}

export default Login
