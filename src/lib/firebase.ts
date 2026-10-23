import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  browserPopupRedirectResolver,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  updatePassword,
  signOut, 
  sendPasswordResetEmail, 
  verifyPasswordResetCode,
  confirmPasswordReset,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  setLogLevel,
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Track, Playlist } from '../types';

export interface UserProfileData {
  uid: string;
  email: string | null;
  username: string;
  displayName: string | null;
  photoURL: string | null;
  hasManualPassword?: boolean;
  manualPasswordRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserMusicCloudData {
  favorites?: Track[];
  playlists?: Playlist[];
  followedArtists?: string[];
  recentSearches?: string[];
  themeColor?: string;
  darkMode?: boolean;
  audioQuality?: string;
  eqPreset?: string;
  updatedAt?: any;
}

const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

// Initialize Firebase App instance safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Suppress noisy internal Firestore WebChannel retry warnings when operating in offline/hybrid mode
try {
  setLogLevel('silent');
} catch (_) {}

// Initialize Firestore with Database ID and automatic long-polling fallback for iframe/proxy resilience
const databaseId = (firebaseConfigJson as any).firestoreDatabaseId || '(default)';
function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
      },
      databaseId
    );
  } catch (_) {
    return getFirestore(app, databaseId);
  }
}
export const db = createFirestoreInstance();

// Validate connection to Firestore when online and authenticated
async function testConnection() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  if (!auth.currentUser) return;
  try {
    await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
  } catch (_) {
    // Client gracefully operates in offline/hybrid mode until backend is reachable
  }
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Validates a Sonic Boomz password:
 * - Minimum 6 characters
 * - Only letters (a-z, A-Z), numbers (0-9), and @ or _ (underscore) are allowed
 * - Must include a mix of at least one letter (uppercase optional; lowercase is fine) and at least one number
 */
export function validateSonicPassword(password: string): string | null {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (!/^[a-zA-Z0-9@_]+$/.test(password)) {
    return 'Only letters, numbers, and the special characters @ and _ are allowed.';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must be a mix of letters (a-z) and numbers (0-9).';
  }
  return null;
}

const MANUAL_SESSION_STORAGE_KEY = 'sonic_manual_auth_session_v1';

type AuthSubscriber = (user: User | null) => void;
const authSubscribers = new Set<AuthSubscriber>();
let currentManualUser: User | null = null;
const musicDataListeners = new Map<string, Set<(data: UserMusicCloudData | null) => void>>();

function createSyntheticUser(profile: UserProfileData): User {
  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Music Enthusiast'),
    photoURL: profile.photoURL || null,
    emailVerified: true,
    isAnonymous: false,
    providerData: [
      {
        providerId: 'password',
        uid: profile.email || profile.uid,
        displayName: profile.displayName || null,
        email: profile.email || null,
        phoneNumber: null,
        photoURL: profile.photoURL || null,
      },
    ],
  } as unknown as User;
}

function loadStoredManualUser(): User | null {
  try {
    const raw = localStorage.getItem(MANUAL_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfileData;
    if (parsed && parsed.uid && parsed.email) {
      return createSyntheticUser(parsed);
    }
  } catch (_) {}
  return null;
}

function saveStoredManualUser(profile: UserProfileData | null): void {
  try {
    if (!profile) {
      localStorage.removeItem(MANUAL_SESSION_STORAGE_KEY);
      currentManualUser = null;
    } else {
      localStorage.setItem(MANUAL_SESSION_STORAGE_KEY, JSON.stringify(profile));
      currentManualUser = createSyntheticUser(profile);
    }
  } catch (_) {}
}

currentManualUser = loadStoredManualUser();

export function getActiveAuthUser(): User | null {
  return auth.currentUser || currentManualUser;
}

function notifyAuthSubscribers(): void {
  const active = getActiveAuthUser();
  authSubscribers.forEach((cb) => {
    try {
      cb(active);
    } catch (_) {}
  });
}

onAuthStateChanged(auth, (fbUser) => {
  if (fbUser) {
    // When Firebase Auth signs in (e.g., Google), clear any separate synthetic session
    saveStoredManualUser(null);
    testConnection();
  }
  notifyAuthSubscribers();
});

export function subscribeToAuthChanges(callback: AuthSubscriber): () => void {
  authSubscribers.add(callback);
  callback(getActiveAuthUser());
  return () => {
    authSubscribers.delete(callback);
  };
}

/**
 * Clear all personal local storage data when signing out so the app returns to a fresh state
 */
export function clearLocalUserSessionData(): void {
  const keysToRemove = [
    'blaze_favs_tracks',
    'blaze_playlists',
    'blaze_followed_artists',
    'sonic_cached_followed_hits',
    'sonic_cached_followed_avatars',
    'sonic_listening_history',
    'sonic_recent_searches_list',
    'blaze_listening_history',
    'blaze_recent_searches_list',
    'sonic_cached_home_widgets_v1',
    MANUAL_SESSION_STORAGE_KEY,
  ];
  for (const key of keysToRemove) {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  }
  currentManualUser = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sonic-auth-reset'));
  }
}

