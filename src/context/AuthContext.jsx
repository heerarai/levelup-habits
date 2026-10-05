import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || 'Friend',
      email: user.email || '',
      photoURL: user.photoURL || '',
      xp: 0,
      coins: 0,
      activeDays: [],
      badges: [],
      challenges: {},
      redeemed: [],
      profile: { age: '', grade: '', interests: [] },
      questionnaire: null,
      plan: null,
      planStatus: 'none',
      stats: { tasksCompleted: 0, habitChecks: 0, moodsLogged: 0, challengesCompleted: 0, bestStreak: 0 },
      createdAt: serverTimestamp(),
    })
    return true
  }
  return false
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) await ensureUserDoc(u)
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const isNew = await ensureUserDoc(result.user)
    return { user: result.user, isNew }
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
