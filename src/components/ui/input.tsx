import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-soil-800">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-soil-200 bg-white px-3 py-2.5 text-soil-900 shadow-sm transition placeholder:text-soil-400 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/20 ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
