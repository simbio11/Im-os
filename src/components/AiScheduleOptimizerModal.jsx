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
  Wand2,
  Key,
  MessageSquare,
  ListTodo
} from 'lucide-react';
import { optimizeScheduleWithAI, askScheduleQuestion } from '../utils/aiScheduleOptimizer';
import { getTodayDateStr, getRelativeDateStr, formatKoreanDate } from '../utils/dateUtils';
import { getStoredGeminiApiKey } from '../services/geminiService';
import { GeminiApiKeyModal } from './GeminiApiKeyModal';

export function AiScheduleOptimizerModal({ 
  isOpen, 
  onClose, 
  currentEvents = [], 
  routines = [],
  onApplyOptimizedEvents, 
  defaultTargetDate = null,
  apiKey = null,
  onOpenKeyModal = null
}) {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'chat'
  const [instruction, setInstruction] = useState('');
  const [targetDate, setTargetDate] = useState(defaultTargetDate || getTodayDateStr());
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Chat QA state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'c1',
      sender: 'assistant',
      text: '안녕하세요! **L&M OS 일정 지능형 비서**입니다.\n\n등록된 일정 요약, 비어있는 딥워크 시간 탐색, 겹치는 일정 분석 등 캘린더에 대해 무엇이든 물어보세요!',
      source: 'L&M OS Schedule Engine'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showKeyModalLocal, setShowKeyModalLocal] = useState(false);

  if (!isOpen) return null;

  const currentKey = apiKey || getStoredGeminiApiKey();
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
        apiKey: currentKey
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

  const handleSendChat = async (qToSend = null) => {
    const query = (qToSend || chatInput).trim();
    if (!query || isChatLoading) return;

    setChatMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: query }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await askScheduleQuestion({
        question: query,
        calendarEvents: currentEvents,
        routines,
        apiKey: currentKey
      });

      setChatMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: res.answer,
          source: res.source
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: '일정 분석 중 오류가 발생했습니다. 다시 질문해주세요.',
          source: 'System Error'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
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
              <h4>✨ AI 일정 자동 편성 & 질의응답 비서</h4>
              <p className="text-muted text-xs">
                자연어로 일정을 일괄 생성하고, 시간을 자동 조율하거나 내 일정에 대해 자유롭게 질문하세요.
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Sub Navigation Switcher & API Key Indicator */}
        <div className="flex justify-between items-center bg-black/30 p-1.5 rounded-lg border border-white/5">
          <div className="flex gap-1.5">
            <button
              type="button"
              className={`btn btn-xs ${activeTab === 'generator' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('generator')}
            >
              <ListTodo size={12} />
              <span>일정 자동 편성 & 편집</span>
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={12} />
              <span>일정 질의응답 (Schedule Q&A)</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-2xs"
            onClick={() => onOpenKeyModal ? onOpenKeyModal() : setShowKeyModalLocal(true)}
            title="Google Gemini API Key 설정"
          >
            <Key size={11} className={currentKey ? 'text-emerald' : 'text-amber'} />
            <span className="text-2xs">
              {currentKey ? '🟢 Gemini 1.5 연결됨' : '⚡ Gemini Key 등록'}
            </span>
          </button>
        </div>

        {/* TAB 1: GENERATOR & BULK EDITOR */}
        {activeTab === 'generator' && (
          <div className="flex flex-col gap-3">
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
                  setPresetPrompt("오후 2시 이후 일정 30분씩 뒤로 연기해줘", targetDate);
                  handleRunOptimization("오후 2시 이후 일정 30분씩 뒤로 연기해줘");
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
9시 기상
11시 학회
저녁 7시에 판교로 돌아옴`, tomorrowStr)}
              >
                📝 자연어 목록으로 스마트 일정 생성 (예시)
              </button>
            </div>

            {/* Input Textarea Area */}
            <div className="ai-input-box">
              <textarea
                className="textarea-input ai-textarea"
                rows={4}
                placeholder="자연어로 편하게 일정을 입력하세요.&#10;예1: '내일 9시 기상, 11시 학회, 저녁 7시에 판교 복귀'&#10;예2: '오늘 오후 일정 30분씩 미뤄줘'&#10;예3: '겹치는 일정 시간 겹치지 않게 순서대로 정리해줘'"
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
              />
              <div className="ai-input-actions">
                <span className="text-2xs text-muted">
                  {currentKey ? "✨ Google Gemini 1.5 Pro/Flash 지능 엔진 가동" : "⚡ 고정밀 한글 자연어 파서 동작 (무료)"}
                </span>
                <button 
                  className="btn btn-primary btn-sm"
                  disabled={isProcessing || !instruction.trim()}
                  onClick={() => handleRunOptimization()}
                >
                  {isProcessing ? (
                    <>
                      <Wand2 size={14} className="animate-spin" />
                      <span>AI 일정 분석 중...</span>
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
                              <span className="mono text-xs text-cyan font-bold">{evt.startTime} - {evt.endTime}</span>
                            </div>
                            <div className="font-semibold text-xs text-highlight">{evt.title}</div>
                            <div className="text-2xs text-muted mt-1">{evt.location} ({evt.category})</div>
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
                            <div className="text-2xs text-faint mt-1">{evt.notes}</div>
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
        )}

        {/* TAB 2: SCHEDULE QA CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col gap-3">
            {/* Quick Question Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button 
                className="chip-btn-ai text-2xs" 
                onClick={() => handleSendChat('내일 일정 브리핑해줘')}
              >
                📅 내일 일정 브리핑
              </button>
              <button 
                className="chip-btn-ai text-2xs" 
                onClick={() => handleSendChat('오늘 남은 할 일과 딥워크 시간 어떻게 돼?')}
              >
                🧠 오늘 남은 할일 점검
              </button>
              <button 
                className="chip-btn-ai text-2xs" 
                onClick={() => handleSendChat('이번 주에 등록된 전체 일정 요약해줘')}
              >
                📊 이번 주 전체 일정 요약
              </button>
            </div>

            {/* Chat Messages Container */}
            <div className="chat-messages-container" style={{ maxHeight: '300px', minHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'user' ? 'user' : 'assistant'} mb-2.5`}>
                  <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`} style={{ padding: '10px 14px', borderRadius: '10px', background: msg.sender === 'user' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-xs text-highlight whitespace-pre-line" style={{ margin: 0 }}>{msg.text}</p>
                    {msg.source && (
                      <span className="text-3xs text-muted block mt-1.5 font-mono">출처: {msg.source}</span>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-muted p-2">
                  <Wand2 size={13} className="animate-spin text-cyan" />
                  <span>일정 지능 데이터 분석 중...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                className="input-text text-xs flex-1"
                placeholder="내 일정에 대해 무엇이든 물어보세요 (예: '내일 일정 브리핑해줘')"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendChat();
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSendChat()}
                disabled={isChatLoading || !chatInput.trim()}
              >
                <Send size={14} />
                <span>질문</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Internal Key Modal Fallback */}
      <GeminiApiKeyModal
        isOpen={showKeyModalLocal}
        onClose={() => setShowKeyModalLocal(false)}
      />
    </div>
  );
}
