// Builds a personalized diet + workout plan from questionnaire answers.
// Runs entirely in the browser: no API key, no cost, works offline.
// To add meals or exercises, just add entries to the lists below.

// ---------------------------------------------------------------------------
// Calories (Mifflin-St Jeor) with guard rails
// ---------------------------------------------------------------------------
const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }
const round50 = (n) => Math.round(n / 50) * 50

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
      note = 'Under 18: calories stay at maintenance. Growing bodies need fuel, so this plan focuses on balanced, filling meals instead of cutting.'
    } else {
      target = tdee - 400
    }
  }
  if (q.goal === 'gain') target = tdee + 300
  target = Math.max(round50(target), 1500)

  return { dailyCalories: target, maintenance: round50(tdee), minor, note, weightKg }
}

// ---------------------------------------------------------------------------
// Meals
// flags: meat, fish, egg, dairy  ·  ingredients are used for "foods to avoid"
// ---------------------------------------------------------------------------
const MEALS = {
  breakfast: [
    { title: 'Berry oatmeal', description: 'Oats cooked in milk, topped with berries, chia seeds and a drizzle of honey.', ingredients: ['oats', 'milk', 'berries', 'chia seeds', 'honey'], dairy: true },
    { title: 'Veggie egg scramble with toast', description: 'Eggs scrambled with spinach and tomato, with a slice of whole-grain toast.', ingredients: ['eggs', 'spinach', 'tomato', 'toast'], egg: true },
    { title: 'Greek yogurt parfait', description: 'Greek yogurt layered with granola, banana and a few almonds.', ingredients: ['greek yogurt', 'granola', 'banana', 'almonds'], dairy: true },
    { title: 'Peanut butter banana toast', description: 'Whole-grain toast with peanut butter and banana, plus a glass of soy milk.', ingredients: ['toast', 'peanut butter', 'banana', 'soy milk'] },
    { title: 'Vegetable poha', description: 'Flattened rice with peas, onion, peanuts and a squeeze of lemon.', ingredients: ['flattened rice', 'peas', 'onion', 'peanuts', 'lemon'] },
    { title: 'Tofu breakfast burrito', description: 'Scrambled tofu, black beans and salsa wrapped in a flour tortilla.', ingredients: ['tofu', 'black beans', 'salsa', 'flour tortilla'] },
    { title: 'Moong dal chilla', description: 'Savory lentil pancakes with onion and spinach, served with mint chutney.', ingredients: ['moong dal', 'onion', 'spinach', 'mint'] },
    { title: 'Smoked salmon bagel', description: 'Whole-grain bagel with smoked salmon, cream cheese and cucumber.', ingredients: ['bagel', 'salmon', 'cream cheese', 'cucumber'], fish: true, dairy: true },
    { title: 'Chicken sausage & potato hash', description: 'Chicken sausage pan-fried with diced potatoes and bell peppers.', ingredients: ['chicken sausage', 'potatoes', 'bell peppers'], meat: true },
  ],
  lunch: [
    { title: 'Grilled chicken quinoa bowl', description: 'Grilled chicken over quinoa with roasted vegetables and a spoon of hummus.', ingredients: ['chicken', 'quinoa', 'roasted vegetables', 'hummus', 'chickpeas'], meat: true },
    { title: 'Chickpea salad wrap', description: 'Chickpeas, cucumber and tomato with tahini dressing in a whole-wheat wrap.', ingredients: ['chickpeas', 'cucumber', 'tomato', 'tahini', 'sesame', 'wrap'] },
    { title: 'Rajma chawal', description: 'Kidney bean curry with tomato and onion, served over brown rice.', ingredients: ['kidney beans', 'tomato', 'onion', 'brown rice'] },
    { title: 'Paneer tikka with roti', description: 'Paneer and peppers marinated in yogurt and spices, with whole-wheat roti.', ingredients: ['paneer', 'yogurt', 'bell peppers', 'roti'], dairy: true },
    { title: 'Tuna salad sandwich', description: 'Tuna mixed with Greek yogurt and celery on whole-grain bread, with fruit on the side.', ingredients: ['tuna', 'greek yogurt', 'celery', 'bread'], fish: true, dairy: true },
    { title: 'Lentil soup with bread', description: 'Hearty lentil soup with carrots and spinach, plus a slice of whole-grain bread.', ingredients: ['lentils', 'carrots', 'spinach', 'bread'] },
    { title: 'Veggie egg fried rice', description: 'Brown rice stir-fried with eggs, peas and carrots.', ingredients: ['eggs', 'brown rice', 'peas', 'carrots', 'soy sauce'], egg: true },
    { title: 'Turkey avocado sandwich', description: 'Sliced turkey, avocado and lettuce on whole-grain bread.', ingredients: ['turkey', 'avocado', 'lettuce', 'bread'], meat: true },
    { title: 'Black bean burrito bowl', description: 'Black beans over rice with corn, salsa and avocado.', ingredients: ['black beans', 'rice', 'corn', 'salsa', 'avocado'] },
  ],
  dinner: [
    { title: 'Baked salmon with sweet potato', description: 'Oven-baked salmon with roasted sweet potato and steamed greens.', ingredients: ['salmon', 'sweet potato', 'greens'], fish: true },
    { title: 'Chicken veggie stir-fry', description: 'Chicken, broccoli and peppers stir-fried and served over brown rice.', ingredients: ['chicken', 'broccoli', 'bell peppers', 'soy sauce', 'brown rice'], meat: true },
    { title: 'Dal, rice and sabzi', description: 'Yellow dal with brown rice and a side of mixed vegetable sabzi.', ingredients: ['lentils', 'brown rice', 'mixed vegetables'] },
    { title: 'Tofu stir-fry noodles', description: 'Crispy tofu and broccoli tossed with noodles and a light soy-ginger sauce.', ingredients: ['tofu', 'broccoli', 'noodles', 'soy sauce', 'ginger'] },
    { title: 'Pasta primavera', description: 'Whole-wheat pasta with zucchini, tomato, garlic and a little parmesan.', ingredients: ['pasta', 'zucchini', 'tomato', 'garlic', 'parmesan'], dairy: true },
    { title: 'Chana masala with roti', description: 'Spiced chickpea curry with whole-wheat roti and cucumber salad.', ingredients: ['chickpeas', 'tomato', 'onion', 'roti', 'cucumber'] },
    { title: 'Lean beef tacos', description: 'Lean ground beef in corn tortillas with lettuce, cheese and salsa.', ingredients: ['beef', 'corn tortillas', 'lettuce', 'cheese', 'salsa'], meat: true, dairy: true },
    { title: 'Shrimp veggie rice bowl', description: 'Sautéed shrimp with mixed vegetables over rice.', ingredients: ['shrimp', 'mixed vegetables', 'rice'], fish: true },
    { title: 'Palak paneer with brown rice', description: 'Spinach curry with paneer cubes, served with brown rice.', ingredients: ['spinach', 'paneer', 'brown rice'], dairy: true },
    { title: 'Veggie omelette with salad', description: 'Three-egg omelette with peppers and onion, a side salad and toast.', ingredients: ['eggs', 'bell peppers', 'onion', 'salad', 'toast'], egg: true },
  ],
  snack: [
    { title: 'Apple with peanut butter', description: 'A sliced apple with two tablespoons of peanut butter.', ingredients: ['apple', 'peanut butter'] },
    { title: 'Greek yogurt with honey', description: 'A cup of Greek yogurt with honey and cinnamon.', ingredients: ['greek yogurt', 'honey'], dairy: true },
    { title: 'Hummus and carrot sticks', description: 'Hummus with carrot and cucumber sticks.', ingredients: ['hummus', 'chickpeas', 'sesame', 'carrots', 'cucumber'] },
    { title: 'Trail mix', description: 'A handful of almonds, cashews and raisins.', ingredients: ['almonds', 'cashews', 'raisins'] },
    { title: 'Boiled eggs and fruit', description: 'Two hard-boiled eggs with an orange.', ingredients: ['eggs', 'orange'], egg: true },
    { title: 'Roasted chana', description: 'Crunchy roasted chickpeas with a pinch of spice.', ingredients: ['chickpeas'] },
    { title: 'Cheese and crackers', description: 'A few slices of cheese with whole-grain crackers.', ingredients: ['cheese', 'crackers'], dairy: true },
    { title: 'Banana oat smoothie', description: 'Banana blended with soy milk, oats and a spoon of peanut butter.', ingredients: ['banana', 'soy milk', 'oats', 'peanut butter'] },
    { title: 'Edamame', description: 'A bowl of steamed edamame with sea salt.', ingredients: ['edamame', 'soy'] },
  ],
}

