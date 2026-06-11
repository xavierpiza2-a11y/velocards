import { create } from 'zustand'
import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { getUserProfile, createUserProfile } from '@/lib/firestore'

const useAuthStore = create((set, get) => ({
  user:    null,   // Firebase Auth user
  profile: null,   // Firestore user doc
  loading: true,
  error:   null,

  // Initialise l'écouteur d'état Auth (appelé dans App.jsx)
  init() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid)
        set({ user: firebaseUser, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
  },

  async loginWithGoogle() {
    set({ error: null })
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const { user } = result
      let profile = await getUserProfile(user.uid)
      if (!profile) {
        await createUserProfile(user.uid, {
          displayName: user.displayName,
          email:       user.email,
          photoURL:    user.photoURL,
        })
        profile = await getUserProfile(user.uid)
      }
      set({ user, profile })
    } catch (err) {
      set({ error: err.message })
    }
  },

  async loginWithEmail(email, password) {
    set({ error: null })
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(result.user.uid)
      set({ user: result.user, profile })
    } catch (err) {
      set({ error: err.message })
    }
  },

  async register(email, password, displayName) {
    set({ error: null })
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(result.user.uid, { displayName, email })
      const profile = await getUserProfile(result.user.uid)
      set({ user: result.user, profile })
    } catch (err) {
      set({ error: err.message })
    }
  },

  async logout() {
    await signOut(auth)
    set({ user: null, profile: null })
  },

  isAdmin() {
    return get().profile?.role === 'admin'
  },
}))

export default useAuthStore
