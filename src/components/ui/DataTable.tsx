import React, { useMemo, useState } from "react";

export function DataTable<T>({ rows, columns }:{
  rows: T[];
  columns: { key: keyof T; label: string; render?: (row: T) => React.ReactNode }[];
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: keyof T; dir: 1 | -1 } | null>(null);

  const data = useMemo(() => {
    let d = rows;
    if (q) {
      const needle = q.toLowerCase();
      d = d.filter(r => Object.values(r as any).some(v => String(v ?? "").toLowerCase().includes(needle)));
    }
    if (sort) {
      d = [...d].sort((a: any, b: any) => (a[sort.key] > b[sort.key] ? sort.dir : -sort.dir));
    }
    return d;
  }, [rows, q, sort]);

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Filter..."
        className="w-full md:w-72 px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-sm text-white placeholder-gray-500"
      />
      <div className="overflow-hidden rounded-xl border border-[#1f2d5e]">
        <table className="w-full border-collapse">
          <thead className="bg-[#0b1437]">
            <tr>
              {columns.map(c => (
                <th key={String(c.key)} className="text-left text-xs font-semibold text-gray-300 tracking-wide px-4 py-3 border-b border-[#1f2d5e] select-none">
                  <button className="hover:text-white" onClick={() => setSort(s => (!s || s.key !== c.key ? { key: c.key, dir: 1 } : { key: c.key, dir: (s.dir * -1) as 1 | -1 }))}>
                    {c.label}{sort?.key === c.key ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[#111c44]">
            {data.length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-gray-400" colSpan={columns.length}>No results</td></tr>
            ) : data.map((r, i) => (
              <tr key={i} className="border-b border-[#1f2d5e] hover:bg-[#1a2755] transition">
                {columns.map(c => (
                  <td key={String(c.key)} className="px-4 py-3 text-sm text-gray-200">{c.render ? c.render(r) : String((r as any)[c.key] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
