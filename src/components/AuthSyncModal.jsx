import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Check, 
  X, 
  Sparkles, 
  LogIn, 
  LogOut, 
  Key, 
  HelpCircle, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  isConfigured, 
  getFirebaseConfig, 
  saveFirebaseConfig 
} from '../services/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

export function AuthSyncModal({ isOpen, onClose, onCloudDataLoaded }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'config'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Config Inputs
  const currentConfig = getFirebaseConfig();
  const [apiKeyInput, setApiKeyInput] = useState(currentConfig.apiKey || '');
  const [authDomainInput, setAuthDomainInput] = useState(currentConfig.authDomain || '');
  const [projectIdInput, setProjectIdInput] = useState(currentConfig.projectId || '');
  const [appIdInput, setAppIdInput] = useState(currentConfig.appId || '');

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user);
      });
      return () => unsubscribe();
    }
  }, []);

  if (!isOpen) return null;

  // Google Login
  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      setAuthError("먼저 아래 [Firebase 설정] 탭에서 Firebase 프로젝트 키를 등록해주세요.");
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (e) {
      console.error(e);
      setAuthError("구글 로그인 실패: " + (e.message || "오류가 발생했습니다."));
    } finally {
      setLoading(false);
    }
  };

  // Email Login / Signup
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!auth) {
      setAuthError("먼저 아래 [Firebase 설정] 탭에서 Firebase 키를 등록해주세요.");
      return;
    }
    if (!email || !password) {
      setAuthError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (e) {
      console.error(e);
      if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        setAuthError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (e.code === 'auth/email-already-in-use') {
        setAuthError("이미 가입된 이메일 주소입니다. 로그인으로 전환해주세요.");
      } else {
        setAuthError("인증 실패: " + (e.message || "오류가 발생했습니다."));
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setCurrentUser(null);
    }
  };

  // Save Config
  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || !projectIdInput.trim()) {
      setAuthError("API Key와 Project ID는 필수 항목입니다.");
      return;
    }

    saveFirebaseConfig({
      apiKey: apiKeyInput.trim(),
      authDomain: authDomainInput.trim() || `${projectIdInput.trim()}.firebaseapp.com`,
      projectId: projectIdInput.trim(),
      storageBucket: `${projectIdInput.trim()}.appspot.com`,
      messagingSenderId: "123456789",
      appId: appIdInput.trim()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-sync-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="panel-title-with-icon">
            <Cloud size={24} className="text-purple" />
            <div>
              <div className="flex items-center gap-2">
                <h4>PC ↔ 모바일 실시간 클라우드 동기화</h4>
                <span className="badge badge-purple">Firebase Live Sync</span>
              </div>
              <p className="text-muted text-xs mt-1">
                폰에서 체크한 루틴/일정이 컴퓨터에도 0.1초 만에 자동 동기화됩니다.
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Sync Benefits Graphic Banner */}
        <div className="sync-graphic-banner glass-card mt-3">
          <div className="sync-device-node">
            <Monitor size={20} className="text-cyan" />
            <span className="text-xs font-bold mt-1">내 컴퓨터 (PC)</span>
          </div>
          <div className="sync-arrows-pulse">
            <RefreshCw size={16} className="text-purple spin-slow" />
            <span className="text-xs text-purple font-mono">Real-time Live Sync</span>
          </div>
          <div className="sync-device-node">
            <Smartphone size={20} className="text-emerald" />
            <span className="text-xs font-bold mt-1">스마트폰 (모바일)</span>
          </div>
        </div>

        {/* Current Login Status Banner */}
        {currentUser ? (
          <div className="logged-in-status-box glass-card mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="status-dot-pulse emerald"></div>
                <div>
                  <div className="text-xs font-bold text-highlight">
                    {currentUser.email || currentUser.displayName || "로그인됨"}
                  </div>
                  <span className="text-muted text-xs">🟢 모든 기기 간 실시간 동기화 활성화됨</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={13} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switcher Pills */}
            <div className="auth-mode-tabs mt-3">
              <button 
                className={`auth-tab-pill ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                로그인
              </button>
              <button 
                className={`auth-tab-pill ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              >
                회원가입
              </button>
              <button 
                className={`auth-tab-pill ${authMode === 'config' ? 'active' : ''}`}
                onClick={() => { setAuthMode('config'); setAuthError(''); }}
              >
                <Key size={12} />
                <span>Firebase 키 설정</span>
              </button>
            </div>

            {authError && (
              <div className="auth-error-banner text-rose text-xs mt-2 glass-card p-2">
                {authError}
              </div>
            )}

            {/* LOGIN / SIGNUP FORM */}
            {(authMode === 'login' || authMode === 'signup') && (
              <div className="auth-form-wrapper mt-3">
                <button 
                  className="btn btn-secondary w-full google-login-btn mb-3"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google 계정으로 원클릭 {authMode === 'signup' ? '가입' : '로그인'}</span>
                </button>

                <div className="auth-divider-line text-xs text-muted">
                  <span>또는 이메일로 계속하기</span>
                </div>

                <form onSubmit={handleEmailAuth} className="mt-3 flex flex-col gap-2">
                  <div>
                    <label className="text-xs text-muted block mb-1">이메일 주소</label>
                    <input 
                      type="email" 
                      className="input-text w-full"
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1">비밀번호</label>
                    <input 
                      type="password" 
                      className="input-text w-full"
                      placeholder="6자리 이상 비밀번호"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-full mt-2"
                    disabled={loading}
                  >
                    <LogIn size={15} />
                    <span>{loading ? '처리 중...' : authMode === 'signup' ? '무료 계정 생성' : '로그인 & 동기화 시작'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* FIREBASE CONFIG INPUTS */}
            {authMode === 'config' && (
              <form onSubmit={handleSaveConfig} className="firebase-config-form mt-3">
                <div className="guide-callout text-xs text-muted glass-card p-3 mb-3">
                  <div className="font-bold text-purple mb-1">💡 Firebase 콘솔 무료 키 등록:</div>
                  1. <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-cyan underline">Firebase 콘솔</a>에 구글 계정으로 로그인 후 프로젝트를 생성합니다.<br/>
                  2. <strong>웹 앱(&lt;/&gt;)</strong>을 추가하면 발급되는 설정값을 아래에 붙여넣으세요.
                </div>

                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-xs text-muted block mb-1">API Key (apiKey)</label>
                    <input 
                      type="text" 
                      className="input-text w-full mono text-xs"
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1">Project ID (projectId)</label>
                    <input 
                      type="text" 
                      className="input-text w-full mono text-xs"
                      placeholder="my-lmos-project"
                      value={projectIdInput}
                      onChange={e => setProjectIdInput(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1">App ID (appId)</label>
                    <input 
                      type="text" 
                      className="input-text w-full mono text-xs"
                      placeholder="1:123456789:web:abcdef"
                      value={appIdInput}
                      onChange={e => setAppIdInput(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-2">
                    <Check size={14} />
                    <span>Firebase 키 저장 & 앱 재시작</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
