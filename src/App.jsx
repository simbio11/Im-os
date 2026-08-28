import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { LevelUpModal } from './components/LevelUpModal';
import { LevelSystemModal } from './components/LevelSystemModal';
import { ObsidianModal } from './components/ObsidianModal';
import { AuthSyncModal } from './components/AuthSyncModal';
import { 
  auth, 
  syncUserDataToCloud, 
  subscribeToCloudUserData,
  getUserCloudData 
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { DailyRoutines } from './components/DailyRoutines';
import { DietTracker } from './components/DietTracker';
import { RunningTracker } from './components/RunningTracker';
import { ExpenseTracker } from './components/ExpenseTracker';
import { MarketBriefing } from './components/MarketBriefing';
import { PolicyNewsTracker } from './components/PolicyNewsTracker';
import { SecEarningsBrief } from './components/SecEarningsBrief';
import { RagAssistant } from './components/RagAssistant';
import { PubMedCurator } from './components/PubMedCurator';
import { GithubAiTracker } from './components/GithubAiTracker';
import { DeepworkSoundscape } from './components/DeepworkSoundscape';
import { CalendarScheduler } from './components/CalendarScheduler';
import { DashboardCalendarWidget } from './components/DashboardCalendarWidget';
import { DashboardMarketWidget } from './components/DashboardMarketWidget';
import { DashboardCockpit } from './components/DashboardCockpit';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GeminiApiKeyModal } from './components/GeminiApiKeyModal';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { getStoredGeminiApiKey } from './services/geminiService';

import { 
  INITIAL_USER_PROFILE, 
  INITIAL_ROUTINES, 
  INITIAL_DIET_LOGS, 
  INITIAL_RUNNING_LOGS, 
  INITIAL_EXPENSES,
  AM_BRIEFING_CONTENT,
  PM_BRIEFING_CONTENT,
  PUBMED_DAILY_CURATION
} from './data/sampleData';
import { INITIAL_CALENDAR_EVENTS } from './data/calendarEvents';
import { YOUTUBE_PRESETS } from './data/soundPresets';

import { calculateLevelFromXP, fireLevelUpConfetti } from './utils/gamification';
import { playLevelUpSound } from './utils/audioSynth';

import { 
  Activity, 
  Flame, 
  TrendingUp, 
  Utensils, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Zap, 
  CheckSquare, 
  BookOpen, 
  Code2, 
  Headphones,
  Sliders,
  DollarSign,
  Clock,
  Calendar
} from 'lucide-react';

import './App.css';

const SCHEMA_VERSION = 'v2_clean_release_prod';

// One-time automatic cleanup of legacy demo sample items for production distribution
try {
  const currentVersion = localStorage.getItem('lm_schema_version');
  if (currentVersion !== SCHEMA_VERSION) {
    localStorage.removeItem('lm_user_profile');
    localStorage.removeItem('lm_routines');
    localStorage.removeItem('lm_diet_logs');
    localStorage.removeItem('lm_running_logs');
    localStorage.removeItem('lm_expenses');
    localStorage.removeItem('lm_calendar_events');
    localStorage.removeItem('lm_timeblocks');
    localStorage.setItem('lm_schema_version', SCHEMA_VERSION);
  }
} catch (e) {
  console.warn("Schema initialization error:", e);
}

// Legacy sample IDs filter to prevent old dummy data from cloud reappearing
const LEGACY_DUMMY_IDS = new Set([
  'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7',
  'e1', 'e2', 'e3', 'e4', 'e5',
  'evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8', 'evt-9',
  'd1', 'd2', 'run1', 'run2', 'run3',
  'tb1', 'tb2', 'tb3', 'tb4', 'tb5', 'tb6', 'tb7', 'tb8', 'tb9'
]);