let activeGoogleSignInPromise: Promise<User> | null = null;

/**
 * Sign in with Google Popup
 * Unifies with Email/Password account for the same Gmail and preserves manual password login
 */
export async function signInWithGoogle(): Promise<User> {
  if (activeGoogleSignInPromise) {
    return activeGoogleSignInPromise;
  }

  activeGoogleSignInPromise = (async () => {
    let user: User;
    try {
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      user = result.user;
    } catch (err: any) {
      // On some browsers/iframes, the popup closes a split-second after auth completes
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        await new Promise((r) => setTimeout(r, 300));
        if (auth.currentUser) {
          user = auth.currentUser;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const cleanEmail = user.email ? user.email.trim().toLowerCase() : null;
    const emailPrefix = cleanEmail ? cleanEmail.split('@')[0] : 'music_lover';

    // 1. Sync with unified backend account store by Gmail so any manual password or music data created via Email+Password is unified
    let serverAccount: { profile?: UserProfileData; musicData?: UserMusicCloudData } | null = null;
    if (cleanEmail) {
      try {
        const res = await fetch('/api/auth/sync-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: cleanEmail,
            displayName: user.displayName || emailPrefix,
            photoURL: user.photoURL || null,
          }),
        });
        if (res.ok) {
          serverAccount = await res.json();
        }
      } catch (_) {}
    }

    const existingProfile = await getUserProfile(user.uid, cleanEmail);

    // Re-attach the user's saved manual password in Firebase Auth if present
    const savedPassRef = existingProfile?.manualPasswordRef;
    if (savedPassRef && savedPassRef.length >= 6) {
      try {
        await updatePassword(user, savedPassRef);
      } catch (_) {}
    }

    const resolvedDisplayName =
      existingProfile?.displayName ||
      serverAccount?.profile?.displayName ||
      user.displayName ||
      emailPrefix;

    const mergedProfile: Partial<UserProfileData> = {
      uid: user.uid,
      email: cleanEmail || existingProfile?.email || null,
      username:
        existingProfile?.username ||
        serverAccount?.profile?.username ||
        emailPrefix.toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
      displayName: resolvedDisplayName,
      photoURL: user.photoURL || existingProfile?.photoURL || serverAccount?.profile?.photoURL || null,
      hasManualPassword: Boolean(
        existingProfile?.hasManualPassword ||
        existingProfile?.manualPasswordRef ||
        serverAccount?.profile?.hasManualPassword
      ),
      manualPasswordRef: existingProfile?.manualPasswordRef || undefined,
    };

    await saveUserProfile(user.uid, mergedProfile);

    // If the user had music data from Email/Password login, ensure it is also synced to Firestore
    if (serverAccount?.musicData) {
      await saveUserMusicData(user.uid, serverAccount.musicData);
      notifyLocalMusicDataListeners(user.uid, serverAccount.musicData);
    }

    notifyAuthSubscribers();
    return user;
  })();

  try {
    return await activeGoogleSignInPromise;
  } finally {
    activeGoogleSignInPromise = null;
  }
}

