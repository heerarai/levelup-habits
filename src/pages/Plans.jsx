import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Droplets, Dumbbell, RefreshCw, Salad, Sparkles } from 'lucide-react'
import { useData } from '../context/DataContext'
import { WEEKDAYS } from '../lib/dates'

const STEPS = ['About you', 'Your goal', 'Food', 'Workouts']

function Choice({ options, value, onChange, cols = 2 }) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border-2 p-3 text-left transition ${value === o.value ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}
        >
          <span className="font-bold">{o.label}</span>
          {o.hint && <span className="block text-sm text-slate-500">{o.hint}</span>}
        </button>
      ))}
    </div>
  )
}

const DEFAULTS = {
  age: '', sex: '', heightFt: '', heightIn: '', weightLbs: '',
  activity: '', goal: '', diet: '', avoid: '',
  location: '', equipment: '', experience: '', daysPerWeek: 3, minutes: 30, likes: '',
}

function Questionnaire({ initial, onSubmit, onCancel }) {
  const [step, setStep] = useState(0)
  const [q, setQ] = useState({ ...DEFAULTS, ...initial })
  const set = (k) => (v) => setQ((p) => ({ ...p, [k]: v }))
  const field = (k) => ({ value: q[k], onChange: (e) => set(k)(e.target.value) })

  const valid = [
    q.age >= 10 && q.age <= 100 && q.sex && q.heightFt && q.weightLbs,
    q.activity && q.goal,
    q.diet,
    q.location && q.experience && q.daysPerWeek && q.minutes,
  ][step]

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : onSubmit({ ...q, age: Number(q.age) }))

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <Sparkles className="mx-auto h-12 w-12 text-plum" />
        <h1 className="mt-3 text-4xl font-bold">Build your plan</h1>
        <p className="mt-2 text-slate-600">A few questions so LevelUp can make a diet and workout plan that fits you.</p>
      </div>

      <ol className="mt-8 flex gap-2" aria-label="Questionnaire steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={`h-2 rounded-full ${i <= step ? 'bg-gradient-to-r from-plum to-berry' : 'bg-slate-200'}`} />
            <p className={`mt-2 text-xs font-bold ${i === step ? 'text-grape' : 'text-slate-400'}`}>{s}</p>
          </li>
        ))}
      </ol>

      <div className="card mt-6 space-y-6">
        {step === 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="q-age">Age</label>
                <input id="q-age" type="number" min="10" max="100" className="input" {...field('age')} placeholder="16" />
              </div>
              <div>
                <label className="label" htmlFor="q-weight">Weight (lbs)</label>
                <input id="q-weight" type="number" min="50" className="input" {...field('weightLbs')} placeholder="130" />
              </div>
              <div>
                <label className="label" htmlFor="q-ft">Height (ft)</label>
                <input id="q-ft" type="number" min="3" max="8" className="input" {...field('heightFt')} placeholder="5" />
              </div>
              <div>
                <label className="label" htmlFor="q-in">Height (in)</label>
                <input id="q-in" type="number" min="0" max="11" className="input" {...field('heightIn')} placeholder="4" />
              </div>
            </div>
            <div>
              <p className="label">Sex (used for the calorie formula)</p>
              <Choice value={q.sex} onChange={set('sex')} cols={3} options={[
                { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }, { value: 'other', label: 'Prefer not to say' },
              ]} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <p className="label">How active are you on a normal day?</p>
              <Choice value={q.activity} onChange={set('activity')} options={[
                { value: 'sedentary', label: 'Mostly sitting', hint: 'School or desk, little exercise' },
                { value: 'light', label: 'Lightly active', hint: 'Walks, exercise 1–2 days a week' },
                { value: 'moderate', label: 'Active', hint: 'Exercise or sports 3–5 days' },
                { value: 'active', label: 'Very active', hint: 'Hard training most days' },
              ]} />
            </div>
            <div>
              <p className="label">Main goal</p>
              <Choice value={q.goal} onChange={set('goal')} options={[
                { value: 'energy', label: 'More energy', hint: 'Feel better day to day' },
                { value: 'fitness', label: 'Get fitter', hint: 'Stamina and strength' },
                { value: 'gain', label: 'Build muscle', hint: 'Slight calorie surplus' },
                { value: 'lose', label: 'Lose some weight', hint: 'Gentle and sustainable' },
              ]} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <p className="label">Eating style</p>
              <Choice value={q.diet} onChange={set('diet')} cols={3} options={[
                { value: 'anything', label: 'Eat everything' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'eggetarian', label: 'Vegetarian + eggs' },
                { value: 'vegan', label: 'Vegan' },
                { value: 'pescatarian', label: 'Pescatarian' },
                { value: 'halal', label: 'Halal' },
              ]} />
            </div>
            <div>
              <label className="label" htmlFor="q-avoid">Foods to avoid (allergies or dislikes)</label>
              <input id="q-avoid" className="input" {...field('avoid')} placeholder="e.g., peanuts, mushrooms" />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <p className="label">Where will you work out?</p>
              <Choice value={q.location} onChange={set('location')} cols={3} options={[
                { value: 'home', label: 'At home' }, { value: 'gym', label: 'Gym' }, { value: 'outdoors', label: 'Outdoors' },
              ]} />
            </div>
            <div>
              <p className="label">Experience</p>
              <Choice value={q.experience} onChange={set('experience')} cols={3} options={[
                { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Some experience' }, { value: 'advanced', label: 'Experienced' },
              ]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="q-days">Workout days per week: {q.daysPerWeek}</label>
                <input id="q-days" type="range" min="1" max="6" className="w-full accent-violet-600" value={q.daysPerWeek} onChange={(e) => set('daysPerWeek')(Number(e.target.value))} />
              </div>
              <div>
                <label className="label" htmlFor="q-min">Minutes per workout: {q.minutes}</label>
                <input id="q-min" type="range" min="10" max="90" step="5" className="w-full accent-violet-600" value={q.minutes} onChange={(e) => set('minutes')(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="q-eq">Equipment you have</label>
              <input id="q-eq" className="input" {...field('equipment')} placeholder="e.g., dumbbells, yoga mat, none" />
            </div>
            <div>
              <label className="label" htmlFor="q-likes">Activities you enjoy</label>
              <input id="q-likes" className="input" {...field('likes')} placeholder="e.g., tennis, dancing, running" />
            </div>
          </>
        )}

        <div className="flex justify-between gap-3 pt-2">
          {step > 0 ? (
            <button className="btn-outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4" /> Back</button>
          ) : onCancel ? (
            <button className="btn-outline" onClick={onCancel}>Cancel</button>
          ) : <span />}
          <button className="btn-gradient" disabled={!valid} onClick={next}>
            {step < STEPS.length - 1 ? <>Next <ArrowRight className="h-4 w-4" /></> : <><Sparkles className="h-4 w-4" /> Generate My Plan</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function Generating({ error, onRetry, onRetake }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <Sparkles className={`mx-auto h-16 w-16 text-plum ${error ? '' : 'animate-pulse'}`} />
      <h1 className="mt-5 text-4xl font-bold">{error ? 'The plan didn’t generate' : 'Building your plan…'}</h1>
      {error ? (
        <p className="mt-4 text-slate-600">{error}</p>
      ) : (
        <>
          <p className="mt-4 text-lg text-slate-600">Matching meals and workouts to your answers.</p>
          <button className="mt-8 text-sm font-bold text-grape underline underline-offset-4" onClick={onRetake}>
            Stuck? Start the questionnaire over
          </button>
        </>
      )}
      {error && (
        <div className="mt-8 flex justify-center gap-3">
          <button className="btn-primary" onClick={onRetry}><RefreshCw className="h-4 w-4" /> Try Again</button>
          <button className="btn-outline" onClick={onRetake}>Retake Questionnaire</button>
        </div>
      )}
    </div>
  )
}

function PlanView({ plan, onRegenerate, onRetake }) {
  const { syncPlan } = useData()
  const navigate = useNavigate()
  const [tab, setTab] = useState('diet')
  const todayName = WEEKDAYS[new Date().getDay()]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Your Plan</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{plan.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-gradient" onClick={async () => { await syncPlan(); navigate('/home') }}>
            <Sparkles className="h-4 w-4" /> Add Today to Tasks
          </button>
          <button className="btn-outline" onClick={onRegenerate}><RefreshCw className="h-4 w-4" /> New Plan</button>
          <button className="btn-outline" onClick={onRetake}>Retake Questionnaire</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ['Daily calories', `${plan.dailyCalories}`, 'kcal'],
          ['Protein', `${plan.macros?.proteinG ?? '–'}`, 'g'],
          ['Carbs', `${plan.macros?.carbsG ?? '–'}`, 'g'],
          ['Water', `${plan.waterGlasses}`, 'glasses'],
        ].map(([label, val, unit]) => (
          <div key={label} className="card py-5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-grape">{val} <span className="text-base text-slate-500">{unit}</span></p>
          </div>
        ))}
      </div>
      {plan.calorieNote && <p className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">{plan.calorieNote}</p>}

      <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm" role="tablist">
        {[['diet', 'Diet', Salad], ['workout', 'Workouts', Dumbbell]].map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold ${tab === id ? 'bg-grape text-white' : 'text-slate-600'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'diet' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {plan.meals.map((m, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-berry">{m.name} · {m.time}</p>
                  <h2 className="mt-1 text-xl font-bold">{m.title}</h2>
                </div>
                <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">{m.calories} kcal</span>
              </div>
              <p className="mt-2 text-slate-600">{m.description}</p>
            </div>
          ))}
          <div className="card md:col-span-2">
            <h2 className="flex items-center gap-2 text-xl font-bold"><Droplets className="h-5 w-5 text-sky-500" /> Tips</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
              {plan.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plan.workoutDays.map((d) => {
            const rest = !d.exercises?.length
            const isToday = d.day?.toLowerCase() === todayName.toLowerCase()
            return (
              <div key={d.day} className={`card ${isToday ? 'ring-2 ring-violet-400' : ''}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{d.day} {isToday && <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs text-grape">Today</span>}</h2>
                  {!rest && <span className="text-sm font-bold text-slate-500">{d.durationMin} min</span>}
                </div>
                <p className={`mt-1 font-semibold ${rest ? 'text-emerald-600' : 'text-ember'}`}>{d.focus}</p>
                {!rest && (
                  <ul className="mt-3 divide-y divide-slate-100">
                    {d.exercises.map((ex, i) => (
                      <li key={i} className="py-2">
                        <div className="flex justify-between gap-3">
                          <span className="font-semibold">{ex.name}</span>
                          <span className="shrink-0 text-sm font-bold text-grape">{ex.sets} × {ex.reps}</span>
                        </div>
                        {ex.notes && <p className="text-sm text-slate-500">{ex.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
      <p className="text-xs text-slate-500">These plans are general guidance, not medical advice. Check with a doctor before big changes to diet or exercise.</p>
    </div>
  )
}

export default function Plans() {
  const { userDoc, generatePlan } = useData()
  const [retaking, setRetaking] = useState(false)
  const status = userDoc.planStatus
  const prefill = userDoc.questionnaire || { age: userDoc.profile?.age || '' }

  const submit = (q) => {
    setRetaking(false)
    generatePlan(q)
  }

  if (status === 'generating' && !retaking) return <Generating onRetake={() => setRetaking(true)} />
  if (retaking || status === 'none' || !userDoc.questionnaire) {
    return <Questionnaire initial={prefill} onSubmit={submit} onCancel={userDoc.plan ? () => setRetaking(false) : null} />
  }
  if (status === 'error' && !userDoc.plan) {
    return <Generating error={userDoc.planError} onRetry={() => generatePlan(userDoc.questionnaire)} onRetake={() => setRetaking(true)} />
  }
  return (
    <>
      {status === 'error' && (
        <p className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">Your new plan didn’t generate ({userDoc.planError}). Showing your previous plan.</p>
      )}
      <PlanView plan={userDoc.plan} onRegenerate={() => generatePlan(userDoc.questionnaire)} onRetake={() => setRetaking(true)} />
    </>
  )
}
