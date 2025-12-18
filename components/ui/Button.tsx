
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ring-offset-slate-950";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:bg-indigo-800 disabled:opacity-50",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 hover:border-white/10 disabled:bg-slate-900",
    danger: "bg-red-600/20 hover:bg-red-500 text-red-500 border border-red-500/30 hover:text-white"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'cursor-wait opacity-80' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
