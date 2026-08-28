import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Lock
} from 'lucide-react';
import { getStoredGeminiApiKey, saveStoredGeminiApiKey, callGeminiApi } from '../services/geminiService';

export function GeminiApiKeyModal({ isOpen, onClose, onApiKeyUpdated }) {
  const [apiKeyInput, setApiKeyInput] = useState(getStoredGeminiApiKey());
  const [statusMessage, setStatusMessage] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const currentKey = getStoredGeminiApiKey();

  const handleSave = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      saveStoredGeminiApiKey('');
      if (onApiKeyUpdated) onApiKeyUpdated('');
      setStatusMessage({ type: 'info', text: 'API 키가 삭제되었습니다. 기본 내장 엔진으로 동작합니다.' });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      // Test the key with a fast ping
      await callGeminiApi({
        prompt: 'Ping! Respond with "OK".',
        apiKey: trimmed,
        model: 'gemini-1.5-flash'
      });

      saveStoredGeminiApiKey(trimmed);
      if (onApiKeyUpdated) onApiKeyUpdated(trimmed);
      setStatusMessage({ type: 'success', text: '✨ Gemini API 키가 성공적으로 검증 및 활성화되었습니다!' });
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.warn("API Key validation error:", err);
      // Still allow saving if user wants
      saveStoredGeminiApiKey(trimmed);
      if (onApiKeyUpdated) onApiKeyUpdated(trimmed);
      const errMsg = err?.message || '네트워크 또는 API 키 유효성 확인 필요';
      setStatusMessage({ type: 'warning', text: `키가 저장되었으나 검증 호출 실패 (${errMsg})` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    saveStoredGeminiApiKey('');
    setApiKeyInput('');
    if (onApiKeyUpdated) onApiKeyUpdated('');
    setStatusMessage({ type: 'info', text: 'API 키가 제거되었습니다.' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gemini-key-modal glass-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="panel-title-with-icon">
            <div className="ai-icon-glow" style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.3))' }}>
              <Key size={20} className="text-cyan" />
            </div>
            <div>
              <h4>Google Gemini AI API Key 설정</h4>
              <p className="text-muted text-xs">
                자연어 일정 자동 생성, 일정 질의응답 및 브리핑 RAG 지식 비서의 두뇌로 동작합니다.
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Info Banner */}
        <div className="gemini-info-box">
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="text-cyan mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-highlight block mb-1">💡 Gemini API 키는 Google AI Studio에서 100% 무료로 발급받을 수 있습니다:</span>
              <ol className="list-decimal pl-4 space-y-1 text-muted">
                <li>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Google AI Studio Key 발급 페이지 열기 <ExternalLink size={11} />
                  </a>
                </li>
                <li>구글 계정으로 로그인 후 <b>"Create API Key"</b> 버튼 클릭</li>
                <li>생성된 <code>AIzaSy...</code> 키를 아래에 붙여넣고 저장하세요.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="form-group mt-3">
          <label className="text-xs text-muted font-bold flex justify-between">
            <span>Gemini API Key</span>
            {currentKey && <span className="text-emerald text-2xs flex items-center gap-1"><CheckCircle2 size={11} /> 현재 연결됨</span>}
          </label>
          <div className="key-input-wrapper">
            <input
              type="password"
              className="input-text mono"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              autoFocus
            />
          </div>
          <span className="text-2xs text-faint flex items-center gap-1 mt-1">
            <Lock size={10} /> 입력하신 API 키는 브라우저의 안전한 로컬 저장소(LocalStorage)에만 보관되며 외부 서버로 전송되지 않습니다.
          </span>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div className={`status-alert-box ${statusMessage.type} mt-2`}>
            {statusMessage.type === 'success' && <CheckCircle2 size={15} className="text-emerald" />}
            {statusMessage.type === 'error' && <AlertCircle size={15} className="text-rose" />}
            {statusMessage.type === 'warning' && <AlertCircle size={15} className="text-amber" />}
            {statusMessage.type === 'info' && <Sparkles size={15} className="text-cyan" />}
            <span className="text-xs">{statusMessage.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions-row mt-4">
          {currentKey && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
              <Trash2 size={14} className="text-rose" />
              <span>키 삭제</span>
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            닫기
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-sm" 
            onClick={handleSave}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <Sparkles size={14} className="animate-spin" />
                <span>API 연결 검증 중...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>API 키 저장 및 활성화</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
