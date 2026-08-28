import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  PieChart as PieIcon, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowUpRight, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle,
  Equal,
  Minus,
  ArrowRight,
  Edit3,
  Check,
  X,
  Sliders,
  Settings,
  Coins,
  Building,
  Target,
  Briefcase,
  Layers,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { parseExpenseNaturalLanguage } from '../utils/nlpParsers';

ChartJS.register(ArcElement, Tooltip, Legend);

// Default Personalized Asset Classes
export const DEFAULT_PORTFOLIO_ALLOCATION = [
  { id: 'p1', name: '미국 지수 대표 ETF (QQQ / SPY)', ticker: 'QQQ, SPY', weight: 45, color: '#00f0ff', note: '시장 수익률 추종 및 코어 자산' },
  { id: 'p2', name: 'AI 빅테크 성장주 (NVDA / AAPL)', ticker: 'NVDA, AAPL', weight: 30, color: '#10b981', note: 'AI 데이터센터 및 소프트웨어 생태계' },
  { id: 'p3', name: '국내 핵심 우량주 (반도체/바이오)', ticker: '005930, 000660', weight: 15, color: '#8b5cf6', note: 'HBM 및 메모리 사이클 수혜' },
  { id: 'p4', name: '기회 유동성 (CMA / 단기채)', ticker: 'CMA, SHY', weight: 10, color: '#f59e0b', note: '시장 급락 시 분할 매수 대기 자금' }
];

