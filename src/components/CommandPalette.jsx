import React, { useState, useEffect, useRef } from 'react';
import { Command, Utensils, CreditCard, Activity, Search, X, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { parseFoodNaturalLanguage } from '../data/nutritionDb';
import { parseExpenseNaturalLanguage } from '../utils/nlpParsers';

export function CommandPalette({ isOpen, onClose, onAddDiet, onAddExpense, onAddRun, onAddEvent, onSearchRAG }) {
  const [input, setInput] = useState('');
  const [previewResult, setPreviewResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setInput('');
      setPreviewResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live preview parser based on input text
  useEffect(() => {
    if (!input.trim()) {
      setPreviewResult(null);
      return;
    }

    const trimmed = input.trim();

    // Check if it's an event/schedule format (e.g. "일정 14:00 투자 미팅", "스케줄 8/28 엔비디아 어닝콜")
    if (trimmed.startsWith('일정') || trimmed.startsWith('스케줄') || trimmed.includes('미팅') || trimmed.includes('어닝콜')) {
      const cleanTitle = trimmed.replace(/^(일정|스케줄)\s*/, '');
      const timeMatch = trimmed.match(/(\d{1,2}:\d{2})/);
      const startTime = timeMatch ? timeMatch[1] : '14:00';
      setPreviewResult({
        type: 'event',
        data: {
          title: cleanTitle || trimmed,
          date: '2026-08-26',
          startTime,
          endTime: '15:00',
          category: trimmed.includes('미팅') ? 'meeting' : trimmed.includes('어닝콜') ? 'market' : 'deepwork',
          location: '온라인/홈오피스'
        }
      });
      return;
    }

    // Check if it's an expense format (contains '원' or numbers or card pattern)
    if (trimmed.includes('원') || trimmed.includes('[신한') || trimmed.includes('[현대') || trimmed.includes('[KB') || trimmed.match(/지출|\d{3,9}/)) {
      const exp = parseExpenseNaturalLanguage(trimmed);
      if (exp && exp.amount > 0) {
        setPreviewResult({ type: 'expense', data: exp });
        return;
      }
    }

    // Check if it's a running format (e.g. "러닝 5km 26분", "운동 5km")
    if (trimmed.includes('러닝') || trimmed.includes('km') || trimmed.includes('달리기')) {
      const distMatch = trimmed.match(/(\d+(\.\d+)?)\s*km/i);
      const timeMatch = trimmed.match(/(\d+)\s*분/);
      const dist = distMatch ? parseFloat(distMatch[1]) : 5.0;
      const time = timeMatch ? parseFloat(timeMatch[1]) : 26.0;

      setPreviewResult({
        type: 'run',
        data: {
          distance: dist,
          durationMinutes: time,
          conditionScore: 4,
          fatigueScore: 2,
          notes: trimmed
        }
      });
      return;
    }

    // Default to Food parser
    const food = parseFoodNaturalLanguage(trimmed);
    if (food && food.totals.kcal > 0) {
      setPreviewResult({ type: 'diet', data: food });
    } else {
      // Fallback to RAG Search query
      setPreviewResult({ type: 'search', query: trimmed });
    }
  }, [input]);

  const handleExecute = () => {
    if (!previewResult) return;

    if (previewResult.type === 'expense') {
      onAddExpense(previewResult.data);
    } else if (previewResult.type === 'event') {
      onAddEvent({
        id: `evt-${Date.now()}`,
        ...previewResult.data,
        completed: false
      });
    } else if (previewResult.type === 'diet') {
      onAddDiet({
        mealType: "간편입력",
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        rawText: input,
        kcal: previewResult.data.totals.kcal,
        carbs: previewResult.data.totals.carbs,
        protein: previewResult.data.totals.protein,
        fat: previewResult.data.totals.fat
      });
    } else if (previewResult.type === 'run') {
      onAddRun(previewResult.data);
    } else if (previewResult.type === 'search') {
      onSearchRAG(previewResult.query);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content command-palette-modal" onClick={e => e.stopPropagation()}>
        <div className="command-palette-header">
          <Command size={20} className="text-cyan" />
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="자연어로 무엇이든 입력하세요 (예: '점심 제육볶음 1인분, 밥 2/3공기', '스타벅스 6500원', '러닝 5km 26분')"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleExecute();
            }}
          />
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Quick Example Chips */}
        <div className="command-chips-row">
          <span className="chips-label">빠른 예시:</span>
          <button 
            className="chip-btn" 
            onClick={() => setInput("점심 제육볶음 1인분, 밥 2/3공기, 계란후라이 1개")}
          >
            <Utensils size={12} /> 제육 식단 분석
          </button>
          <button 
            className="chip-btn" 
            onClick={() => setInput("[신한카드] 08/26 12:30 스타벅스 6,500원 결제")}
          >
            <CreditCard size={12} /> 카드 결제 문자
          </button>
          <button 
            className="chip-btn" 
            onClick={() => setInput("러닝 5km 25분 30초 컨디션 5점")}
          >
            <Activity size={12} /> 5km 모닝 러닝
          </button>
          <button 
            className="chip-btn" 
            onClick={() => setInput("최근 금리 변동에 따른 기술주 동향 요약")}
          >
            <Search size={12} /> RAG 시장 질의
          </button>
        </div>

        {/* Real-time Parsed Preview Box */}
        {previewResult && (
          <div className="command-preview-box">
            <div className="preview-header">
              <span className="badge badge-cyan">
                {previewResult.type === 'diet' && '🥗 식단 영양소 자동 분석'}
                {previewResult.type === 'expense' && '💳 가계부 지출 자동 분류'}
                {previewResult.type === 'run' && '🏃 5km 러닝 기록'}
                {previewResult.type === 'search' && '🔍 RAG 지식 검색'}
              </span>
              <span className="text-muted text-xs">Enter 키를 눌러 즉시 적용</span>
            </div>

            {previewResult.type === 'diet' && (
              <div className="preview-body">
                <div className="preview-diet-stats">
                  <div className="stat-pill"><span className="label">칼로리</span><span className="value mono">{previewResult.data.totals.kcal} kcal</span></div>
                  <div className="stat-pill"><span className="label">탄수화물</span><span className="value mono">{previewResult.data.totals.carbs}g</span></div>
                  <div className="stat-pill"><span className="label">단백질</span><span className="value mono text-emerald">{previewResult.data.totals.protein}g</span></div>
                  <div className="stat-pill"><span className="label">지방</span><span className="value mono">{previewResult.data.totals.fat}g</span></div>
                </div>
                <div className="preview-items-list">
                  {previewResult.data.items.map((it, idx) => (
                    <span key={idx} className="preview-sub-item">
                      {it.name} ({it.portionLabel}) ➔ {it.kcal}kcal
                    </span>
                  ))}
                </div>
              </div>
            )}

            {previewResult.type === 'expense' && (
              <div className="preview-body">
                <div className="preview-exp-row">
                  <div>
                    <span className="text-muted text-xs">사용처:</span>
                    <strong className="text-highlight"> {previewResult.data.merchant}</strong>
                  </div>
                  <div>
                    <span className="text-muted text-xs">카테고리:</span>
                    <span className="badge badge-purple">{previewResult.data.category}</span>
                  </div>
                  <div>
                    <span className="text-muted text-xs">금액:</span>
                    <strong className="text-cyan mono"> {previewResult.data.amount.toLocaleString()}원</strong>
                  </div>
                </div>
              </div>
            )}

            {previewResult.type === 'run' && (
              <div className="preview-body">
                <div className="preview-exp-row">
                  <div><span className="text-muted text-xs">거리:</span> <strong>{previewResult.data.distance} km</strong></div>
                  <div><span className="text-muted text-xs">소요시간:</span> <strong>{previewResult.data.durationMinutes}분</strong></div>
                  <div><span className="text-muted text-xs">컨디션:</span> <strong>5/5</strong></div>
                </div>
              </div>
            )}

            {previewResult.type === 'search' && (
              <div className="preview-body">
                <div className="text-sm text-muted">
                  "{previewResult.query}" 관련 브리핑 및 루틴 노트를 인텔리전스 RAG로 조회합니다.
                </div>
              </div>
            )}

            <div className="preview-footer">
              <button className="btn btn-primary btn-sm" onClick={handleExecute}>
                <span>기록 실행</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