export function App() {
  // 1. Persistent State with LocalStorage fallbacks
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...INITIAL_USER_PROFILE, 
          ...parsed, 
          xp: typeof parsed.xp === 'number' ? parsed.xp : INITIAL_USER_PROFILE.xp 
        };
      }
    } catch (e) {
      console.warn("User profile parse error:", e);
    }
    return INITIAL_USER_PROFILE;
  });

  const [routines, setRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_routines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(r => !LEGACY_DUMMY_IDS.has(r?.id));
      }
    } catch (e) {}
    return INITIAL_ROUTINES;
  });

  const [dietLogs, setDietLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_diet_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(d => !LEGACY_DUMMY_IDS.has(d?.id));
      }
    } catch (e) {}
    return INITIAL_DIET_LOGS;
  });

  const [runningLogs, setRunningLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_running_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(r => !LEGACY_DUMMY_IDS.has(r?.id));
      }
    } catch (e) {}
    return INITIAL_RUNNING_LOGS;
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(e => !LEGACY_DUMMY_IDS.has(e?.id));
      }
    } catch (e) {}
    return INITIAL_EXPENSES;
  });

  const [calendarEvents, setCalendarEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_calendar_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(ev => !LEGACY_DUMMY_IDS.has(ev?.id));
      }
    } catch (e) {}
    return INITIAL_CALENDAR_EVENTS;
  });

  // UI Navigation & Modal States (Supports PWA App Shortcuts via URL search param)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['dashboard', 'calendar', 'daily', 'expenses', 'market', 'rag', 'pubmed'].includes(tabParam)) {
        return tabParam;
      }
    } catch (e) {}
    return 'dashboard';
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [obsidianModalOpen, setObsidianModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [levelSystemModalOpen, setLevelSystemModalOpen] = useState(false);
  const [geminiKeyModalOpen, setGeminiKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => getStoredGeminiApiKey());
  const [ragInitialQuery, setRagInitialQuery] = useState('');

  // Sync Loop & Echo Prevention Refs
  const isRemoteUpdateRef = useRef(false);
  const isHydratedRef = useRef(false);

  // Monitor Auth State & Initial Cloud Hydration
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user?.uid) {
          isHydratedRef.current = false;
          try {
            const cloudData = await getUserCloudData(user.uid);
            if (cloudData) {
              // Apply existing cloud data to local state without triggering cloud write-back, filtering out any legacy dummy records
              isRemoteUpdateRef.current = true;
              if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
              if (cloudData.routines) setRoutines(cloudData.routines.filter(r => !LEGACY_DUMMY_IDS.has(r?.id)));
              if (cloudData.dietLogs) setDietLogs(cloudData.dietLogs.filter(d => !LEGACY_DUMMY_IDS.has(d?.id)));
              if (cloudData.runningLogs) setRunningLogs(cloudData.runningLogs.filter(r => !LEGACY_DUMMY_IDS.has(r?.id)));
              if (cloudData.expenses) setExpenses(cloudData.expenses.filter(e => !LEGACY_DUMMY_IDS.has(e?.id)));
              if (cloudData.calendarEvents) setCalendarEvents(cloudData.calendarEvents.filter(ev => !LEGACY_DUMMY_IDS.has(ev?.id)));
            } else {
              // Initial push for newly registered account
              await syncUserDataToCloud(user.uid, {
                userProfile,
                routines,
                dietLogs,
                runningLogs,
                expenses,
                calendarEvents
              });
            }
          } catch (e) {
            console.error("Hydration error:", e);
          } finally {
            isHydratedRef.current = true;
          }
        } else {
          isHydratedRef.current = false;
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Real-time Cloud Data Subscription (Device Sync)
  useEffect(() => {
    if (currentUser?.uid) {
      const unsubscribe = subscribeToCloudUserData(currentUser.uid, (cloudData) => {
        if (cloudData && isHydratedRef.current) {
          isRemoteUpdateRef.current = true;
          if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
          if (cloudData.routines) setRoutines(cloudData.routines.filter(r => !LEGACY_DUMMY_IDS.has(r?.id)));
          if (cloudData.dietLogs) setDietLogs(cloudData.dietLogs.filter(d => !LEGACY_DUMMY_IDS.has(d?.id)));
          if (cloudData.runningLogs) setRunningLogs(cloudData.runningLogs.filter(r => !LEGACY_DUMMY_IDS.has(r?.id)));
          if (cloudData.expenses) setExpenses(cloudData.expenses.filter(e => !LEGACY_DUMMY_IDS.has(e?.id)));
          if (cloudData.calendarEvents) setCalendarEvents(cloudData.calendarEvents.filter(ev => !LEGACY_DUMMY_IDS.has(ev?.id)));
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Sync to Cloud ONLY when local user makes modifications (not on remote echo or unhydrated mount)
  useEffect(() => {
    if (!currentUser?.uid || !isHydratedRef.current) {
      return;
    }

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    syncUserDataToCloud(currentUser.uid, {
      userProfile,
      routines,
      dietLogs,
      runningLogs,
      expenses,
      calendarEvents
    });
  }, [currentUser, userProfile, routines, dietLogs, runningLogs, expenses, calendarEvents]);

  // Global YouTube Music State
  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_active_music_track');
      return saved ? JSON.parse(saved) : YOUTUBE_PRESETS[0];
    } catch (e) {
      return YOUTUBE_PRESETS[0];
    }
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    localStorage.setItem('lm_active_music_track', JSON.stringify(currentTrack));
  }, [currentTrack]);

  const handleToggleMusic = () => {
    setIsMusicPlaying(prev => !prev);
  };

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    setIsMusicPlaying(true);
  };

  const handleShuffleMusic = () => {
    const currentIndex = YOUTUBE_PRESETS.findIndex(p => p.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % YOUTUBE_PRESETS.length;
    const nextTrack = YOUTUBE_PRESETS[nextIndex];
    setCurrentTrack(nextTrack);
    setIsMusicPlaying(true);
  };

  const handleResetXP = () => {
    const freshProfile = {
      ...INITIAL_USER_PROFILE,
      xp: 0,
      level: 1,
      tier: "입만 산 애송이"
    };
    setUserProfile(freshProfile);
    localStorage.setItem('lm_user_profile', JSON.stringify(freshProfile));
  };

  // 2. Compute Level and Tier Info dynamically from total XP
  const levelInfo = calculateLevelFromXP(userProfile?.xp ?? 0);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('lm_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('lm_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('lm_diet_logs', JSON.stringify(dietLogs));
  }, [dietLogs]);

  useEffect(() => {
    localStorage.setItem('lm_running_logs', JSON.stringify(runningLogs));
  }, [runningLogs]);

  useEffect(() => {
    localStorage.setItem('lm_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('lm_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Global Keyboard Shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // XP & Level Up Engine
  const awardXP = (xpPoints, reason = "프로토콜 완수") => {
    setUserProfile(prev => {
      const prevLevelInfo = calculateLevelFromXP(prev.xp);
      const newTotalXP = prev.xp + xpPoints;
      const nextLevelInfo = calculateLevelFromXP(newTotalXP);

      if (nextLevelInfo.level > prevLevelInfo.level) {
        // Trigger Level Up Celebration!
        playLevelUpSound();
        fireLevelUpConfetti();
        setLevelUpModalOpen(true);
      }

      return {
        ...prev,
        xp: newTotalXP,
        level: nextLevelInfo.level,
        tier: nextLevelInfo.tier.name
      };
    });
  };

  // Routine Handlers
  const handleToggleRoutine = (id) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const nextCompleted = !r.completed;
        if (nextCompleted) {
          awardXP(r.xp, r.title);
        }
        return { ...r, completed: nextCompleted };
      }
      return r;
    }));
  };

  const handleAddRoutine = (newRoutine) => {
    setRoutines(prev => [...prev, newRoutine]);
  };

  const handleDeleteRoutine = (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  // Diet Handlers
  const handleAddDietLog = (newLog) => {
    setDietLogs(prev => [newLog, ...prev]);
    awardXP(20, "식단 기록 완료");
  };

  const handleDeleteDietLog = (id) => {
    setDietLogs(prev => prev.filter(d => d.id !== id));
  };

  // Running Handlers
  const handleAddRunLog = (newRun) => {
    setRunningLogs(prev => [newRun, ...prev]);
    awardXP(60, "5km 러닝 완료");
  };

  const handleDeleteRunLog = (id) => {
    setRunningLogs(prev => prev.filter(r => r.id !== id));
  };

  // Expense Handlers
  const handleAddExpense = (newExp) => {
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Calendar Event Handlers
  const handleAddCalendarEvent = (newEvent) => {
    setCalendarEvents(prev => [...prev, newEvent]);
    awardXP(15, "새 일정 등록");
  };

  const handleToggleCalendarEvent = (id) => {
    setCalendarEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        const nextCompleted = !evt.completed;
        if (nextCompleted) awardXP(20, "일정 완수");
        return { ...evt, completed: nextCompleted };
      }
      return evt;
    }));
  };

  const handleEditCalendarEvent = (updatedEvent) => {
    setCalendarEvents(prev => prev.map(evt => evt.id === updatedEvent.id ? { ...evt, ...updatedEvent } : evt));
  };

  const handleDeleteCalendarEvent = (id) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleBulkUpdateCalendarEvents = (updatedAllEvents) => {
    setCalendarEvents(updatedAllEvents);
    awardXP(30, "AI 일정 자동 일괄 편집 및 최적화");
  };

  // Deepwork Completion
  const handleCompleteDeepwork = (durationMin) => {
    awardXP(50, `${durationMin}분 딥워크 완수`);
  };

  // Quick RAG Search from Command Palette
  const handleSearchRAG = (query) => {
    setRagInitialQuery(query);
    setActiveTab('rag');
  };

  // Financial Surplus Computations
  const variableExpenses = expenses.filter(e => !e.isFixed);
  const totalVariableExpense = variableExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const monthlyIncome = Number(userProfile?.monthlyIncome ?? 0);
  const fixedCosts = Number(userProfile?.fixedCosts ?? 0);
  const availableInvestmentSurplus = monthlyIncome - fixedCosts - totalVariableExpense;

  // Diet Computations
  const totalKcal = dietLogs.reduce((acc, l) => acc + (l.kcal || 0), 0);
  const totalProtein = dietLogs.reduce((acc, l) => acc + (l.protein || 0), 0).toFixed(1);

  // Routine Computations
  const completedRoutinesCount = routines.filter(r => r.completed).length;

  return (
    <div className="app-layout">
      {/* 1. Universal Top Header */}
      <Header
        userProfile={userProfile}
        levelInfo={levelInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenObsidianModal={() => setObsidianModalOpen(true)}
        onOpenLevelModal={() => setLevelSystemModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenGeminiKeyModal={() => setGeminiKeyModalOpen(true)}
        geminiApiKey={geminiApiKey}
        currentUser={currentUser}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onShuffleMusic={handleShuffleMusic}
        currentTrack={currentTrack}
      />

      {/* 2. Main Tab View Router */}
      <main className="main-content-wrapper">
        {/* TAB 1: EXECUTIVE COCKPIT / OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview-view">
            {/* 1. 2x2 Master Executive Cockpit Grid (Calendar, Life, Stocks, PubMed) */}
            <DashboardCockpit
              calendarEvents={calendarEvents}
              onToggleCalendarEvent={handleToggleCalendarEvent}
              onAddCalendarEvent={handleAddCalendarEvent}
              onBulkUpdateCalendarEvents={handleBulkUpdateCalendarEvents}
              routines={routines}
              onToggleRoutine={handleToggleRoutine}
              onAddRoutine={handleAddRoutine}
              dietLogs={dietLogs}
              userProfile={userProfile}
              onNavigateTab={setActiveTab}
              onOpenObsidianModal={() => setObsidianModalOpen(true)}
              geminiApiKey={geminiApiKey}
              onOpenKeyModal={() => setGeminiKeyModalOpen(true)}
            />

            {/* 2. Quick Status HUD Cards (Clean Typography & Icon Hierarchy) */}
            <div className="hud-metric-cards-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
              {/* Card 1: Investment Surplus */}
              <div 
                className="hud-card glass-card-interactive" 
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">이번 달 투자 가용 잉여금</span>
                  <DollarSign size={16} className="text-cyan" />
                </div>
                <div className="hud-card-val text-cyan">
                  <span className="mono">{availableInvestmentSurplus.toLocaleString()}</span> <small>원</small>
                </div>
                <div className="hud-card-sub">
                  소득 {(monthlyIncome / 10000).toLocaleString()}만 - 고정비 {(fixedCosts / 10000).toLocaleString()}만 - 변동 {totalVariableExpense.toLocaleString()}원
                </div>
              </div>

              {/* Card 2: Today's Schedule & XP Progress */}
              <div 
                className="hud-card glass-card-interactive"
                onClick={() => setActiveTab('calendar')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">오늘 주요 일정 & 딥워크</span>
                  <Calendar size={16} className="text-emerald" />
                </div>
                <div className="hud-card-val text-emerald">
                  <span className="mono">{calendarEvents.filter(e => e.completed).length} / {calendarEvents.length}</span> <small>완수</small>
                </div>
                <div className="hud-card-sub">
                  총 보유 XP: <span className="mono">{userProfile.currentXP?.toLocaleString()}</span> XP (Lv.{userProfile.level})
                </div>
              </div>

              {/* Card 3: Daily Routine Checklist Status */}
              <div 
                className="hud-card glass-card-interactive"
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">데일리 루틴 프로토콜</span>
                  <CheckSquare size={16} className="text-purple" />
                </div>
                <div className="hud-card-val text-purple">
                  <span className="mono">{completedRoutinesCount} / {routines.length}</span> <small>완수</small>
                </div>
                <div className="hud-card-sub">
                  연속 스트릭: <span className="mono text-amber font-bold">{userProfile.streak}일</span> 달성 중
                </div>
              </div>

              {/* Card 4: Daily Nutrition & Protein */}
              <div 
                className="hud-card glass-card-interactive"
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">식단 영양소 & 칼로리</span>
                  <Utensils size={16} className="text-amber" />
                </div>
                <div className="hud-card-val text-amber" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span className="mono">{totalKcal}</span> <small>kcal</small>
                  <span className="text-xs text-emerald font-semibold" style={{ marginLeft: '4px' }}>
                    (단백질 <span className="mono font-bold">{totalProtein}g</span>)
                  </span>
                </div>
                <div className="hud-card-sub">
                  목표 2,200 kcal 대비 <span className="mono font-bold">{Math.round((totalKcal / 2200) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* 3. Financial Surplus & Asset Allocation Engine */}
            <div style={{ marginTop: '24px' }}>
              <ExpenseTracker
                userProfile={userProfile}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateUserProfile={(updates) => setUserProfile(prev => ({ ...prev, ...updates }))}
              />
            </div>
          </div>
        )}

        {/* TAB: CALENDAR & SCHEDULE PROTOCOL */}
        {activeTab === 'calendar' && (
          <div className="tab-view-container">
            <CalendarScheduler
              events={calendarEvents}
              onAddEvent={handleAddCalendarEvent}
              onToggleEvent={handleToggleCalendarEvent}
              onEditEvent={handleEditCalendarEvent}
              onDeleteEvent={handleDeleteCalendarEvent}
              onBulkUpdateEvents={handleBulkUpdateCalendarEvents}
              onOpenObsidianModal={() => setObsidianModalOpen(true)}
              geminiApiKey={geminiApiKey}
              onOpenKeyModal={() => setGeminiKeyModalOpen(true)}
              routines={routines}
            />
          </div>
        )}

        {/* TAB 2: DAILY & LIFE PROTOCOL */}
        {activeTab === 'life' && (
          <div className="tab-view-container">
            <div className="subtab-section">
              <DailyRoutines
                routines={routines}
                onToggleRoutine={handleToggleRoutine}
                onAddRoutine={handleAddRoutine}
                onDeleteRoutine={handleDeleteRoutine}
                onOpenObsidianModal={() => setObsidianModalOpen(true)}
              />
            </div>

            <div className="subtab-section mt-5">
              <DietTracker
                dietLogs={dietLogs}
                onAddDietLog={handleAddDietLog}
                onDeleteDietLog={handleDeleteDietLog}
              />
            </div>

            <div className="subtab-section mt-5">
              <ExpenseTracker
                userProfile={userProfile}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateUserProfile={(updates) => setUserProfile(prev => ({ ...prev, ...updates }))}
              />
            </div>
          </div>
        )}

        {/* TAB 3: MARKET & MACRO INTELLIGENCE */}
        {activeTab === 'market' && (
          <div className="tab-view-container">
            <MarketBriefing onOpenObsidianModal={() => setObsidianModalOpen(true)} />
            <div className="mt-5">
              <PolicyNewsTracker />
            </div>
            <div className="mt-5">
              <SecEarningsBrief />
            </div>
          </div>
        )}

        {/* TAB 4: RAG ASSISTANT & KNOWLEDGE QA */}
        {activeTab === 'rag' && (
          <div className="tab-view-container">
            <RagAssistant 
              initialQuery={ragInitialQuery}
              calendarEvents={calendarEvents}
              routines={routines}
              dietLogs={dietLogs}
              runningLogs={runningLogs}
              expenses={expenses}
              userProfile={userProfile}
            />
          </div>
        )}

        {/* TAB 5: PUBMED & GITHUB CURATION */}
        {activeTab === 'knowledge' && (
          <div className="tab-view-container">
            <PubMedCurator />
            <div className="mt-5">
              <GithubAiTracker />
            </div>
          </div>
        )}

        {/* TAB 6: DEEPWORK SOUNDSCAPE & POMODORO */}
        {activeTab === 'soundscape' && (
          <div className="tab-view-container">
            <DeepworkSoundscape 
              onCompleteDeepwork={handleCompleteDeepwork} 
              isMusicPlaying={isMusicPlaying}
              onToggleMusic={handleToggleMusic}
              currentTrack={currentTrack}
              onSelectTrack={handleSelectTrack}
            />
          </div>
        )}
      </main>

      {/* Hidden Persistent YouTube Audio Player (Continues audio across all tabs) */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: -9999, 
          left: -9999, 
          width: '1px', 
          height: '1px', 
          opacity: 0, 
          pointerEvents: 'none' 
        }} 
        aria-hidden="true"
      >
        {isMusicPlaying && currentTrack?.videoId && (
          <iframe
            id="global-bg-youtube-player"
            width="200"
            height="200"
            src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=1&enablejsapi=1&loop=1&playlist=${currentTrack.videoId}&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
            title="Global Background Music"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>

      {/* 3. Global Modals & Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onAddDiet={handleAddDietLog}
        onAddExpense={handleAddExpense}
        onAddRun={handleAddRunLog}
        onAddEvent={handleAddCalendarEvent}
        onSearchRAG={handleSearchRAG}
      />

      <ObsidianModal
        isOpen={obsidianModalOpen}
        onClose={() => setObsidianModalOpen(false)}
        userProfile={userProfile}
        routines={routines}
        dietLogs={dietLogs}
        runningLogs={runningLogs}
        expenses={expenses}
        calendarEvents={calendarEvents}
        amBriefing={AM_BRIEFING_CONTENT}
        pmBriefing={PM_BRIEFING_CONTENT}
        pubmedCuration={PUBMED_DAILY_CURATION}
      />

      <LevelUpModal
        isOpen={levelUpModalOpen}
        onClose={() => setLevelUpModalOpen(false)}
        level={levelInfo.level}
        tier={levelInfo.tier}
        earnedXP={userProfile.xp}
      />

      <LevelSystemModal
        isOpen={levelSystemModalOpen}
        onClose={() => setLevelSystemModalOpen(false)}
        userProfile={userProfile}
        levelInfo={levelInfo}
        onAwardXP={awardXP}
        onResetXP={handleResetXP}
      />

      <AuthSyncModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <GeminiApiKeyModal
        isOpen={geminiKeyModalOpen}
        onClose={() => setGeminiKeyModalOpen(false)}
        onApiKeyUpdated={(newKey) => setGeminiApiKey(newKey)}
      />

      {/* Mobile Bottom Navigation Bar (Shown on Mobile screens <= 768px) */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />

      {/* Global Floating Real-time AI Copilot Assistant */}
      <FloatingAiAssistant 
        calendarEvents={calendarEvents}
        routines={routines}
        dietLogs={dietLogs}
        runningLogs={runningLogs}
        expenses={expenses}
        userProfile={userProfile}
        onNavigateTab={setActiveTab}
        onBulkUpdateCalendarEvents={handleBulkUpdateCalendarEvents}
        onAddDietLog={handleAddDietLog}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}

export default App;
