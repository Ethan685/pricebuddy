import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantClasses = {
    default: "bg-surfaceHighlight text-textMuted border border-border",
    primary: "bg-primary/20 text-primary border border-primary/30",
    success: "bg-successNeon/20 text-successNeon border border-successNeon/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
    error: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
