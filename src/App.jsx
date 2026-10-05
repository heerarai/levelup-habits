import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useData } from './context/DataContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Plans from './pages/Plans'
import Challenges from './pages/Challenges'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import { firebaseConfigured } from './lib/firebase'

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" aria-label="Loading" />
    </div>
  )
}

function AppShell({ children }) {
  const { user, loading } = useAuth()
  const { ready } = useData()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/" replace />
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 md:pb-16">{ready ? children : <Loading />}</main>
    </>
  )
}

export default function App() {
  if (!firebaseConfigured) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="card">
          <h1 className="text-2xl font-bold">Almost there</h1>
          <p className="mt-2 text-slate-600">
            Firebase isn’t configured yet. Copy <code>.env.example</code> to <code>.env</code>, fill in your Firebase keys,
            and restart <code>npm run dev</code>. The README walks through it step by step.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<AppShell><Home /></AppShell>} />
      <Route path="/plans" element={<AppShell><Plans /></AppShell>} />
      <Route path="/challenges" element={<AppShell><Challenges /></AppShell>} />
      <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
      <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