const SLOTS = [
  { key: 'breakfast', name: 'Breakfast', time: '7:30 AM', share: 0.25 },
  { key: 'lunch', name: 'Lunch', time: '12:30 PM', share: 0.3 },
  { key: 'snack', name: 'Snack', time: '4:00 PM', share: 0.15 },
  { key: 'dinner', name: 'Dinner', time: '7:00 PM', share: 0.3 },
]

const DIET_RULES = {
  anything: () => true,
  vegetarian: (m) => !m.meat && !m.fish && !m.egg,
  eggetarian: (m) => !m.meat && !m.fish,
  vegan: (m) => !m.meat && !m.fish && !m.egg && !m.dairy && !m.ingredients.includes('honey'),
  pescatarian: (m) => !m.meat,
  halal: () => true,
}

// Common words people type → the ingredient keywords they mean
const AVOID_ALIASES = {
  dairy: ['milk', 'yogurt', 'cheese', 'paneer', 'parmesan', 'cream cheese'],
  lactose: ['milk', 'yogurt', 'cheese', 'paneer', 'parmesan', 'cream cheese'],
  milk: ['milk', 'yogurt', 'cheese', 'paneer', 'parmesan', 'cream cheese'],
  gluten: ['toast', 'bread', 'bagel', 'wrap', 'flour tortilla', 'roti', 'pasta', 'noodles', 'granola', 'crackers', 'soy sauce', 'oats'],
  wheat: ['toast', 'bread', 'bagel', 'wrap', 'flour tortilla', 'roti', 'pasta', 'noodles', 'crackers'],
  nuts: ['almonds', 'cashews', 'peanuts', 'peanut butter', 'granola'],
  'tree nuts': ['almonds', 'cashews', 'granola'],
  peanut: ['peanuts', 'peanut butter'],
  peanuts: ['peanuts', 'peanut butter'],
  egg: ['eggs'],
  eggs: ['eggs'],
  soy: ['soy', 'soy milk', 'soy sauce', 'tofu', 'edamame'],
  seafood: ['salmon', 'tuna', 'shrimp'],
  fish: ['salmon', 'tuna'],
  shellfish: ['shrimp'],
  sesame: ['sesame', 'tahini', 'hummus'],
  meat: ['chicken', 'turkey', 'beef', 'chicken sausage'],
}

