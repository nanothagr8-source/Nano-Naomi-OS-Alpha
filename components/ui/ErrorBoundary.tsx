import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Terminal, ShieldAlert, LifeBuoy, RefreshCw } from 'lucide-react';
import Button from './Button';
import { telemetry } from '../../services/telemetryService';
import { getUserFriendlyError } from '../../utils/errorHandler';

interface ErrorBoundaryProps {
  children?: ReactNode;
  moduleName: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * IndustrialErrorBoundary provides kernel-level protection for isolated modules.
 * Centralizes error reporting to telemetry engine.
 */
// Fix: Import Component directly and extend it to ensure props, state, and setState are correctly inherited.
class IndustrialErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Initializing state in constructor ensures it is recognized by TypeScript and resolves 'Property state does not exist' errors.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fix: Accessing moduleName from this.props which is correctly inherited from Component.
    console.error(`[KERNEL ERROR] ${this.props.moduleName}:`, error, errorInfo);
    // Report to central logging
    telemetry.logError(this.props.moduleName, error, true);
  }

  private handleReset = () => {
    // Fix: Utilizing this.setState inherited from Component to clear error state.
    this.setState({ hasError: false, error: null });
  };

  public render() {
    // Fix: Correctly accessing this.state to determine if an error has occurred.
    if (this.state.hasError) {
      // Fix: Accessing this.state.error for user-friendly error processing.
      const { title, message, suggestion } = getUserFriendlyError(this.state.error);

      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-12 bg-slate-950/50 backdrop-blur-md rounded-3xl border border-red-500/20 animate-fade-in text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="w-20 h-20 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center shadow-2xl relative">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{title || 'Module Kernel Panic'}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              {/* Fix: Correctly accessing moduleName from this.props. */}
              Fault detected in <span className="text-red-400">{this.props.moduleName}</span>. System stability maintained via sandbox isolation.
            </p>
            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-200/80">
                {message}
            </div>
          </div>

          {suggestion && (
            <div className="mt-6 flex items-start gap-3 bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl max-w-sm text-left">
              <LifeBuoy className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Action</p>
                 <p className="text-xs text-slate-300">{suggestion}</p>
              </div>
            </div>
          )}

          <div className="w-full bg-black/60 border border-white/5 rounded-xl p-4 mt-8 font-mono text-[10px] text-red-400/80 overflow-hidden mb-8 max-w-lg">
             <div className="flex items-center gap-2 mb-2 text-slate-600 border-b border-white/5 pb-2 uppercase font-black">
                <Terminal className="w-3 h-3" /> Trace Buffer
             </div>
             {/* Fix: Accessing this.state.error for display. */}
             <p className="truncate text-left">{this.state.error?.toString()}</p>
          </div>

          <Button onClick={this.handleReset} className="bg-red-600 hover:bg-red-500 h-12 px-8 rounded-xl shadow-lg shadow-red-900/20">
            <RefreshCw className="w-4 h-4 mr-2" /> Hot Reboot module
          </Button>
        </div>
      );
    }

    // Fix: Safely returning this.props.children when no error is present.
    return this.props.children;
  }
}

export default IndustrialErrorBoundary;