"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  ...props
}) => {
  const baseStyle =
    "w-full py-2.5 px-4 font-mono font-bold uppercase tracking-wider text-xs flex justify-center items-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-2";

  const variants = {
    primary:
      "bg-brand-navy hover:bg-[#132856] text-white border-brand-navy shadow-sm active:translate-y-0.5",
    secondary:
      "bg-brand-sidebar hover:bg-slate-100 text-brand-textMain border-slate-900 active:translate-y-0.5",
    danger:
      "bg-brand-terracotta hover:opacity-90 text-white border-brand-terracotta active:translate-y-0.5",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};
