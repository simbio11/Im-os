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

// Default Firebase Configuration for my-lmos-sync
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyClb1nzDhzXhbEPC6hbEaPflP5sf-35Gjs",
  authDomain: "my-lmos-sync.firebaseapp.com",
  projectId: "my-lmos-sync",
  storageBucket: "my-lmos-sync.firebasestorage.app",
  messagingSenderId: "314650615967",
  appId: "1:314650615967:web:685831e42dad54fd8a42aa"
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
 * Fetch initial user data from Firestore on login
 */
export async function getUserCloudData(uid) {
  if (!db || !uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.error("Error fetching initial cloud data:", e);
  }
  return null;
}

/**
 * Save user data to Firestore under their UID
 */
export async function syncUserDataToCloud(uid, data) {
  if (!db || !uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: Date.now(),
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
  return onSnapshot(userDocRef, { includeMetadataChanges: true }, (docSnap) => {
    // Ignore local uncommitted writes to prevent echo feedback loop
    if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
      onDataUpdate(docSnap.data());
    }
  }, (error) => {
    console.warn("Snapshot subscription error:", error);
  });
}
