export function Button({ children, variant = "primary", size = "md", className = "", ...props }: {
  children: any;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = "font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95";
  const variants = {
    primary: "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-lg shadow-red-500/30",
    secondary: "bg-[#334155] hover:bg-[#475569] text-[#f1f5f9]",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent border-2 border-[#475569] hover:bg-[#334155] text-[#f1f5f9]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };
  return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}
