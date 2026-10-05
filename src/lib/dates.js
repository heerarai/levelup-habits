export function dateKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => dateKey()

export function lastNDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) out.push(dateKey(addDays(new Date(), -i)))
  return out
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function shortDay(key) {
  return parseKey(key).toLocaleDateString(undefined, { weekday: 'short' })
}

// Counts consecutive active days ending today (or yesterday, so a streak
// doesn't look broken before you've done anything today).
export function computeStreak(activeDays = []) {
  const set = new Set(activeDays)
  let cursor = new Date()
  if (!set.has(dateKey(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (set.has(dateKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}