function avoidKeywords(text = '') {
  return text
    .toLowerCase()
    .split(/[,;/]|\band\b/)
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((term) => AVOID_ALIASES[term] || AVOID_ALIASES[term.replace(/s$/, '')] || [term.replace(/s$/, '')])
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickMeals(q, dailyCalories) {
  const allowed = DIET_RULES[q.diet] || DIET_RULES.anything
  const avoid = avoidKeywords(q.avoid)
  const safe = (m) => !m.ingredients.some((ing) => avoid.some((a) => ing.includes(a) || a.includes(ing)))

  return SLOTS.map((slot) => {
    const options = MEALS[slot.key].filter((m) => allowed(m) && safe(m))
    const meal = shuffle(options)[0]
    const calories = round50(dailyCalories * slot.share)
    if (!meal) {
      return {
        name: slot.name, time: slot.time, calories,
        title: 'Build-your-own balanced plate',
        description: 'Half veggies, a quarter protein you can eat, a quarter whole grains or starch, plus a healthy fat.',
      }
    }
    const halalNote = q.diet === 'halal' && meal.meat ? ' Use halal-certified meat.' : ''
    return { name: slot.name, time: slot.time, calories, title: meal.title, description: meal.description + halalNote }
  })
}

// ---------------------------------------------------------------------------
// Workouts
// kind: reps | hold | time   ·   equip: none | dumbbells | gym | rope | outdoor
// level: lowest experience level the move suits
// ---------------------------------------------------------------------------
const EXERCISES = {
  lower: [
    { name: 'Bodyweight squats', kind: 'reps', equip: 'none', notes: 'Sit back like into a chair, chest up.' },
    { name: 'Reverse lunges', kind: 'reps', equip: 'none', notes: 'Step back, both knees to about 90°. Reps per leg.' },
    { name: 'Glute bridges', kind: 'reps', equip: 'none', notes: 'Squeeze your glutes at the top for a second.' },
    { name: 'Wall sit', kind: 'hold', equip: 'none', notes: 'Thighs parallel to the floor, back flat on the wall.' },
    { name: 'Calf raises', kind: 'reps', equip: 'none', notes: 'Slow on the way down.' },
    { name: 'Jump squats', kind: 'reps', equip: 'none', level: 'intermediate', notes: 'Land softly with bent knees.' },
    { name: 'Goblet squats', kind: 'reps', equip: 'dumbbells', notes: 'Hold one dumbbell at your chest.' },
    { name: 'Dumbbell Romanian deadlifts', kind: 'reps', equip: 'dumbbells', notes: 'Hinge at the hips, keep your back flat.' },
    { name: 'Leg press', kind: 'reps', equip: 'gym', notes: 'Pick a weight where the last 2 reps feel hard.' },
    { name: 'Walking lunges', kind: 'reps', equip: 'none', level: 'intermediate', notes: 'Reps per leg; keep your torso tall.' },
  ],
  upper: [
    { name: 'Push-ups', kind: 'reps', equip: 'none', notes: 'Drop to your knees if needed. Body in a straight line.' },
    { name: 'Incline push-ups', kind: 'reps', equip: 'none', notes: 'Hands on a bench or counter. Easier than floor push-ups.' },
    { name: 'Chair tricep dips', kind: 'reps', equip: 'none', notes: 'Use a sturdy chair; elbows point back.' },
    { name: 'Superman holds', kind: 'hold', equip: 'none', notes: 'Lift arms and legs, squeeze your back.' },
    { name: 'Plank shoulder taps', kind: 'reps', equip: 'none', notes: 'Keep hips still while you tap.' },
    { name: 'Pike push-ups', kind: 'reps', equip: 'none', level: 'intermediate', notes: 'Hips high, lower your head toward the floor.' },
    { name: 'Dumbbell rows', kind: 'reps', equip: 'dumbbells', notes: 'Pull your elbow toward your hip. Reps per arm.' },
    { name: 'Dumbbell shoulder press', kind: 'reps', equip: 'dumbbells', notes: 'Press overhead without arching your back.' },
    { name: 'Floor dumbbell chest press', kind: 'reps', equip: 'dumbbells', notes: 'Elbows at about 45° from your body.' },
    { name: 'Lat pulldown', kind: 'reps', equip: 'gym', notes: 'Pull the bar to your upper chest.' },
    { name: 'Seated cable row', kind: 'reps', equip: 'gym', notes: 'Squeeze your shoulder blades together.' },
  ],
  core: [
    { name: 'Plank', kind: 'hold', equip: 'none', notes: 'Straight line from head to heels.' },
    { name: 'Dead bugs', kind: 'reps', equip: 'none', notes: 'Lower back stays pressed into the floor.' },
    { name: 'Bicycle crunches', kind: 'reps', equip: 'none', notes: 'Slow and controlled. Reps per side.' },
    { name: 'Side plank', kind: 'hold', equip: 'none', notes: 'Hold per side; stack your feet or drop a knee.' },
    { name: 'Bird dogs', kind: 'reps', equip: 'none', notes: 'Opposite arm and leg; reps per side.' },
    { name: 'Mountain climbers', kind: 'time', equip: 'none', level: 'intermediate', notes: 'Drive your knees in quickly.' },
  ],
  cardio: [
    { name: 'Brisk walk or easy jog', kind: 'time', equip: 'none', notes: 'You should be able to talk, but not sing.' },
    { name: 'Jumping jacks', kind: 'time', equip: 'none', notes: 'Work for the time, then rest briefly.' },
    { name: 'High knees', kind: 'time', equip: 'none', notes: 'Bring knees to hip height.' },
    { name: 'Skater hops', kind: 'time', equip: 'none', level: 'intermediate', notes: 'Hop side to side, land softly.' },
    { name: 'Burpees', kind: 'reps', equip: 'none', level: 'advanced', notes: 'Step back instead of jumping if needed.' },
    { name: 'Jump rope', kind: 'time', equip: 'rope', notes: 'Small hops on the balls of your feet.' },
    { name: 'Run/walk intervals', kind: 'time', equip: 'outdoor', notes: '1 minute jog, 1 minute walk, repeat.' },
    { name: 'Hill walk', kind: 'time', equip: 'outdoor', notes: 'Find a slope and keep a steady pace.' },
    { name: 'Incline treadmill walk', kind: 'time', equip: 'gym', notes: 'Set the incline to 6–10%.' },
    { name: 'Stationary bike', kind: 'time', equip: 'gym', notes: 'Moderate resistance, steady pace.' },
    { name: 'Rowing machine', kind: 'time', equip: 'gym', level: 'intermediate', notes: 'Push with your legs first, then pull.' },
  ],
  mobility: [
    { name: 'Cat-cow', kind: 'reps', equip: 'none', notes: 'Move slowly with your breathing.' },
    { name: 'Hip flexor stretch', kind: 'hold', equip: 'none', notes: 'Hold per side, tuck your hips under.' },
    { name: 'World’s greatest stretch', kind: 'reps', equip: 'none', notes: 'Lunge, twist and reach. Reps per side.' },
    { name: 'Hamstring stretch', kind: 'hold', equip: 'none', notes: 'Hinge forward with a flat back.' },
    { name: 'Child’s pose', kind: 'hold', equip: 'none', notes: 'Breathe deeply into your back.' },
    { name: 'Thoracic rotations', kind: 'reps', equip: 'none', notes: 'On all fours, open your chest to the ceiling.' },
  ],
}

const FOCUS = {
  'Full body': ['lower', 'upper', 'core', 'lower', 'upper', 'cardio', 'core'],
  'Full body B': ['upper', 'lower', 'core', 'upper', 'lower', 'cardio', 'mobility'],
  'Upper body': ['upper', 'upper', 'core', 'upper', 'upper', 'core'],
  'Lower body': ['lower', 'lower', 'core', 'lower', 'lower', 'core'],
  'Cardio & core': ['cardio', 'core', 'cardio', 'core', 'cardio', 'core'],
  'Core & mobility': ['mobility', 'core', 'mobility', 'core', 'mobility', 'mobility'],
}

const SPLITS = {
  1: { days: ['Wednesday'], focus: ['Full body'] },
  2: { days: ['Monday', 'Thursday'], focus: ['Full body', 'Full body B'] },
  3: { days: ['Monday', 'Wednesday', 'Friday'], focus: ['Full body', 'Cardio & core', 'Full body B'] },
  4: { days: ['Monday', 'Tuesday', 'Thursday', 'Friday'], focus: ['Upper body', 'Lower body', 'Cardio & core', 'Full body'] },
  5: { days: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'], focus: ['Upper body', 'Lower body', 'Cardio & core', 'Full body', 'Core & mobility'] },
  6: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], focus: ['Upper body', 'Lower body', 'Cardio & core', 'Upper body', 'Lower body', 'Core & mobility'] },
}

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const LEVELS = ['beginner', 'intermediate', 'advanced']

