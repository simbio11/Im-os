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
  RefreshCw
} from 'lucide-react';
import { queryKnowledgeBase } from '../data/knowledgeBase';

export function RagAssistant({ initialQuery }) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: `안녕하세요! **L&M OS 인텔리전스 RAG 비서**입니다.\n\n` +
        `축적된 일자별 **장전/장후 시장 브리핑, 매크로 4대 지표, 데일리 루틴, 5km 러닝, 식단 및 가계부 잉여금 데이터**를 기반으로 실시간 맥락 질의에 응답합니다.\n\n` +
        `궁금하신 내용을 입력하시거나 아래 추천 질문을 클릭해보세요!`,
      sources: ["L&M OS Live Kernel", "Knowledge Base Index"]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
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

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowKeyInput(false);
  };

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // If Gemini API Key is configured, attempt live call, otherwise use offline Smart RAG engine
    if (apiKey && apiKey.startsWith('AIza')) {
      try {
        const ragContext = queryKnowledgeBase(text);
        const prompt = `당신은 개인 운영체제 L&M OS의 최고 전략가이자 AI 인텔리전스 어시스턴트입니다.
아래 제공된 사용자 일일 브리핑 및 라이프 프로토콜 지식 베이스를 참고하여 사용자의 질문에 매우 전문적이고 명확하게 한국어로 답변하세요.

[지식 베이스 데이터]:
${ragContext?.answer || '시장 및 루틴 정상 운용 중'}

[사용자 질문]:
${text}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await res.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          setMessages(prev => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              sender: 'assistant',
              text: responseText,
              sources: ["Gemini 1.5 Live API", ...(ragContext?.sources || [])]
            }
          ]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Gemini API call error, falling back to local RAG:", err);
      }
    }

    // Local High-Speed RAG Engine response simulation
    setTimeout(() => {
      const ragResult = queryKnowledgeBase(text);
      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: ragResult.answer,
          sources: ragResult.sources
        }
      ]);
      setIsLoading(false);
    }, 450);
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
            <h4>브리핑 누적 RAG 질의 & AI 인텔리전스 (Knowledge QA)</h4>
            <p className="text-muted text-xs">
              날짜별 시장 브리핑, 거시경제 지표, 루틴/식단/잉여금 지식 베이스 기반 실시간 맥락 질의응답
            </p>
          </div>
        </div>

        <div className="rag-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowKeyInput(!showKeyInput)}
          >
            <Key size={13} />
            <span>{apiKey ? 'API Key 연동됨' : 'Gemini Key 설정'}</span>
          </button>
        </div>
      </div>

      {/* API Key Drawer */}
      {showKeyInput && (
        <div className="api-key-drawer">
          <div className="text-xs text-muted mb-1">
            Google AI Studio에서 발급받은 Gemini API Key를 입력하시면 실시간 초지능 모델로 답변합니다 (입력하지 않아도 내장 로컬 RAG로 즉시 동작합니다).
          </div>
          <div className="input-with-button">
            <input
              type="password"
              className="input-text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => handleSaveApiKey(apiKey)}>
              저장
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="rag-prompt-chips">
        <span className="chips-label text-xs text-muted">추천 질문:</span>
        <button 
          className="chip-btn"
          onClick={() => handleSend("최근 금리 변동에 따른 기술주 동향 요약해줘")}
        >
          📈 최근 금리 변동과 기술주 동향 요약
        </button>
        <button 
          className="chip-btn"
          onClick={() => handleSend("엔비디아 차세대 블랙웰 아키텍처 및 실적 전망")}
        >
          🚀 엔비디아 블랙웰 및 실적 전망
        </button>
        <button 
          className="chip-btn"
          onClick={() => handleSend("5km 러닝 프로토콜과 딥워크 집중력의 상관관계")}
        >
          🏃 5km 러닝과 딥워크 집중력 상관관계
        </button>
        <button 
          className="chip-btn"
          onClick={() => handleSend("스마트 잉여금 공식과 해외 우량주 적립식 투자 전략")}
        >
          💳 투자 가용 잉여금과 자산 배분 전략
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="rag-messages-area">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
            <div className="bubble-avatar">
              {msg.sender === 'assistant' ? (
                <Bot size={16} className="text-cyan" />
              ) : (
                <User size={16} className="text-emerald" />
              )}
            </div>

            <div className="bubble-content-box">
              <div className="bubble-text">
                {msg.text.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="bubble-sources-row">
                  <span className="source-label text-xs text-faint">참조 소스:</span>
                  {msg.sources.map((src, sIdx) => (
                    <span key={sIdx} className="badge badge-purple text-xs">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble-row assistant">
            <div className="bubble-avatar">
              <Bot size={16} className="text-cyan animate-spin-slow" />
            </div>
            <div className="bubble-content-box">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="text-xs text-muted ml-2">지식 베이스 및 최신 브리핑 검색 중...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form 
        className="rag-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="input-text"
          placeholder="시장 동향, 루틴 분석, 투자 잉여금 관련 질문을 자유롭게 입력하세요..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading || !inputText.trim()}>
          <Send size={15} />
          <span>질의하기</span>
        </button>
      </form>
    </div>
  );
}
