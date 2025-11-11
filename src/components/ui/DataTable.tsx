import React from "react";

export function DataTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#0f172a]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-slate-300">
            {head}
          </thead>
          <tbody className="divide-y divide-gray-800">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
