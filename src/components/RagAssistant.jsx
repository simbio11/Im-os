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
  Zap
} from 'lucide-react';
import { queryKnowledgeBase } from '../data/knowledgeBase';
import { callGeminiApi, getStoredGeminiApiKey, buildGlobalSystemContext } from '../services/geminiService';
import { GeminiApiKeyModal } from './GeminiApiKeyModal';

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
      text: `안녕하세요! **L&M OS 최고 전략 AI 인텔리전스 비서**입니다.\n\n` +
        `축적된 **일정 캘린더, 장전/장후 주식 브리핑, 거시경제 지표, 데일리 루틴, 5km 러닝, 식단 칼로리/단백질, 투자 잉여금 가계부 및 PubMed 학술 논문** 데이터를 종합 분석하여 실시간 질의에 전문적으로 응답합니다.\n\n` +
        `궁금하신 내용을 자유롭게 질문해보세요!`,
      sources: ["L&M OS Global Kernel", "Real-time Live Context"]
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

    // Add user message
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const currentKey = getStoredGeminiApiKey();

    // 1. If Gemini API Key is configured, execute advanced multi-modal LLM reasoning
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

        const ragDocContext = queryKnowledgeBase(text);

        const systemInstruction = `당신은 최고 전략 개인 OS 'L&M OS'의 수석 AI 비서이자 전략가입니다.
아래 제공된 사용자의 실시간 데이터(캘린더 일정, 라이프 루틴, 식단, 러닝, 가계부 잉여금, 거시경제 지표, PubMed 논문)를 완벽히 이해하고, 사용자의 질문에 최고 수준의 정확도와 통찰력을 담아 전문적인 한국어 마크다운으로 답변하세요.

${liveContext}

[추가 색인 지식 베이스]:
${ragDocContext?.answer || '지식 베이스 인덱스 정상 가동 중'}`;

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
              sources: ["Google Gemini 1.5 Live AI", "L&M OS Live Real-time Context", ...(ragDocContext?.sources || [])]
            }
          ]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Gemini Live API call error, falling back to smart local engine:", err);
      }
    }

    // 2. Local Intelligent Fallback Engine
    setTimeout(() => {
      const ragResult = queryKnowledgeBase(text);
      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: ragResult.answer + 
            `\n\n> 💡 **안내**: 상단의 **[🔑 Gemini Key 설정]**에 무료 Google Gemini API Key를 등록하시면 실시간 전체 캘린더/가계부/논문 데이터를 결합한 초고지능 AI 답변을 즉시 받으실 수 있습니다.`,
          sources: ["L&M OS Local Strategic Engine", ...(ragResult?.sources || [])]
        }
      ]);
      setIsLoading(false);
    }, 400);
  };

  const handlePresetClick = (q) => {
    handleSend(q);
  };

  return (
    <div className="rag-assistant-container glass-card">
      {/* Top RAG Header */}
      <div className="rag-header-bar">
        <div className="panel-title-with-icon">
          <div className="rag-avatar-glow">
            <Sparkles size={20} className="text-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4>브리핑 & 캘린더 통합 RAG AI 인텔리전스</h4>
              <span className={`badge ${apiKey ? 'badge-emerald' : 'badge-amber'}`}>
                {apiKey ? '✨ Gemini 1.5 Live AI 가동 중' : '⚡ 로컬 지식 엔진'}
              </span>
            </div>
            <p className="text-muted text-xs">
              일정 캘린더, 시장 브리핑, 거시경제 지표, 루틴/식단/잉여금 및 PubMed 의학 데이터베이스 기반 심층 질의응답
            </p>
          </div>
        </div>

        <div className="rag-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowKeyModal(true)}
          >
            <Key size={13} className={apiKey ? 'text-emerald' : 'text-amber'} />
            <span>{apiKey ? 'Gemini Key 설정됨' : 'Gemini Key 설정 (무료)'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="rag-suggestions-row">
        <span className="text-2xs text-muted font-bold mr-1">추천 질문:</span>
        <button 
          className="rag-chip-btn"
          onClick={() => handlePresetClick("내일 일정과 주요 할 일 브리핑해줘")}
        >
          📅 내일 일정 & 할일 브리핑
        </button>
        <button 
          className="rag-chip-btn"
          onClick={() => handlePresetClick("최근 금리 변동에 따른 빅테크 기술주 동향 및 투자 가이드 요약해줘")}
        >
          📈 금리 변동 & 기술주 동향
        </button>
        <button 
          className="rag-chip-btn"
          onClick={() => handlePresetClick("엔비디아(NVDA) 블랙웰 실적 및 AI 가속기 전망 요약해줘")}
        >
          🚀 엔비디아 실적 & 블랙웰 전망
        </button>
        <button 
          className="rag-chip-btn"
          onClick={() => handlePresetClick("현재 투자 가용 잉여금과 자산 배분 전략 알려줘")}
        >
          💵 투자 가용 잉여금 & 자산배분
        </button>
        <button 
          className="rag-chip-btn"
          onClick={() => handlePresetClick("5km 러닝이 딥워크 집중력과 대사에 미치는 영향 요약해줘")}
        >
          🏃 5km 러닝 & 딥워크 인지 효과
        </button>
      </div>

      {/* Messages Feed */}
      <div className="rag-messages-feed">
        {messages.map(msg => (
          <div key={msg.id} className={`rag-message-item ${msg.sender}`}>
            <div className="rag-message-avatar">
              {msg.sender === 'assistant' ? (
                <div className="avatar-ai">
                  <Bot size={16} className="text-cyan" />
                </div>
              ) : (
                <div className="avatar-user">
                  <User size={16} className="text-purple" />
                </div>
              )}
            </div>

            <div className="rag-message-bubble-wrapper">
              <div className={`rag-message-bubble ${msg.sender}`}>
                <div className="rag-message-text markdown-body">
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="rag-sources-row">
                    <span className="source-label">참조 소스:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="source-tag">{src}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="rag-message-item assistant">
            <div className="rag-message-avatar">
              <div className="avatar-ai animate-pulse">
                <Bot size={16} className="text-cyan" />
              </div>
            </div>
            <div className="rag-message-bubble assistant loading">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Sparkles size={14} className="animate-spin text-cyan" />
                <span>실시간 데이터베이스 색인 및 Gemini 지능 분석 중...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="rag-input-box">
        <input 
          type="text"
          className="input-text rag-input"
          placeholder="시장 동향, 캘린더 일정, 5km 러닝, 식단 분석, 투자 잉여금 관련 질문을 자유롭게 입력하세요..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading}
        />
        <button 
          className="btn btn-primary btn-sm rag-send-btn"
          onClick={() => handleSend()}
          disabled={isLoading || !inputText.trim()}
        >
          <Send size={15} />
          <span>질의하기</span>
        </button>
      </div>

      {/* Gemini API Key Modal */}
      <GeminiApiKeyModal
        isOpen={showKeyModal}
        onClose={() => {
          setShowKeyModal(false);
          setApiKey(getStoredGeminiApiKey());
        }}
        onApiKeyUpdated={(newKey) => {
          setApiKey(newKey);
        }}
      />
    </div>
  );
}
