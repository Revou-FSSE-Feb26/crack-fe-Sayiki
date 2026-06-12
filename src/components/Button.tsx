"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading ,
  className,
  ...props
}) => {
  const baseStyle =
    "w-full py-2.5 px-4 rounded-md font-medium tracking-wide transition-all duration-200 text-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-brand-navy hover:bg-[#132856] text-white shadow-sm font-semibold",
    secondary:
      "bg-brand-sidebar hover:bg-slate-50 text-brand-textMain border border-brand-border font-medium",
    danger: "bg-brand-terracotta hover:opacity-90 text-white font-semibold",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};
