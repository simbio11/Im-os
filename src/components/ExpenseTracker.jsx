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
  X
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
  const [editingField, setEditingField] = useState(null); // 'income' | 'fixed' | 'target'
  const [editValue, setEditValue] = useState('');

  // Financial Variables
  const monthlyIncome = Number(userProfile?.monthlyIncome) || 6500000; // 650만원
  const fixedCosts = Number(userProfile?.fixedCosts) || 1850000; // 185만원
  const investmentTarget = Number(userProfile?.monthlyInvestmentTarget) || 3000000; // 300만원

  const startEdit = (field, currentVal) => {
    setEditingField(field);
    setEditValue(String(currentVal));
  };

  const commitEdit = () => {
    const num = parseInt(editValue.replace(/,/g, ''), 10);
    if (!isNaN(num) && num >= 0 && onUpdateUserProfile) {
      if (editingField === 'income') onUpdateUserProfile({ monthlyIncome: num });
      if (editingField === 'fixed') onUpdateUserProfile({ fixedCosts: num });
      if (editingField === 'target') onUpdateUserProfile({ monthlyInvestmentTarget: num });
    }
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

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
          {/* Step 1: Income - Editable */}
          <div 
            className="surplus-step-tile surplus-step-tile-editable cursor-pointer"
            onClick={() => editingField !== 'income' && startEdit('income', monthlyIncome)}
            title="클릭하여 당월 총소득 수정"
          >
            <div className="step-tile-top">
              <span className="step-tag text-cyan">1. 당월 총소득</span>
              <span className="step-sign text-emerald">+</span>
            </div>
            {editingField === 'income' ? (
              <div className="step-edit-box mt-1" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  type="number"
                  className="input-text step-inline-input"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => e.key === 'Enter' && commitEdit()}
                />
                <div className="flex gap-1 mt-1">
                  <button className="btn btn-primary btn-xs" onClick={commitEdit}>저장</button>
                  <button className="btn btn-secondary btn-xs" onClick={cancelEdit}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <div className="step-amount mono text-highlight">
                  {monthlyIncome.toLocaleString()}원 <Edit3 size={12} className="inline text-muted" />
                </div>
                <span className="step-desc text-muted text-xs">급여 및 사업 소득 (클릭하여 수정)</span>
              </>
            )}
          </div>

          {/* Step 2: Fixed Costs - Editable */}
          <div 
            className="surplus-step-tile surplus-step-tile-editable cursor-pointer"
            onClick={() => editingField !== 'fixed' && startEdit('fixed', fixedCosts)}
            title="클릭하여 고정비 수정"
          >
            <div className="step-tile-top">
              <span className="step-tag text-rose">2. 고정비</span>
              <span className="step-sign text-rose">-</span>
            </div>
            {editingField === 'fixed' ? (
              <div className="step-edit-box mt-1" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  type="number"
                  className="input-text step-inline-input"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => e.key === 'Enter' && commitEdit()}
                />
                <div className="flex gap-1 mt-1">
                  <button className="btn btn-primary btn-xs" onClick={commitEdit}>저장</button>
                  <button className="btn btn-secondary btn-xs" onClick={cancelEdit}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <div className="step-amount mono text-rose">
                  {fixedCosts.toLocaleString()}원 <Edit3 size={12} className="inline text-muted" />
                </div>
                <span className="step-desc text-muted text-xs">월세, 보험, 통신, 대출 (클릭하여 수정)</span>
              </>
            )}
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

        {/* Step 4: Final Investment Surplus Result Card */}
        <div className="surplus-result-banner glass-card mt-3">
          <div className="result-banner-left">
            <span className="badge badge-cyan font-bold text-xs">🎯 최종 투자 가용 잉여금</span>
            <div className="result-amount mono text-cyan">
              {availableInvestmentSurplus.toLocaleString()} <small className="text-sm">원</small>
            </div>
            {editingField === 'target' ? (
              <div className="step-edit-box mt-1" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted">투자 목표:</span>
                  <input
                    autoFocus
                    type="number"
                    className="input-text step-inline-input w-32"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => e.key === 'Enter' && commitEdit()}
                  />
                  <button className="btn btn-primary btn-xs" onClick={commitEdit}>저장</button>
                  <button className="btn btn-secondary btn-xs" onClick={cancelEdit}>취소</button>
                </div>
              </div>
            ) : (
              <p 
                className="text-muted text-xs mt-1 cursor-pointer"
                onClick={() => startEdit('target', investmentTarget)}
                title="클릭하여 목표 투자액 수정"
              >
                월간 투자 목표(<span className="text-highlight underline font-bold">{investmentTarget.toLocaleString()}원 ✏️</span>) 대비 <strong className="text-emerald">{surplusTargetPercent}%</strong> 달성 중
              </p>
            )}
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
              className="badge badge-cyan cursor-pointer"
              onClick={() => handleInputChange('[KB국민] 08/27 12:40 구내식당 9,000원 결제')}
            >
              🍱 점심 식비
            </button>
            <button
              type="button"
              className="badge badge-purple cursor-pointer"
              onClick={() => handleInputChange('교보문고 AI 서적 35000원 구매')}
            >
              📚 도서 구매
            </button>
            <button
              type="button"
              className="badge badge-amber cursor-pointer"
              onClick={() => handleInputChange('스타벅스 아메리카노 4500원')}
            >
              ☕ 카페
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
              <div className="empty-state-card">
                <Wallet size={32} className="text-muted mb-2" />
                <p className="text-muted text-xs">지출 내역이 없습니다.</p>
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
              <div className="empty-state-card">
                <p className="text-muted text-xs">등록된 지출 내역이 없습니다.</p>
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
