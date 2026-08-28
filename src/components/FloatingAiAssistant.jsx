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
  MessageSquare
} from 'lucide-react';
import { queryLocalAiEngine, cleanAiText } from '../services/localAiEngine.js';
import { callGeminiApi, getStoredGeminiApiKey, buildGlobalSystemContext } from '../services/geminiService.js';

export function FloatingAiAssistant({
  calendarEvents = [],
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  userProfile = {},
  onNavigateTab,
  onBulkUpdateCalendarEvents
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'assistant',
      text: '안녕하세요! L&M OS 실시간 AI Copilot입니다. 일정 질문, 시간 변경, 가용 잉여금, 식단 분석 등 무엇이든 물어보세요.'
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

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const currentKey = getStoredGeminiApiKey();

    // 1. Try Gemini Live API if API key is present
    if (currentKey && currentKey.trim()) {
      try {
        const liveContext = buildGlobalSystemContext({
          calendarEvents,
          routines,
          dietLogs,
          runningLogs,
          expenses,
          userProfile
        });

        const systemInstruction = `당신은 최고 전략 개인 OS 'L&M OS'의 플로팅 실시간 AI Copilot입니다.
사용자의 실시간 데이터를 기반으로 질문에 아주 간결하고 명확하게 답변하세요.
절대로 ** (마크다운 볼드 기호)나 불필요한 특수기호를 쓰지 말고, 2~4줄 이내로 깔끔하게 요약하여 답변하세요.

${liveContext}`;

        const responseText = await callGeminiApi({
          prompt: text,
          systemInstruction,
          apiKey: currentKey,
          model: 'gemini-1.5-flash'
        });

        if (responseText) {
          setMessages(prev => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              sender: 'assistant',
              text: cleanAiText(responseText)
            }
          ]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Floating AI Gemini call fallback:", err);
      }
    }

    // 2. Local AI Engine Fallback
    setTimeout(() => {
      const localResult = queryLocalAiEngine(text, {
        calendarEvents,
        routines,
        dietLogs,
        runningLogs,
        expenses,
        userProfile
      });

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: cleanAiText(localResult.answer)
        }
      ]);
      setIsLoading(false);
    }, 200);
  };

  return (
    <>
      {/* 1. Floating Launcher Button (Always Visible at Bottom-Right) */}
      <div className="floating-ai-launcher-wrapper">
        <button
          type="button"
          className={`floating-ai-pill-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="언제든 질문하거나 일정을 수정할 수 있는 실시간 AI 어시스턴트"
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
                  {apiKey ? '🟢 Gemini 1.5 Live' : '⚡ 지능형 내장 AI'}
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
              onClick={() => handleSend("내일 일정 브리핑해줘")}
            >
              📅 내일 일정
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("이번 달 투자 가용 잉여금 얼마야?")}
            >
              💵 가용 잉여금
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("엔비디아 블랙웰 실적 요약해줘")}
            >
              🚀 엔비디아
            </button>
            <button 
              type="button"
              className="floating-quick-chip"
              onClick={() => handleSend("오늘 먹은 칼로리와 단백질 분석해줘")}
            >
              🥗 식단 영양
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
