import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';
import Card from './Card.jsx';

/**
 * Enterprise React Error Boundary
 * Prevents blank screen crashes and provides helpful runtime error context
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neuro-bg flex items-center justify-center p-6 text-neuro-text">
          <Card elevated className="max-w-xl w-full border-rose-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-neuro-textMuted leading-relaxed">
              An unexpected render error occurred in this component.
            </p>

            <div className="p-3 rounded-xl bg-neuro-elevated border border-white/5 text-left text-xs font-mono text-rose-300 overflow-x-auto">
              {this.state.error?.toString()}
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button size="md" onClick={this.handleReload} icon={RefreshCw}>
                Reload Application
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
