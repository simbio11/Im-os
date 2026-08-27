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
  ArrowRight
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
  onUpdateBudget 
}) {
  const [smsInput, setSmsInput] = useState('');
  const [previewParsed, setPreviewParsed] = useState(null);

  // Financial Variables
  const monthlyIncome = Number(userProfile?.monthlyIncome) || 6500000; // 650만원
  const fixedCosts = Number(userProfile?.fixedCosts) || 1850000; // 185만원
  const investmentTarget = Number(userProfile?.monthlyInvestmentTarget) || 3000000; // 300만원

  // Calculate Cumulative Variable Expenses
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  const variableExpenses = validExpenses.filter(e => e && !e.isFixed);
  const totalVariableExpense = variableExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // The Essential Core Formula:
  // Available Investment Surplus = Monthly Income - Fixed Costs - Cumulative Variable Expenses
  const availableInvestmentSurplus = monthlyIncome - fixedCosts - totalVariableExpense;
  const surplusTargetPercent = Math.min(100, Math.max(0, Math.round((availableInvestmentSurplus / investmentTarget) * 100)));

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

  return (
    <div className="expense-tracker-container">
      {/* 🎯 CORE INVESTMENT SURPLUS HUD BANNER */}
      <div className="surplus-hero-banner glass-card">
        <div className="surplus-formula-header">
          <div className="formula-icon-box">
            <TrendingUp size={22} className="text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-cyan">실시간 자산 배분 인텔리전스</span>
              <span className="badge badge-emerald mono">목표 대비 {surplusTargetPercent}%</span>
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
          <div className="surplus-step-tile">
            <div className="step-tile-top">
              <span className="step-tag text-cyan">1. 당월 총소득</span>
              <span className="step-sign text-emerald">+</span>
            </div>
            <div className="step-amount mono text-highlight">
              {monthlyIncome.toLocaleString()}원
            </div>
            <span className="step-desc text-muted text-xs">급여 및 사업 소득</span>
          </div>

          {/* Step 2: Fixed Costs */}
          <div className="surplus-step-tile">
            <div className="step-tile-top">
              <span className="step-tag text-rose">2. 고정비</span>
              <span className="step-sign text-rose">-</span>
            </div>
            <div className="step-amount mono text-rose">
              {fixedCosts.toLocaleString()}원
            </div>
            <span className="step-desc text-muted text-xs">월세, 보험, 통신, 대출</span>
          </div>

          {/* Step 3: Cumulative Variable Expenses */}
          <div className="surplus-step-tile">
            <div className="step-tile-top">
              <span className="step-tag text-amber">3. 누적 변동지출</span>
              <span className="step-sign text-amber">-</span>
            </div>
            <div className="step-amount mono text-amber">
              {totalVariableExpense.toLocaleString()}원
            </div>
            <span className="step-desc text-muted text-xs">식비, 쇼핑, 카페, 여가 ({expenses.length}건)</span>
          </div>
        </div>

        {/* Step 4: Final Investment Surplus Result Card (Full Width - Never Cut Off) */}
        <div className="surplus-result-banner glass-card mt-3">
          <div className="result-banner-left">
            <span className="badge badge-cyan font-bold text-xs">🎯 최종 투자 가용 잉여금</span>
            <div className="result-amount mono text-cyan">
              {availableInvestmentSurplus.toLocaleString()} <small className="text-sm">원</small>
            </div>
            <p className="text-muted text-xs mt-1">
              월간 투자 목표({investmentTarget.toLocaleString()}원) 대비 <strong className="text-emerald">{surplusTargetPercent}%</strong> 달성 중
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
              🇺🇸 핵심 코어 ETF (QQQ/S&P500 50%): <strong>{Math.round(availableInvestmentSurplus * 0.5).toLocaleString()}원</strong>
            </span>
            <span className="glass-pill text-emerald">
              🚀 AI 주도 성장주 (NVDA/TSLA 35%): <strong>{Math.round(availableInvestmentSurplus * 0.35).toLocaleString()}원</strong>
            </span>
            <span className="glass-pill text-amber">
              🛡️ 기회 유동성 (단기채/CMA 15%): <strong>{Math.round(availableInvestmentSurplus * 0.15).toLocaleString()}원</strong>
            </span>
          </div>
        </div>
      </div>

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

          {/* Quick Preset Buttons */}
          <div className="quick-expense-presets mt-2">
            <span className="text-muted text-xs">빠른 예시:</span>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handleInputChange("[신한카드] 08/26 12:30 스타벅스 8,500원 결제")}
            >
              스타벅스 8,500원 (식비/카페)
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handleInputChange("쿠팡 45,000원 결제 (생활/쇼핑)")}
            >
              쿠팡 45,000원 (생활/쇼핑)
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handleInputChange("해외주식 500,000원 매수 (투자/자산)")}
            >
              해외주식 50만원 (투자/자산)
            </button>
          </div>

          {/* Live NLP Extraction Preview Box */}
          {previewParsed && (
            <div className="expense-preview-card mt-3">
              <div className="preview-top-row">
                <span className="badge badge-cyan">자연어 지출 분석 추출 결과</span>
                <span className="mono font-bold text-highlight">{previewParsed.amount.toLocaleString()}원</span>
              </div>
              <div className="preview-details-grid mt-2">
                <div className="preview-detail-chip">
                  <span className="text-muted text-xs">가맹점 / 내역:</span>
                  <strong className="text-highlight text-xs">{previewParsed.description}</strong>
                </div>
                <div className="preview-detail-chip">
                  <span className="text-muted text-xs">자동 분류 카테고리:</span>
                  <span className="badge badge-purple">{previewParsed.category}</span>
                </div>
                <div className="preview-detail-chip">
                  <span className="text-muted text-xs">지출 일시:</span>
                  <span className="mono text-xs">{previewParsed.date} {previewParsed.time}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 2-Column Split: Category Doughnut Chart & Expense Logs Table */}
      <div className="expense-grid mt-4">
        {/* Left Column: Category Breakdown Chart */}
        <div className="expense-chart-card glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <PieIcon size={18} className="text-cyan" />
              <h4>카테고리별 지출 비중</h4>
            </div>
            <span className="mono text-xs text-muted">Total: {totalVariableExpense.toLocaleString()}원</span>
          </div>

          <div className="expense-chart-wrapper">
            <div className="doughnut-chart-box">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="chart-center-overlay">
                <div className="center-kcal mono font-bold text-highlight">{expenses.length}</div>
                <div className="center-unit text-muted text-xs">건 결제</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Expense Transaction History List */}
        <div className="expense-history-card glass-card">
          <div className="panel-header">
            <h4>지출 내역 목록 ({expenses.length}건)</h4>
            <span className="badge badge-cyan">Transactions</span>
          </div>

          <div className="expense-list-items">
            {validExpenses.length === 0 ? (
              <div className="empty-state-box">
                <CreditCard size={32} className="text-faint" />
                <p className="text-muted text-xs">기록된 지출 내역이 없습니다.</p>
              </div>
            ) : (
              validExpenses.map(exp => (
                <div key={exp.id || Math.random()} className="expense-item-row glass-card">
                  <div className="exp-left">
                    <span className="badge badge-purple text-xs">{exp.category || '기타'}</span>
                    <div>
                      <strong className="exp-desc text-sm text-highlight">
                        {exp.description || exp.merchant || '지출 내역'}
                      </strong>
                      <div className="exp-time-sub text-xs text-muted mono">
                        {exp.date || ''} {exp.time || ''} {exp.paymentMethod && `• ${exp.paymentMethod}`}
                      </div>
                    </div>
                  </div>

                  <div className="exp-right">
                    <span className="exp-amount mono font-bold text-highlight">
                      -{(Number(exp.amount) || 0).toLocaleString()}원
                    </span>
                    <button 
                      className="btn-icon btn-delete ml-2"
                      onClick={() => onDeleteExpense(exp.id)}
                      title="지출 삭제"
                    >
                      <Trash2 size={14} />
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
