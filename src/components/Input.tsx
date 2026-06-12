import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-xs font-bold text-brand-textMuted uppercase tracking-wider">
        {label}
        <input
          className={`w-full px-3 py-2 bg-white border ${error ? "border-brand-terracotta focus:border-brand-terracotta" : "border-brand-border focus:border-brand-navy"} rounded-md text-brand-textMain placeholder-slate-400 focus:outline-none transition-colors text-sm shadow-sm`}
        />
      </label>
      {error && (
        <span className="text-xs text-brand-terracotta mt-0.5">{error}</span>
      )}
    </div>
  );
};
