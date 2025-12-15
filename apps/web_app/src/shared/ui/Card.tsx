import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-xl border border-border bg-surface/80 backdrop-blur-md shadow-glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

