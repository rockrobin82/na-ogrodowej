import { type ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-leaf-100 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-soil-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-soil-600">{description}</p>
      )}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-soil-100 text-soil-700",
    success: "bg-leaf-100 text-leaf-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
