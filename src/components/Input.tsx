import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider">
        {label}
        <input
          className={`w-full px-3.5 py-2.5 bg-white border-2 ${
            error
              ? "border-brand-terracotta focus:border-brand-terracotta"
              : "border-slate-800 focus:border-brand-navy"
          } text-brand-textMain placeholder-slate-400 focus:outline-none transition-colors text-sm font-mono mt-1`}
          {...props}
        />
      </label>
      {error && (
        <span className="text-xs text-brand-terracotta mt-0.5 font-mono font-semibold">{error}</span>
      )}
    </div>
  );
};
