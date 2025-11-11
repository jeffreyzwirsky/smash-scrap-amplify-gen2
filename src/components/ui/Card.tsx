export function Card({ title, children, className = "", action }: {
  title?: string;
  children: any;
  className?: string;
  action?: any;
}) {
  return (
    <div className={`bg-[#1e293b] border border-[#475569] rounded-lg shadow-md ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-[#475569] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#f1f5f9]">{title}</h3>
          {action}
        </div>
      )}
      <div className={title ? "p-4" : ""}>{children}</div>
    </div>
  );
}
