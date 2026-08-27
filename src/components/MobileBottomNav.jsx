import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  TrendingUp, 
  Headphones, 
  Bot
} from 'lucide-react';

export function MobileBottomNav({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'dashboard', label: '홈', icon: LayoutDashboard },
    { id: 'calendar', label: '캘린더', icon: Calendar },
    { id: 'life', label: '라이프', icon: CheckSquare },
    { id: 'market', label: '금융/마켓', icon: TrendingUp },
    { id: 'sound', label: '딥워크', icon: Headphones },
    { id: 'rag', label: 'AI 검색', icon: Bot }
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              aria-label={item.label}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={20} />
                {isActive && <div className="mobile-nav-active-dot"></div>}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