export function ExpenseTracker({ 
  userProfile, 
  expenses, 
  onAddExpense, 
  onDeleteExpense,
  onUpdateBudget,
  onUpdateUserProfile
}) {
  const [smsInput, setSmsInput] = useState('');
  const [previewParsed, setPreviewParsed] = useState(null);
  
  // Financial Setting Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(userProfile?.monthlyIncome ?? 6500000));
  const [fixedInput, setFixedInput] = useState(String(userProfile?.fixedCosts ?? 1850000));
  const [targetInput, setTargetInput] = useState(String(userProfile?.monthlyInvestmentTarget ?? 3000000));

  // Personalized Portfolio Management State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioAllocations, setPortfolioAllocations] = useState(() => {
    try {
      const saved = localStorage.getItem('lm_user_portfolio_allocation');
      return saved ? JSON.parse(saved) : DEFAULT_PORTFOLIO_ALLOCATION;
    } catch (e) {
      return DEFAULT_PORTFOLIO_ALLOCATION;
    }
  });

  // Draft state for portfolio editor
  const [draftAllocations, setDraftAllocations] = useState(portfolioAllocations);

  // Financial Variables
  const monthlyIncome = Number(userProfile?.monthlyIncome) || 6500000;
  const fixedCosts = Number(userProfile?.fixedCosts) || 1850000;
  const investmentTarget = Number(userProfile?.monthlyInvestmentTarget) || 3000000;

  // Persist Portfolio to localStorage
  useEffect(() => {
    localStorage.setItem('lm_user_portfolio_allocation', JSON.stringify(portfolioAllocations));
  }, [portfolioAllocations]);

  const openSettings = () => {
    setIncomeInput(String(monthlyIncome));
    setFixedInput(String(fixedCosts));
    setTargetInput(String(investmentTarget));
    setIsSettingsModalOpen(true);
  };

  const saveSettings = () => {
    const inc = Math.max(0, parseInt(String(incomeInput).replace(/,/g, ''), 10) || 0);
    const fix = Math.max(0, parseInt(String(fixedInput).replace(/,/g, ''), 10) || 0);
    const tgt = Math.max(0, parseInt(String(targetInput).replace(/,/g, ''), 10) || 0);

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        monthlyIncome: inc,
        fixedCosts: fix,
        monthlyInvestmentTarget: tgt
      });
    }
    setIsSettingsModalOpen(false);
  };

  const openPortfolioModal = () => {
    setDraftAllocations(JSON.parse(JSON.stringify(portfolioAllocations)));
    setIsPortfolioModalOpen(true);
  };

  const savePortfolioAllocations = () => {
    setPortfolioAllocations(draftAllocations);
    setIsPortfolioModalOpen(false);
  };

  // Quick adjust helpers
  const adjustValue = (setter, currentStr, delta) => {
    const curr = parseInt(String(currentStr).replace(/,/g, ''), 10) || 0;
    const next = Math.max(0, curr + delta);
    setter(String(next));
  };

  const formatKoreanUnits = (numStr) => {
    const n = parseInt(String(numStr).replace(/,/g, ''), 10) || 0;
    if (n === 0) return '0원';
    const eok = Math.floor(n / 100000000);
    const man = Math.floor((n % 100000000) / 10000);
    const remainder = n % 10000;
    
    let res = '';
    if (eok > 0) res += `${eok}억 `;
    if (man > 0) res += `${man}만 `;
    if (remainder > 0 || res === '') res += `${remainder.toLocaleString()}원`;
    else res += '원';
    return res.trim();
  };

  // Cumulative Variable Expenses Calculation
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  const variableExpenses = validExpenses.filter(e => e && !e.isFixed);
  const totalVariableExpense = variableExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Available Free Cash Flow (Investment Surplus)
  const availableInvestmentSurplus = monthlyIncome - fixedCosts - totalVariableExpense;
  const surplusTargetPercent = investmentTarget > 0 
    ? Math.min(100, Math.max(0, Math.round((availableInvestmentSurplus / investmentTarget) * 100)))
    : 0;

  // Category Aggregate Calculation
  const categoryTotals = {};
  validExpenses.forEach(e => {
    if (e && e.category) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
    }
  });

  const chartLabels = Object.keys(categoryTotals);
  const chartDataValues = Object.values(categoryTotals);

  const categoryColors = [
    '#00f0ff', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#38bdf8'
  ];

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['기본 예산'],
    datasets: [
      {
        data: chartDataValues.length > 0 ? chartDataValues : [1],
        backgroundColor: categoryColors.slice(0, Math.max(1, chartLabels.length)),
        borderColor: '#080b11',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return ` ${context.label}: ${context.raw.toLocaleString()}원`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const handleInputChange = (val) => {
    setSmsInput(val);
    if (val.trim().length > 2) {
      const parsed = parseExpenseNaturalLanguage(val);
      setPreviewParsed(parsed);
    } else {
      setPreviewParsed(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const parsed = previewParsed || parseExpenseNaturalLanguage(smsInput);
    if (!parsed) return;

    onAddExpense(parsed);
    setSmsInput('');
    setPreviewParsed(null);
  };

  // Total allocation percentage calculation in draft
  const totalDraftWeight = draftAllocations.reduce((acc, a) => acc + (Number(a.weight) || 0), 0);

  // Apply Predefined Strategy Presets
  const applyPresetStrategy = (presetType) => {
    if (presetType === 'growth') {
      setDraftAllocations([
        { id: 'p1', name: '미국 나스닥 지수 (QQQ)', ticker: 'QQQ', weight: 50, color: '#00f0ff', note: '빅테크 중심 지수 레버리지' },
        { id: 'p2', name: 'AI 혁신 성장주 (NVDA/TSLA)', ticker: 'NVDA, TSLA', weight: 35, color: '#10b981', note: 'AI 및 자율주행 모멘텀' },
        { id: 'p3', name: '현금 및 유동성 (CMA)', ticker: 'CMA', weight: 15, color: '#f59e0b', note: '분할 매수 버퍼' }
      ]);
    } else if (presetType === 'allweather') {
      setDraftAllocations([
        { id: 'p1', name: '미국 광범위 지수 (SPY/VT)', ticker: 'SPY, VT', weight: 35, color: '#00f0ff', note: '전 세계 글로벌 주식' },
        { id: 'p2', name: '미국 장기채권 (TLT)', ticker: 'TLT', weight: 25, color: '#8b5cf6', note: '금리 인하 및 안전자산' },
        { id: 'p3', name: '원자재 / 금 (GLD)', ticker: 'GLD', weight: 15, color: '#f59e0b', note: '인플레이션 헤지' },
        { id: 'p4', name: 'AI 성장주 및 국내주식', ticker: 'NVDA, 삼성전자', weight: 15, color: '#10b981', note: '알파 수익 추구' },
        { id: 'p5', name: '단기 유동성 (CMA)', ticker: 'CMA', weight: 10, color: '#ec4899', note: '리밸런싱 버퍼' }
      ]);
    } else if (presetType === 'barbell') {
      setDraftAllocations([
        { id: 'p1', name: '초고성장 테크/반도체 (NVDA/SOXL)', ticker: 'NVDA, SOXL', weight: 40, color: '#10b981', note: '공격적 성장 포지션' },
        { id: 'p2', name: '고배당/안정 ETF (SCHD/JEPI)', ticker: 'SCHD, JEPI', weight: 40, color: '#00f0ff', note: '월배당 현금흐름 창출' },
        { id: 'p3', name: 'CMA 기회 유동성', ticker: 'CMA', weight: 20, color: '#f59e0b', note: '리스크 관리' }
      ]);
    }
  };

  return (
    <div className="expense-tracker-container">
      {/* 🎯 1. REFINED FREE CASH FLOW & SURPLUS DASHBOARD */}
      <div className="surplus-hero-banner glass-card">
        <div className="surplus-formula-header">
          <div className="formula-icon-box">
            <TrendingUp size={22} className="text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-cyan">스마트 잉여 현금흐름 (Free Cash Flow)</span>
                <span className="badge badge-emerald">목표 달성률 {surplusTargetPercent}%</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm glowing-btn"
                onClick={openSettings}
                title="소득, 고정비, 투자 목표액 설정"
              >
                <Settings size={14} className="text-cyan" />
                <span>재정 기준금액 설정</span>
              </button>
            </div>

            <h3 className="mt-1">월간 가용 현금흐름 및 자산 배분</h3>
            <div className="surplus-equation-strip mt-1">
              <span className="equation-term text-highlight font-bold">월 소득 (+{(monthlyIncome / 10000).toLocaleString()}만)</span>
              <span className="equation-op text-muted">-</span>
              <span className="equation-term text-rose font-bold">고정비 ({(fixedCosts / 10000).toLocaleString()}만)</span>
              <span className="equation-op text-muted">-</span>
              <span className="equation-term text-amber font-bold">누적 지출 ({totalVariableExpense.toLocaleString()}원)</span>
              <span className="equation-op text-muted">=</span>
              <span className="equation-result text-cyan font-extrabold text-sm">{availableInvestmentSurplus.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* Financial Calculation Steps Grid */}
        <div className="surplus-steps-grid mt-3">
          {/* Step 1: Income */}
          <div 
            className="surplus-step-tile surplus-step-tile-interactive cursor-pointer"
            onClick={openSettings}
            title="클릭하여 소득 기준 금액 수정"
          >
            <div className="step-tile-top">
              <span className="step-tag text-cyan font-bold">1. 당월 총소득</span>
              <span className="step-sign text-emerald">+</span>
            </div>
            <div className="step-amount mono text-highlight">
              {monthlyIncome.toLocaleString()}원
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="step-desc text-muted text-xs">급여 및 사업 소득</span>
              <span className="edit-pill-badge">✏️ 설정</span>
            </div>
          </div>

          {/* Step 2: Fixed Costs */}
          <div 
            className="surplus-step-tile surplus-step-tile-interactive cursor-pointer"
            onClick={openSettings}
            title="클릭하여 고정비 기준 금액 수정"
          >
            <div className="step-tile-top">
              <span className="step-tag text-rose font-bold">2. 고정 지출</span>
              <span className="step-sign text-rose">-</span>
            </div>
            <div className="step-amount mono text-rose">
              {fixedCosts.toLocaleString()}원
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="step-desc text-muted text-xs">월세, 보험, 통신, 대출</span>
              <span className="edit-pill-badge badge-rose">✏️ 설정</span>
            </div>
          </div>

          {/* Step 3: Cumulative Variable Expenses */}
          <div className="surplus-step-tile">
            <div className="step-tile-top">
              <span className="step-tag text-amber font-bold">3. 누적 변동지출</span>
              <span className="step-sign text-amber">-</span>
            </div>
            <div className="step-amount mono text-amber">
              {totalVariableExpense.toLocaleString()}원
            </div>
            <span className="step-desc text-muted text-xs">
              {expenses.length > 0 ? `식비, 쇼핑, 카페 등 (${expenses.length}건)` : '등록된 변동지출 없음'}
            </span>
          </div>
        </div>

        {/* Step 4: Final Free Cash Flow Result Banner */}
        <div className="surplus-result-banner glass-card mt-3">
          <div className="result-banner-left">
            <span className="badge badge-cyan font-bold text-xs">🎯 당월 가용 잉여금 (투자 가용 자금)</span>
            <div className="result-amount mono text-cyan">
              {availableInvestmentSurplus.toLocaleString()} <small className="text-sm">원</small>
            </div>
            <p 
              className="text-muted text-xs mt-1 cursor-pointer"
              onClick={openSettings}
              title="클릭하여 투자 목표 금액 수정"
            >
              월간 투자 목표(<span className="text-highlight underline font-bold">{investmentTarget.toLocaleString()}원 ✏️</span>) 대비 <strong className="text-emerald">{surplusTargetPercent}%</strong> 달성 중
            </p>
          </div>

          <div className="result-banner-right">
            <div className="surplus-progress-track">
              <div 
                className="surplus-progress-fill" 
                style={{ width: `${surplusTargetPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 💼 2. PERSONALIZED PORTFOLIO ALLOCATION MANAGER */}
      <div className="portfolio-manager-card glass-card mt-4">
        <div className="panel-header flex-wrap gap-2">
          <div className="panel-title-with-icon">
            <Briefcase size={18} className="text-cyan" />
            <div>
              <div className="flex items-center gap-2">
                <h4>개인 맞춤형 자산 포트폴리오 관리</h4>
                <span className="badge badge-cyan font-bold">Asset Allocation</span>
              </div>
              <p className="text-muted text-xs mt-0.5">
                당월 가용 잉여금({availableInvestmentSurplus.toLocaleString()}원)을 나만의 맞춤형 비중에 맞춰 자동으로 배분합니다.
              </p>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            onClick={openPortfolioModal}
            title="포트폴리오 비중 및 자산군 직접 편집"
          >
            <SlidersHorizontal size={14} />
            <span>포트폴리오 비중 설정</span>
          </button>
        </div>

        {/* Allocation Progress Bar */}
        <div className="portfolio-progress-bar-container mt-3">
          <div className="portfolio-stacked-bar">
            {portfolioAllocations.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="portfolio-bar-segment"
                style={{ width: `${item.weight}%`, backgroundColor: item.color }}
                title={`${item.name}: ${item.weight}%`}
              />
            ))}
          </div>
        </div>

        {/* Allocation Cards Grid */}
        <div className="portfolio-cards-grid mt-3">
          {portfolioAllocations.map(item => {
            const calculatedAmount = Math.max(0, Math.round((availableInvestmentSurplus * item.weight) / 100));

            return (
              <div key={item.id} className="portfolio-asset-card glass-card">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="asset-color-dot" style={{ backgroundColor: item.color }} />
                    <span className="asset-name text-xs font-bold text-highlight">{item.name}</span>
                  </div>
                  <span className="badge badge-purple mono font-bold">{item.weight}%</span>
                </div>

                <div className="asset-calc-amount mono mt-2">
                  {calculatedAmount.toLocaleString()} <span className="text-xs text-muted">원</span>
                </div>

                {item.ticker && (
                  <div className="asset-ticker-tag mt-1">
                    <span className="text-3xs text-muted mono">{item.ticker}</span>
                  </div>
                )}

                {item.note && (
                  <p className="asset-note-text text-3xs text-muted mt-1">{item.note}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NATURAL LANGUAGE EXPENSE INPUT & CHARTS */}
      <div className="expense-grid mt-4">
        {/* Left Column: Natural Language Input & Recent List */}
        <div className="expense-left-col">
          {/* SMS / Natural Language Quick Input Box */}
          <div className="glass-card expense-input-card">
            <div className="panel-title-with-icon">
              <Wallet size={16} className="text-cyan" />
              <h5>자연어 지출 등록</h5>
            </div>
            <p className="text-muted text-xs mt-1">
              "점심 스타벅스 6500원", "신한카드 8/28 결제 배민 23000원", "교보문고 책 38000원" 등 자유롭게 입력하세요.
            </p>

            <form onSubmit={handleSubmit} className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-text flex-1"
                  placeholder="예: 강남역 삼겹살 45000원 카드결제"
                  value={smsInput}
                  onChange={e => handleInputChange(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>등록</span>
                </button>
              </div>

              {/* Instant Parsing Preview Pill */}
              {previewParsed && (
                <div className="mt-2.5 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-cyan">{previewParsed.category}</span>
                    <span className="font-semibold text-highlight">{previewParsed.merchant}</span>
                  </div>
                  <span className="mono font-bold text-cyan text-sm">
                    {previewParsed.amount.toLocaleString()}원
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Recent Expenses Ledger List */}
          <div className="glass-card mt-3">
            <div className="panel-header">
              <h5>최근 지출 내역 ({expenses.length}건)</h5>
              <span className="text-xs text-muted">최신순 정렬</span>
            </div>

            <div className="expense-list-container mt-2">
              {expenses.length === 0 ? (
                <div className="empty-expense-state">
                  <p className="text-muted text-xs">등록된 지출 내역이 없습니다.</p>
                </div>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} className="expense-item-row">
                    <div className="flex items-center gap-2.5">
                      <span className="category-pill">{expense.category}</span>
                      <div>
                        <div className="text-xs font-semibold text-highlight">{expense.merchant}</div>
                        <div className="text-3xs text-muted mono">{expense.date} • {expense.paymentMethod || '카드'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="mono text-xs font-bold text-highlight">
                        -{expense.amount.toLocaleString()}원
                      </span>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => onDeleteExpense(expense.id)}
                        title="지출 내역 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Category Breakdown Donut Chart */}
        <div className="expense-right-col glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <PieIcon size={16} className="text-purple" />
              <h5>카테고리별 지출 비중</h5>
            </div>
          </div>

          <div className="donut-chart-wrapper mt-3">
            <Doughnut data={chartData} options={chartOptions} />
          </div>

          <div className="category-summary-stats mt-4">
            {Object.entries(categoryTotals).map(([cat, amt], idx) => (
              <div key={cat} className="flex justify-between items-center py-1 border-b border-white/5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: categoryColors[idx % categoryColors.length] }} 
                  />
                  <span className="text-muted">{cat}</span>
                </div>
                <span className="mono font-bold text-highlight">{amt.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⚙️ 4. FINANCIAL BASELINE SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="modal-backdrop-blur" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="financial-modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="modal-icon-badge bg-cyan-500/20 text-cyan p-2 rounded-lg">
                  <Sliders size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-highlight">재정 기준 금액 설정</h4>
                  <p className="text-muted text-xs">수정 즉시 실시간 잉여금 및 투자 배분이 자동 계산됩니다.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setIsSettingsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content mt-4 space-y-4">
              {/* Field 1: Monthly Income */}
              <div className="financial-input-group glass-card p-3 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Coins size={15} className="text-cyan" />
                    <span className="text-xs font-bold text-cyan">1. 당월 총소득 (월급 / 사업 소득)</span>
                  </div>
                  <span className="mono text-xs font-bold text-highlight">{formatKoreanUnits(incomeInput)}</span>
                </div>
                <div className="input-currency-wrapper">
                  <input
                    type="text"
                    className="input-text mono text-sm font-bold w-full"
                    value={incomeInput}
                    onChange={e => setIncomeInput(e.target.value)}
                  />
                </div>
                <div className="quick-adjust-chips mt-2 flex gap-1.5 flex-wrap">
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setIncomeInput, incomeInput, 500000)}>+50만</button>
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setIncomeInput, incomeInput, 1000000)}>+100만</button>
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setIncomeInput, incomeInput, -500000)}>-50만</button>
                </div>
              </div>

              {/* Field 2: Fixed Costs */}
              <div className="financial-input-group glass-card p-3 border border-rose-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building size={15} className="text-rose" />
                    <span className="text-xs font-bold text-rose">2. 월간 고정비 (월세, 보험, 대출 등)</span>
                  </div>
                  <span className="mono text-xs font-bold text-highlight">{formatKoreanUnits(fixedInput)}</span>
                </div>
                <div className="input-currency-wrapper">
                  <input
                    type="text"
                    className="input-text mono text-sm font-bold w-full"
                    value={fixedInput}
                    onChange={e => setFixedInput(e.target.value)}
                  />
                </div>
                <div className="quick-adjust-chips mt-2 flex gap-1.5 flex-wrap">
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setFixedInput, fixedInput, 100000)}>+10만</button>
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setFixedInput, fixedInput, 500000)}>+50만</button>
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setFixedInput, fixedInput, -100000)}>-10만</button>
                </div>
              </div>

              {/* Field 3: Monthly Investment Target */}
              <div className="financial-input-group glass-card p-3 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Target size={15} className="text-emerald" />
                    <span className="text-xs font-bold text-emerald">3. 월간 목표 투자액</span>
                  </div>
                  <span className="mono text-xs font-bold text-highlight">{formatKoreanUnits(targetInput)}</span>
                </div>
                <div className="input-currency-wrapper">
                  <input
                    type="text"
                    className="input-text mono text-sm font-bold w-full"
                    value={targetInput}
                    onChange={e => setTargetInput(e.target.value)}
                  />
                </div>
                <div className="quick-adjust-chips mt-2 flex gap-1.5 flex-wrap">
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setTargetInput, targetInput, 500000)}>+50만</button>
                  <button type="button" className="chip-adjust" onClick={() => adjustValue(setTargetInput, targetInput, 1000000)}>+100만</button>
                </div>
              </div>
            </div>

            <div className="modal-footer-actions flex justify-end gap-2 mt-4 pt-3 border-t border-white/10">
              <button className="btn btn-secondary btn-sm" onClick={() => setIsSettingsModalOpen(false)}>취소</button>
              <button className="btn btn-primary btn-sm" onClick={saveSettings}>기준 금액 저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 💼 5. CUSTOM PORTFOLIO MANAGER MODAL */}
      {isPortfolioModalOpen && (
        <div className="modal-backdrop-blur" onClick={() => setIsPortfolioModalOpen(false)}>
          <div className="portfolio-modal-card glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="modal-icon-badge bg-purple-500/20 text-purple p-2 rounded-lg">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-highlight">💼 개인 맞춤형 포트폴리오 비중 설정</h4>
                  <p className="text-muted text-xs">본인의 투자 성향에 맞게 자산군과 비중(%)을 자유롭게 구성하세요.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setIsPortfolioModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Strategy Presets */}
            <div className="preset-strategies-bar mt-3 p-2 rounded-lg bg-black/30 border border-white/5">
              <span className="text-2xs font-bold text-muted mr-2">추천 전략 프리셋:</span>
              <div className="flex gap-1.5 flex-wrap mt-1">
                <button type="button" className="btn btn-secondary btn-xs" onClick={() => applyPresetStrategy('growth')}>
                  🚀 50:35:15 성장형
                </button>
                <button type="button" className="btn btn-secondary btn-xs" onClick={() => applyPresetStrategy('allweather')}>
                  🛡️ 올웨더 자산배분
                </button>
                <button type="button" className="btn btn-secondary btn-xs" onClick={() => applyPresetStrategy('barbell')}>
                  ⚖️ 바벨 전략 (배당+테크)
                </button>
              </div>
            </div>

            {/* Total Weight Validation Badge */}
            <div className="flex justify-between items-center mt-3 p-2 rounded bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-highlight">총 비중 합계:</span>
              <span className={`mono text-sm font-extrabold ${totalDraftWeight === 100 ? 'text-emerald' : 'text-rose'}`}>
                {totalDraftWeight}% {totalDraftWeight === 100 ? '✓ (완벽한 100%)' : `(차이: ${100 - totalDraftWeight}%)`}
              </span>
            </div>

            {/* Allocations Editor List */}
            <div className="portfolio-draft-list mt-3 flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {draftAllocations.map((alloc, idx) => (
                <div key={alloc.id || idx} className="portfolio-draft-row glass-card p-2.5 flex items-center gap-3">
                  <input 
                    type="color" 
                    className="portfolio-color-input"
                    value={alloc.color || '#00f0ff'}
                    onChange={e => {
                      const val = e.target.value;
                      setDraftAllocations(prev => prev.map((a, i) => i === idx ? { ...a, color: val } : a));
                    }}
                    title="색상 선택"
                  />

                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      className="input-text text-xs font-bold w-full"
                      value={alloc.name}
                      placeholder="자산군 명칭"
                      onChange={e => {
                        const val = e.target.value;
                        setDraftAllocations(prev => prev.map((a, i) => i === idx ? { ...a, name: val } : a));
                      }}
                    />
                    <input 
                      type="text" 
                      className="input-text text-2xs text-muted w-full mt-1"
                      value={alloc.ticker || ''}
                      placeholder="대표 티커 (예: QQQ, NVDA)"
                      onChange={e => {
                        const val = e.target.value;
                        setDraftAllocations(prev => prev.map((a, i) => i === idx ? { ...a, ticker: val } : a));
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="input-text mono text-xs font-bold text-center"
                      style={{ width: '65px' }}
                      min="0"
                      max="100"
                      value={alloc.weight}
                      onChange={e => {
                        const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                        setDraftAllocations(prev => prev.map((a, i) => i === idx ? { ...a, weight: val } : a));
                      }}
                    />
                    <span className="text-xs text-muted font-bold">%</span>
                  </div>

                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => {
                      if (draftAllocations.length <= 1) {
                        alert("최소 1개 이상의 자산군이 유지되어야 합니다.");
                        return;
                      }
                      setDraftAllocations(prev => prev.filter((_, i) => i !== idx));
                    }}
                    title="자산군 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Asset Class Button */}
            <button 
              className="btn btn-secondary btn-sm w-full mt-3"
              onClick={() => {
                setDraftAllocations(prev => [
                  ...prev,
                  {
                    id: `p-${Date.now()}`,
                    name: '새 자산군',
                    ticker: 'TICKER',
                    weight: 10,
                    color: '#38bdf8',
                    note: '신규 자산군 배분'
                  }
                ]);
              }}
            >
              <Plus size={14} />
              <span>새 자산군 추가</span>
            </button>

            <div className="modal-footer-actions flex justify-end gap-2 mt-4 pt-3 border-t border-white/10">
              <button className="btn btn-secondary btn-sm" onClick={() => setIsPortfolioModalOpen(false)}>취소</button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={savePortfolioAllocations}
                disabled={totalDraftWeight !== 100}
                title={totalDraftWeight !== 100 ? "비중의 합계가 100%가 되어야 저장할 수 있습니다." : ""}
              >
                포트폴리오 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
