// POST /api/generate-plan
// Runs on the server (Vercel function in production, Vite middleware in dev),
// so GEMINI_API_KEY is never sent to the browser.

const ACTIVITY = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very: 1.9,
}

const round50 = (n) => Math.round(n / 50) * 50

// Calorie target using the Mifflin-St Jeor formula, with guard rails:
// - under 18: no calorie deficit (growing bodies need fuel), focus on balance
// - adults: a modest deficit/surplus only, never below 1500 kcal
export function computeTargets(q) {
  const age = Number(q.age)
  const weightKg = Number(q.weightLbs) * 0.4536
  const heightCm = (Number(q.heightFt) * 12 + Number(q.heightIn || 0)) * 2.54
  const sexAdj = q.sex === 'male' ? 5 : q.sex === 'female' ? -161 : -78
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexAdj
  const tdee = bmr * (ACTIVITY[q.activity] || 1.375)
  const minor = age < 18

  let target = tdee
  let note = ''
  if (q.goal === 'lose') {
    if (minor) {
      note = 'Under 18: the plan keeps calories at maintenance and focuses on balanced, nourishing meals instead of cutting.'
    } else {
      target = tdee - 400
    }
  }
  if (q.goal === 'gain') target = tdee + 300
  target = Math.max(round50(target), 1500)

  return { dailyCalories: target, maintenance: round50(tdee), minor, note }
}

async function verifyUser(req) {
  const header = req.headers.authorization || ''
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : null
  const apiKey = process.env.VITE_FIREBASE_API_KEY
  if (!idToken || !apiKey) return false
  // Firebase's public REST endpoint rejects invalid or expired tokens.
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  )
  if (!r.ok) return false
  const data = await r.json()
  return Array.isArray(data.users) && data.users.length > 0
}

function buildPrompt(q, targets) {
  return `You are a friendly, safety-minded fitness and nutrition coach inside a habit-tracking app.
Create a personalized one-week plan for this person.

Person:
- Age: ${q.age}
- Sex: ${q.sex}
- Height: ${q.heightFt} ft ${q.heightIn || 0} in, Weight: ${q.weightLbs} lbs
- Activity level: ${q.activity}
- Main goal: ${q.goal}
- Eating style: ${q.diet}
- Foods to avoid (allergies/dislikes): ${q.avoid || 'none'}
- Workout location: ${q.location}, equipment: ${q.equipment || 'none'}
- Experience: ${q.experience}
- Workout days per week: ${q.daysPerWeek}, minutes per session: ${q.minutes}
- Favorite activities: ${q.likes || 'not specified'}

Daily calorie target (already calculated, use exactly this): ${targets.dailyCalories} kcal.
${targets.note}

Rules:
- No crash diets, fasting, meal skipping, detoxes, or supplements.
- ${targets.minor ? 'This person is under 18: keep exercise age-appropriate (no maximal lifting), emphasize energy, growth and fun.' : 'Keep progressions gradual and beginner-safe if experience is low.'}
- Respect the eating style and foods to avoid strictly.
- Use simple, affordable, realistic foods.
- Exactly ${q.daysPerWeek} workout days; the rest are rest or light-activity days with an empty exercises list.
- Meals: breakfast, lunch, dinner and one snack. Meal calories should add up close to the daily target.

Respond with ONLY valid JSON in this exact shape:
{
  "summary": "2 sentence encouraging overview",
  "dailyCalories": ${targets.dailyCalories},
  "macros": { "proteinG": 0, "carbsG": 0, "fatG": 0 },
  "waterGlasses": 8,
  "meals": [
    { "name": "Breakfast", "time": "8:00 AM", "title": "short dish name", "description": "what to eat, one sentence", "calories": 0 }
  ],
  "workoutDays": [
    { "day": "Monday", "focus": "Full body", "durationMin": 30,
      "exercises": [ { "name": "Squats", "sets": "3", "reps": "12", "notes": "short form tip" } ] }
  ],
  "tips": ["short tip", "short tip", "short tip"]
}
workoutDays must list all 7 days, Monday to Sunday.`
}

function cleanJson(text) {
  const stripped = text.replace(/```json|```/g, '').trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  return JSON.parse(stripped.slice(start, end + 1))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' })
  }

  try {
    if (!(await verifyUser(req))) {
      return res.status(401).json({ error: 'Sign in again to generate a plan.' })
    }

    const key = process.env.GEMINI_API_KEY
    if (!key) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing on the server. Add it to .env (local) or Vercel environment variables.' })
    }

    const q = req.body?.questionnaire
    const required = ['age', 'sex', 'heightFt', 'weightLbs', 'activity', 'goal', 'diet', 'location', 'experience', 'daysPerWeek', 'minutes']
    const missing = required.filter((k) => q?.[k] === undefined || q?.[k] === '')
    if (missing.length) {
      return res.status(400).json({ error: `Questionnaire is missing: ${missing.join(', ')}` })
    }

    const targets = computeTargets(q)
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: buildPrompt(q, targets) }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        }),
      },
    )

    const data = await r.json()
    if (!r.ok) {
      const msg = data?.error?.message || `Gemini returned ${r.status}`
      return res.status(502).json({ error: `Gemini error: ${msg}` })
    }

    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
    const plan = cleanJson(text)

    // Trust our own calorie math over the model's.
    plan.dailyCalories = targets.dailyCalories
    plan.maintenanceCalories = targets.maintenance
    plan.calorieNote = targets.note
    plan.meals = Array.isArray(plan.meals) ? plan.meals : []
    plan.workoutDays = Array.isArray(plan.workoutDays) ? plan.workoutDays : []
    plan.tips = Array.isArray(plan.tips) ? plan.tips : []
    plan.waterGlasses = Number(plan.waterGlasses) || 8

    return res.status(200).json({ plan })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Plan generation failed. Try again in a minute.' })
  }
}
