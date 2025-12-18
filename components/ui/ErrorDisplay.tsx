import React from 'react';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { getUserFriendlyError } from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onDismiss, className = '' }) => {
  if (!error) return null;

  const { title, message, suggestion } = getUserFriendlyError(error);

  return (
    <div className={`bg-red-950/30 border border-red-500/20 rounded-lg p-4 flex items-start gap-4 animate-fade-in ${className}`}>
      <div className="bg-red-500/10 p-2 rounded-full flex-shrink-0 mt-0.5">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-red-300 font-semibold text-sm mb-1">{title}</h4>
        <p className="text-red-200/80 text-sm mb-3 leading-relaxed">{message}</p>
        {suggestion && (
            <div className="flex items-center gap-2 text-red-300/60 text-xs bg-red-950/30 px-2 py-1.5 rounded w-fit border border-red-500/10">
                <span>💡</span>
                <span>{suggestion}</span>
            </div>
        )}
      </div>
      {(onRetry || onDismiss) && (
          <div className="flex flex-col gap-2">
            {onDismiss && (
                <button 
                  onClick={onDismiss} 
                  className="text-red-400/70 hover:text-red-300 transition-colors p-1"
                  aria-label="Dismiss"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            )}
             {onRetry && (
                <button 
                  onClick={onRetry} 
                  className="text-red-400/70 hover:text-red-300 transition-colors p-1" 
                  title="Retry"
                  aria-label="Retry"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            )}
          </div>
      )}
    </div>
  );
};

export default ErrorDisplay;