"use client";

const VARIANT_CLASSES = {
  primary:
    "bg-medical-600 hover:bg-medical-700 text-white shadow-sm",
  secondary: "bg-navy-100 hover:bg-navy-200 text-navy-900",
  outline:
    "border border-medical-600 text-medical-700 hover:bg-medical-50",
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
};

export function Button({ variant = "primary", className = "", children, ...props }) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  return (
    <button
      className={`inline-flex items-center justify-center font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
