import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantClasses = {
    default: "bg-surfaceHighlight text-textMuted border border-border",
    success: "bg-success/20 text-successNeon border border-success/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
    error: "bg-danger/20 text-dangerNeon border border-danger/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
