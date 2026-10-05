import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, increment,
  onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import { generatePlan as buildPlan } from '../lib/planGenerator'
import { addDays, computeStreak, dateKey, todayKey, WEEKDAYS } from '../lib/dates'
import {
  BADGES, CHALLENGES, REWARDS, TIERS, XP_RULES, challengeProgress, levelInfo, tierFor, tierIndex,
} from '../lib/game'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [userDoc, setUserDoc] = useState(null)
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [moods, setMoods] = useState([])
  const [loaded, setLoaded] = useState({ user: false, tasks: false, habits: false, moods: false })
  const busy = useRef(new Set())

  const uid = user?.uid
  const userRef = uid ? doc(db, 'users', uid) : null
  const col = (name) => collection(db, 'users', uid, name)

  // ---- live subscriptions ----
  useEffect(() => {
    if (!uid) return
    setLoaded({ user: false, tasks: false, habits: false, moods: false })
    const since90 = dateKey(addDays(new Date(), -90))
    const since30 = dateKey(addDays(new Date(), -30))
    const mark = (k) => setLoaded((l) => ({ ...l, [k]: true }))
    const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const unsubs = [
      onSnapshot(doc(db, 'users', uid), (s) => { setUserDoc(s.exists() ? s.data() : null); mark('user') }),
      onSnapshot(query(collection(db, 'users', uid, 'tasks'), where('date', '>=', since90)), (s) => { setTasks(list(s)); mark('tasks') }),
      onSnapshot(collection(db, 'users', uid, 'habits'), (s) => { setHabits(list(s)); mark('habits') }),
      onSnapshot(query(collection(db, 'users', uid, 'moods'), where('date', '>=', since30)), (s) => { setMoods(list(s)); mark('moods') }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [uid])

  const ready = loaded.user && loaded.tasks && loaded.habits && loaded.moods && !!userDoc

  // ---- derived values ----
  const xp = userDoc?.xp || 0
  const coins = userDoc?.coins || 0
  const lvl = levelInfo(xp)
  const tier = tierFor(lvl.level)
  const streak = computeStreak(userDoc?.activeDays)
  const stats = userDoc?.stats || {}
  const today = todayKey()
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.date === today).sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0)),
    [tasks, today],
  )

  // ---- XP helper ----
  const award = (amount, extra = {}) =>
    updateDoc(userRef, { xp: increment(amount), coins: increment(amount), ...extra })

  const takeBack = (amount, extra = {}) =>
    updateDoc(userRef, {
      xp: Math.max(0, xp - amount),
      coins: Math.max(0, coins - amount),
      ...extra,
    })

  // ---- tasks ----
  const addTask = async ({ title, category, xp: taskXp, date = today, tag = null, id }) => {
    const data = { title, category, xp: taskXp, date, tag, completed: false, createdAtMs: Date.now() }
    if (id) await setDoc(doc(db, 'users', uid, 'tasks', id), data, { merge: true })
    else await addDoc(col('tasks'), data)
  }

  const toggleTask = async (task) => {
    const ref = doc(db, 'users', uid, 'tasks', task.id)
    if (!task.completed) {
      await updateDoc(ref, { completed: true, completedAt: serverTimestamp() })
      await award(task.xp, { 'stats.tasksCompleted': increment(1), activeDays: arrayUnion(task.date) })
      toast.success(`+${task.xp} XP`, { description: task.title })
    } else {
      await updateDoc(ref, { completed: false, completedAt: null })
      await takeBack(task.xp, { 'stats.tasksCompleted': Math.max(0, (stats.tasksCompleted || 0) - 1) })
    }
  }

  const deleteTask = async (task) => {
    if (task.completed) await takeBack(task.xp, { 'stats.tasksCompleted': Math.max(0, (stats.tasksCompleted || 0) - 1) })
    await deleteDoc(doc(db, 'users', uid, 'tasks', task.id))
  }

  // Adds today's meals, workout and water goal from the plan as tasks.
  // Each gets a fixed id, so syncing twice never makes duplicates.
  const syncPlan = async () => {
    const plan = userDoc?.plan
    if (!plan) {
      toast.error('No plan yet. Fill in the questionnaire on the Plans page first.')
      return false
    }
    const weekday = WEEKDAYS[new Date().getDay()]
    const jobs = []
    plan.meals.forEach((m, i) =>
      jobs.push(addTask({ id: `plan-${today}-meal-${i}`, title: `${m.name}: ${m.title}`, category: 'nutrition', xp: 10 })),
    )
    const workout = plan.workoutDays.find((d) => d.day?.toLowerCase() === weekday.toLowerCase())
    if (workout && workout.exercises?.length) {
      jobs.push(addTask({ id: `plan-${today}-workout`, title: `Workout: ${workout.focus} (${workout.durationMin} min)`, category: 'fitness', xp: 25 }))
    }
    jobs.push(addTask({ id: `plan-${today}-water`, title: `Drink ${plan.waterGlasses} glasses of water`, category: 'health', xp: 10, tag: 'water' }))
    await Promise.all(jobs)
    toast.success('Today’s plan added to your tasks')
    return true
  }

  // ---- habits ----
  const addHabit = async ({ name, category }) => {
    if (habits.length >= tier.maxHabits) {
      const next = TIERS[tierIndex(tier.id) + 1]
      toast.error(`${tier.name}s can track up to ${tier.maxHabits} habits. Reach level ${next?.min} for more.`)
      return false
    }
    await addDoc(col('habits'), { name, category, completions: [], createdAtMs: Date.now() })
    toast.success('Habit added')
    return true
  }

  const toggleHabitToday = async (habit) => {
    const ref = doc(db, 'users', uid, 'habits', habit.id)
    const done = (habit.completions || []).includes(today)
    if (!done) {
      await updateDoc(ref, { completions: arrayUnion(today) })
      await award(XP_RULES.habitCheck, { 'stats.habitChecks': increment(1), activeDays: arrayUnion(today) })
      toast.success(`+${XP_RULES.habitCheck} XP`, { description: habit.name })
    } else {
      await updateDoc(ref, { completions: arrayRemove(today) })
      await takeBack(XP_RULES.habitCheck, { 'stats.habitChecks': Math.max(0, (stats.habitChecks || 0) - 1) })
    }
  }

  const deleteHabit = (habit) => deleteDoc(doc(db, 'users', uid, 'habits', habit.id))

  // ---- moods ----
  const logMood = async (mood) => {
    await addDoc(col('moods'), { value: mood.value, label: mood.label, emoji: mood.emoji, date: today, createdAtMs: Date.now() })
    await updateDoc(userRef, { 'stats.moodsLogged': increment(1) })
    toast.success('Mood logged')
  }

  // ---- profile ----
  const saveProfile = (profile) => updateDoc(userRef, { profile })

  // ---- plan ----
  const generatePlan = async (questionnaire) => {
    await updateDoc(userRef, { questionnaire, planStatus: 'generating', planError: null })
    try {
      const plan = buildPlan(questionnaire)
      const firstTime = !userDoc?.questionnaireBonus
      await updateDoc(userRef, {
        plan: { ...plan, createdAtMs: Date.now() },
        planStatus: 'ready',
        ...(firstTime ? { questionnaireBonus: true, xp: increment(XP_RULES.questionnaireBonus), coins: increment(XP_RULES.questionnaireBonus) } : {}),
      })
      toast.success(firstTime ? `Your plan is ready! +${XP_RULES.questionnaireBonus} XP` : 'Your new plan is ready!')
    } catch (err) {
      console.error(err)
      await updateDoc(userRef, { planStatus: 'error', planError: 'Something in the questionnaire looks off. Check your answers and try again.' })
      toast.error('The plan couldn’t be created. Check your answers and try again.')
    }
  }

  // ---- challenges ----
  const startChallenge = async (ch) => {
    await updateDoc(userRef, { [`challenges.${ch.id}`]: { status: 'active', startedAt: today } })
    toast.success(`Challenge started: ${ch.title}`)
  }

  const quitChallenge = (ch) => updateDoc(userRef, { [`challenges.${ch.id}`]: { status: 'none' } })

  // ---- rewards ----
  const redeemReward = async (reward) => {
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef)
        const c = snap.data().coins || 0
        if (c < reward.cost) throw new Error('Not enough coins yet.')
        tx.update(userRef, { coins: c - reward.cost, redeemed: arrayUnion({ id: reward.id, at: Date.now() }) })
      })
      toast.success(`Redeemed: ${reward.name}. Enjoy it! 🎉`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ---- delete everything ----
  const deleteAllData = async () => {
    for (const name of ['tasks', 'habits', 'moods']) {
      const snap = await getDocs(col(name))
      const batch = writeBatch(db)
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
    await deleteDoc(userRef)
  }

  // ---- automatic checks: best streak, challenge completion, badges ----
  useEffect(() => {
    if (!ready) return
    if (streak > (stats.bestStreak || 0)) updateDoc(userRef, { 'stats.bestStreak': streak })
  }, [ready, streak]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return
    const state = userDoc.challenges || {}
    CHALLENGES.forEach((ch) => {
      const s = state[ch.id]
      if (s?.status !== 'active' || busy.current.has(ch.id)) return
      const progress = challengeProgress(ch, s.startedAt, { tasks, habits, streak })
      if (progress < ch.target) return
      busy.current.add(ch.id)
      runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef)
        if (snap.data().challenges?.[ch.id]?.status !== 'active') return false
        tx.update(userRef, {
          [`challenges.${ch.id}`]: { ...s, status: 'completed', completedAt: today },
          xp: increment(ch.xp),
          coins: increment(ch.xp),
          'stats.challengesCompleted': increment(1),
        })
        return true
      })
        .then((didIt) => didIt && toast.success(`Challenge complete: ${ch.title}! +${ch.xp} XP 🏆`))
        .finally(() => busy.current.delete(ch.id))
    })
  }, [ready, tasks, habits, streak, userDoc]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return
    const have = new Set(userDoc.badges || [])
    const s = {
      ...stats,
      tasksCompleted: stats.tasksCompleted || 0,
      bestStreak: Math.max(stats.bestStreak || 0, streak),
      hasPlan: !!userDoc.plan,
      habitCount: habits.length,
      level: lvl.level,
    }
    const fresh = BADGES.filter((b) => !have.has(b.id) && !busy.current.has(`badge-${b.id}`) && b.check(s))
    if (!fresh.length) return
    fresh.forEach((b) => busy.current.add(`badge-${b.id}`))
    updateDoc(userRef, { badges: arrayUnion(...fresh.map((b) => b.id)) }).then(() =>
      fresh.forEach((b) => toast.success(`Badge unlocked: ${b.name} ${b.emoji}`, { description: b.description })),
    )
  }, [ready, userDoc, habits.length, streak]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    ready, userDoc, tasks, todayTasks, habits, moods, xp, coins, lvl, tier, streak, stats, today,
    addTask, toggleTask, deleteTask, syncPlan,
    addHabit, toggleHabitToday, deleteHabit,
    logMood, saveProfile, generatePlan,
    startChallenge, quitChallenge, redeemReward, deleteAllData,
    REWARDS,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
