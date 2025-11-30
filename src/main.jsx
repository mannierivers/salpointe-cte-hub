import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Define a safety net component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("CRITICAL APP CRASH:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#1e293b', color: 'white', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '20px' }}>⚠️ System Failure (App Crash)</h1>
          <p style={{ marginBottom: '10px' }}>Please send this error message to the developer:</p>
          <div style={{ backgroundColor: 'black', padding: '20px', borderRadius: '8px', overflow: 'auto', border: '1px solid #475569' }}>
            <strong style={{ color: '#fbbf24' }}>{this.state.error?.toString()}</strong>
            <pre style={{ marginTop: '10px', color: '#94a3b8', fontSize: '12px' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0891b2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            reboot_system (Reload Page)
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// 2. Wrap your App in the safety net
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)