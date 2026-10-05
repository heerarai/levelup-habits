import { CalendarDays, CheckCircle2, Lock, Play, Trophy, Zap } from 'lucide-react'
import { useData } from '../context/DataContext'
import { CHALLENGES, TIERS, challengeProgress, tierIndex, tierLabel, tierProgress } from '../lib/game'
import ProgressBar from '../components/ProgressBar'

function ChallengeCard({ ch, locked }) {
  const { userDoc, tasks, habits, streak, startChallenge, quitChallenge } = useData()
  const state = userDoc.challenges?.[ch.id] || { status: 'none' }
  const active = state.status === 'active'
  const completed = state.status === 'completed'
  const progress = active ? challengeProgress(ch, state.startedAt, { tasks, habits, streak }) : completed ? ch.target : 0
  const tier = TIERS.find((t) => t.id === ch.tier)

  return (
    <div className={`card flex flex-col ${locked ? 'opacity-60' : ''} ${completed ? 'ring-2 ring-emerald-300' : ''}`}>
      <div className="flex items-start justify-between">
        <span className="text-5xl" aria-hidden>{locked ? '🔒' : ch.emoji}</span>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-lg border px-2.5 py-0.5 text-sm font-bold ${tier.badge}`}>{tier.name.toLowerCase()}</span>
          {active && <span className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-sm font-bold text-blue-700"><Play className="h-3.5 w-3.5" /> Active</span>}
          {completed && <span className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Done</span>}
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold">{ch.title}</h3>
      <p className="mt-1 text-lg text-slate-600">{ch.description}</p>

      {(active || completed) && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm font-bold">
            <span>Progress</span>
            <span className="text-grape">{progress}/{ch.target}</span>
          </div>
          <ProgressBar pct={(progress / ch.target) * 100} fill={completed ? 'bg-emerald-500' : 'bg-grape'} />
        </div>
      )}

      <ul className="mt-5 space-y-2 text-slate-600">
        <li className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> {ch.days} {ch.days === 1 ? 'day' : 'days'}</li>
        <li className="flex items-center gap-2"><Trophy className="h-5 w-5" /> {tierLabel(tier)}</li>
        <li className="flex items-center gap-2 font-bold text-grape"><Zap className="h-5 w-5" /> {ch.xp} XP Reward</li>
      </ul>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-bold uppercase tracking-wide text-slate-500">{ch.category}</span>
          {locked ? (
            <span className="flex items-center gap-1 text-sm font-bold text-slate-500"><Lock className="h-4 w-4" /> Reach level {tier.min}</span>
          ) : active ? (
            <button className="text-sm font-bold text-slate-500 hover:text-rose-600" onClick={() => quitChallenge(ch)}>Quit</button>
          ) : completed ? null : (
            <button className="btn-primary py-2" onClick={() => startChallenge(ch)}><Play className="h-4 w-4" /> Start</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Challenges() {
  const { lvl, tier } = useData()
  const myTier = tierIndex(tier.id)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl font-bold">Challenges</h1>
        <p className="mt-2 text-lg text-slate-600">Level-based challenges to test your skills</p>
      </div>

      <div className="grid gap-6 rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 p-7 text-white shadow-xl shadow-pink-200/60 md:grid-cols-3">
        <div>
          <p className="font-bold opacity-90">Your Level</p>
          <p className="mt-1 font-display text-4xl font-bold">{lvl.level} · {tier.name}</p>
        </div>
        <div>
          <p className="font-bold opacity-90">Tier Progress</p>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar pct={tierProgress(lvl.level)} track="bg-white/30" fill="bg-white" height="h-4" />
            <span className="font-display text-lg font-bold">{tierProgress(lvl.level)}%</span>
          </div>
        </div>
        <div>
          <p className="font-bold opacity-90">Current Unlocks</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tier.unlocks.map((u) => <span key={u} className="rounded-full bg-white/25 px-3 py-1 text-sm font-semibold">{u}</span>)}
          </div>
        </div>
      </div>

      {TIERS.map((t, i) => (
        <section key={t.id}>
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-3xl font-bold">{t.name} Challenges</h2>
            <span className={`rounded-lg border px-2.5 py-0.5 text-sm font-bold ${t.badge}`}>{tierLabel(t)}</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CHALLENGES.filter((c) => c.tier === t.id).map((c) => (
              <ChallengeCard key={c.id} ch={c} locked={i > myTier} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
