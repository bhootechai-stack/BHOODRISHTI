import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BhooTech AI Runtime Caught Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F1E8] text-[#1E2B1F] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(40,50,35,0.06)] text-center space-y-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#FFFBEB] text-[#D9922B] mx-auto flex items-center justify-center border border-[#FDE68A]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1E2B1F]">Application Notice</h2>
              <p className="text-xs text-[#6B7266]">
                A background operation encountered a momentary pause. Your saved data and farm records remain secure.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] text-left font-mono text-[11px] text-[#D9922B] break-words max-h-32 overflow-y-auto">
                {this.state.error.message || 'Script error'}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-[#2D5A36] hover:bg-[#23472A] text-white rounded-[8px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

