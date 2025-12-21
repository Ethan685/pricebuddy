import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantClasses = {
    default: "bg-surfaceHighlight/80 text-textMuted border border-border/50 backdrop-blur-sm",
    primary: "bg-primary/25 text-primary border border-primary/40 backdrop-blur-sm shadow-lg shadow-primary/20",
    success: "bg-successNeon/25 text-successNeon border border-successNeon/40 backdrop-blur-sm shadow-lg shadow-successNeon/20",
    warning: "bg-warning/25 text-warning border border-warning/40 backdrop-blur-sm",
    error: "bg-red-500/30 text-red-300 border border-red-400/50 backdrop-blur-sm shadow-lg shadow-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
