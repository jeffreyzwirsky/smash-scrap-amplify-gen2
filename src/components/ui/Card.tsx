import React from "react";

export function Card({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-[#0f172a] shadow-card">
      {(title || actions) && (
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-800">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
