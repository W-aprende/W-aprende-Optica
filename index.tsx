import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './types'; // Import types to ensure global JSX augmentation is applied

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  public state: {hasError: boolean, error: Error | null};
  public props: {children: React.ReactNode};

  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ef4444', backgroundColor: '#1e293b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>Algo salió mal 😔</h1>
          <p style={{color: '#94a3b8', marginBottom: '2rem'}}>La aplicación ha encontrado un error inesperado.</p>
          <pre style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', maxWidth: '800px', border: '1px solid #334155' }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);