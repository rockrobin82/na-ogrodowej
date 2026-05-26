import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-leaf-600 text-white hover:bg-leaf-700 focus-visible:ring-leaf-500",
  secondary:
    "bg-soil-100 text-soil-900 hover:bg-soil-200 focus-visible:ring-soil-400",
  outline:
    "border border-leaf-600 text-leaf-700 hover:bg-leaf-50 focus-visible:ring-leaf-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  ghost: "text-soil-700 hover:bg-soil-100 focus-visible:ring-soil-400",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
