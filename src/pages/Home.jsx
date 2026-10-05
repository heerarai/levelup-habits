import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Flame, Plus, Sparkles, Trash2, Trophy, Zap } from 'lucide-react'
import { useData } from '../context/DataContext'
import { BADGES, CATEGORIES, DIFFICULTY, dailyBoost } from '../lib/game'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'

function StatCard({ title, value, sub, icon: Icon, gradient, children }) {
  return (
    <div className={`${gradient} rounded-3xl p-6 text-white shadow-xl shadow-violet-200/40`}>
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold opacity-95">{title}</h2>
        <Icon className="h-7 w-7 opacity-90" />
      </div>
      <p className="mt-3 font-display text-6xl font-bold leading-none">{value}</p>
      {children}
      <p className="mt-3 text-white/90">{sub}</p>
    </div>
  )
}

function AddTaskModal({ open, onClose }) {
  const { addTask } = useData()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('health')
  const [difficulty, setDifficulty] = useState('easy')

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({ title: title.trim(), category, xp: DIFFICULTY[difficulty].xp })
    setTitle('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a task">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="task-title">Task</label>
          <input id="task-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 20 minute walk" autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="task-cat">Category</label>
          <select id="task-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORIES).map(([id, c]) => (
              <option key={id} value={id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="label">Difficulty</legend>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(DIFFICULTY).map(([id, d]) => (
              <button
                type="button"
                key={id}
                onClick={() => setDifficulty(id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${difficulty === id ? 'border-violet-500 bg-violet-50 text-grape' : 'border-slate-200'}`}
              >
                {d.label}<span className="block text-xs font-semibold opacity-70">+{d.xp} XP</span>
              </button>
            ))}
          </div>
        </fieldset>
        <button className="btn-primary w-full" type="submit"><Plus className="h-4 w-4" /> Add Task</button>
      </form>
    </Modal>
  )
}

function AddHabitModal({ open, onClose }) {
  const { addHabit, tier, habits } = useData()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('health')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (await addHabit({ name: name.trim(), category })) {
      setName('')
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a habit">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-500">
          Habits repeat every day. Check one off for +5 XP. You’re using {habits.length} of{' '}
          {tier.maxHabits === Infinity ? 'unlimited' : tier.maxHabits} habit slots.
        </p>
        <div>
          <label className="label" htmlFor="habit-name">Habit</label>
          <input id="habit-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Drink water" autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="habit-cat">Category</label>
          <select id="habit-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORIES).map(([id, c]) => (
              <option key={id} value={id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full" type="submit"><Plus className="h-4 w-4" /> Add Habit</button>
      </form>
    </Modal>
  )
}

export default function Home() {
  const { userDoc, lvl, streak, xp, todayTasks, habits, today, toggleTask, deleteTask, syncPlan, toggleHabitToday, deleteHabit } = useData()
  const navigate = useNavigate()
  const [taskOpen, setTaskOpen] = useState(false)
  const [habitOpen, setHabitOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const firstName = (userDoc.name || 'Friend').split(' ')[0]
  const done = todayTasks.filter((t) => t.completed).length
  const earned = BADGES.filter((b) => (userDoc.badges || []).includes(b.id))

  const onSync = async () => {
    setSyncing(true)
    const ok = await syncPlan()
    setSyncing(false)
    if (!ok) navigate('/plans')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Welcome back, {firstName}!</h1>
          <p className="mt-2 text-lg text-slate-600">Let’s make today amazing 🚀</p>
        </div>
        <Link to="/plans" className="btn-gradient"><Sparkles className="h-4 w-4" /> Get My Plan</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Level" value={lvl.level} sub={`${lvl.into} / ${lvl.need} XP`} icon={Trophy} gradient="stat-gradient-purple">
          <div className="mt-5"><ProgressBar pct={lvl.pct} track="bg-white/30" fill="bg-white" /></div>
        </StatCard>
        <StatCard title="Streak" value={streak} sub="days in a row" icon={Flame} gradient="stat-gradient-orange" />
        <StatCard title="Total XP" value={xp} sub={`${earned.length} badges earned`} icon={Zap} gradient="stat-gradient-pink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card flex items-center gap-5 border-violet-200">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-plum to-berry text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold">Daily Boost</h2>
              <p className="mt-1 text-slate-600">{dailyBoost(streak, done, todayTasks.length)}</p>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Today’s Tasks</h2>
                {todayTasks.length > 0 && <p className="text-sm text-slate-500">{done} of {todayTasks.length} done</p>}
              </div>
              <div className="flex gap-2">
                <button className="btn-outline" onClick={onSync} disabled={syncing}>
                  <Sparkles className="h-4 w-4" /> {syncing ? 'Syncing…' : 'Sync Plan'}
                </button>
                <button className="btn-primary" onClick={() => setTaskOpen(true)}><Plus className="h-4 w-4" /> Add Task</button>
              </div>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-lg text-slate-500">No tasks yet!</p>
                <p className="mt-1 text-sm text-slate-500">Add a task, or press Sync Plan to pull in today’s meals and workout.</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {todayTasks.map((t) => {
                  const cat = CATEGORIES[t.category] || CATEGORIES.other
                  return (
                    <li key={t.id} className={`group flex items-center gap-3 rounded-2xl border p-3.5 transition ${t.completed ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
                      <button
                        onClick={() => toggleTask(t)}
                        aria-label={t.completed ? `Mark "${t.title}" not done` : `Complete "${t.title}"`}
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition ${t.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-violet-500'}`}
                      >
                        {t.completed && <Check className="h-4 w-4" strokeWidth={3} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold ${t.completed ? 'text-slate-400 line-through' : ''}`}>{t.title}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${cat.chip}`}>{cat.emoji} {cat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-grape">+{t.xp} XP</span>
                      <button onClick={() => deleteTask(t)} className="rounded-lg p-1.5 text-slate-400 opacity-60 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" aria-label={`Delete "${t.title}"`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Habits</h2>
              <button className="btn-outline px-3" onClick={() => setHabitOpen(true)} aria-label="Add habit"><Plus className="h-5 w-5" /></button>
            </div>
            {habits.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">Add a habit you want to do every day, like drinking water or reading.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {habits.map((h) => {
                  const cat = CATEGORIES[h.category] || CATEGORIES.other
                  const doneToday = (h.completions || []).includes(today)
                  return (
                    <li key={h.id} className={`group flex items-center gap-3 rounded-2xl border-2 p-3 transition ${doneToday ? 'border-emerald-300 bg-emerald-50' : 'border-blue-200 bg-blue-50/50'}`}>
                      <button
                        onClick={() => toggleHabitToday(h)}
                        aria-label={doneToday ? `Undo "${h.name}" for today` : `Check off "${h.name}" for today`}
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xl ${doneToday ? 'from-emerald-400 to-emerald-600 text-white' : cat.ring}`}
                      >
                        {doneToday ? <Check className="h-6 w-6" strokeWidth={3} /> : cat.emoji}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{h.name}</p>
                        <p className="text-sm text-slate-500">{cat.label} · {(h.completions || []).length} check-ins</p>
                      </div>
                      <button onClick={() => deleteHabit(h)} className="rounded-lg p-1.5 text-slate-400 opacity-60 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" aria-label={`Delete "${h.name}"`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-[0_8px_30px_-12px_rgba(234,88,12,0.2)]">
            <h2 className="text-2xl font-bold">Recent Badges</h2>
            {earned.length === 0 ? (
              <p className="mt-5 text-center text-slate-600">Complete tasks to earn badges!</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {earned.slice(-6).reverse().map((b) => (
                  <div key={b.id} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm" title={b.description}>
                    <span className="text-2xl">{b.emoji}</span>
                    <span className="text-sm font-bold">{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTaskModal open={taskOpen} onClose={() => setTaskOpen(false)} />
      <AddHabitModal open={habitOpen} onClose={() => setHabitOpen(false)} />
    </div>
  )
}
