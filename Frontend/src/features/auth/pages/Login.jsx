import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth.js'

const Login = () => {
  const navigate = useNavigate()
  const { handleLogin, loading, error, user } = useAuth()


  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleSubmitForm = async (event) => {
    event.preventDefault()
    setSuccessMessage('')

    try {
      const data = await handleLogin(formData)
      setSuccessMessage(data?.message || 'Logged in successfully.')
      navigate('/', { replace: true })
    } catch {
      setSuccessMessage('')
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#09090b] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(173,75,38,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(173,75,38,0.2),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]" />
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-[#AD4B26]/20 blur-3xl" />
      <div className="absolute bottom-10 right-12 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#AD4B26] via-[#7f341c] to-[#0f0f10] p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,transparent_65%,rgba(255,255,255,0.06))]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                  Anubis AI
                </span>

                <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                  Welcome back to Anubis AI.
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                  Sign in to access your secure workspace, smart tools, and the dark premium experience behind Anubis AI.
                </p>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Secure</p>
                  <p className="mt-2 text-lg font-semibold">Protected</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Fast</p>
                  <p className="mt-2 text-lg font-semibold">Simple</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Style</p>
                  <p className="mt-2 text-lg font-semibold">Premium</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-950/95 p-8 sm:p-10 lg:p-12">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#e38b66]">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Login</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Enter your credentials to continue into your dashboard.
              </p>
              {user && (
                <p className="mt-3 text-sm text-emerald-300">
                  Signed in as {user.username || user.email}
                </p>
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmitForm}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-[#AD4B26] focus:ring-2 focus:ring-[#AD4B26]/30"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <button type="button" className="text-sm font-medium text-[#e38b66] transition hover:text-[#f0a178]">
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-[#AD4B26] focus:ring-2 focus:ring-[#AD4B26]/30"
                />
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}
              {successMessage && <p className="text-sm text-emerald-300">{successMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#AD4B26] to-[#d97706] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#AD4B26]/25 transition duration-200 hover:brightness-110 active:scale-[0.99]"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                New here?{' '}
                <Link to="/register" className="font-semibold text-[#f0a178] transition hover:text-[#ffbf9c]">
                  Create your account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Login