const DOSAGE = {
  beginner: { sets: '2', reps: '10', hold: '20 sec', time: '5 min' },
  intermediate: { sets: '3', reps: '12', hold: '40 sec', time: '8 min' },
  advanced: { sets: '4', reps: '12', hold: '60 sec', time: '10 min' },
}

function availableEquipment(q) {
  const set = new Set(['none'])
  const eq = (q.equipment || '').toLowerCase()
  if (q.location === 'gym') ['gym', 'dumbbells', 'rope'].forEach((e) => set.add(e))
  if (q.location === 'outdoors') set.add('outdoor')
  if (/dumbbell|weight|kettlebell/.test(eq)) set.add('dumbbells')
  if (/rope/.test(eq)) set.add('rope')
  return set
}

function buildSession(focus, q, gear, used) {
  const level = LEVELS.includes(q.experience) ? q.experience : 'beginner'
  const levelIdx = LEVELS.indexOf(level)
  const dose = DOSAGE[level]
  const count = Math.min(8, Math.max(3, Math.round(Number(q.minutes) / 7)))

  const pools = {}
  Object.entries(EXERCISES).forEach(([group, list]) => {
    const ok = list.filter((e) => gear.has(e.equip) && LEVELS.indexOf(e.level || 'beginner') <= levelIdx)
    // Equipment moves first (you have the gear, so use it), then shuffle within each group.
    pools[group] = [...shuffle(ok.filter((e) => e.equip !== 'none')), ...shuffle(ok.filter((e) => e.equip === 'none'))]
  })

  const picked = []
  const recipe = FOCUS[focus]
  for (let i = 0; picked.length < count && i < recipe.length * 3; i++) {
    const group = recipe[i % recipe.length]
    const next = pools[group].find((e) => !used.has(e.name) && !picked.includes(e))
      || pools[group].find((e) => !picked.includes(e))
    if (next) picked.push(next)
  }
  picked.forEach((e) => used.add(e.name))

  return picked.map((e) => {
    if (e.kind === 'time') return { name: e.name, sets: '1', reps: dose.time, notes: e.notes }
    if (e.kind === 'hold') return { name: e.name, sets: dose.sets, reps: dose.hold, notes: e.notes }
    return { name: e.name, sets: dose.sets, reps: dose.reps, notes: e.notes }
  })
}

