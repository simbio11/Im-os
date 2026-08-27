import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { parseExpenseNaturalLanguage } from '../utils/nlpParsers';

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [incomeInput, setIncomeInput] = useState(String(userProfile?.monthlyIncome ?? 0));
  const [fixedInput, setFixedInput] = useState(String(userProfile?.fixedCosts ?? 0));
  const [targetInput, setTargetInput] = useState(String(userProfile?.monthlyInvestmentTarget ?? 0));

  // Financial Variables
  const monthlyIncome = Number(userProfile?.monthlyIncome) || 0;
  const fixedCosts = Number(userProfile?.fixedCosts) || 0;
  const investmentTarget = Number(userProfile?.monthlyInvestmentTarget) || 0;

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

  // Calculate Cumulative Variable Expenses
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  const variableExpenses = validExpenses.filter(e => e && !e.isFixed);
  const totalVariableExpense = variableExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Available Investment Surplus = Monthly Income - Fixed Costs - Cumulative Variable Expenses
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
    '#00f0ff', // 식비/카페
    '#10b981', // 투자/자산
    '#8b5cf6', // 자기계발/도서
    '#f59e0b', // 생활/쇼핑
    '#f43f5e', // 고정비
    '#38bdf8'  // 기타
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

  // Preview numbers inside modal
  const previewInc = parseInt(String(incomeInput).replace(/,/g, ''), 10) || 0;
  const previewFix = parseInt(String(fixedInput).replace(/,/g, ''), 10) || 0;
  const previewTgt = parseInt(String(targetInput).replace(/,/g, ''), 10) || 0;
  const previewSurplus = previewInc - previewFix - totalVariableExpense;

  return (
    <div className="expense-tracker-container">
      {/* 🎯 CORE INVESTMENT SURPLUS HUD BANNER */}
      <div className="surplus-hero-banner glass-card">
        <div className="surplus-formula-header">
          <div className="formula-icon-box">
            <TrendingUp size={22} className="text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-cyan">실시간 자산 배분 인텔리전스</span>
                <span className="badge badge-emerald mono">목표 대비 {surplusTargetPercent}%</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm glowing-btn"
                onClick={openSettings}
                title="소득, 고정비, 투자 목표액 직접 수정"
              >
                <Settings size={14} className="text-cyan" />
                <span>⚙️ 재정 기준금액 설정</span>
              </button>
            </div>

            <h3 className="mt-1">이번 달 투자 가용 잉여금 산출 공식</h3>
            <div className="surplus-equation-strip mono text-xs mt-1">
              <span className="text-highlight font-bold">소득 (+{(monthlyIncome / 10000).toLocaleString()}만)</span>
              <span className="text-muted">-</span>
              <span className="text-rose font-bold">고정비 ({(fixedCosts / 10000).toLocaleString()}만)</span>
              <span className="text-muted">-</span>
              <span className="text-amber font-bold">변동지출 ({totalVariableExpense.toLocaleString()}원)</span>
              <span className="text-muted">=</span>
              <span className="text-cyan font-extrabold text-sm">{availableInvestmentSurplus.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* Financial Calculation Steps Grid (3 Inputs + 1 Full Result Banner) */}
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
              <span className="step-tag text-rose font-bold">2. 고정비</span>
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

        {/* Step 4: Final Investment Surplus Result Card */}
        <div className="surplus-result-banner glass-card mt-3">
          <div className="result-banner-left">
            <span className="badge badge-cyan font-bold text-xs">🎯 최종 투자 가용 잉여금</span>
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

        {/* Recommended Surplus Portfolio Allocation */}
        <div className="surplus-allocation-box mt-3">
          <span className="alloc-title text-xs font-bold text-highlight">
            💡 AI 권장 가용 잉여금 포트폴리오 배분:
          </span>
          <div className="alloc-chips mt-2">
            <span className="glass-pill text-cyan">
              🇺🇸 핵심 코어 ETF (50%): <strong>{Math.max(0, Math.round(availableInvestmentSurplus * 0.5)).toLocaleString()}원</strong>
            </span>
            <span className="glass-pill text-emerald">
              🚀 AI 주도 성장주 (35%): <strong>{Math.max(0, Math.round(availableInvestmentSurplus * 0.35)).toLocaleString()}원</strong>
            </span>
            <span className="glass-pill text-amber">
              🛡️ 기회 유동성 (15%): <strong>{Math.max(0, Math.round(availableInvestmentSurplus * 0.15)).toLocaleString()}원</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 ULTRA-SLEEK GLASS MODAL FOR FINANCIAL BASELINE SETTINGS */}
      {isSettingsModalOpen && (
        <div className="modal-backdrop-blur" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="financial-modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="modal-icon-badge bg-cyan-500/20 text-cyan p-2 rounded-lg">
                  <Sliders size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-highlight">⚙️ 재정 기준 금액 설정</h4>
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
                    type="number"
                    className="input-text financial-number-input"
                    value={incomeInput}
                    onChange={e => setIncomeInput(e.target.value)}
                    placeholder="0"
                  />
                  <span className="currency-unit">원</span>
                </div>
                <div className="quick-step-pills mt-2 flex gap-1.5 flex-wrap">
                  <button className="step-pill" onClick={() => adjustValue(setIncomeInput, incomeInput, 100000)}>+10만</button>
                  <button className="step-pill" onClick={() => adjustValue(setIncomeInput, incomeInput, 500000)}>+50만</button>
                  <button className="step-pill" onClick={() => adjustValue(setIncomeInput, incomeInput, 1000000)}>+100만</button>
                  <button className="step-pill text-rose" onClick={() => setIncomeInput('0')}>초기화</button>
                </div>
              </div>

              {/* Field 2: Fixed Costs */}
              <div className="financial-input-group glass-card p-3 border border-rose-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building size={15} className="text-rose" />
                    <span className="text-xs font-bold text-rose">2. 월 고정비 (월세 / 대출 / 보험 / 통신)</span>
                  </div>
                  <span className="mono text-xs font-bold text-rose">{formatKoreanUnits(fixedInput)}</span>
                </div>
                <div className="input-currency-wrapper">
                  <input
                    type="number"
                    className="input-text financial-number-input border-rose-500/40"
                    value={fixedInput}
                    onChange={e => setFixedInput(e.target.value)}
                    placeholder="0"
                  />
                  <span className="currency-unit">원</span>
                </div>
                <div className="quick-step-pills mt-2 flex gap-1.5 flex-wrap">
                  <button className="step-pill" onClick={() => adjustValue(setFixedInput, fixedInput, 50000)}>+5만</button>
                  <button className="step-pill" onClick={() => adjustValue(setFixedInput, fixedInput, 100000)}>+10만</button>
                  <button className="step-pill" onClick={() => adjustValue(setFixedInput, fixedInput, 500000)}>+50만</button>
                  <button className="step-pill text-rose" onClick={() => setFixedInput('0')}>초기화</button>
                </div>
              </div>

              {/* Field 3: Monthly Investment Target */}
              <div className="financial-input-group glass-card p-3 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Target size={15} className="text-emerald" />
                    <span className="text-xs font-bold text-emerald">3. 월간 목표 투자액</span>
                  </div>
                  <span className="mono text-xs font-bold text-emerald">{formatKoreanUnits(targetInput)}</span>
                </div>
                <div className="input-currency-wrapper">
                  <input
                    type="number"
                    className="input-text financial-number-input border-emerald-500/40"
                    value={targetInput}
                    onChange={e => setTargetInput(e.target.value)}
                    placeholder="0"
                  />
                  <span className="currency-unit">원</span>
                </div>
                <div className="quick-step-pills mt-2 flex gap-1.5 flex-wrap">
                  <button className="step-pill" onClick={() => adjustValue(setTargetInput, targetInput, 100000)}>+10만</button>
                  <button className="step-pill" onClick={() => adjustValue(setTargetInput, targetInput, 500000)}>+50만</button>
                  <button className="step-pill" onClick={() => adjustValue(setTargetInput, targetInput, 1000000)}>+100만</button>
                  <button className="step-pill text-rose" onClick={() => setTargetInput('0')}>초기화</button>
                </div>
              </div>

              {/* Live Preview Strip */}
              <div className="preview-calc-strip p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-muted">예상 가용 잉여금:</span>
                <span className="mono font-bold text-cyan text-sm">
                  {previewSurplus.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="modal-footer-actions flex justify-end gap-2.5 mt-5 pt-3 border-t border-white/10">
              <button className="btn btn-secondary" onClick={() => setIsSettingsModalOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary px-5 font-bold" onClick={saveSettings}>
                <Check size={16} />
                <span>설정 저장하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card SMS & Expense Input Bar */}
      <div className="expense-input-card glass-card mt-4">
        <div className="panel-header">
          <div className="panel-title-with-icon">
            <CreditCard size={18} className="text-purple" />
            <h4>카드 결제 문자 및 자연어 지출 자동 분류기</h4>
          </div>
          <span className="badge badge-purple">NLP Smart Categorizer</span>
        </div>

        <form onSubmit={handleSubmit} className="expense-nlp-form">
          <div className="input-with-button">
            <input
              type="text"
              className="input-text"
              placeholder="카드 결제 문자 또는 자연어 붙여넣기 (예: '[신한카드] 08/26 12:30 스타벅스 6,500원 결제', '쿠팡 생필품 34000원')"
              value={smsInput}
              onChange={e => handleInputChange(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>지출 기록</span>
            </button>
          </div>
        </form>

        {previewParsed && (
          <div className="nlp-preview-card mt-3">
            <div className="nlp-preview-header">
              <Sparkles size={14} className="text-cyan" />
              <span className="text-xs font-bold text-cyan">자연어 파싱 결과 미리보기</span>
            </div>
            <div className="nlp-preview-body mt-1">
              <span className="preview-chip">항목: <strong>{previewParsed.description}</strong></span>
              <span className="preview-chip">금액: <strong className="text-rose">{Number(previewParsed.amount).toLocaleString()}원</strong></span>
              <span className="preview-chip">분류: <strong className="text-cyan">{previewParsed.category}</strong></span>
              <span className="preview-chip text-muted text-xs">일시: {previewParsed.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Split: Donut Chart & Expense History Table */}
      <div className="expense-detail-grid mt-4">
        {/* Left: Category Doughnut Chart */}
        <div className="expense-chart-card glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <PieIcon size={18} className="text-cyan" />
              <h4>카테고리별 지출 비중</h4>
            </div>
          </div>

          <div className="doughnut-chart-wrapper">
            {chartLabels.length > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="empty-state-card flex flex-col items-center justify-center p-8 text-center">
                <Wallet size={36} className="text-muted/50 mb-2" />
                <p className="text-muted text-xs font-medium">등록된 지출 내역이 없습니다.</p>
                <p className="text-muted/60 text-2xs mt-1">위 입력창에 카드 결제 문자를 붙여넣어보세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Expense Items History List */}
        <div className="expense-history-card glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <Wallet size={18} className="text-emerald" />
              <h4>변동지출 내역 ({expenses.length}건)</h4>
            </div>
            <span className="mono text-xs text-muted">
              총 {totalVariableExpense.toLocaleString()}원
            </span>
          </div>

          <div className="expense-items-table">
            {expenses.length === 0 ? (
              <div className="empty-state-card flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted text-xs font-medium">등록된 지출 내역이 없습니다.</p>
                <p className="text-muted/60 text-2xs mt-1">새로운 결제 내역을 기록하면 이곳에 실시간 누적됩니다.</p>
              </div>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="expense-row-item">
                  <div className="expense-item-info">
                    <div className="expense-main-line">
                      <span className="expense-desc">{expense.description}</span>
                      <span className="badge badge-cyan text-xs">{expense.category}</span>
                    </div>
                    <div className="expense-meta-line text-xs text-muted">
                      <span>{expense.date}</span>
                      {expense.card && <span> · {expense.card}</span>}
                    </div>
                  </div>

                  <div className="expense-item-actions">
                    <span className="expense-amount mono text-rose font-bold">
                      -{Number(expense.amount).toLocaleString()}원
                    </span>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => onDeleteExpense(expense.id)}
                      title="지출 삭제"
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
    </div>
  );
}
