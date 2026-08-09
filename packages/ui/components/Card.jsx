export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white border border-navy-200 rounded-lg shadow-sm p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
