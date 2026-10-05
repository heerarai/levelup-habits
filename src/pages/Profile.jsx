import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Coins, Lock, LogOut, Trash2, Trophy, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { BADGES, REWARDS, TIERS, tierIndex } from '../lib/game'

function ProfileTab() {
  const { userDoc, saveProfile, deleteAllData } = useData()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const p = userDoc.profile || {}
  const [age, setAge] = useState(p.age || '')
  const [grade, setGrade] = useState(p.grade || '')
  const [interests, setInterests] = useState((p.interests || []).join(', '))

  const save = async (e) => {
    e.preventDefault()
    await saveProfile({ age, grade, interests: interests.split(',').map((s) => s.trim()).filter(Boolean) })
    toast.success('Changes saved')
  }

  const wipe = async () => {
    if (!window.confirm('Delete all your LevelUp data? Your XP, tasks, habits, moods and plan will be gone for good.')) return
    await deleteAllData()
    await logout()
    toast.success('Your data was deleted')
    navigate('/')
  }

  return (
    <div className="card">
      <h2 className="text-3xl font-bold">Profile Settings</h2>
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-5">
        <div>
          <label className="label" htmlFor="p-age">Age</label>
          <input id="p-age" type="number" className="input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" />
        </div>
        <div>
          <label className="label" htmlFor="p-grade">Grade/Level</label>
          <input id="p-grade" className="input" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g., 10th Grade, College, Professional" />
        </div>
        <div>
          <label className="label" htmlFor="p-int">Interests</label>
          <input id="p-int" className="input" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g., Reading, Yoga, Gaming (comma-separated)" />
        </div>
        <button className="btn-primary" type="submit">Save Changes</button>
      </form>

      <div className="mt-10 border-t border-slate-100 pt-8">
        <h2 className="text-2xl font-bold">Data & Privacy</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Your data is stored in your own Firebase account and only you can read it. Your plan is built right in your
          browser, so your answers are never sent to any outside service.
        </p>
        <button className="btn mt-4 border border-rose-200 bg-white text-rose-600 hover:bg-rose-50" onClick={wipe}>
          <Trash2 className="h-4 w-4" /> Delete All My Data
        </button>
      </div>
    </div>
  )
}

function BadgesTab() {
  const { userDoc } = useData()
  const have = new Set(userDoc.badges || [])
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BADGES.map((b) => {
        const earned = have.has(b.id)
        return (
          <div key={b.id} className={`card flex items-center gap-4 ${earned ? '' : 'opacity-55 grayscale'}`}>
            <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl ${earned ? 'bg-gradient-to-br from-amber-100 to-orange-200' : 'bg-slate-100'}`}>
              {earned ? b.emoji : <Lock className="h-6 w-6 text-slate-400" />}
            </span>
            <div>
              <h3 className="text-lg font-bold">{b.name}</h3>
              <p className="text-sm text-slate-600">{b.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RewardsTab() {
  const { coins, tier, redeemReward, userDoc } = useData()
  const myTier = tierIndex(tier.id)
  const history = [...(userDoc.redeemed || [])].sort((a, b) => b.at - a.at).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white shadow-lg shadow-orange-200">
        <div>
          <p className="font-bold opacity-90">Your coins</p>
          <p className="font-display text-5xl font-bold">🪙 {coins}</p>
        </div>
        <p className="max-w-sm text-white/95">You earn 1 coin for every XP. Spending coins never lowers your level. Pick rewards that feel worth it to you.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((r) => {
          const rTier = TIERS.find((t) => t.id === r.tier)
          const locked = tierIndex(r.tier) > myTier
          const short = coins < r.cost
          return (
            <div key={r.id} className={`card flex flex-col ${locked ? 'opacity-60' : ''}`}>
              <span className="text-4xl">{locked ? '🔒' : r.emoji}</span>
              <h3 className="mt-3 text-lg font-bold">{r.name}</h3>
              <p className="mt-1 flex items-center gap-1 font-bold text-amber-600"><Coins className="h-4 w-4" /> {r.cost} coins</p>
              <div className="mt-auto pt-4">
                {locked ? (
                  <p className="text-sm font-bold text-slate-500">Unlocks at level {rTier.min}</p>
                ) : (
                  <button className="btn-primary w-full" disabled={short} onClick={() => redeemReward(r)}>
                    {short ? `${r.cost - coins} more coins` : 'Redeem'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {history.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold">Recently redeemed</h3>
          <ul className="mt-3 space-y-2">
            {history.map((h) => {
              const r = REWARDS.find((x) => x.id === h.id)
              return (
                <li key={h.at} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>{r?.emoji} {r?.name}</span>
                  <span className="text-sm text-slate-500">{new Date(h.at).toLocaleDateString()}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { userDoc, lvl, xp } = useData()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="card flex flex-wrap items-center gap-6 sm:p-10">
        {userDoc.photoURL ? (
          <img src={userDoc.photoURL} alt="" referrerPolicy="no-referrer" className="h-28 w-28 rounded-full object-cover shadow-md" />
        ) : (
          <span className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-plum to-berry font-display text-4xl font-bold text-white">
            {(userDoc.name || '?')[0]}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-bold">{userDoc.name}</h1>
          <p className="mt-1 truncate text-slate-600">{userDoc.email}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-display text-2xl font-bold">
            <span className="flex items-center gap-2 text-grape"><Trophy className="h-6 w-6" /> Level {lvl.level}</span>
            <span className="flex items-center gap-2 text-ember"><Zap className="h-6 w-6" /> {xp} XP</span>
            <span className="flex items-center gap-2 text-amber-600"><Award className="h-6 w-6" /> {(userDoc.badges || []).length} Badges</span>
          </div>
        </div>
        <button className="btn border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 self-start" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm" role="tablist">
        {[['profile', 'Profile'], ['badges', 'Badges'], ['rewards', 'Rewards']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`rounded-xl px-5 py-2 font-bold ${tab === id ? 'bg-violet-50 text-ink shadow-sm' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'badges' && <BadgesTab />}
      {tab === 'rewards' && <RewardsTab />}
    </div>
  )
}
