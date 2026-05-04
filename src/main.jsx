import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// GitHub Pages directory paths need a trailing slash to load that folder's index.html.
// If someone hits /BusinessCard (no slash), we redirect before React mounts.
if (window.location.pathname === '/BusinessCard') {
  window.location.replace('/BusinessCard/')
}

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            padding: '1.5rem',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '28rem',
            margin: '2rem auto',
            lineHeight: 1.5,
          }}
        >
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Something went wrong loading this page</h1>
          <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.75rem' }}>
            Try a normal browser tab (not an in-app browser), update iOS/Android, or clear cache. If you screenshot this for support, include the grey box below.
          </p>
          <pre
            style={{
              fontSize: '11px',
              overflow: 'auto',
              marginTop: '1rem',
              background: '#f4f4f5',
              padding: '0.75rem',
              borderRadius: '6px',
            }}
          >
            {String(this.state.err)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
