import React from 'react';
import { Star, GitFork, ArrowUpRight, ExternalLink, Code2, Sparkles, GitBranch } from 'lucide-react';
import { GITHUB_AI_TRENDING } from '../data/sampleData';

export function GithubAiTracker() {
  return (
    <div className="github-tracker-container glass-card">
      <div className="panel-header">
        <div className="panel-title-with-icon">
          <Code2 size={20} className="text-cyan" />
          <div>
            <h4>GitHub / AI 트렌딩 트래커 (Open Source Tech Radar)</h4>
            <p className="text-muted text-xs">
              AI / Reasoning / RAG / HealthTech 분야 최신 인기 오픈소스 리포지토리 요약
            </p>
          </div>
        </div>
        <span className="badge badge-cyan">Global Trending</span>
      </div>

      <div className="github-cards-grid">
        {GITHUB_AI_TRENDING.map(repo => (
          <div key={repo.id} className="github-repo-card glass-card">
            <div className="repo-header">
              <div>
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="repo-name-link font-bold text-highlight"
                >
                  {repo.repo}
                </a>
                <div className="repo-category-row">
                  <span className="badge badge-purple text-xs">{repo.category}</span>
                  <span className="badge badge-cyan text-xs">{repo.language}</span>
                </div>
              </div>

              <div className="repo-stars-col text-right">
                <div className="stars-count mono font-bold text-amber">
                  <Star size={14} className="fill-amber" /> {repo.stars}
                </div>
                <div className="today-stars text-xs text-emerald mono">
                  {repo.todayStars} today
                </div>
              </div>
            </div>

            <p className="repo-desc text-xs text-muted">
              {repo.description}
            </p>

            <div className="repo-footer">
              <a 
                href={repo.url} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>GitHub에서 보기</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
