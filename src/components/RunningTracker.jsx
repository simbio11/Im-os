import React, { useState } from 'react';
import { 
  Activity, 
  Flame, 
  Heart, 
  Plus, 
  Trash2, 
  Trophy, 
  Zap, 
  Clock, 
  TrendingUp,
  Star
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { calculateRunningPace } from '../utils/nlpParsers';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend
);

export function RunningTracker({ runningLogs, onAddRunLog, onDeleteRunLog }) {
  const [distance, setDistance] = useState('5.0');
  const [duration, setDuration] = useState('26.5');
  const [conditionScore, setConditionScore] = useState(4);
  const [fatigueScore, setFatigueScore] = useState(2);
  const [heartRate, setHeartRate] = useState(148);
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const WEEKLY_GOAL_RUNS = 4; // 주 4회 5km
  const thisWeekRunsCount = runningLogs.length;
  const goalProgressPercent = Math.min(100, Math.round((thisWeekRunsCount / WEEKLY_GOAL_RUNS) * 100));

  const totalWeeklyKm = runningLogs.reduce((acc, r) => acc + (r.distance || 0), 0).toFixed(1);

  // Chart data: Weekly mileage
  const chartLabels = ['월 (8/20)', '수 (8/22)', '금 (8/24)', '일 (8/26)', '목표 (Goal)'];
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        type: 'bar',
        label: '러닝 거리 (km)',
        data: [0, 5.0, 5.15, 5.02, 5.0],
        backgroundColor: [
          'rgba(255, 255, 255, 0.05)',
          'rgba(0, 240, 255, 0.65)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(0, 240, 255, 0.85)',
          'rgba(139, 92, 246, 0.35)'
        ],
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} km`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } },
        min: 0,
        max: 8
      }
    }
  };

  const calculatedPace = calculateRunningPace(parseFloat(distance) || 0, parseFloat(duration) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const distNum = parseFloat(distance) || 5.0;
    const durNum = parseFloat(duration) || 26.0;

    onAddRunLog({
      id: `run-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      distance: distNum,
      durationMinutes: durNum,
      pace: calculateRunningPace(distNum, durNum),
      conditionScore: parseInt(conditionScore, 10),
      fatigueScore: parseInt(fatigueScore, 10),
      heartRateAvg: parseInt(heartRate, 10) || 145,
      notes: notes.trim() || "Zone 2 모닝 5km 안정적 완주."
    });

    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="running-tracker-container">
      {/* Top Banner: Weekly 5km Goal HUD */}
      <div className="running-goal-banner glass-card">
        <div className="goal-banner-left">
          <div className="goal-title-row">
            <div className="goal-icon-glow">
              <Activity size={24} className="text-cyan" />
            </div>
            <div>
              <h3>주 3~4회 5km 러닝 프로토콜 현황</h3>
              <p className="text-muted text-xs">
                Zone 2 심박수 기반 유산소 운동으로 PGC-1α 미토콘드리아 생합성 촉진 (+60 XP 지급)
              </p>
            </div>
          </div>

          <div className="weekly-runs-stepper">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className={`step-circle ${idx <= thisWeekRunsCount ? 'completed' : ''}`}>
                {idx <= thisWeekRunsCount ? `✓ ${idx}회차 (5km)` : `${idx}회차`}
              </div>
            ))}
          </div>

          <div className="progress-bar-large">
            <div 
              className="progress-fill-cyan" 
              style={{ width: `${goalProgressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="goal-banner-right">
          <div className="mileage-stat-card">
            <span className="stat-label">이번 주 누적 거리</span>
            <span className="stat-val mono text-cyan">{totalWeeklyKm} <small>km</small></span>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} />
            <span>{showAddForm ? '입력창 닫기' : '러닝 기록 등록'}</span>
          </button>
        </div>
      </div>

      {/* New Run Log Form */}
      {showAddForm && (
        <form className="new-run-form glass-card" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h4>새 러닝 세션 기록</h4>
            <span className="badge badge-cyan">Auto Pace & Fatigue Rating</span>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="text-xs text-muted">달린 거리 (km)</label>
              <input
                type="number"
                step="0.01"
                className="input-text mono"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs text-muted">소요 시간 (분)</label>
              <input
                type="number"
                step="0.1"
                className="input-text mono"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs text-muted">자동 계산 페이스 (/km)</label>
              <div className="input-text-disabled mono text-cyan font-bold">
                {calculatedPace}
              </div>
            </div>
          </div>

          <div className="form-grid-3 mt-3">
            <div className="form-group">
              <label className="text-xs text-muted">당일 컨디션 점수 (1~5점)</label>
              <select 
                className="select-input"
                value={conditionScore}
                onChange={e => setConditionScore(e.target.value)}
              >
                <option value="5">⭐⭐⭐⭐⭐ 5점 (최상)</option>
                <option value="4">⭐⭐⭐⭐ 4점 (좋음)</option>
                <option value="3">⭐⭐⭐ 3점 (보통)</option>
                <option value="2">⭐⭐ 2점 (피로감)</option>
                <option value="1">⭐ 1점 (매우 지침)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-xs text-muted">운동 후 피로도 (1~5점, 낮을수록 경쾌)</label>
              <select 
                className="select-input"
                value={fatigueScore}
                onChange={e => setFatigueScore(e.target.value)}
              >
                <option value="1">1점 - 거의 피로 없음 (상쾌함)</option>
                <option value="2">2점 - 적당한 활력 피로 (최적)</option>
                <option value="3">3점 - 약간 묵직함</option>
                <option value="4">4점 - 다리 뭉침 및 지침</option>
                <option value="5">5점 - 완전 고갈 (과훈련 주의)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-xs text-muted">평균 심박수 (bpm)</label>
              <input
                type="number"
                className="input-text mono"
                value={heartRate}
                onChange={e => setHeartRate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="text-xs text-muted">러닝 메모 & 특이사항</label>
            <input
              type="text"
              className="input-text"
              placeholder="예: 초반 2km 가볍게 빌드업, 후반 3km 5분대 유지. 호흡 쾌적."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions mt-3">
            <button type="submit" className="btn btn-emerald">
              <Zap size={16} />
              <span>러닝 완료 & +60 XP 받기</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid: Chart vs Recent Sessions */}
      <div className="running-grid">
        {/* Weekly Mileage Chart */}
        <div className="running-chart-card glass-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <TrendingUp size={18} className="text-cyan" />
              <h4>주간 마일리지 & 페이스 추이</h4>
            </div>
            <span className="badge badge-cyan">Weekly Mileage</span>
          </div>

          <div className="running-chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Run Logs List */}
        <div className="running-history-card glass-card">
          <div className="panel-header">
            <h4>최근 5km 러닝 기록 ({runningLogs.length}회)</h4>
            <span className="badge badge-emerald">Zone 2 Protocol</span>
          </div>

          <div className="running-logs-list">
            {runningLogs.map(log => (
              <div key={log.id} className="running-log-item">
                <div className="log-top-row">
                  <span className="run-dist mono text-highlight font-bold">{log.distance} km</span>
                  <span className="badge badge-cyan mono">페이스 {log.pace}</span>
                  <span className="mono text-xs text-muted ml-auto">{log.date}</span>
                  <button 
                    className="btn-icon btn-delete" 
                    onClick={() => onDeleteRunLog(log.id)}
                    title="기록 삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="log-stats-row">
                  <span className="stat-pill"><Clock size={12} /> {log.durationMinutes}분</span>
                  <span className="stat-pill"><Heart size={12} className="text-rose" /> {log.heartRateAvg || 145} bpm</span>
                  <span className="stat-pill">컨디션: {log.conditionScore}/5점</span>
                  <span className="stat-pill">피로도: {log.fatigueScore}/5점</span>
                </div>

                <div className="log-notes text-xs text-muted">
                  "{log.notes}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
