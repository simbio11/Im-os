import React, { useState } from 'react';
import { Shield, AlertTriangle, TrendingUp, Filter, ExternalLink, Bookmark, Clock } from 'lucide-react';
import { POLICY_NEWS } from '../data/sampleData';

export function PolicyNewsTracker() {
  const [selectedTag, setSelectedTag] = useState('ALL');

  const tags = ['ALL', '관세/통상', '빅테크 규제', '연준/통화정책'];

  const filteredNews = selectedTag === 'ALL' 
    ? POLICY_NEWS 
    : POLICY_NEWS.filter(n => n.tag === selectedTag);

  const getSentimentBadge = (sent) => {
    switch (sent) {
      case 'BULLISH':
        return <span className="badge badge-emerald">📈 시장 호재 (Bullish)</span>;
      case 'BEARISH':
        return <span className="badge badge-rose">📉 리스크/악재 (Bearish)</span>;
      default:
        return <span className="badge badge-cyan">⚖️ 중립/관망 (Neutral)</span>;
    }
  };

  return (
    <div className="policy-news-container">
      <div className="policy-header-row">
        <div className="panel-title-with-icon">
          <Shield size={20} className="text-purple" />
          <div>
            <h3>정치 & 정책 뉴스 트래커 (Policy & Macro Regulations)</h3>
            <p className="text-muted text-xs">
              대선/정치 발언, 관세 정책, 빅테크 규제 및 연준 FOMC 발언 핵심 3줄 압축 요약
            </p>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="tag-filter-pills">
          {tags.map(tag => (
            <button
              key={tag}
              className={`filter-pill ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="policy-news-grid">
        {filteredNews.map(news => (
          <div key={news.id} className="policy-card glass-card">
            <div className="policy-card-header">
              <div className="policy-meta-row">
                <span className="badge badge-purple">{news.tag}</span>
                <span className="text-muted text-xs">{news.source} • {news.time}</span>
              </div>
              {getSentimentBadge(news.sentiment)}
            </div>

            <h4 className="policy-card-title">{news.title}</h4>

            <div className="three-lines-box">
              <div className="three-lines-title text-xs font-bold text-cyan">
                ⚡ 3줄 압축 핵심 요약:
              </div>
              <ul className="three-lines-list">
                {news.threeLines.map((line, idx) => (
                  <li key={idx} className="three-line-item text-xs">
                    <span className="line-num mono">{idx + 1}.</span> {line}
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
