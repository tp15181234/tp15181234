import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-lg p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                일시적인 화면 오류가 발생했습니다
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                네트워크 연결 또는 인증 상태를 확인한 후 다시 시도해 주세요.
              </p>
              {this.state.errorMessage && (
                <div className="mt-2 p-2 rounded bg-slate-100 text-[10px] font-mono text-slate-600 break-all max-h-24 overflow-y-auto">
                  {this.state.errorMessage}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>새로고침하여 복구하기</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
