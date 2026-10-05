import { useMemo, useState } from 'react'
import { Activity, BarChart3, Heart, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../context/DataContext'
import { addDays, dateKey, lastNDays, shortDay } from '../lib/dates'
import { MOODS } from '../lib/game'

function Stat({ title, value, sub, icon: Icon, color }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <h2 className="font-sans text-lg font-bold text-slate-700">{title}</h2>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <p className={`mt-3 font-display text-5xl font-bold ${color}`}>{value}</p>
      <p className="mt-2 text-slate-500">{sub}</p>
    </div>
  )
}

function insight(thisWeek, lastWeek, rate) {
  if (thisWeek === 0 && lastWeek === 0) return 'Finish a task this week and insights about your patterns will show up here.'
  if (lastWeek === 0) return `${thisWeek} tasks done this week, up from none last week. Great start!`
  const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
  if (change > 0) return `You’re ${change}% more productive than last week!`
  if (change === 0) return `Same pace as last week (${thisWeek} tasks). Steady wins.`
  if (rate >= 70) return `Fewer tasks than last week, but you’re finishing ${rate}% of what you plan.`
  return `${thisWeek} tasks this week vs ${lastWeek} last week. One extra task a day closes the gap.`
}

export default function Dashboard() {
  const { tasks, moods, xp, stats, logMood } = useData()
  const [mood, setMood] = useState('')

  const data = useMemo(() => {
    const since30 = dateKey(addDays(new Date(), -29))
    const weekStart = dateKey(addDays(new Date(), -6))
    const lastWeekStart = dateKey(addDays(new Date(), -13))
    const last30 = tasks.filter((t) => t.date >= since30)
    const done30 = last30.filter((t) => t.completed)
    const rate = last30.length ? Math.round((done30.length / last30.length) * 100) : 0
    const thisWeek = tasks.filter((t) => t.completed && t.date >= weekStart).length
    const lastWeek = tasks.filter((t) => t.completed && t.date >= lastWeekStart && t.date < weekStart).length

    const daily = lastNDays(7).map((d) => {
      const day = tasks.filter((t) => t.date === d)
      return { day: shortDay(d), Completed: day.filter((t) => t.completed).length, Planned: day.length }
    })

    const moodDaily = lastNDays(14).map((d) => {
      const list = moods.filter((m) => m.date === d)
      const avg = list.length ? list.reduce((s, m) => s + m.value, 0) / list.length : null
      return { day: shortDay(d), Mood: avg && Math.round(avg * 10) / 10 }
    })

    return { last30, done30, rate, thisWeek, lastWeek, daily, moodDaily, hasMood: moodDaily.some((m) => m.Mood) }
  }, [tasks, moods])

  const recentMoods = [...moods].sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 5)

  const submitMood = async () => {
    const m = MOODS.find((x) => String(x.value) === mood)
    if (!m) return
    await logMood(m)
    setMood('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">Analytics Dashboard</h1>
        <p className="mt-2 text-lg text-slate-600">Track your progress and insights</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Completion Rate" value={`${data.rate}%`} sub="Last 30 days" icon={BarChart3} color="text-grape" />
        <Stat title="Tasks Done" value={stats.tasksCompleted || 0} sub="Total completed" icon={TrendingUp} color="text-emerald-600" />
        <Stat title="This Week" value={data.thisWeek} sub="Tasks completed" icon={Activity} color="text-blue-600" />
        <Stat title="Total XP" value={xp} sub="Experience earned" icon={TrendingUp} color="text-ember" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="flex items-center gap-5 rounded-3xl bg-gradient-to-r from-violet-500 to-pink-500 p-6 text-white shadow-xl shadow-pink-200/50">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/20"><BarChart3 className="h-7 w-7" /></span>
            <div>
              <h2 className="text-2xl font-bold">Weekly Insight</h2>
              <p className="mt-1 text-lg text-white/95">{insight(data.thisWeek, data.lastWeek, data.rate)}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold">Daily Performance</h2>
            {data.last30.length === 0 ? (
              <p className="py-16 text-center text-slate-500">No task data yet. Start completing tasks to see your progress!</p>
            ) : (
              <div className="mt-4 h-72">
                <ResponsiveContainer>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede9fe" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                    <Tooltip cursor={{ fill: '#f5f3ff' }} />
                    <Legend />
                    <Bar dataKey="Planned" fill="#ddd6fe" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Completed" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold">Mood Tracking</h2>
            {!data.hasMood ? (
              <p className="py-16 text-center text-slate-500">Log your mood to see how it changes over two weeks.</p>
            ) : (
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <LineChart data={data.moodDaily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false} axisLine={false} width={28}
                      tickFormatter={(v) => MOODS.find((m) => m.value === v)?.emoji || v} />
                    <Tooltip formatter={(v) => [`${v} / 5`, 'Mood']} />
                    <Line type="monotone" dataKey="Mood" stroke="#db2777" strokeWidth={3} dot={{ r: 5, fill: '#db2777' }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold">Log Your Mood</h2>
            <label htmlFor="mood" className="sr-only">How are you feeling?</label>
            <select id="mood" className="input mt-4" value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="">How are you feeling?</option>
              {MOODS.map((m) => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
            </select>
            <button className="btn-primary mt-4 w-full" onClick={submitMood} disabled={!mood}><Heart className="h-4 w-4" /> Log Mood</button>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="font-sans font-bold text-slate-700">Recent Moods</h3>
              {recentMoods.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Nothing logged yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentMoods.map((m) => (
                    <li key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="font-semibold">{m.emoji} {m.label}</span>
                      <span className="text-sm text-slate-500">
                        {new Date(m.createdAtMs).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-100 p-6">
            <h2 className="text-2xl font-bold">Quick Stats</h2>
            <dl className="mt-4 space-y-4 text-lg">
              <div className="flex justify-between"><dt>Mood Logs</dt><dd className="font-display font-bold text-grape">{stats.moodsLogged || 0}</dd></div>
              <div className="flex justify-between"><dt>Total Tasks (30 days)</dt><dd className="font-display font-bold text-blue-600">{data.last30.length}</dd></div>
              <div className="flex justify-between"><dt>Avg. Daily</dt><dd className="font-display font-bold text-emerald-600">{(data.done30.length / 30).toFixed(1)}</dd></div>
              <div className="flex justify-between"><dt>Best Streak</dt><dd className="font-display font-bold text-ember">{stats.bestStreak || 0}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
