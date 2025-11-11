import React from "react";

export function Modal({ open, title, onClose, children }:{
  open: boolean; title?: string; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,720px)] bg-[#111c44] border border-[#1f2d5e] rounded-2xl shadow-2xl">
        <div className="px-5 py-3 border-b border-[#1f2d5e] flex items-center justify-between">
          <div className="text-white font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-sm px-2 py-1">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
