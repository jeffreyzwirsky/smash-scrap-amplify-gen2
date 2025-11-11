export function Card({ title, children, className = '', action }: { title?: string; children: any; className?: string; action?: any }) {
  return (
    <div className={`bg-[#111c44] border border-[#1f2d5e] rounded-2xl shadow-xl ${className}`}>
      {title && <div className="px-6 py-4 border-b border-[#1f2d5e] flex items-center justify-between"><h3 className="text-lg font-bold text-white">{title}</h3>{action}</div>}
      <div className="p-6">{children}</div>
    </div>
  );
}
