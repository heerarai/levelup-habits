// All the "game" rules live here so they're easy to tweak in one place.

export const XP_RULES = {
  habitCheck: 5,
  questionnaireBonus: 100,
}

export const DIFFICULTY = {
  easy: { label: 'Easy', xp: 10 },
  medium: { label: 'Medium', xp: 15 },
  hard: { label: 'Hard', xp: 25 },
}

export const CATEGORIES = {
  nutrition: { label: 'Nutrition', emoji: '🥗', chip: 'bg-emerald-100 text-emerald-700', ring: 'from-emerald-400 to-teal-500' },
  fitness: { label: 'Fitness', emoji: '🏃', chip: 'bg-orange-100 text-orange-700', ring: 'from-orange-400 to-rose-500' },
  health: { label: 'Health', emoji: '💧', chip: 'bg-sky-100 text-sky-700', ring: 'from-sky-400 to-blue-600' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘', chip: 'bg-violet-100 text-violet-700', ring: 'from-violet-400 to-purple-600' },
  learning: { label: 'Learning', emoji: '📚', chip: 'bg-amber-100 text-amber-700', ring: 'from-amber-400 to-orange-500' },
  other: { label: 'Other', emoji: '✨', chip: 'bg-slate-100 text-slate-700', ring: 'from-slate-400 to-slate-600' },
}

// Level 1 → 2 needs 100 XP, level 2 → 3 needs 200, level 3 → 4 needs 300, ...
export function levelInfo(totalXp = 0) {
  let level = 1
  let need = 100
  let rem = Math.max(0, totalXp)
  while (rem >= need) {
    rem -= need
    level++
    need = 100 * level
  }
  return { level, into: rem, need, pct: Math.round((rem / need) * 100) }
}

export const TIERS = [
  { id: 'beginner', name: 'Beginner', min: 1, max: 5, maxHabits: 3, unlocks: ['Basic tasks', 'Up to 3 habits', 'Starter rewards'], badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'intermediate', name: 'Intermediate', min: 6, max: 10, maxHabits: 6, unlocks: ['Up to 6 habits', 'Weekly challenges', 'More rewards'], badge: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'advanced', name: 'Advanced', min: 11, max: 15, maxHabits: 10, unlocks: ['Up to 10 habits', 'Hard challenges', 'Premium rewards'], badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  { id: 'elite', name: 'Elite', min: 16, max: Infinity, maxHabits: Infinity, unlocks: ['Unlimited habits', 'Legend challenges', 'Every reward'], badge: 'bg-amber-100 text-amber-800 border-amber-200' },
]

export const tierIndex = (id) => TIERS.findIndex((t) => t.id === id)

export function tierFor(level) {
  return TIERS.find((t) => level >= t.min && level <= t.max) || TIERS[0]
}

export function tierProgress(level) {
  const t = tierFor(level)
  if (t.max === Infinity) return 100
  return Math.round(((level - t.min + 1) / (t.max - t.min + 1)) * 100)
}

export const tierLabel = (t) => (t.max === Infinity ? `Level ${t.min}+` : `Level ${t.min}-${t.max}`)

// metric types:
//   allCategoryDays – days where every task of a category was finished
//   categoryDays    – days with at least one finished task of a category
//   waterDays       – days where a water task or water habit was done
//   perfectDays     – days where every task was finished
//   tasksTotal      – finished tasks
//   habitChecks     – habit check-ins
//   streak          – current streak length
export const CHALLENGES = [
  { id: 'first-day-victory', tier: 'beginner', emoji: '🎯', title: 'First Day Victory', description: 'Complete all your meal tasks today', metric: { type: 'allCategoryDays', category: 'nutrition' }, target: 1, days: 1, xp: 30, category: 'nutrition' },
  { id: 'hydration-hero', tier: 'beginner', emoji: '💧', title: 'Hydration Hero', description: 'Track your water intake for 3 days', metric: { type: 'waterDays' }, target: 3, days: 3, xp: 40, category: 'health' },
  { id: 'workout-starter', tier: 'beginner', emoji: '🏃', title: 'Workout Starter', description: 'Complete your workout plan for 3 days', metric: { type: 'categoryDays', category: 'fitness' }, target: 3, days: 3, xp: 50, category: 'fitness' },
  { id: 'seven-day-streak', tier: 'beginner', emoji: '🔥', title: '7-Day Streak', description: 'Stay active 7 days in a row', metric: { type: 'streak' }, target: 7, days: 7, xp: 75, category: 'consistency' },

  { id: 'meal-master', tier: 'intermediate', emoji: '🥗', title: 'Meal Master', description: 'Finish every meal task on 5 days', metric: { type: 'allCategoryDays', category: 'nutrition' }, target: 5, days: 7, xp: 100, category: 'nutrition' },
  { id: 'mindful-week', tier: 'intermediate', emoji: '🧘', title: 'Mindful Week', description: 'Do a mindfulness task on 5 days', metric: { type: 'categoryDays', category: 'mindfulness' }, target: 5, days: 7, xp: 100, category: 'mindfulness' },
  { id: 'task-crusher', tier: 'intermediate', emoji: '⚡', title: 'Task Crusher', description: 'Complete 25 tasks', metric: { type: 'tasksTotal' }, target: 25, days: 10, xp: 120, category: 'productivity' },
  { id: 'fourteen-day-streak', tier: 'intermediate', emoji: '🔥', title: '14-Day Streak', description: 'Stay active 14 days in a row', metric: { type: 'streak' }, target: 14, days: 14, xp: 150, category: 'consistency' },

  { id: 'perfect-week', tier: 'advanced', emoji: '🏆', title: 'Perfect Week', description: 'Finish every task on 7 days', metric: { type: 'perfectDays' }, target: 7, days: 10, xp: 200, category: 'productivity' },
  { id: 'iron-will', tier: 'advanced', emoji: '🏋️', title: 'Iron Will', description: 'Work out on 12 days', metric: { type: 'categoryDays', category: 'fitness' }, target: 12, days: 14, xp: 220, category: 'fitness' },
  { id: 'hydration-pro', tier: 'advanced', emoji: '🌊', title: 'Hydration Pro', description: 'Hit your water goal on 10 days', metric: { type: 'waterDays' }, target: 10, days: 10, xp: 180, category: 'health' },
  { id: 'century-club', tier: 'advanced', emoji: '💯', title: 'Century Club', description: 'Complete 100 tasks', metric: { type: 'tasksTotal' }, target: 100, days: 30, xp: 300, category: 'productivity' },

  { id: 'thirty-day-streak', tier: 'elite', emoji: '👑', title: '30-Day Streak', description: 'Stay active 30 days in a row', metric: { type: 'streak' }, target: 30, days: 30, xp: 500, category: 'consistency' },
  { id: 'perfect-fortnight', tier: 'elite', emoji: '💎', title: 'Perfect Fortnight', description: 'Finish every task on 14 days', metric: { type: 'perfectDays' }, target: 14, days: 20, xp: 450, category: 'productivity' },
  { id: 'habit-legend', tier: 'elite', emoji: '🌟', title: 'Habit Legend', description: 'Check off habits 100 times', metric: { type: 'habitChecks' }, target: 100, days: 30, xp: 400, category: 'habits' },
]

const isWaterTask = (t) => t.tag === 'water' || /water|hydrat/i.test(t.title || '')
const isWaterHabit = (h) => /water|hydrat/i.test(h.name || '')

export function challengeProgress(ch, startedAt, { tasks, habits, streak }) {
  const since = (d) => d >= startedAt
  const recent = tasks.filter((t) => since(t.date))
  const byDay = {}
  recent.forEach((t) => {
    ;(byDay[t.date] ||= []).push(t)
  })

  let value = 0
  const m = ch.metric
  switch (m.type) {
    case 'allCategoryDays':
      value = Object.values(byDay).filter((list) => {
        const cat = list.filter((t) => t.category === m.category)
        return cat.length > 0 && cat.every((t) => t.completed)
      }).length
      break
    case 'categoryDays':
      value = Object.values(byDay).filter((list) => list.some((t) => t.category === m.category && t.completed)).length
      break
    case 'perfectDays':
      value = Object.values(byDay).filter((list) => list.length > 0 && list.every((t) => t.completed)).length
      break
    case 'waterDays': {
      const days = new Set(recent.filter((t) => t.completed && isWaterTask(t)).map((t) => t.date))
      habits.filter(isWaterHabit).forEach((h) => (h.completions || []).filter(since).forEach((d) => days.add(d)))
      value = days.size
      break
    }
    case 'tasksTotal':
      value = recent.filter((t) => t.completed).length
      break
    case 'habitChecks':
      value = habits.reduce((sum, h) => sum + (h.completions || []).filter(since).length, 0)
      break
    case 'streak':
      value = streak
      break
    default:
      value = 0
  }
  return Math.min(value, ch.target)
}

export const BADGES = [
  { id: 'first-step', emoji: '👣', name: 'First Step', description: 'Complete your first task', check: (s) => s.tasksCompleted >= 1 },
  { id: 'planner', emoji: '🗺️', name: 'Planner', description: 'Get your first plan', check: (s) => s.hasPlan },
  { id: 'habit-builder', emoji: '🌱', name: 'Habit Builder', description: 'Create 3 habits', check: (s) => s.habitCount >= 3 },
  { id: 'on-fire', emoji: '🔥', name: 'On Fire', description: 'Reach a 3-day streak', check: (s) => s.bestStreak >= 3 },
  { id: 'week-warrior', emoji: '⚔️', name: 'Week Warrior', description: 'Reach a 7-day streak', check: (s) => s.bestStreak >= 7 },
  { id: 'ten-down', emoji: '✅', name: 'Ten Down', description: 'Complete 10 tasks', check: (s) => s.tasksCompleted >= 10 },
  { id: 'fifty-down', emoji: '🎖️', name: 'Fifty Down', description: 'Complete 50 tasks', check: (s) => s.tasksCompleted >= 50 },
  { id: 'challenger', emoji: '🏅', name: 'Challenger', description: 'Finish a challenge', check: (s) => s.challengesCompleted >= 1 },
  { id: 'check-in', emoji: '💜', name: 'Check-in Pro', description: 'Log your mood 5 times', check: (s) => s.moodsLogged >= 5 },
  { id: 'level-5', emoji: '⭐', name: 'Rising Star', description: 'Reach level 5', check: (s) => s.level >= 5 },
  { id: 'level-10', emoji: '🌟', name: 'Superstar', description: 'Reach level 10', check: (s) => s.level >= 10 },
]

// Coins are earned 1:1 with XP and spent on rewards, so redeeming
// never lowers your level.
export const REWARDS = [
  { id: 'snack', emoji: '🍫', name: 'Your favorite snack', cost: 50, tier: 'beginner' },
  { id: 'music', emoji: '🎧', name: '30 minutes of music, guilt-free', cost: 60, tier: 'beginner' },
  { id: 'episode', emoji: '📺', name: 'One episode of a show', cost: 80, tier: 'beginner' },
  { id: 'gaming', emoji: '🎮', name: 'An hour of gaming', cost: 150, tier: 'intermediate' },
  { id: 'treat', emoji: '🧋', name: 'A boba or treat run', cost: 200, tier: 'intermediate' },
  { id: 'sleep-in', emoji: '😴', name: 'Sleep in on a weekend', cost: 250, tier: 'intermediate' },
  { id: 'movie', emoji: '🎬', name: 'Movie night', cost: 400, tier: 'advanced' },
  { id: 'purchase', emoji: '🛍️', name: 'A small thing you’ve wanted', cost: 600, tier: 'advanced' },
  { id: 'day-off', emoji: '🏖️', name: 'A full day off from habits', cost: 800, tier: 'elite' },
  { id: 'big-one', emoji: '🎁', name: 'A big reward of your choice', cost: 1200, tier: 'elite' },
]

export const MOODS = [
  { value: 5, label: 'Great', emoji: '😄' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 1, label: 'Rough', emoji: '😣' },
]

export function dailyBoost(streak, doneToday, totalToday) {
  if (totalToday > 0 && doneToday === totalToday) return 'Every task done today. That’s a perfect day! 🏆'
  if (streak >= 7) return `${streak} days in a row. You’re building something real. 🔥`
  if (streak >= 3) return `A ${streak}-day streak! Keep the chain going today. ⚡`
  if (doneToday > 0) return `${doneToday} down already. One more and you’ll feel it. 💪`
  const lines = [
    'Small wins count. Pick one task and start there. 🌱',
    'You’re doing amazing! Keep up the great work today! 💪',
    'Today is a fresh page. What’s one thing you’ll check off? ✨',
    'Progress, not perfection. Let’s go! 🚀',
  ]
  return lines[new Date().getDate() % lines.length]
}
