import React, { useState } from 'react';
import { 
  Utensils, 
  PieChart as PieIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Flame, 
  Check, 
  AlertCircle,
  Scale
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { parseFoodNaturalLanguage } from '../data/nutritionDb';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DietTracker({ dietLogs, onAddDietLog, onDeleteDietLog }) {
  const [naturalInput, setNaturalInput] = useState('');
  const [mealType, setMealType] = useState('점심');
  const [selectedGram, setSelectedGram] = useState('auto'); // 'auto', '50', '100', '130', '150', '200', '250', '300', '400', '500'
  const [previewParsed, setPreviewParsed] = useState(null);

  // Daily Nutritional Goals
  const DAILY_GOALS = {
    kcal: 2200,
    protein: 140, // g
    carbs: 220, // g
    fat: 65 // g
  };

  // Calculate current totals
  const totalKcal = dietLogs.reduce((acc, log) => acc + (log.kcal || 0), 0);
  const totalCarbs = parseFloat(dietLogs.reduce((acc, log) => acc + (log.carbs || 0), 0).toFixed(1));
  const totalProtein = parseFloat(dietLogs.reduce((acc, log) => acc + (log.protein || 0), 0).toFixed(1));
  const totalFat = parseFloat(dietLogs.reduce((acc, log) => acc + (log.fat || 0), 0).toFixed(1));

  const kcalPercent = Math.min(100, Math.round((totalKcal / DAILY_GOALS.kcal) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / DAILY_GOALS.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / DAILY_GOALS.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / DAILY_GOALS.fat) * 100));

  // Doughnut Chart Data
  const chartData = {
    labels: ['탄수화물 (Carbs)', '단백질 (Protein)', '지방 (Fat)'],
    datasets: [
      {
        data: [totalCarbs || 1, totalProtein || 1, totalFat || 1],
        backgroundColor: ['#00f0ff', '#10b981', '#f59e0b'],
        borderColor: ['#080b11', '#080b11', '#080b11'],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return ` ${context.label}: ${context.raw}g`;
          }
        }
      }
    },
    cutout: '72%'
  };

  const computeParsed = (text, gramVal) => {
    if (!text || text.trim().length === 0) return null;
    const gNum = gramVal && gramVal !== 'auto' ? parseFloat(gramVal) : null;
    return parseFoodNaturalLanguage(text, gNum);
  };

  const handleInputChange = (val, gramVal = selectedGram) => {
    setNaturalInput(val);
    if (val.trim().length > 0) {
      const parsed = computeParsed(val, gramVal);
      setPreviewParsed(parsed);
    } else {
      setPreviewParsed(null);
    }
  };

  const handleGramSelect = (gramVal) => {
    setSelectedGram(gramVal);
    if (naturalInput.trim().length > 0) {
      const parsed = computeParsed(naturalInput, gramVal);
      setPreviewParsed(parsed);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    const parsed = previewParsed || computeParsed(naturalInput, selectedGram);
    if (!parsed) return;

    const gramSuffix = selectedGram !== 'auto' && !naturalInput.includes('g') && !naturalInput.includes('그램') ? ` (${selectedGram}g)` : '';
    const formattedRawText = `${naturalInput.trim()}${gramSuffix}`;

    onAddDietLog({
      id: `diet-${Date.now()}`,
      mealType,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      rawText: formattedRawText,
      kcal: parsed.totals.kcal,
      carbs: parsed.totals.carbs,
      protein: parsed.totals.protein,
      fat: parsed.totals.fat
    });

    setNaturalInput('');
    setPreviewParsed(null);
    setSelectedGram('auto');
  };

  const setExampleInput = (text, type = '점심', gram = 'auto') => {
    setMealType(type);
    setSelectedGram(gram);
    handleInputChange(text, gram);
  };

  const GRAM_PRESETS = ['50', '100', '130', '150', '200', '250', '300', '400', '500'];

  return (
    <div className="diet-tracker-container">
      {/* Top Banner: Quick NLP Input */}
      <div className="diet-input-card glass-card">
        <div className="panel-header">
          <div className="panel-title-with-icon">
            <Utensils size={18} className="text-emerald" />
            <h4>자연어 식단 & 영양 분석기 (NLP Engine)</h4>
          </div>
          <span className="badge badge-emerald">Real-time NLP Parser</span>
        </div>

        <form onSubmit={handleSubmit} className="diet-nlp-form">
          <div className="diet-form-inputs">
            {/* 1. Meal Type Selector */}
            <select 
              className="select-input meal-type-select"
              value={mealType}
              onChange={e => setMealType(e.target.value)}
            >
              <option value="아침">아침 (Breakfast)</option>
              <option value="점심">점심 (Lunch)</option>
              <option value="저녁">저녁 (Dinner)</option>
              <option value="간식/보충제">간식/보충제 (Snack)</option>
            </select>

            {/* 2. Natural Language Food Search Input */}
            <input
              type="text"
              className="input-text flex-1"
              placeholder="음식명 입력 (예: '닭가슴살', '밥', '제육볶음', '소고기 스테이크', '그릭요거트, 바나나')"
              value={naturalInput}
              onChange={e => handleInputChange(e.target.value)}
            />

            {/* 3. Gram (g) Selector Right Next to Search Input */}
            <div className="gram-select-wrapper">
              <Scale size={14} className="gram-icon text-emerald" />
              <select
                className="select-input gram-select-input"
                value={selectedGram}
                onChange={e => handleGramSelect(e.target.value)}
                title="섭취 중량 (g) 선택"
              >
                <option value="auto">중량(g) 선택</option>
                <option value="50">50g</option>
                <option value="100">100g (1팩/1회)</option>
                <option value="130">130g (정량)</option>
                <option value="150">150g</option>
                <option value="200">200g (1인분)</option>
                <option value="250">250g</option>
                <option value="300">300g (든든하게)</option>
                <option value="400">400g</option>
                <option value="500">500g (대용량)</option>
              </select>
            </div>

            {/* 4. Submit Button */}
            <button type="submit" className="btn btn-emerald">
              <Plus size={16} />
              <span>식단 등록</span>
            </button>
          </div>

          {/* Quick Gram Preset Pills & Frequent Diets */}
          <div className="diet-aux-controls-row mt-3">
            {/* Quick Gram Pills */}
            <div className="quick-gram-pills">
              <span className="text-xs text-muted font-bold">빠른 g 선택:</span>
              {GRAM_PRESETS.map(g => (
                <button
                  key={g}
                  type="button"
                  className={`gram-pill-btn ${selectedGram === g ? 'active' : ''}`}
                  onClick={() => handleGramSelect(g)}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="quick-diet-presets mt-2">
            <span className="text-muted text-xs">자주 먹는 식단:</span>
            <button 
              type="button" 
              className="chip-btn"
              onClick={() => setExampleInput("닭가슴살", "점심", "130")}
            >
              🍗 닭가슴살 130g
            </button>
            <button 
              type="button" 
              className="chip-btn"
              onClick={() => setExampleInput("흰쌀밥", "점심", "130")}
            >
              🍚 밥 130g
            </button>
            <button 
              type="button" 
              className="chip-btn"
              onClick={() => setExampleInput("소고기 등심", "저녁", "200")}
            >
              🥩 소고기 200g
            </button>
            <button 
              type="button" 
              className="chip-btn"
              onClick={() => setExampleInput("제육볶음 1인분, 밥 2/3공기, 계란후라이 1개", "점심", "auto")}
            >
              제육 정식 (755 kcal)
            </button>
            <button 
              type="button" 
              className="chip-btn"
              onClick={() => setExampleInput("그릭요거트 100g, 바나나 1개, 견과류 1봉", "아침", "auto")}
            >
              모닝 볼 (355 kcal)
            </button>
          </div>

          {/* Live NLP Breakdown Preview Box */}
          {previewParsed && (
            <div className="diet-preview-card mt-3">
              <div className="preview-top-row">
                <div className="flex items-center gap-2">
                  <span className="badge badge-cyan">자동 영양소 분석 결과</span>
                  {selectedGram !== 'auto' && (
                    <span className="badge badge-emerald font-bold mono">⚖️ {selectedGram}g 기준 산출</span>
                  )}
                </div>
                <span className="mono font-bold text-highlight">{previewParsed.totals.kcal} kcal</span>
              </div>
              <div className="preview-macros-grid">
                <div className="macro-chip">
                  <span className="macro-label text-cyan">탄수화물</span>
                  <span className="macro-val mono">{previewParsed.totals.carbs}g</span>
                </div>
                <div className="macro-chip">
                  <span className="macro-label text-emerald">단백질</span>
                  <span className="macro-val mono">{previewParsed.totals.protein}g</span>
                </div>
                <div className="macro-chip">
                  <span className="macro-label text-amber">지방</span>
                  <span className="macro-val mono">{previewParsed.totals.fat}g</span>
                </div>
                <div className="macro-chip">
                  <span className="macro-label text-purple">식이섬유</span>
                  <span className="macro-val mono">{previewParsed.totals.fiber}g</span>
                </div>
              </div>

              {previewParsed.items.length > 0 && (
                <div className="preview-items-list mt-2">
                  {previewParsed.items.map((it, idx) => (
                    <span key={idx} className="preview-sub-item">
                      ✓ {it.name} ({it.portionLabel}) ➔ <strong>{it.kcal} kcal</strong> (단백질 {it.protein}g)
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* 2-Column Split: Nutrition Macro Progress & Recorded Diet Logs */}
      <div className="diet-grid mt-4">
        {/* Left Column: Macro Gauge & Doughnut Chart */}
        <div className="diet-macro-card glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <PieIcon size={18} className="text-cyan" />
              <h4>오늘의 영양소(탄단지) 비율 & 목표 달성률</h4>
            </div>
            <span className="badge badge-cyan mono">Goal: {DAILY_GOALS.kcal} kcal</span>
          </div>

          <div className="chart-and-stats-row">
            {/* Doughnut Chart with fixed dimension box */}
            <div className="doughnut-chart-box">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="chart-center-overlay">
                <div className="center-kcal mono font-bold text-highlight">{totalKcal}</div>
                <div className="center-unit text-muted text-xs">kcal</div>
              </div>
            </div>

            {/* Macro Breakdown Bars */}
            <div className="macro-bars-column">
              {/* Calories */}
              <div className="macro-bar-item">
                <div className="macro-bar-header">
                  <span className="text-xs text-muted font-bold">총 칼로리</span>
                  <span className="mono text-xs font-bold text-highlight">
                    {totalKcal} / {DAILY_GOALS.kcal} kcal ({kcalPercent}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill fill-cyan" 
                    style={{ width: `${kcalPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Protein */}
              <div className="macro-bar-item">
                <div className="macro-bar-header">
                  <span className="text-xs text-emerald font-bold">단백질 (Protein)</span>
                  <span className="mono text-xs font-bold text-emerald">
                    {totalProtein} / {DAILY_GOALS.protein}g ({proteinPercent}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill fill-emerald" 
                    style={{ width: `${proteinPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Carbs */}
              <div className="macro-bar-item">
                <div className="macro-bar-header">
                  <span className="text-xs text-cyan font-bold">탄수화물 (Carbs)</span>
                  <span className="mono text-xs font-bold text-cyan">
                    {totalCarbs} / {DAILY_GOALS.carbs}g ({carbsPercent}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill fill-cyan" 
                    style={{ width: `${carbsPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Fat */}
              <div className="macro-bar-item">
                <div className="macro-bar-header">
                  <span className="text-xs text-amber font-bold">지방 (Fat)</span>
                  <span className="mono text-xs font-bold text-amber">
                    {totalFat} / {DAILY_GOALS.fat}g ({fatPercent}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill fill-amber" 
                    style={{ width: `${fatPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Log History */}
        <div className="diet-logs-card glass-card">
          <div className="panel-header">
            <h4>오늘 기록된 식단 ({dietLogs.length}건)</h4>
            <span className="badge badge-emerald">Daily Nutrition Log</span>
          </div>

          <div className="diet-logs-list">
            {dietLogs.length === 0 ? (
              <div className="empty-state-box">
                <Utensils size={32} className="text-faint" />
                <p className="text-muted text-xs">기록된 식단이 없습니다. 상단에서 자연어로 간편하게 입력하세요.</p>
              </div>
            ) : (
              dietLogs.map(log => (
                <div key={log.id} className="diet-log-item glass-card">
                  <div className="diet-log-header">
                    <span className="badge badge-cyan text-xs font-bold">{log.mealType}</span>
                    <span className="mono text-xs text-muted">{log.time}</span>
                    <button 
                      className="btn-icon btn-delete ml-auto"
                      onClick={() => onDeleteDietLog(log.id)}
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="diet-log-body">
                    <p className="diet-raw-text text-sm font-semibold text-highlight">{log.rawText}</p>
                    <div className="diet-macros-row mono text-xs mt-1">
                      <span className="text-highlight font-bold">{log.kcal} kcal</span>
                      <span className="text-muted">•</span>
                      <span className="text-cyan">탄: {log.carbs}g</span>
                      <span className="text-emerald">단: {log.protein}g</span>
                      <span className="text-amber">지: {log.fat}g</span>
                    </div>
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
