import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200";
  const variantClasses = {
    primary: "bg-primary hover:bg-primaryHover text-white shadow-neon-blue",
    secondary: "bg-surfaceHighlight hover:bg-border text-textMain border border-border",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