function buildWeek(q) {
  const split = SPLITS[Math.min(6, Math.max(1, Number(q.daysPerWeek)))]
  const gear = availableEquipment(q)
  const used = new Set()
  const likes = (q.likes || '').split(',').map((s) => s.trim()).filter(Boolean)

  return WEEK.map((day) => {
    const idx = split.days.indexOf(day)
    if (idx === -1) {
      const active = likes.length ? `an easy walk or some ${likes[Math.floor(Math.random() * likes.length)]}` : 'an easy walk or stretching'
      return { day, focus: `Rest day: ${active} if you feel like it`, durationMin: 0, exercises: [] }
    }
    const focus = split.focus[idx]
    const exercises = buildSession(focus, q, gear, used)
    if (focus === 'Cardio & core' && likes.length) {
      exercises.unshift({ name: `Your pick: ${likes[0]}`, sets: '1', reps: '15–20 min', notes: 'Fun counts as cardio. Swap it in for any cardio move.' })
    }
    return { day, focus: focus.replace(' B', ''), durationMin: Number(q.minutes), exercises }
  })
}

// ---------------------------------------------------------------------------
// Tips and summary
// ---------------------------------------------------------------------------
function buildTips(q, minor) {
  const tips = [
    'Warm up for 5 minutes before each workout and stretch for a few minutes after.',
    'Aim for 8–10 hours of sleep. It’s when your muscles recover.',
  ]
  if (minor) tips.push('Don’t skip meals. Your body is still growing and needs steady fuel.')
  if (q.goal === 'gain') tips.push('Get some protein at every meal and add weight or reps a little each week.')
  if (q.goal === 'lose' && !minor) tips.push('Fill half your plate with vegetables. It keeps you full without extra calories.')
  if (q.goal === 'energy') tips.push('Pair carbs with protein at snacks so your energy doesn’t crash.')
  if (q.goal === 'fitness') tips.push('Track your reps each week. Beating last week by one rep is progress.')
  if (q.diet === 'vegan') tips.push('Eat B12-fortified foods (like fortified soy milk or cereal) regularly.')
  if (q.diet === 'vegetarian' || q.diet === 'eggetarian') tips.push('Mix beans, lentils, dairy and whole grains to get enough protein.')
  tips.push('If something hurts (not just feels hard), stop that exercise and try an easier version.')
  return tips.slice(0, 5)
}

