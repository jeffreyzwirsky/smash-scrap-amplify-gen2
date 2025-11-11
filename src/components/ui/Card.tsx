export function Card({ title, children, className = "", action }: {
  title?: string;
  children: any;
  className?: string;
  action?: any;
}) {
  return (
    <div className={`bg-[#1e293b] border border-[#475569] rounded-xl shadow-xl hover-lift fade-in ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-[#475569] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#f1f5f9]">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
