import { ReactNode } from "react";
export function Card({ title, action, children, className = "" }:{
  title?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`bg-[#111c44] border border-[#1f2d5e] rounded-2xl shadow-xl ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[#1f2d5e] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