/**
 * Sign in with Email and Password
 * Works seamlessly across both Firebase Auth and the unified Gmail/Password store
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const emailPrefix = cleanEmail.split('@')[0] || 'music_lover';

  // 1. Try unified backend login first or in parallel so accounts created via Email/Password or linked from Google always work
  let backendData: { profile?: UserProfileData; musicData?: UserMusicCloudData; error?: string; code?: string } | null = null;
  let backendOk = false;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: pass }),
    });
    backendData = await res.json();
    backendOk = res.ok;
  } catch (_) {}

  // 2. Also attempt Firebase Email/Password sign-in if enabled
  let fbUser: User | null = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    fbUser = cred.user;
  } catch (fbErr: any) {
    // If Firebase Auth succeeded on backend, we use the unified session even if Firebase stripped the password provider on Google login or has email auth disabled
    if (!backendOk) {
      const err: any = new Error(
        backendData?.error ||
        'Invalid email or password. If you joined with "Continue with Google", tap "Continue with Google" above (you can set a manual password inside your profile), or switch to "Create Account" to link a password.'
      );
      err.code = backendData?.code || fbErr?.code || 'auth/invalid-credential';
      throw err;
    }
  }

  // If Firebase login succeeded (e.g. after a password reset link) and backend had an older password or none yet, sync it to backend
  if (fbUser && !backendOk) {
    try {
      const syncRes = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          uid: fbUser.uid,
          newPassword: pass,
        }),
      });
      if (syncRes.ok) {
        backendData = await syncRes.json();
      }
    } catch (_) {}
  }

  const resolvedUid = fbUser?.uid || backendData?.profile?.uid || `sb_${cleanEmail.replace(/[^a-z0-9]/g, '')}`;
  const existingProfile = await getUserProfile(resolvedUid, cleanEmail);

  const finalProfile: UserProfileData = {
    uid: resolvedUid,
    email: cleanEmail,
    username:
      existingProfile?.username ||
      backendData?.profile?.username ||
      emailPrefix.replace(/[^a-z0-9_.-]/g, ''),
    displayName:
      existingProfile?.displayName ||
      backendData?.profile?.displayName ||
      fbUser?.displayName ||
      emailPrefix,
    photoURL:
      fbUser?.photoURL ||
      existingProfile?.photoURL ||
      backendData?.profile?.photoURL ||
      null,
    hasManualPassword: true,
    manualPasswordRef: pass,
    updatedAt: new Date().toISOString(),
  };

  await saveUserProfile(resolvedUid, finalProfile);

  if (fbUser) {
    saveStoredManualUser(null);
    notifyAuthSubscribers();
    if (backendData?.musicData) {
      notifyLocalMusicDataListeners(resolvedUid, backendData.musicData);
    }
    return fbUser;
  }

  // Fallback unified user session when Firebase Email/Password provider is disabled or unlinked by Google
  saveStoredManualUser(finalProfile);
  notifyAuthSubscribers();
  if (backendData?.musicData) {
    notifyLocalMusicDataListeners(resolvedUid, backendData.musicData);
  }
  return currentManualUser!;
}

/**
 * Register with Email and Password (no display name input required; automatically derived from email)
 * Strictly creates a new account. If the email is already associated with an existing account,
 * throws an error instructing the user to switch to the Sign In section rather than signing them in from Create Account.
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  username?: string, 
  displayName?: string
): Promise<User> {
  const passError = validateSonicPassword(pass);
  if (passError) {
    throw new Error(passError);
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailPrefix = cleanEmail.split('@')[0] || 'music_lover';
  const cleanUsername = (username?.trim() || emailPrefix).toLowerCase().replace(/[^a-z0-9_.-]/g, '') || 'user';
  const cleanDisplayName = displayName?.trim() || emailPrefix;

  // 1. Register in unified backend account store (strictly rejects if email is already associated with an account)
  let backendData: { profile?: UserProfileData; musicData?: UserMusicCloudData; error?: string; code?: string } | null = null;
  let backendStatus = 200;
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: pass,
        displayName: cleanDisplayName,
        username: cleanUsername,
      }),
    });
    backendStatus = res.status;
    backendData = await res.json();
    if (!res.ok) {
      const customErr: any = new Error(
        backendData?.error ||
        'This email is already associated with an account. Please switch to the Sign In section to sign in.'
      );
      customErr.code = backendData?.code || (res.status === 409 ? 'auth/email-already-in-use' : 'auth/registration-failed');
      throw customErr;
    }
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use' || err?.code === 'auth/registration-failed') {
      throw err;
    }
  }

  // 2. Attempt Firebase Email/Password registration if enabled in Firebase project
  let fbUser: User | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    fbUser = cred.user;
    try {
      await updateProfile(fbUser, { displayName: cleanDisplayName });
    } catch (_) {}
  } catch (fbErr: any) {
    if (fbErr?.code === 'auth/email-already-in-use') {
      // Do NOT sign the user in from the Create Account section if the email is already registered in Firebase Auth
      const customErr: any = new Error(
        'This email is already associated with an account. Please switch to the Sign In section to sign in.'
      );
      customErr.code = 'auth/email-already-in-use';
      throw customErr;
    }
    if (backendStatus >= 400) {
      throw fbErr;
    }
  }

  const resolvedUid = fbUser?.uid || backendData?.profile?.uid || `sb_${cleanEmail.replace(/[^a-z0-9]/g, '')}`;
  const finalProfile: UserProfileData = {
    uid: resolvedUid,
    email: cleanEmail,
    username: backendData?.profile?.username || cleanUsername,
    displayName: backendData?.profile?.displayName || cleanDisplayName,
    photoURL: fbUser?.photoURL || backendData?.profile?.photoURL || null,
    hasManualPassword: true,
    manualPasswordRef: pass,
    createdAt: backendData?.profile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveUserProfile(resolvedUid, finalProfile);

  if (fbUser) {
    saveStoredManualUser(null);
    notifyAuthSubscribers();
    if (backendData?.musicData) {
      notifyLocalMusicDataListeners(resolvedUid, backendData.musicData);
    }
    return fbUser;
  }

  saveStoredManualUser(finalProfile);
  notifyAuthSubscribers();
  if (backendData?.musicData) {
    notifyLocalMusicDataListeners(resolvedUid, backendData.musicData);
  }
  return currentManualUser!;
}

/**
 * Set or update manual password for the currently signed-in user (e.g. a user who signed in with Google
 * and wants a password to sign in manually with Email + Password on another device)
 */
