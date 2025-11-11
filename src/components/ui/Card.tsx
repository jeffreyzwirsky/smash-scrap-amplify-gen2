export function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1a1a1a] border border-[#333] rounded-lg ${className}`}>
      {title && <div className="px-4 py-3 border-b border-[#333] font-semibold text-white">{title}</div>}
      <div className="p-4">{children}</div>
    </div>
  );
}
