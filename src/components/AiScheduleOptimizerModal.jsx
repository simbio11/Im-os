import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  X, 
  Clock, 
  RotateCcw, 
  Zap, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { optimizeScheduleWithAI } from '../utils/aiScheduleOptimizer';
import { getTodayDateStr, getRelativeDateStr, formatKoreanDate } from '../utils/dateUtils';
import { CALENDAR_CATEGORIES } from '../data/calendarEvents';

export function AiScheduleOptimizerModal({ 
  isOpen, 
  onClose, 
  currentEvents = [], 
  onApplyOptimizedEvents, 
  defaultTargetDate = null,
  apiKey = null 
}) {
  const [instruction, setInstruction] = useState('');
  const [targetDate, setTargetDate] = useState(defaultTargetDate || getTodayDateStr());
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  if (!isOpen) return null;

  const todayStr = getTodayDateStr();
  const tomorrowStr = getRelativeDateStr(1);

  const handleRunOptimization = async (customPrompt = null) => {
    const textToRun = customPrompt || instruction;
    if (!textToRun.trim()) return;

    setIsProcessing(true);
    setAiResult(null);

    try {
      const result = await optimizeScheduleWithAI({
        userInstruction: textToRun,
        currentEvents,
        targetDate,
        apiKey
      });
      setAiResult(result);
    } catch (err) {
      console.error("Schedule AI optimization error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!aiResult || !aiResult.allEvents) return;
    onApplyOptimizedEvents(aiResult.allEvents);
    onClose();
  };

  const setPresetPrompt = (prompt, dateStr = null) => {
    setInstruction(prompt);
    if (dateStr) setTargetDate(dateStr);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-optimizer-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="panel-title-with-icon">
            <div className="ai-icon-glow">
              <Sparkles size={22} className="text-cyan animate-pulse" />
            </div>
            <div>
              <h4>✨ AI 일정 자동 일괄 편집 & 최적화 (Schedule Copilot)</h4>
              <p className="text-muted text-xs">
                자연어 한 문장으로 일정을 일괄 등록하거나, 시간을 뒤로 미루고, 겹치는 일정을 자동 정리합니다.
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Date Selector Row */}
        <div className="ai-target-date-row">
          <span className="text-xs text-muted font-semibold">적용 대상 날짜:</span>
          <div className="date-pill-group">
            <button 
              type="button" 
              className={`date-pill ${targetDate === todayStr ? 'active' : ''}`}
              onClick={() => setTargetDate(todayStr)}
            >
              오늘 ({todayStr.slice(5)})
            </button>
            <button 
              type="button" 
              className={`date-pill ${targetDate === tomorrowStr ? 'active' : ''}`}
              onClick={() => setTargetDate(tomorrowStr)}
            >
              내일 ({tomorrowStr.slice(5)})
            </button>
            <input
              type="date"
              className="input-text-sm mono"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        {/* Preset Prompt Chips */}
        <div className="ai-preset-chips-row">
          <span className="text-xs text-muted font-bold">💡 빠른 AI 추천 명령:</span>
          <button 
            type="button"
            className="chip-btn-ai"
            onClick={() => {
              setPresetPrompt("오늘 14시 이후 일정 30분씩 뒤로 연기해줘", todayStr);
              handleRunOptimization("오늘 14시 이후 일정 30분씩 뒤로 연기해줘");
            }}
          >
            ⏰ 오후 일정 30분씩 뒤로 미루기
          </button>
          <button 
            type="button"
            className="chip-btn-ai"
            onClick={() => {
              setPresetPrompt("겹치는 일정 충돌 해결하고 미팅 사이에 15분 휴식 버퍼 넣어줘", targetDate);
              handleRunOptimization("겹치는 일정 충돌 해결하고 미팅 사이에 15분 휴식 버퍼 넣어줘");
            }}
          >
            🛡️ 겹치는 일정 충돌 해결 & 15분 버퍼
          </button>
          <button 
            type="button"
            className="chip-btn-ai"
            onClick={() => setPresetPrompt(
`내일 일정:
- 09:30 AI 아키텍처 딥워크 2시간
- 13:00 팀 싱크 미팅
- 15:30 주식 포트폴리오 점검
- 18:00 5km 모닝 러닝 & 샤워`, tomorrowStr)}
          >
            📝 텍스트 목록으로 일괄 등록
          </button>
          <button 
            type="button"
            className="chip-btn-ai"
            onClick={() => {
              setPresetPrompt("고효율 딥워크 및 러닝 하루 시간표 자동 생성해줘", targetDate);
              handleRunOptimization("고효율 딥워크 및 러닝 하루 시간표 자동 생성해줘");
            }}
          >
            🚀 고효율 하루 시간표 자동 생성
          </button>
        </div>

        {/* Input Textarea Area */}
        <div className="ai-input-box">
          <textarea
            className="textarea-input ai-textarea"
            rows={4}
            placeholder="자연어로 원하는 작업을 입력하세요.&#10;예1: '오늘 오후 일정 30분씩 미뤄줘'&#10;예2: '내일 오전 10시 팀미팅 1시간, 14시부터 16시까지 딥워크, 18시에 5km 러닝 넣어줘'&#10;예3: '일정 겹치는 거 자동으로 순서대로 정리해줘'"
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
          />
          <div className="ai-input-actions">
            <span className="text-xs text-muted">
              {apiKey ? "🟢 Gemini 1.5 Live AI 연결됨" : "⚡ 초고속 내장 스마트 AI 엔진 동작 중"}
            </span>
            <button 
              className="btn btn-primary btn-sm"
              disabled={isProcessing || !instruction.trim()}
              onClick={() => handleRunOptimization()}
            >
              {isProcessing ? (
                <>
                  <Wand2 size={14} className="animate-spin" />
                  <span>AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>AI 일정 분석 & 생성</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Result Diff Preview */}
        {aiResult && (
          <div className="ai-result-preview-card">
            <div className="ai-result-header">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald" />
                <span className="font-bold text-sm text-highlight">{aiResult.summary}</span>
              </div>
              <span className="badge badge-cyan">{formatKoreanDate(aiResult.targetDate)}</span>
            </div>

            {/* List of Affected / Created Events */}
            <div className="ai-preview-events-list">
              {aiResult.newEvents && aiResult.newEvents.length > 0 && (
                <div className="preview-group">
                  <span className="text-xs font-bold text-emerald mb-1 block">
                    ✨ 새로 추가될 일정 ({aiResult.newEvents.length}건):
                  </span>
                  <div className="preview-chips-grid">
                    {aiResult.newEvents.map(evt => (
                      <div key={evt.id} className="preview-event-card new">
                        <div className="flex justify-between items-center mb-1">
                          <span className="badge badge-emerald text-xs">NEW</span>
                          <span className="mono text-xs text-cyan">{evt.startTime} - {evt.endTime}</span>
                        </div>
                        <div className="font-semibold text-xs text-highlight">{evt.title}</div>
                        <div className="text-xs text-muted mt-1">{evt.location}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiResult.modifiedEvents && aiResult.modifiedEvents.length > 0 && (
                <div className="preview-group mt-3">
                  <span className="text-xs font-bold text-amber mb-1 block">
                    🔄 시간 조정된 일정 ({aiResult.modifiedEvents.length}건):
                  </span>
                  <div className="preview-chips-grid">
                    {aiResult.modifiedEvents.map(evt => (
                      <div key={evt.id} className="preview-event-card modified">
                        <div className="flex justify-between items-center mb-1">
                          <span className="badge badge-amber text-xs">MODIFIED</span>
                          <span className="mono text-xs text-amber font-bold">{evt.startTime} - {evt.endTime}</span>
                        </div>
                        <div className="font-semibold text-xs text-highlight">{evt.title}</div>
                        <div className="text-xs text-faint mt-1">{evt.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply Action Button */}
            <div className="ai-apply-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setAiResult(null)}>
                다시 작성
              </button>
              <button className="btn btn-emerald" onClick={handleApply}>
                <Check size={16} />
                <span>✨ 캘린더에 즉시 적용 (+30 XP)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
