import React, { useState } from 'react';
import { FileCheck, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Layers, Building2, ExternalLink } from 'lucide-react';
import { SEC_EARNINGS_BRIEFS } from '../data/sampleData';
import { DART_DISCLOSURES_CACHE, DART_API_KEY } from '../services/dartService';

export function SecEarningsBrief() {
  const [tab, setTab] = useState('dart'); // 'dart' or 'sec'

  return (
    <div className="sec-brief-container">
      <div className="section-title-row">
        <div className="panel-title-with-icon">
          <FileCheck size={20} className="text-cyan" />
          <div>
            <h3>{tab === 'dart' ? 'Open DART 전자공시 & 실적 퀵 브리프 (국내 상장사)' : 'SEC 공시 & 실적 퀵 브리프 (US EDGAR & 10-Q)'}</h3>
            <p className="text-muted text-xs">
              {tab === 'dart' 
                ? '금융감독원 Open DART API 기반 국내 핵심 상장사(삼성전자, SK하이닉스 등)의 잠정실적 및 주요 경영사항 공시'
                : '미국 관심 종목 어닝콜 및 공시 발생 시 매출/EPS 서프라이즈(Beat/Miss) 및 핵심 가이던스 3줄 압축'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="tab-pill-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            <button 
              className={`btn-xs ${tab === 'dart' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}
              onClick={() => setTab('dart')}
            >
              🇰🇷 DART 전자공시
            </button>
            <button 
              className={`btn-xs ${tab === 'sec' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}
              onClick={() => setTab('sec')}
            >
              🇺🇸 SEC EDGAR
            </button>
          </div>
          <span className="badge badge-emerald mono text-2xs" title={`DART API Key: ${DART_API_KEY.substring(0, 8)}...`}>
            DART API 연동 🟢
          </span>
        </div>
      </div>

      {tab === 'dart' ? (
        /* DART Korea Disclosures Grid */
        <div className="sec-briefs-grid">
          {DART_DISCLOSURES_CACHE.map(disc => (
            <div key={disc.rcept_no} className="sec-card glass-card">
              <div className="sec-card-header">
                <div className="stock-sym-badge">
                  <span className="sym-name font-bold text-highlight">{disc.corp_name}</span>
                  <span className="quarter-tag mono text-xs text-muted">({disc.stock_code})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-purple text-xs">{disc.category}</span>
                  <span className="mono text-2xs text-muted">{disc.rcept_dt}</span>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <h5 className="text-xs font-bold text-highlight">{disc.report_nm}</h5>
                <p className="text-xs text-cyan mt-1" style={{ lineHeight: '1.4' }}>{disc.summary}</p>
              </div>

              {/* AI Key Insights Box */}
              <div className="guidance-summary-box mt-2">
                <span className="guidance-title text-xs font-bold text-purple">
                  ⚡ DART AI 핵심 요약 & 애널리스트 인사이트:
                </span>
                <p className="text-xs text-muted mt-1 leading-normal">
                  {disc.ai_insights}
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <a 
                  href={disc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary btn-xs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  <span>DART 원문 보기</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SEC US Earnings Grid */
        <div className="sec-briefs-grid">
          {SEC_EARNINGS_BRIEFS.map(brief => (
            <div key={brief.id} className="sec-card glass-card">
              <div className="sec-card-header">
                <div className="stock-sym-badge">
                  <span className="sym-name mono">{brief.symbol}</span>
                  <span className="quarter-tag text-xs text-muted">{brief.quarter}</span>
                </div>
                <span className="badge badge-emerald">{brief.releaseDate}</span>
              </div>

              {/* Revenue & EPS Surprise Grid */}
              <div className="earnings-numbers-grid">
                <div className="earn-stat-box">
                  <span className="stat-label text-xs text-muted">분기 매출 (Revenue)</span>
                  <span className="stat-val mono text-highlight font-bold">{brief.revenue}</span>
                  <span className="badge badge-emerald text-xs mt-1">
                    <ArrowUpRight size={12} /> {brief.revenueSurprise}
                  </span>
                </div>

                <div className="earn-stat-box">
                  <span className="stat-label text-xs text-muted">주당순이익 (EPS)</span>
                  <span className="stat-val mono text-highlight font-bold">{brief.eps}</span>
                  <span className={`badge ${brief.epsSurprise.includes('Beat') ? 'badge-emerald' : 'badge-amber'} text-xs mt-1`}>
                    {brief.epsSurprise}
                  </span>
                </div>
              </div>

              {/* 3-line Guidance Summary */}
              <div className="guidance-summary-box">
                <span className="guidance-title text-xs font-bold text-cyan">
                  ⚡ 경영진 핵심 가이던스 3줄 압축:
                </span>
                <ul className="guidance-list">
                  {brief.guidance.map((g, idx) => (
                    <li key={idx} className="guidance-item text-xs">
                      <span className="mono line-num">{idx + 1}.</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
