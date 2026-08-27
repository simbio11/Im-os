import React from 'react';
import { FileCheck, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { SEC_EARNINGS_BRIEFS } from '../data/sampleData';

export function SecEarningsBrief() {
  return (
    <div className="sec-brief-container">
      <div className="section-title-row">
        <div className="panel-title-with-icon">
          <FileCheck size={20} className="text-cyan" />
          <div>
            <h3>SEC 공시 & 실적 퀵 브리프 (Earnings & 8-K/10-K)</h3>
            <p className="text-muted text-xs">
              관심 종목 어닝콜 및 공시 발생 시 매출/EPS 서프라이즈(Beat/Miss) 및 핵심 가이던스 3줄 압축
            </p>
          </div>
        </div>
        <span className="badge badge-cyan">SEC EDGAR AI Feed</span>
      </div>

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
    </div>
  );
}
