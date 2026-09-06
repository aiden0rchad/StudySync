import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StudySync Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-white bg-slate-900 min-h-screen flex flex-col items-center justify-center text-center">
          <h1 className="text-xl font-bold text-rose-400">Something went wrong</h1>
          <p className="mt-2 text-slate-400 text-sm max-w-md">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-xs font-semibold shadow-md transition-colors"
          >
            Reset Stored Data & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Register PWA Service Worker
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname.endsWith('.ts.net'))) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('ServiceWorker registration error:', err);
    });
  });
}
