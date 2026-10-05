import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Sparkles, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const FEATURES = [
  { icon: Target, title: 'Smart Goals', text: 'Personalized diet and workout plans built from your answers', color: 'from-violet-500 to-purple-700' },
  { icon: Award, title: 'Earn Rewards', text: 'Unlock badges, level up, and redeem rewards you choose', color: 'from-pink-500 to-rose-700' },
  { icon: TrendingUp, title: 'Track Progress', text: 'See your growth with charts for tasks, streaks and mood', color: 'from-orange-500 to-orange-700' },
]

export default function Landing() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const start = async () => {
    if (user) return navigate('/home')
    setBusy(true)
    try {
      const { isNew } = await signInWithGoogle()
      toast.success(isNew ? 'Welcome to LevelUp!' : 'Welcome back!')
      navigate(isNew ? '/plans' : '/home')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error('Sign-in didn’t work. Check that pop-ups are allowed and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-6xl justify-start">
        <Logo />
      </div>

      <section className="mx-auto mt-14 max-w-4xl text-center sm:mt-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display font-semibold text-purple-800 shadow-lg shadow-violet-100">
          <Sparkles className="h-5 w-5 text-plum" /> Level Up Your Life
        </span>
        <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-plum via-berry to-ember bg-clip-text text-transparent">Transform Habits</span>
          <br />
          Into Superpowers
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
          Turn your daily routines into an epic adventure. Track habits, earn XP, unlock badges, and level up your
          wellness journey with personalized plans.
        </p>
        <button
          onClick={start}
          disabled={busy}
          className="mt-10 rounded-full bg-gradient-to-r from-plum to-berry px-10 py-4 font-display text-xl font-bold text-white shadow-xl shadow-pink-300/60 transition hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? 'Opening Google…' : user ? 'Continue Your Journey' : 'Start Your Journey'}
        </button>
        {!user && <p className="mt-3 text-sm text-slate-500">Sign in with Google. It’s free.</p>}
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text, color }) => (
          <div key={title} className="card text-center">
            <span className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
              <Icon className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-slate-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
