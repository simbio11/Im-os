import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Check, 
  X, 
  Save,
  FolderSync, 
  ExternalLink, 
  Sparkles,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';
import { generateObsidianDailyNote } from '../utils/markdownGenerator';
import { 
  saveDirectlyToObsidian, 
  downloadMarkdown, 
  openNoteInObsidianApp,
  generateObsidianCalendarNote 
} from '../utils/fileSystemSync';

export function ObsidianModal({ 
  isOpen, 
  onClose, 
  userProfile, 
  routines = [], 
  dietLogs = [], 
  runningLogs = [], 
  expenses = [], 
  calendarEvents = [],
  amBriefing, 
  pmBriefing, 
  pubmedCuration 
}) {
  const [copied, setCopied] = useState(false);
  const [noteType, setNoteType] = useState('daily'); // 'daily' | 'calendar'
  const [vaultName, setVaultName] = useState('Simbio');
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  // Generate markdown based on selected note type
  const markdownContent = noteType === 'daily'
    ? generateObsidianDailyNote({
        date: todayStr,
        userProfile,
        routines,
        dietLogs,
        runningLogs,
        expenses,
        calendarEvents,
        amBriefing,
        pmBriefing,
        pubmedCuration
      })
    : generateObsidianCalendarNote(calendarEvents, todayStr);

  const defaultFileName = noteType === 'daily' ? `${todayStr}.md` : `Calendar_${todayStr}.md`;

  // 1. Direct Save to Obsidian via Web File System Access API
  const handleDirectSync = async () => {
    setIsSaving(true);
    setSyncStatusMsg('');
    try {
      const result = await saveDirectlyToObsidian(markdownContent, defaultFileName);
      if (result.success) {
        setSyncStatusMsg(`✅ [${result.fileName}] 파일에 성공적으로 저장 & 동기화되었습니다!`);
        setTimeout(() => setSyncStatusMsg(''), 5000);
      } else if (!result.aborted) {
        setSyncStatusMsg('⚠️ 파일 저장 중 취소되었거나 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
      setSyncStatusMsg('⚠️ 저장 실패: 브라우저 권한을 확인해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Clipboard Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setSyncStatusMsg('📋 클립보드에 마크다운이 복사되었습니다.');
    setTimeout(() => {
      setCopied(false);
      setSyncStatusMsg('');
    }, 3000);
  };

  // 3. Direct Download Fallback
  const handleDownload = () => {
    downloadMarkdown(defaultFileName, markdownContent);
    setSyncStatusMsg(`📥 [${defaultFileName}] 파일이 다운로드되었습니다.`);
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  // 4. Open in Obsidian App
  const handleOpenObsidianApp = () => {
    openNoteInObsidianApp(vaultName, defaultFileName);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content obsidian-modal" onClick={e => e.stopPropagation()}>
        <div className="obsidian-modal-header">
          <div className="panel-title-with-icon">
            <FileText size={22} className="text-purple" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4>Obsidian 마크다운 자동 생성 & 볼트 동기화</h4>
                <span className="badge badge-purple">File System Sync Ready</span>
              </div>
              <p className="text-muted text-xs mt-1">
                웹에서 수정한 캘린더 일정과 데일리 프로토콜을 내 컴퓨터 옵시디언 볼트에 1초 만에 바로 저장합니다.
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Note Type Selector Switcher */}
        <div className="obsidian-note-type-tabs mt-2">
          <button 
            className={`obsidian-tab-pill ${noteType === 'daily' ? 'active' : ''}`}
            onClick={() => setNoteType('daily')}
          >
            <Layers size={14} />
            <span>🌟 종합 데일리 리포트 (`{todayStr}.md`)</span>
          </button>
          <button 
            className={`obsidian-tab-pill ${noteType === 'calendar' ? 'active' : ''}`}
            onClick={() => setNoteType('calendar')}
          >
            <Calendar size={14} />
            <span>📅 캘린더 일정 & 타임블록 전용 (`Calendar_{todayStr}.md`)</span>
          </button>
        </div>

        {/* Sync Actions Bar */}
        <div className="obsidian-actions-bar mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleDirectSync}
              disabled={isSaving}
              title="컴퓨터의 옵시디언 볼트 폴더/파일을 선택하여 즉시 덮어쓰기 저장"
            >
              <Save size={14} className="text-purple" />
              <span>{isSaving ? '저장 중...' : '⚡ 내 옵시디언에 즉시 저장 & 업데이트'}</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleDownload} title=".md 파일로 다운로드">
              <Download size={14} />
              <span>`.md` 다운로드</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copied ? '복사 완료' : '마크다운 복사'}</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleOpenObsidianApp} title="Obsidian 앱 바로 실행">
              <ExternalLink size={13} className="text-purple" />
              <span>Obsidian 열기</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Alert */}
        {syncStatusMsg && (
          <div className="obsidian-status-banner glass-card mt-2 animate-fade-in">
            <Sparkles size={14} className="text-purple" />
            <span className="text-xs font-bold text-highlight">{syncStatusMsg}</span>
          </div>
        )}

        {/* Syntax-styled Markdown Preview Area */}
        <div className="obsidian-markdown-preview mono mt-3">
          <pre>{markdownContent}</pre>
        </div>

        {/* Vault Setup Instructions */}
        <div className="vault-guide-box mt-3">
          <div className="guide-title text-xs font-bold text-purple flex items-center gap-1">
            <Zap size={14} />
            <span>💡 옵시디언 자동 연동 사용법:</span>
          </div>
          <p className="text-muted text-xs mt-1 leading-relaxed">
            • <strong>[⚡ 내 옵시디언에 즉시 저장 & 업데이트]</strong>를 누르고, 옵시디언 볼트(<code>C:\Simbio\Daily Notes\</code> 등)에 있는 파일을 선택하면 <strong>클릭 한 번으로 즉시 갱신</strong>됩니다.<br />
            • 옵시디언 <strong>Tasks</strong> 및 <strong>Dataview</strong> 플러그인과 100% 호환되는 마크다운 형식(체크박스, 시간 태그, 프론트매터)으로 자동 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
