export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled,
  type = "button",
  ...props
}: {
  children: any;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}) {
  const baseClasses = "font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#ef4444] hover:bg-[#dc2626] active:bg-[#b91c1c] text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40",
    secondary: "bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-[#f1f5f9] border border-[#475569]",
    danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
    ghost: "bg-transparent border-2 border-[#475569] hover:bg-[#334155] active:bg-[#1e293b] text-[#f1f5f9]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8",
    md: "px-5 py-2.5 text-sm h-10",
    lg: "px-6 py-3 text-base h-12"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
