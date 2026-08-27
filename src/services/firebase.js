// Firebase Configuration & Firestore Real-time Sync Service for L&M OS
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';

// Default Firebase Configuration (can be updated with user's real project config)
// You can also paste your config keys here or in localStorage!
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyReplaceWithYourOwn",
  authDomain: "lm-os-sync.firebaseapp.com",
  projectId: "lm-os-sync",
  storageBucket: "lm-os-sync.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Retrieve config from localStorage or default
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('lm_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to parse firebase config:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  localStorage.setItem('lm_firebase_config', JSON.stringify(config));
  // Reload app to re-initialize firebase
  window.location.reload();
}

const currentConfig = getFirebaseConfig();

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let isConfigured = false;

try {
  if (currentConfig.apiKey && currentConfig.apiKey !== "AIzaSyDummyKeyReplaceWithYourOwn") {
    app = initializeApp(currentConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    isConfigured = true;
  }
} catch (error) {
  console.warn("Firebase initialization skipped or invalid config:", error);
}

export { auth, db, googleProvider, isConfigured };

/**
 * Save user data to Firestore under their UID
 */
export async function syncUserDataToCloud(uid, data) {
  if (!db || !uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error("Cloud sync error:", e);
    return false;
  }
}

/**
 * Listen for real-time changes to user data across all devices
 */
export function subscribeToCloudUserData(uid, onDataUpdate) {
  if (!db || !uid) return () => {};
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      onDataUpdate(docSnap.data());
    }
  }, (error) => {
    console.warn("Snapshot subscription error:", error);
  });
}