const GOAL_TEXT = {
  energy: 'feel more energized every day',
  fitness: 'build stamina and strength',
  gain: 'build muscle steadily',
  lose: 'reach a healthier weight in a sustainable way',
}

export function generatePlan(q) {
  const targets = computeTargets(q)
  const proteinPerKg = q.goal === 'gain' ? 1.6 : 1.2
  const proteinG = Math.round(targets.weightKg * proteinPerKg)
  const fatG = Math.round((targets.dailyCalories * 0.28) / 9)
  const carbsG = Math.max(0, Math.round((targets.dailyCalories - proteinG * 4 - fatG * 9) / 4))
  const waterGlasses = Math.min(12, Math.max(6, Math.round(Number(q.weightLbs) / 2 / 8) + (['moderate', 'active'].includes(q.activity) ? 1 : 0)))

  return {
    summary: `This plan is built to help you ${GOAL_TEXT[q.goal] || 'feel your best'}, with ${q.daysPerWeek} workouts a week that fit into ${q.minutes} minutes. Press "New Plan" anytime for different meals and exercises.`,
    dailyCalories: targets.dailyCalories,
    maintenanceCalories: targets.maintenance,
    calorieNote: targets.note,
    macros: { proteinG, carbsG, fatG },
    waterGlasses,
    meals: pickMeals(q, targets.dailyCalories),
    workoutDays: buildWeek(q),
    tips: buildTips(q, targets.minor),
  }
}