export async function setManualAccountPassword(newPassword: string): Promise<void> {
  const activeUser = getActiveAuthUser();
  if (!activeUser) {
    throw new Error('You must be signed in to set a manual password.');
  }
  const passError = validateSonicPassword(newPassword);
  if (passError) {
    throw new Error(passError);
  }

  const cleanEmail = activeUser.email ? activeUser.email.trim().toLowerCase() : '';

  // 1. Always persist manual password in unified backend store so cross-device Email + Password login works immediately without requiring a second popup
  if (cleanEmail) {
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        uid: activeUser.uid,
        newPassword,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Could not save manual password.');
    }
  }

  // 2. Also update in Firebase Auth if currently signed in via Firebase SDK and recent login allows it
  if (auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (_) {
      // Backend store already saved the password and will re-link automatically on next login
    }
  }

  await saveUserProfile(activeUser.uid, {
    uid: activeUser.uid,
    email: cleanEmail || null,
    hasManualPassword: true,
    manualPasswordRef: newPassword,
  });
}

/**
 * Send password reset email with continue URL back to Sonic Boomz
 */
export async function resetPassword(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    if (typeof window !== 'undefined' && window.location?.origin) {
      await sendPasswordResetEmail(auth, cleanEmail, {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      return;
    }
  } catch (_) {
    // Fallback if continue URL domain is not in Firebase action code allowlist
  }
  await sendPasswordResetEmail(auth, cleanEmail);
}

/**
 * Verify a Firebase password reset oobCode and return the associated email
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
  return await verifyPasswordResetCode(auth, oobCode);
}

/**
 * Confirm password reset using oobCode and sync new password to unified Sonic Boomz account store
 */
export async function completePasswordReset(oobCode: string, newPassword: string): Promise<string> {
  const passError = validateSonicPassword(newPassword);
  if (passError) {
    throw new Error(passError);
  }
  const email = await verifyPasswordResetCode(auth, oobCode);
  await confirmPasswordReset(auth, oobCode, newPassword);
  const cleanEmail = email.trim().toLowerCase();
  try {
    await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        newPassword,
      }),
    });
  } catch (_) {}
  return cleanEmail;
}

/**
 * Sign out current user and clear local personal session data
 */
export async function logoutUser(): Promise<void> {
  clearLocalUserSessionData();
  try {
    await signOut(auth);
  } catch (_) {}
  notifyAuthSubscribers();
}

/**
 * Save / Update User Profile in Firestore and Unified Backend Store
 */
export async function saveUserProfile(userId: string, data: Partial<UserProfileData>): Promise<void> {
  const activeUser = getActiveAuthUser();
  const resolvedEmail = (data.email || activeUser?.email || '').trim().toLowerCase();
  const payload = {
    ...data,
    uid: userId,
    email: resolvedEmail || data.email || null,
    updatedAt: new Date().toISOString(),
  };

  // Save to unified backend store
  if (resolvedEmail || userId) {
    try {
      await fetch('/api/auth/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resolvedEmail,
          uid: userId,
          profile: payload,
        }),
      });
    } catch (_) {}
  }

  // Update local manual session if active
  if (currentManualUser && currentManualUser.uid === userId) {
    saveStoredManualUser({
      uid: userId,
      email: payload.email || currentManualUser.email,
      username: payload.username || (payload.email ? payload.email.split('@')[0] : 'user'),
      displayName: payload.displayName || currentManualUser.displayName,
      photoURL: payload.photoURL !== undefined ? payload.photoURL : currentManualUser.photoURL,
      hasManualPassword: payload.hasManualPassword ?? true,
    });
    notifyAuthSubscribers();
  }

  // Save to Firestore when authenticated with Firebase SDK
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, payload, { merge: true });
    } catch (_) {
      // Unified backend store already persisted the profile; Firestore will sync when reachable
    }
  }
}

