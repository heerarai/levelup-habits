# LevelUp ✨

A gamified habit tracker. Track tasks and habits, earn XP, level up, unlock tiered challenges and badges, redeem rewards, log your mood, and get an AI-generated diet and workout plan from a short questionnaire.

**Stack:** React + Vite + Tailwind CSS · Firebase (Google sign-in + Firestore) · Vercel hosting

## Features

- **Google sign-in** with Firebase Authentication
- **Home:** level, streak and XP cards, a daily boost message, today's tasks, daily habits, recent badges
- **Plans:** 4-step questionnaire → a built-in generator makes a personalized meal plan and 7-day workout plan (respects eating style, foods to avoid, equipment, experience and favorite activities). "Add Today to Tasks" / "Sync Plan" turns today's meals, workout and water goal into tasks
- **Challenges:** Beginner (lvl 1–5), Intermediate (6–10), Advanced (11–15), Elite (16+). Higher tiers unlock as you level up; progress is tracked automatically
- **Dashboard:** completion rate, weekly comparison, daily performance chart, mood log and mood chart
- **Profile:** settings, badge collection, rewards shop (coins earned 1:1 with XP), delete-all-data button

### Game rules (edit them in `src/lib/game.js`)
- Tasks: Easy 10 / Medium 15 / Hard 25 XP. Habits: 5 XP per daily check-in. Finishing the first questionnaire: 100 XP
- Level 1→2 needs 100 XP, 2→3 needs 200, 3→4 needs 300, and so on
- Unchecking a task takes its XP back, so there's no XP farming

### How plans are made (`src/lib/planGenerator.js`)
Calories use the Mifflin-St Jeor formula and never go below 1,500 kcal. For anyone under 18 there is no calorie deficit, even if they choose "lose weight"; the plan focuses on balanced eating instead. Meals are picked from a library filtered by eating style and foods to avoid, and workouts are built from exercise pools matched to location, equipment and experience. No API key needed, and answers never leave the browser. Add your own meals or exercises by editing the lists in that file.

---

## Setup (about 15 minutes)

You need [Node.js 20+](https://nodejs.org) and a Google account.

### 1. Install
```bash
npm install
cp .env.example .env
```

### 2. Firebase
1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project** (Google Analytics is optional).
2. **Build → Authentication → Get started → Sign-in method → Google → Enable → Save.**
3. **Build → Firestore Database → Create database** → pick a location → start in **production mode**.
4. In Firestore, open the **Rules** tab, paste in the contents of `firestore.rules`, and click **Publish**. This ensures each person can only see their own data.
5. **Project settings (⚙️) → Your apps → Web (`</>`)** → register an app → copy the config values into `.env` (`VITE_FIREBASE_API_KEY`, etc.).

### 3. Run it
```bash
npm run dev
```
Open http://localhost:5173.

---

## Put it on GitHub
```bash
git init
git add .
git commit -m "LevelUp habit tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/levelup-habits.git
git push -u origin main
```
`.env` is in `.gitignore`, so your keys won't be uploaded. Double-check before pushing.

## Deploy as a web app (Vercel, free)
1. Sign in at [vercel.com](https://vercel.com) with GitHub → **Add New → Project** → import your repo. Vite is detected automatically.
2. Under **Environment Variables**, add every variable from your `.env`.
3. Click **Deploy**.
4. Copy your new domain (e.g. `levelup-habits.vercel.app`) into **Firebase → Authentication → Settings → Authorized domains**, or Google sign-in will be blocked there.

After that, every `git push` redeploys automatically.

## Project structure
```
src/lib/planGenerator.js  Diet and workout plan generator
src/lib/game.js           Levels, tiers, challenges, badges, rewards
src/lib/dates.js          Date and streak helpers
src/lib/firebase.js       Firebase setup
src/context/AuthContext   Google sign-in
src/context/DataContext   Live Firestore data and every action (complete task, log mood, ...)
src/pages/                Landing, Home, Plans, Challenges, Dashboard, Profile
firestore.rules           Database security rules
```

## Troubleshooting
- **"Firebase isn't configured yet":** `.env` is missing values. Restart `npm run dev` after editing it.
- **Sign-in popup closes or errors:** allow pop-ups, and make sure your domain is in Firebase's authorized domains.
- **"Missing or insufficient permissions":** the Firestore rules weren't published (Setup step 2.4).

*Plans are general guidance, not medical advice.*
