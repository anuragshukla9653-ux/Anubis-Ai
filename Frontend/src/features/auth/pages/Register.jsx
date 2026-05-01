import React, { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hook/useAuth.js'

const Register = () => {
  const { handleRegister, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [successMessage, setSuccessMessage] = useState('')

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
      const data = await handleRegister(formData)
      setSuccessMessage(data?.message || 'Account created successfully. Check your email to verify your account.')
    } catch {
      setSuccessMessage('')
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#09090b] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(173,75,38,0.26),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(173,75,38,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]" />
      <div className="absolute left-12 top-16 h-44 w-44 rounded-full bg-[#AD4B26]/20 blur-3xl" />
      <div className="absolute bottom-10 right-8 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f341c] to-[#AD4B26] p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,transparent_65%,rgba(255,255,255,0.06))]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                  Join Now
                </span>

                <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                  Join Anubis AI and start building with confidence.
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                  Create your profile to unlock Anubis AI tools, insights, and a secure dark workspace designed for focus.
                </p>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Quick</p>
                  <p className="mt-2 text-lg font-semibold">Setup</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Clean</p>
                  <p className="mt-2 text-lg font-semibold">Flow</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Dark</p>
                  <p className="mt-2 text-lg font-semibold">Theme</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-950/95 p-8 sm:p-10 lg:p-12">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#e38b66]">Get started</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Register</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Fill in your details to create your new account.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmitForm}>
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-300">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Your username"
                  autoComplete="username"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-[#AD4B26] focus:ring-2 focus:ring-[#AD4B26]/30"
                />
              </div>

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
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  minLength={6}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#f0a178] transition hover:text-[#ffbf9c]">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Register
