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
import { MobileBottomNav } from './components/MobileBottomNav';

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
  Clock
} from 'lucide-react';

import './App.css';

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
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_ROUTINES;
  });

  const [dietLogs, setDietLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_diet_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_DIET_LOGS;
  });

  const [runningLogs, setRunningLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_running_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_RUNNING_LOGS;
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_EXPENSES;
  });

  const [calendarEvents, setCalendarEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_calendar_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_CALENDAR_EVENTS;
  });

  // UI Navigation & Modal States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [obsidianModalOpen, setObsidianModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [levelSystemModalOpen, setLevelSystemModalOpen] = useState(false);
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
              // Apply existing cloud data to local state without triggering cloud write-back
              isRemoteUpdateRef.current = true;
              if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
              if (cloudData.routines) setRoutines(cloudData.routines);
              if (cloudData.dietLogs) setDietLogs(cloudData.dietLogs);
              if (cloudData.runningLogs) setRunningLogs(cloudData.runningLogs);
              if (cloudData.expenses) setExpenses(cloudData.expenses);
              if (cloudData.calendarEvents) setCalendarEvents(cloudData.calendarEvents);
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
          if (cloudData.routines) setRoutines(cloudData.routines);
          if (cloudData.dietLogs) setDietLogs(cloudData.dietLogs);
          if (cloudData.runningLogs) setRunningLogs(cloudData.runningLogs);
          if (cloudData.expenses) setExpenses(cloudData.expenses);
          if (cloudData.calendarEvents) setCalendarEvents(cloudData.calendarEvents);
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
  const availableInvestmentSurplus = (userProfile.monthlyIncome || 6500000) - (userProfile.fixedCosts || 1850000) - totalVariableExpense;

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
            {/* Top Executive Command Deck */}
            <div className="top-executive-deck-grid">
              <DashboardCalendarWidget
                events={calendarEvents}
                onToggleEvent={handleToggleCalendarEvent}
                onAddEvent={handleAddCalendarEvent}
                onGoToCalendar={() => setActiveTab('calendar')}
                onOpenObsidianModal={() => setObsidianModalOpen(true)}
              />
              <DashboardMarketWidget
                onGoToMarket={() => setActiveTab('market')}
              />
            </div>

            {/* Top Quick Status HUD Cards */}
            <div className="hud-metric-cards-row mt-4">
              {/* Card 1: Investment Surplus */}
              <div 
                className="hud-card glass-card glass-card-interactive" 
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">🎯 이번 달 투자 가용 잉여금</span>
                  <DollarSign size={16} className="text-cyan" />
                </div>
                <div className="hud-card-val mono text-cyan">
                  {availableInvestmentSurplus.toLocaleString()} <small>원</small>
                </div>
                <div className="hud-card-sub text-xs text-muted">
                  소득 650만 - 고정비 185만 - 변동 {totalVariableExpense.toLocaleString()}원
                </div>
              </div>

              {/* Card 2: 5km Running Progress */}
              <div 
                className="hud-card glass-card glass-card-interactive"
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">🏃 5km 러닝 주간 달성</span>
                  <Activity size={16} className="text-emerald" />
                </div>
                <div className="hud-card-val mono text-emerald">
                  {runningLogs.length} / 4 <small>회 완수</small>
                </div>
                <div className="hud-card-sub text-xs text-muted">
                  최근 페이스: {runningLogs[0]?.pace || "5'16\""} (Zone 2 최적화)
                </div>
              </div>

              {/* Card 3: Daily Routine Checklist Status */}
              <div 
                className="hud-card glass-card glass-card-interactive"
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">📋 데일리 루틴 프로토콜</span>
                  <CheckSquare size={16} className="text-purple" />
                </div>
                <div className="hud-card-val mono text-purple">
                  {completedRoutinesCount} / {routines.length} <small>완수</small>
                </div>
                <div className="hud-card-sub text-xs text-muted">
                  연속 스트릭: {userProfile.streak}일 달성 중 🔥
                </div>
              </div>

              {/* Card 4: Daily Nutrition & Protein */}
              <div 
                className="hud-card glass-card glass-card-interactive"
                onClick={() => setActiveTab('life')}
              >
                <div className="hud-card-top">
                  <span className="hud-card-label">🥗 식단 영양소 & 칼로리</span>
                  <Utensils size={16} className="text-amber" />
                </div>
                <div className="hud-card-val mono text-amber">
                  {totalKcal} <small>kcal</small> <span className="text-xs text-emerald">(단백질 {totalProtein}g)</span>
                </div>
                <div className="hud-card-sub text-xs text-muted">
                  목표 2,200 kcal 대비 {Math.round((totalKcal / 2200) * 100)}%
                </div>
              </div>
            </div>

            {/* Dashboard 2-Column Split: Market Intelligence & Daily Life Protocol */}
            <div className="dashboard-grid mt-4">
              {/* Left 7 Columns: Market AM/PM & Watchlist Snapshot */}
              <div className="dash-col-left">
                <DailyRoutines
                  routines={routines}
                  onToggleRoutine={handleToggleRoutine}
                  onAddRoutine={handleAddRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
                  onOpenObsidianModal={() => setObsidianModalOpen(true)}
                />

                <div className="mt-4">
                  <MarketBriefing onOpenObsidianModal={() => setObsidianModalOpen(true)} />
                </div>
              </div>

              {/* Right 5 Columns: Routines, Expense, & Deepwork Quick Widgets */}
              <div className="dash-col-right">
                <ExpenseTracker
                  userProfile={userProfile}
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                />

                <div className="mt-4">
                  <SecEarningsBrief />
                </div>

                <div className="mt-4">
                  <PubMedCurator />
                </div>
              </div>
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
              onOpenObsidianModal={() => setObsidianModalOpen(true)}
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
              <RunningTracker
                runningLogs={runningLogs}
                onAddRunLog={handleAddRunLog}
                onDeleteRunLog={handleDeleteRunLog}
              />
            </div>

            <div className="subtab-section mt-5">
              <ExpenseTracker
                userProfile={userProfile}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
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
            <RagAssistant initialQuery={ragInitialQuery} />
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

      {/* Mobile Bottom Navigation Bar (Shown on Mobile screens <= 768px) */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />
    </div>
  );
}

export default App;
