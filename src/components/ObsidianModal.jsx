import React, { useState } from 'react';
import { FileText, Copy, Download, Check, X, FolderSync, ExternalLink, Sparkles } from 'lucide-react';
import { generateObsidianDailyNote, downloadMarkdownFile } from '../utils/markdownGenerator';

export function ObsidianModal({ 
  isOpen, 
  onClose, 
  userProfile, 
  routines, 
  dietLogs, 
  runningLogs, 
  expenses, 
  calendarEvents,
  amBriefing, 
  pmBriefing, 
  pubmedCuration 
}) {
  const [copied, setCopied] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const markdownContent = generateObsidianDailyNote({
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
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    downloadMarkdownFile(`${todayStr}.md`, markdownContent);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content obsidian-modal" onClick={e => e.stopPropagation()}>
        <div className="obsidian-modal-header">
          <div className="panel-title-with-icon">
            <FileText size={20} className="text-purple" />
            <div>
              <h4>Obsidian Daily Note 양방향 동기화 (`{todayStr}.md`)</h4>
              <p className="text-muted text-xs">
                캘린더 스케줄, 루틴, 식단 매크로, 5km 러닝, 스마트 가계부 잉여금, 장전/장후 주식 브리핑 및 PubMed 큐레이션 통합 마크다운
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Sync Actions Bar */}
        <div className="obsidian-actions-bar">
          <div className="obsidian-status-pill">
            <span className="status-dot emerald"></span>
            <span className="text-xs text-muted">Obsidian Vault Ready 포맷 (YAML Frontmatter + Tasks 플러그인 호환)</span>
          </div>

          <div className="action-buttons-row">
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copied ? '✓ 클립보드 복사 완료' : '마크다운 복사'}</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              <Download size={14} />
              <span>`.md` 파일 다운로드</span>
            </button>
          </div>
        </div>

        {/* Syntax-styled Markdown Preview Area */}
        <div className="obsidian-markdown-preview mono">
          <pre>{markdownContent}</pre>
        </div>

        {/* Vault Setup Instructions */}
        <div className="vault-guide-box">
          <div className="guide-title text-xs font-bold text-highlight">
            💡 Obsidian Vault 연동 가이드:
          </div>
          <p className="text-muted text-xs mt-1">
            1. 다운로드한 <code>{todayStr}.md</code> 파일을 옵시디언 볼트의 <code>Daily Notes/</code> 폴더로 이동시키거나 내용을 복사하여 붙여넣으세요.
            <br />
            2. Dataview 및 Tasks 플러그인을 통해 투자가용잉여금(<code>investment_surplus</code>), 캘린더 일정 및 루틴 통계를 자동으로 집계할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
