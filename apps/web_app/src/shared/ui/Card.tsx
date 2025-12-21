import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-xl border border-border/60 bg-surface/90 backdrop-blur-xl shadow-glass-card transition-all duration-300 ${className}`} {...props}>
      {children}
    </div>
  );
}

