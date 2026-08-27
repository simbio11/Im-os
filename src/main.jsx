import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("L&M OS Global Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#080b11',
          color: '#f1f5f9',
          fontFamily: "'Inter', sans-serif",
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(22, 29, 44, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '520px',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#00f0ff', marginBottom: '8px' }}>
              L&M OS 복구 모드
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.6 }}>
              애플리케이션 렌더링 중 오류가 감지되었습니다.<br/>
              로컬 저장소 캐시를 초기화하고 시스템을 재시작합니다.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#f43f5e',
              marginBottom: '20px',
              textAlign: 'left',
              wordBreak: 'break-all'
            }}>
              {this.state.error?.message || '알 수 없는 런타임 오류'}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #0284c7)',
                color: '#080b11',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              캐시 초기화 및 재시작
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

