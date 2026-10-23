import React, { useState, useEffect } from 'react';
import { BlazeLogo } from './BlazeLogo';
import {
  X,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Trash2,
  Edit3,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Heart,
  ListMusic,
  Download,
  ChevronRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  resetPassword,
  logoutUser,
  UserProfileData,
  saveUserProfile,
  setManualAccountPassword,
  validateSonicPassword
} from '../lib/firebase';
import { safeLocalStorageSet } from '../lib/safeStorage';

interface AuthPageProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userProfile: UserProfileData | null;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  themeColor: string;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
  showToast?: (msg: string) => void;
  onClearCache?: () => void;
  cachedTracksCount?: number;
  favoritesCount?: number;
  playlistsCount?: number;
}

export function AuthPage({
  isOpen,
  onClose,
  user,
  userProfile,
  theme = 'dark',
  toggleTheme,
  themeColor,
  onManualSync,
  isSyncing = false,
  showToast,
  onClearCache,
  cachedTracksCount = 0,
  favoritesCount = 0,
  playlistsCount = 0,
}: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [customDisplayName, setCustomDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Manual password drawer state for signed-in users
  const [isPasswordPanelOpen, setIsPasswordPanelOpen] = useState(false);
  const [manualPasswordInput, setManualPasswordInput] = useState('');
  const [showManualPassword, setShowManualPassword] = useState(false);
  const [isSavingManualPassword, setIsSavingManualPassword] = useState(false);
  const [manualPasswordFeedback, setManualPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localHasPassword, setLocalHasPassword] = useState(false);

  // Auto-delete / clear email, password, and form state whenever the user leaves the Account page
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setManualPasswordInput('');
      setShowManualPassword(false);
      setIsPasswordPanelOpen(false);
      setAuthError(null);
      setAuthSuccess(null);
      setManualPasswordFeedback(null);
      setIsEditingName(false);
      setShowDeleteConfirm(false);
      setAuthMode('login');
    }
  }, [isOpen, user]);

  const handleClosePage = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setManualPasswordInput('');
    setShowManualPassword(false);
    setIsPasswordPanelOpen(false);
    setAuthError(null);
    setAuthSuccess(null);
    setManualPasswordFeedback(null);
    setIsEditingName(false);
    setShowDeleteConfirm(false);
    setAuthMode('login');
    onClose();
  };

  if (!isOpen) return null;

  const liveDisallowedCharError =
    password.length > 0 && !/^[a-zA-Z0-9@_]+$/.test(password)
      ? 'Only @ and _ are allowed as special characters. Please use letters, numbers, @, or _.'
      : null;

  const liveManualDisallowedCharError =
    manualPasswordInput.length > 0 && !/^[a-zA-Z0-9@_]+$/.test(manualPasswordInput)
      ? 'Only @ and _ are allowed as special characters. Please use letters, numbers, @, or _.'
      : null;

  const hasLinkedPassword =
    localHasPassword ||
    Boolean(userProfile?.hasManualPassword) ||
    Boolean(user?.providerData?.some((p) => p.providerId === 'password'));

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await signInWithGoogle();
      if (showToast) showToast('Signed in with Google');
      setAuthSuccess('Signed in with Google.');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setAuthError(null);
        if (showToast) showToast('Sign-in window closed.');
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked by browser. Please allow popups or sign in with email below.');
      } else {
        setAuthError(err?.message || 'Could not complete Google sign-in.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Email / Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (authMode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password.');
        }
        const passRuleErr = validateSonicPassword(password);
        if (passRuleErr) {
          throw new Error(passRuleErr);
        }
        await signInWithEmail(email, password);
        setEmail('');
        setPassword('');
        if (showToast) showToast('Signed in successfully');
        setAuthSuccess('Signed in!');
      } else if (authMode === 'register') {
        if (!email.trim() || !password) {
          throw new Error('Please enter an email address and password.');
        }
        const passRuleErr = validateSonicPassword(password);
        if (passRuleErr) {
          throw new Error(passRuleErr);
        }
        await registerWithEmail(email, password);
        setEmail('');
        setPassword('');
        if (showToast) showToast('Account created!');
        setAuthSuccess('Account created!');
      } else if (authMode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(email);
        setAuthSuccess(
          'Password reset link sent to your Gmail! If you do not see it in your Primary inbox, check your Spam folder and mark it as "Not Spam".'
        );
        if (showToast) showToast('Reset link sent to your Gmail');
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Try "Continue with Google" or switch to "Create Account".';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already associated with an account. Please switch to the Sign In section to sign in.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Set / Update Manual Password for current account
  const handleSetManualPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const passError = validateSonicPassword(manualPasswordInput);
    if (passError) {
      setManualPasswordFeedback({ type: 'error', text: passError });
      return;
    }
    setIsSavingManualPassword(true);
    setManualPasswordFeedback(null);
    try {
      await setManualAccountPassword(manualPasswordInput);
      setLocalHasPassword(true);
      setManualPasswordInput('');
      setIsPasswordPanelOpen(false);
      setManualPasswordFeedback({
        type: 'success',
        text: 'Password saved for manual Gmail login.'
      });
      if (showToast) showToast('Password saved!');
    } catch (err: any) {
      setManualPasswordFeedback({
        type: 'error',
        text: err.message || 'Could not update password.'
      });
    } finally {
      setIsSavingManualPassword(false);
    }
  };

  // Save Display Name to Profile
  const handleSaveDisplayName = async () => {
    if (!user) return;
    const cleanName = customDisplayName.trim();
    if (!cleanName) return;
    try {
      await saveUserProfile(user.uid, {
        displayName: cleanName,
        email: user.email || '',
        updatedAt: new Date().toISOString()
      });
      setIsEditingName(false);
      if (showToast) showToast('Profile name updated');
    } catch (err: any) {
      if (showToast) showToast('Failed to update name');
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
      if (showToast) showToast('Signed out');
      setAuthSuccess(null);
      setAuthError(null);
    } catch (_) {
      setAuthError('Failed to sign out.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset / Clear Account Data
  const handleDeleteAccountData = async () => {
    try {
      safeLocalStorageSet('blaze_favs_tracks', []);
      safeLocalStorageSet('blaze_playlists', []);
      safeLocalStorageSet('blaze_listening_history', []);
      safeLocalStorageSet('blaze_recent_searches_list', []);
      if (onClearCache) onClearCache();
      setShowDeleteConfirm(false);
      if (showToast) showToast('Local data reset');
    } catch (_) {}
  };

  return (
    <div className={`fixed inset-0 z-[90] flex flex-col overflow-y-auto safe-area-pt safe-area-pb transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#090a10] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-20 px-4 sm:px-8 py-3.5 backdrop-blur-xl border-b flex items-center justify-between ${
        theme === 'dark' ? 'bg-[#090a10]/90 border-white/10' : 'bg-white/90 border-black/10'
      }`}>
        <button
          id="btn-settings-close"
          onClick={handleClosePage}
          className={`flex items-center gap-2 py-2 px-3 -ml-2 rounded-xl transition-all cursor-pointer font-bold text-xs ${
            theme === 'dark' ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'
          }`}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <span className="text-xs font-extrabold tracking-tight">
          {user ? 'Account & Profile' : 'Sonic Boomz Account'}
        </span>

        <div className="flex items-center gap-1.5">
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                theme === 'dark' ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-700'
              }`}
              aria-label="Toggle theme"
              title="Switch Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <button
            onClick={handleClosePage}
            className={`p-2 -mr-1 rounded-xl transition-colors cursor-pointer ${
              theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'
            }`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-1 w-full max-w-lg mx-auto px-5 py-6 sm:py-10 flex flex-col justify-center">
        {user ? (
          /* ========================================================================= */
          /* SIGNED-IN PROFESSIONAL ACCOUNT & PROFILE PAGE */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Profile Hero Section */}
            <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left ${
              theme === 'dark' ? 'bg-white/[0.04] border-white/10' : 'bg-white border-black/10 shadow-sm'
            }`}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[var(--theme-color)] shadow-md shrink-0"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-md shrink-0"
                  style={{
                    backgroundColor: themeColor,
                    color: themeColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'
                  }}
                >
                  {(userProfile?.displayName || user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={customDisplayName}
                      onChange={(e) => setCustomDisplayName(e.target.value)}
                      placeholder="Display name"
                      className={`flex-1 rounded-xl px-3 py-1.5 text-sm font-bold border focus:outline-none ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-gray-100 border-black/15 text-gray-900'
                      }`}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      className="p-2 rounded-xl bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] cursor-pointer"
                      title="Save"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className={`p-2 rounded-xl cursor-pointer ${
                        theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-black/5 text-gray-600'
                      }`}
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl font-black tracking-tight truncate">
                      {userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Music Enthusiast'}
                    </h1>
                    <button
                      onClick={() => {
                        setCustomDisplayName(userProfile?.displayName || user.displayName || '');
                        setIsEditingName(true);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'
                      }`}
                      title="Edit Name"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {user.email}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-emerald-500 font-semibold mt-2">
                  <CheckCircle2 size={13} />
                  <span>Cloud Account Connected</span>
                </div>
              </div>
            </div>

            {/* Clean Library Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border text-center ${
                theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/10 shadow-2xs'
              }`}>
                <div className="flex items-center justify-center text-pink-500 mb-1">
                  <Heart size={16} />
                </div>
                <div className="text-lg font-black tabular-nums">{favoritesCount}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Liked Songs</div>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${
                theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/10 shadow-2xs'
              }`}>
                <div className="flex items-center justify-center text-indigo-500 mb-1">
                  <ListMusic size={16} />
                </div>
                <div className="text-lg font-black tabular-nums">{playlistsCount}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Playlists</div>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${
                theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/10 shadow-2xs'
              }`}>
                <div className="flex items-center justify-center text-emerald-500 mb-1">
                  <Download size={16} />
                </div>
                <div className="text-lg font-black tabular-nums">{cachedTracksCount}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Downloads</div>
              </div>
            </div>

            {/* Feedback Banner for Password Save */}
            {manualPasswordFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 border ${
                  manualPasswordFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
                    : 'bg-red-500/10 border-red-500/25 text-red-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {manualPasswordFeedback.type === 'success' ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0" />
                  )}
                  <span className="font-medium">{manualPasswordFeedback.text}</span>
                </div>
                <button
                  onClick={() => setManualPasswordFeedback(null)}
                  className="p-1 opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Clean Settings & Account Controls List */}
            <div className={`rounded-3xl border divide-y overflow-hidden ${
              theme === 'dark'
                ? 'bg-white/[0.03] border-white/10 divide-white/10'
                : 'bg-white border-black/10 divide-black/10 shadow-2xs'
            }`}>
              {/* 1. Manual Password Control */}
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900'
                    }`}>
                      <KeyRound size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold">Password Login</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {hasLinkedPassword ? 'Linked to your Gmail' : 'Set a password for manual login'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordPanelOpen(!isPasswordPanelOpen);
                      setManualPasswordInput('');
                      setManualPasswordFeedback(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isPasswordPanelOpen
                        ? theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-black/10 text-gray-700'
                        : 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)]'
                    }`}
                  >
                    {isPasswordPanelOpen ? 'Cancel' : hasLinkedPassword ? 'Change' : 'Set Password'}
                  </button>
                </div>

                {isPasswordPanelOpen && (
                  <form onSubmit={handleSetManualPassword} className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
                    <div className="relative">
                      <input
                        type={showManualPassword ? 'text' : 'password'}
                        value={manualPasswordInput}
                        onChange={(e) => {
                          setManualPasswordInput(e.target.value);
                          setManualPasswordFeedback(null);
                        }}
                        placeholder="Letters + numbers (optional @ or _)"
                        autoComplete="new-password"
                        autoFocus
                        className={`w-full rounded-xl py-2.5 pl-9 pr-10 text-xs border focus:outline-none ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/15 text-white'
                            : 'bg-gray-50 border-black/15 text-gray-900'
                        }`}
                      />
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowManualPassword(!showManualPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                        aria-label={showManualPassword ? 'Hide password' : 'Show password'}
                      >
                        {showManualPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {liveManualDisallowedCharError ? (
                      <p className="text-[11px] text-red-500 font-medium">
                        {liveManualDisallowedCharError}
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Min 6 chars · Mix of letters (a–z) & numbers (0–9) · Only @ and _ allowed
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Use with {user.email} on any device.
                      </span>
                      <button
                        type="submit"
                        disabled={isSavingManualPassword}
                        className="px-4 py-2 rounded-xl bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] font-bold text-xs hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                      >
                        {isSavingManualPassword ? 'Saving...' : 'Save Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2. Cloud Sync Row */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900'
                  }`}>
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold">Cloud Sync</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      Sync playlists & liked songs
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onManualSync && onManualSync()}
                  disabled={isSyncing}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/15 text-white'
                      : 'bg-black/5 hover:bg-black/10 text-gray-900'
                  }`}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              {/* 3. Offline Storage Row */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900'
                  }`}>
                    <Download size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold">Offline Downloads</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {cachedTracksCount} {cachedTracksCount === 1 ? 'song' : 'songs'} saved on device
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearCache}
                  disabled={cachedTracksCount === 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-40 ${
                    theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/15 text-white'
                      : 'bg-black/5 hover:bg-black/10 text-gray-900'
                  }`}
                >
                  Clear
                </button>
              </div>

              {/* 4. Reset Local Session Row */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <Trash2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold">Reset Local Data</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      Clear local history and cached files
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              id="btn-signout"
              onClick={handleSignOut}
              disabled={authLoading}
              className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/15 active:scale-[0.99] text-red-500 border border-red-500/20 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>{authLoading ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* SIGNED-OUT CLEAN, PROFESSIONAL SIGN IN / CREATE ACCOUNT PAGE */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Brand & Concise Heading */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <BlazeLogo themeColor={themeColor} size="lg" showText={false} className="mb-1" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {authMode === 'login' && 'Welcome Back'}
                {authMode === 'register' && 'Create Account'}
                {authMode === 'forgot' && 'Reset Password'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {authMode === 'forgot'
                  ? 'Enter your email to receive a password reset link.'
                  : 'Sign in to sync your songs, playlists, and downloads.'}
              </p>
            </div>

            {/* Clean Segmented Switcher (Sign In vs Create Account) */}
            {authMode !== 'forgot' && (
              <div className={`grid grid-cols-2 p-1 rounded-2xl border ${
                theme === 'dark' ? 'bg-white/[0.04] border-white/10' : 'bg-black/5 border-black/5'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setPassword('');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setPassword('');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Google Sign-In Button */}
            {authMode !== 'forgot' && (
              <div className="space-y-4">
                <button
                  id="btn-signin-google"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer border ${
                    theme === 'dark'
                      ? 'bg-white text-gray-900 hover:bg-gray-100 border-white'
                      : 'bg-white text-gray-900 hover:bg-gray-50 border-black/15'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authLoading ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                  <span className="text-[11px] font-semibold text-gray-400">or with email</span>
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            )}

            {/* Error & Success Feedback */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{authError}</span>
                </div>
                {authMode === 'register' && authError.toLowerCase().includes('sign in') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className="self-start px-3.5 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Switch to Sign In
                  </button>
                )}
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    className={`w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm border focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] ${
                      theme === 'dark'
                        ? 'bg-white/[0.04] border-white/10 text-white'
                        : 'bg-white border-black/15 text-gray-900'
                    }`}
                  />
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Password
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setPassword('');
                          setAuthError(null);
                          setAuthSuccess(null);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-semibold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="Letters + numbers (optional @ or _)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      className={`w-full rounded-2xl py-3.5 pl-10 pr-11 text-sm border focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)] ${
                        theme === 'dark'
                          ? 'bg-white/[0.04] border-white/10 text-white'
                          : 'bg-white border-black/15 text-gray-900'
                      }`}
                    />
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {liveDisallowedCharError ? (
                    <p className="text-[11px] text-red-500 font-medium mt-1.5">
                      {liveDisallowedCharError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                      Min 6 characters · Mix of letters (a–z) & numbers (0–9) · Special characters: only @ and _
                    </p>
                  )}
                </div>
              )}

              <button
                id="btn-auth-submit"
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-[var(--theme-color)] text-[var(--theme-text-color,#ffffff)] border border-[var(--theme-border-color,transparent)] font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : authMode === 'login' ? (
                  <>
                    <LogIn size={17} />
                    <span>Sign In</span>
                  </>
                ) : authMode === 'register' ? (
                  <>
                    <UserPlus size={17} />
                    <span>Create Account</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={17} />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            {authMode === 'forgot' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-sm p-6 rounded-3xl border text-center space-y-4 ${
            theme === 'dark' ? 'bg-[#141522] border-white/10 text-white' : 'bg-white border-black/10 text-gray-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-black">Reset Local Data?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This will clear locally cached files and history on this device. Your cloud account remains safe.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-black/5 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountData}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
