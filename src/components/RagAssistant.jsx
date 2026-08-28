import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Search, 
  Key, 
  BookOpen, 
  Layers, 
  Check, 
  Cpu,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  Flame,
  MessageSquare
} from 'lucide-react';
import { queryLocalAiEngine } from '../services/localAiEngine.js';
import { callGeminiApi, getStoredGeminiApiKey, buildGlobalSystemContext } from '../services/geminiService.js';
import { GeminiApiKeyModal } from './GeminiApiKeyModal.jsx';

export function RagAssistant({ 
  initialQuery,
  calendarEvents = [],
  routines = [],
  dietLogs = [],
  runningLogs = [],
  expenses = [],
  userProfile = {}
}) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: `안녕하세요! **L&M OS 최고 전략 AI 비서**입니다.\n\n사용자의 **일정 캘린더, 장전/장후 주식 브리핑, 거시경제 지표, 데일리 루틴, 5km 러닝, 식단 칼로리/단백질, 투자 가용 잉여금 및 PubMed 의학 지식**을 모두 파악하고 있습니다.\n\n궁금하신 점을 편하게 질문해보세요!`,
      sources: ["L&M OS Live Kernel", "Full System Context"]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [apiKey, setApiKey] = useState(getStoredGeminiApiKey());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isLoading) return;

    // 1. Add user message
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const currentKey = getStoredGeminiApiKey();

    // 2. Try Gemini Live API if key is present
    if (currentKey && currentKey.startsWith('AIza')) {
      try {
        const liveContext = buildGlobalSystemContext({
          calendarEvents,
          routines,
          dietLogs,
          runningLogs,
          expenses,
          userProfile
        });

        const systemInstruction = `당신은 최고 전략 개인 OS 'L&M OS'의 수석 AI 비서이자 전략가입니다.
아래 제공된 사용자의 실시간 데이터(캘린더 일정, 루틴, 식단, 러닝, 가계부 잉여금, 거시경제 지표, PubMed 논문)를 기반으로 사용자의 질문에 군더더기 없이 간결하고 명확하며 세련된 한국어 마크다운으로 답변하세요.

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
              text: responseText,
              sources: ["Google Gemini 1.5 Live AI", "L&M OS Live Context"]
            }
          ]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Gemini API call failed, using built-in AI engine:", err);
      }
    }

    // 3. Built-in Local AI Engine (Instant, Accurate & Contextual)
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
          text: localResult.answer,
          sources: localResult.sources
        }
      ]);
      setIsLoading(false);
    }, 250);
  };

  const handlePresetClick = (q) => {
    handleSend(q);
  };

  return (
    <div className="rag-chat-wrapper glass-card">
      {/* Top Header */}
      <div className="rag-header-clean">
        <div className="rag-header-info">
          <div className="rag-header-icon-box">
            <Sparkles size={18} className="text-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="rag-header-title">L&M OS 전략 AI 어시스턴트</h3>
              <span className={`status-pill ${apiKey ? 'active' : 'local'}`}>
                {apiKey ? '🟢 Gemini 1.5 Live' : '⚡ 스마트 내장 AI'}
              </span>
            </div>
            <p className="rag-header-subtitle">
              캘린더 일정, 가계부 잉여금, 식단/러닝, 주식 브리핑 및 PubMed 학술 지식 통합 질의
            </p>
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm key-config-btn"
          onClick={() => setShowKeyModal(true)}
        >
          <Key size={13} className={apiKey ? 'text-emerald' : 'text-amber'} />
          <span>{apiKey ? 'Gemini Key 연동됨' : 'Gemini Key 설정'}</span>
        </button>
      </div>

      {/* Suggested Prompts Bar */}
      <div className="rag-prompt-chips-container">
        <div className="rag-prompt-chips-scroll">
          <button 
            className="rag-chip"
            onClick={() => handlePresetClick("넌 뭘 할 수 있어?")}
          >
            <Bot size={13} className="text-cyan" />
            <span>🤖 AI 비서 기능 소개</span>
          </button>
          <button 
            className="rag-chip"
            onClick={() => handlePresetClick("내일 일정 브리핑해줘")}
          >
            <Calendar size={13} className="text-purple" />
            <span>📅 내일 일정 브리핑</span>
          </button>
          <button 
            className="rag-chip"
            onClick={() => handlePresetClick("현재 투자 가용 잉여금과 자산 배분 전략 알려줘")}
          >
            <DollarSign size={13} className="text-emerald" />
            <span>💵 투자 잉여금 & 자산배분</span>
          </button>
          <button 
            className="rag-chip"
            onClick={() => handlePresetClick("엔비디아(NVDA) 블랙웰 실적 및 AI 가속기 전망 요약해줘")}
          >
            <TrendingUp size={13} className="text-amber" />
            <span>🚀 엔비디아 실적 & 블랙웰</span>
          </button>
          <button 
            className="rag-chip"
            onClick={() => handlePresetClick("오늘 먹은 단백질이랑 식단 영양 분석해줘")}
          >
            <Activity size={13} className="text-rose" />
            <span>🥗 식단 & 단백질 분석</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="rag-stream-feed">
        {messages.map(msg => (
          <div key={msg.id} className={`rag-stream-row ${msg.sender}`}>
            {msg.sender === 'assistant' && (
              <div className="rag-bot-avatar">
                <Bot size={16} className="text-cyan" />
              </div>
            )}

            <div className={`rag-bubble ${msg.sender}`}>
              <div className="rag-bubble-body markdown-body">
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="rag-sources-chips">
                  <span className="source-label">참조:</span>
                  {msg.sources.map((src, sIdx) => (
                    <span key={sIdx} className="source-badge">{src}</span>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="rag-user-avatar">
                <User size={16} className="text-purple" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="rag-stream-row assistant">
            <div className="rag-bot-avatar">
              <Bot size={16} className="text-cyan" />
            </div>
            <div className="rag-bubble assistant loading-bubble">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="animate-spin text-cyan" />
                <span className="text-xs text-muted">지능형 데이터베이스 분석 중...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="rag-input-container">
        <div className="rag-input-glass">
          <input 
            type="text"
            className="rag-text-input"
            placeholder="일정, 잉여금, 식단, 주식 동향 등에 대해 무엇이든 질문하세요..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
            autoFocus
          />
          <button 
            className="rag-submit-btn"
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
          >
            <Send size={15} />
            <span>질문</span>
          </button>
        </div>
      </div>

      {/* Key Modal */}
      <GeminiApiKeyModal
        isOpen={showKeyModal}
        onClose={() => {
          setShowKeyModal(false);
          setApiKey(getStoredGeminiApiKey());
        }}
        onApiKeyUpdated={(newKey) => setApiKey(newKey)}
      />
    </div>
  );
}
