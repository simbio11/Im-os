import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Minus, 
  Bot, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  RotateCw,
  ExternalLink,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  CalendarPlus,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cleanAiText } from '../services/localAiEngine.js';
import { getStoredGeminiApiKey } from '../services/geminiService.js';
import { processAiCopilotInstruction } from '../utils/aiActionEngine.js';

export function FloatingAiAssistant({
  calendarEvents = [],
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  userProfile = {},
  onNavigateTab,
  onBulkUpdateCalendarEvents,
  onAddDietLog,
  onAddExpense
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'assistant',
      text: '안녕하세요! L&M OS 실시간 AI Copilot입니다. "9월 매주 월, 목에 순회진료 일정 넣어줘", "내일 오후 3시 회의 추가해줘"처럼 말씀하시면 실제 캘린더에 바로 등록해 드립니다.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const apiKey = getStoredGeminiApiKey();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8, x: 0.85 }
      });
    } catch (e) {}
  };

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Execute through Unified AI Action Engine (Gemini 3.1 Pro / Local Hybrid)
      const result = await processAiCopilotInstruction({
        userInput: text,
        calendarEvents,
        routines,
        dietLogs,
        runningLogs,
        expenses,
        userProfile
      });

      let actionMeta = null;

      // Execute actual actions if any were produced
      if (result.actions && result.actions.length > 0) {
        for (const act of result.actions) {
          if (act.type === 'CLEAR_ALL_CALENDAR_EVENTS') {
            if (onBulkUpdateCalendarEvents) {
              onBulkUpdateCalendarEvents([]);
            }
            actionMeta = { type: 'clear_all' };
          } else if (act.type === 'ADD_CALENDAR_EVENTS' && Array.isArray(act.events) && act.events.length > 0) {
            // Merge new events into calendar
            const updated = [...calendarEvents, ...act.events];
            if (onBulkUpdateCalendarEvents) {
              onBulkUpdateCalendarEvents(updated);
            }
            actionMeta = {
              type: 'calendar',
              count: act.events.length,
              events: act.events
            };
            triggerConfetti();
          } else if (act.type === 'DELETE_CALENDAR_EVENT_BY_TITLE' && act.keyword) {
            const lowerKw = act.keyword.toLowerCase();
            const filtered = calendarEvents.filter(e => !e.title?.toLowerCase().includes(lowerKw));
            if (onBulkUpdateCalendarEvents) {
              onBulkUpdateCalendarEvents(filtered);
            }
            actionMeta = { type: 'delete_calendar', keyword: act.keyword };
          } else if (act.type === 'ADD_DIET_LOG' && act.log && onAddDietLog) {
            onAddDietLog({
              id: `diet-ai-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              ...act.log
            });
            actionMeta = { type: 'diet' };
          } else if (act.type === 'ADD_EXPENSE' && act.expense && onAddExpense) {
            onAddExpense({
              id: `exp-ai-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              ...act.expense
            });
            actionMeta = { type: 'expense' };
          }
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: cleanAiText(result.answer),
          actionMeta
        }
      ]);
    } catch (err) {
      console.warn("AI Copilot Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: '요청을 처리하는 도중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button (Always Visible at Bottom-Right) */}
      <div className="floating-ai-launcher-wrapper">
        <button
          type="button"
          className={`floating-ai-pill-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="자연어로 일정을 추가하고 질문할 수 있는 실시간 AI 어시스턴트"
        >
          <div className="floating-btn-content">
            <span className="floating-live-dot" />
            <Sparkles size={15} className="text-cyan animate-pulse" />
            <span className="floating-btn-text font-bold">AI 어시스턴트</span>
          </div>
        </button>
      </div>

      {/* 2. Floating AI Chat Drawer / Popup Window */}
      {isOpen && (
        <div className="floating-ai-window glass-card">
          {/* Header */}
          <div className="floating-ai-header">
            <div className="flex items-center gap-2">
              <div className="floating-header-avatar">
                <Bot size={15} className="text-cyan" />
              </div>
              <div>
                <h5 className="floating-header-title">L&M AI Copilot</h5>
                <span className="floating-status-pill">
                  {apiKey ? '🟢 Gemini AI Live' : '⚡ 지능형 내장 AI'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                type="button"
                className="btn-icon-micro" 
                onClick={() => setIsOpen(false)}
                title="창 닫기"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="floating-chips-scroll">
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("내일 오후 2시에 딥워크 일정 추가해줘")}
            >
              ⚡ 내일 딥워크 등록
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("오늘 일정과 루틴 브리핑해줘")}
            >
              📅 오늘 일정 브리핑
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("이번 달 투자 가용 잉여금 얼마야?")}
            >
              💵 가용 잉여금 분석
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("오늘 먹은 칼로리와 단백질 분석해줘")}
            >
              🥗 식단 영양 요약
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("엔비디아와 나스닥 시장 브리핑해줘")}
            >
              🚀 시장 & 주식 브리핑
            </button>
            <button 
              type="button"
              className="floating-quick-chip text-rose"
              onClick={() => handleSend("전체 일정 초기화해줘")}
            >
              🧹 전체 일정 비우기
            </button>
          </div>

          {/* Messages Stream */}
          <div className="floating-messages-box">
            {messages.map(msg => (
              <div key={msg.id} className={`floating-msg-row ${msg.sender}`}>
                <div className={`floating-msg-bubble ${msg.sender}`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className="floating-msg-line">{line}</p>
                  ))}

                  {/* Action Confirmation & Navigation Badge */}
                  {msg.actionMeta?.type === 'clear_all' && (
                    <div className="mt-2 pt-1 border-t border-white/10 text-2xs text-rose font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>캘린더의 모든 일정이 깨끗하게 초기화되었습니다.</span>
                    </div>
                  )}

                  {msg.actionMeta?.type === 'calendar' && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5">
                      <div className="text-2xs text-emerald font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>{msg.actionMeta.count}건의 일정이 캘린더에 성공적으로 등록되었습니다.</span>
                      </div>
                      {onNavigateTab && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs inline-flex items-center gap-1 self-start mt-1 text-cyan border-cyan/30"
                          onClick={() => {
                            onNavigateTab('calendar');
                          }}
                        >
                          <CalendarPlus size={12} />
                          <span>캘린더에서 확인하기</span>
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  )}

                  {msg.actionMeta?.type === 'delete_calendar' && (
                    <div className="mt-2 pt-1 border-t border-white/10 text-2xs text-amber flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>'{msg.actionMeta.keyword}' 관련 일정이 삭제되었습니다.</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="floating-msg-row assistant">
                <div className="floating-msg-bubble assistant flex items-center gap-1.5 py-2">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            className="floating-input-form"
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="floating-chat-input"
              placeholder="일정, 잉여금, 식단 등에 대해 질문하세요..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="floating-send-btn"
              disabled={isLoading || !inputText.trim()}
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
