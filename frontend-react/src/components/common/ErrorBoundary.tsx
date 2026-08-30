import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          background: '#090D14',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            background: '#121927',
            border: '1px solid rgba(255, 61, 113, 0.4)',
            borderRadius: '8px',
            padding: '24px 32px',
            maxWidth: '500px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)'
          }}>
            <AlertTriangle size={36} style={{ color: '#FF3D71', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>
              Terminal Workspace Render Notice
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.4 }}>
              {this.state.error?.message || 'A transient component render state was detected.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid #00E5FF',
                color: '#00E5FF',
                borderRadius: '4px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.80rem'
              }}
            >
              <RefreshCw size={13} /> Refresh Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
