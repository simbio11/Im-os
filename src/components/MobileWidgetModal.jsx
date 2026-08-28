import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ExternalLink,
  HelpCircle,
  Apple,
  Grid
} from 'lucide-react';

export function MobileWidgetModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('pwa'); // 'pwa' | 'ios' | 'android'

  if (!isOpen) return null;

  const scriptableCode = `// L&M OS iPhone Native Home Screen Widget (Scriptable)
// 1. App Store에서 'Scriptable' 앱 설치
// 2. 새 스크립트 생성 후 아래 코드 붙여넣기
// 3. 아이폰 홈 화면 길게 눌러 Scriptable 위젯 추가

let widget = new ListWidget();
widget.backgroundColor = new Color("#080b11");

// Header
let header = widget.addText("⚡ L&M OS Protocol");
header.textColor = new Color("#00f0ff");
header.font = Font.boldSystemFont(12);

widget.addSpacer(6);

// Date
let today = new Date();
let dateText = widget.addText(today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }));
dateText.textColor = new Color("#94a3b8");
dateText.font = Font.systemFont(10);

widget.addSpacer(8);

// Content
let scheduleItem = widget.addText("📅 오늘 주요 일정: 딥워크 & 시장 브리핑");
scheduleItem.textColor = new Color("#ffffff");
scheduleItem.font = Font.mediumSystemFont(11);

widget.addSpacer(4);

let stockItem = widget.addText("🚀 NVDA $128.45 (+4.18%) | NQ 19,820");
stockItem.textColor = new Color("#10b981");
stockItem.font = Font.systemFont(10);

widget.addSpacer(6);

// Footer Link
let footer = widget.addText("👆 탭하여 L&M OS 열기");
footer.textColor = new Color("#64748b");
footer.font = Font.systemFont(9);

widget.url = "https://simbio11.github.io/Im-os/";

Script.setWidget(widget);
Script.complete();
widget.presentMedium();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="modal-icon-badge bg-cyan-500/20 text-cyan p-2 rounded-lg">
              <Smartphone size={18} />
            </div>
            <div>
              <h4 className="text-base font-bold text-highlight">📱 모바일 위젯 & 홈 화면 연동 가이드</h4>
              <p className="text-muted text-xs">스마트폰 홈 화면에서 캘린더와 주요 기능을 위젯처럼 사용하는 2가지 방법</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 mt-4 p-1.5 bg-black/40 rounded-lg border border-white/5">
          <button 
            className={`btn btn-xs flex-1 ${activeTab === 'pwa' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pwa')}
          >
            <Grid size={13} />
            <span>1. PWA 홈 화면 앱 설치 (권장)</span>
          </button>
          <button 
            className={`btn btn-xs flex-1 ${activeTab === 'ios' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ios')}
          >
            <span>2. 아이폰(iOS) 실제 홈 위젯</span>
          </button>
        </div>

        {/* TAB 1: PWA Home Screen Installation */}
        {activeTab === 'pwa' && (
          <div className="mt-4 space-y-3">
            <div className="glass-card p-3 border border-cyan-500/20">
              <span className="text-xs font-bold text-cyan">⚡ 1단계: 브라우저에서 '홈 화면에 추가'</span>
              <ul className="text-xs text-secondary mt-2 space-y-1.5 list-disc list-inside">
                <li><strong>아이폰(Safari)</strong>: 하단 공유 버튼(네모+화살표) 탭 → <strong>'홈 화면에 추가'</strong> 선택</li>
                <li><strong>안드로이드(Chrome)</strong>: 우측 상단 메뉴(점 3개) 탭 → <strong>'홈 화면에 추가' 또는 '앱 설치'</strong> 선택</li>
              </ul>
            </div>

            <div className="glass-card p-3 border border-purple-500/20">
              <span className="text-xs font-bold text-purple">🚀 2단계: 홈 화면 아이콘을 길게 꾹(Long Press) 누르기</span>
              <p className="text-xs text-muted mt-1">
                바탕화면에 설치된 L&M OS 아이콘을 1초간 길게 누르면 <strong>빠른 퀵 위젯 메뉴</strong>가 나타납니다:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold text-highlight">📅 오늘 캘린더</span>
                  <p className="text-3xs text-muted">오늘 일정 & 타임블록 캘린더</p>
                </div>
                <div className="grid-cell p-2 rounded bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold text-highlight">🥗 식단 & 영양</span>
                  <p className="text-3xs text-muted">자연어 칼로리/단백질 기록</p>
                </div>
                <div className="grid-cell p-2 rounded bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold text-highlight">💵 잉여금 & 자산배분</span>
                  <p className="text-3xs text-muted">월간 잉여금 및 포트폴리오</p>
                </div>
                <div className="grid-cell p-2 rounded bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold text-highlight">📊 실시간 주식 브리핑</span>
                  <p className="text-3xs text-muted">나스닥 및 엔비디아 시세</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: iOS Scriptable Native Widget */}
        {activeTab === 'ios' && (
          <div className="mt-4 space-y-3">
            <div className="glass-card p-3 border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald">🍏 아이폰 실제 홈 화면 2x2/4x2 네이티브 위젯 설정</span>
              <p className="text-xs text-secondary mt-1">
                아이폰에서는 <strong>Scriptable</strong>(무료 앱스토어 앱)을 사용하면 L&M OS의 일정과 주가를 아이폰 바탕화면 위젯에 바로 띄울 수 있습니다.
              </p>
              <ol className="text-xs text-muted mt-2 space-y-1 list-decimal list-inside">
                <li>App Store에서 무료 앱 <strong>Scriptable</strong> 설치</li>
                <li>아래 코드를 복사한 뒤 Scriptable에서 새 스크립트로 저장</li>
                <li>아이폰 홈 화면을 길게 눌러 <strong>Scriptable 위젯</strong> 추가</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="p-2.5 rounded bg-black/60 border border-white/10 text-3xs font-mono text-cyan overflow-x-auto max-h-36">
                {scriptableCode}
              </pre>
              <button 
                type="button"
                className="btn btn-primary btn-xs absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? '복사 완료!' : '위젯 코드 복사'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="modal-footer-actions flex justify-end gap-2 mt-4 pt-3 border-t border-white/10">
          <button className="btn btn-primary btn-sm" onClick={onClose}>확인 완료</button>
        </div>
      </div>
    </div>
  );
}
