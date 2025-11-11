export function Card({ title, children, className = "" }: { title?: string; children: any; className?: string }) {
  return (
    <div className={`bg-[#111c44] border border-[#1f2d5e] rounded-xl shadow-xl ${className}`}>
      {title && <div className="px-6 py-4 border-b border-[#1f2d5e] font-semibold text-white">{title}</div>}
      <div className="p-6">{children}</div>
    </div>
  );
}