/**
 * Retrieve User Profile from Firestore and Unified Backend Store
 */
export async function getUserProfile(userId: string, emailHint?: string | null): Promise<UserProfileData | null> {
  const activeUser = getActiveAuthUser();
  const resolvedEmail = (emailHint || activeUser?.email || '').trim().toLowerCase();

  let serverProfile: UserProfileData | null = null;
  try {
    const query = resolvedEmail
      ? `email=${encodeURIComponent(resolvedEmail)}`
      : `uid=${encodeURIComponent(userId)}`;
    const res = await fetch(`/api/auth/user-data?${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.profile) {
        serverProfile = data.profile as UserProfileData;
      }
    }
  } catch (_) {}

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const fbProfile = snap.data() as UserProfileData;
        return {
          ...serverProfile,
          ...fbProfile,
          hasManualPassword: Boolean(fbProfile.hasManualPassword || serverProfile?.hasManualPassword),
        };
      }
    } catch (_) {
      // Fall back to unified server profile when Firestore is temporarily offline
    }
  }

  return serverProfile;
}

function notifyLocalMusicDataListeners(userId: string, data: UserMusicCloudData | null) {
  const set = musicDataListeners.get(userId);
  if (set) {
    set.forEach((cb) => {
      try {
        cb(data);
      } catch (_) {}
    });
  }
}

/**
 * Save user music data (favorites, followed artists, preferences) to Firestore & Unified Store for cross-device sync
 */
export async function saveUserMusicData(userId: string, data: UserMusicCloudData): Promise<void> {
  const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === 'audioBlob') return undefined;
    if (value === undefined) return null;
    return value;
  }));

  const payload = {
    ...cleanData,
    userId,
    updatedAt: new Date().toISOString(),
  };

  const activeUser = getActiveAuthUser();
  const resolvedEmail = (activeUser?.email || '').trim().toLowerCase();

  if (resolvedEmail || userId) {
    try {
      await fetch('/api/auth/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resolvedEmail,
          uid: userId,
          musicData: payload,
        }),
      });
    } catch (_) {}
  }

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const musicRef = doc(db, 'users', userId, 'musicData', 'preferences');
      await setDoc(musicRef, payload, { merge: true });
    } catch (_) {
      // Unified backend store already persisted music data
    }
  }
}

/**
 * Load user music data from Firestore / Unified Store
 */
export async function getUserMusicData(userId: string): Promise<UserMusicCloudData | null> {
  const activeUser = getActiveAuthUser();
  const resolvedEmail = (activeUser?.email || '').trim().toLowerCase();

  let serverMusicData: UserMusicCloudData | null = null;
  try {
    const query = resolvedEmail
      ? `email=${encodeURIComponent(resolvedEmail)}`
      : `uid=${encodeURIComponent(userId)}`;
    const res = await fetch(`/api/auth/user-data?${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.musicData) {
        serverMusicData = data.musicData as UserMusicCloudData;
      }
    }
  } catch (_) {}

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const musicRef = doc(db, 'users', userId, 'musicData', 'preferences');
      const snap = await getDoc(musicRef);
      if (snap.exists()) {
        return {
          ...serverMusicData,
          ...(snap.data() as UserMusicCloudData),
        };
      }
    } catch (_) {
      // Fall back to unified server music data when Firestore is temporarily offline
    }
  }

  return serverMusicData;
}

/**
 * Subscribe to real-time updates for user music data across tabs/devices and both auth pathways
 */
export function subscribeUserMusicData(userId: string, onUpdate: (data: UserMusicCloudData | null) => void) {
  if (!musicDataListeners.has(userId)) {
    musicDataListeners.set(userId, new Set());
  }
  musicDataListeners.get(userId)!.add(onUpdate);

  // Immediately fetch from unified backend store as well so Email/Password and Google accounts share data
  getUserMusicData(userId).then((initialData) => {
    if (initialData) {
      onUpdate(initialData);
    }
  }).catch(() => {});

  let unsubscribeFirestore: (() => void) | null = null;
  if (auth.currentUser && auth.currentUser.uid === userId) {
    const musicRef = doc(db, 'users', userId, 'musicData', 'preferences');
    unsubscribeFirestore = onSnapshot(
      musicRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as UserMusicCloudData);
        }
      },
      () => {
        // Handled gracefully via unified backend store & offline cache
      }
    );
  }

  return () => {
    musicDataListeners.get(userId)?.delete(onUpdate);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
