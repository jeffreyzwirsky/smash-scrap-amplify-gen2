export function Table({ headers, rows, empty }:{
  headers: string[]; rows: React.ReactNode[][]; empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1f2d5e]">
      <table className="w-full border-collapse">
        <thead className="bg-[#0b1437]">
          <tr>{headers.map(h=>(
            <th key={h} className="text-left text-xs font-semibold text-gray-300 tracking-wide px-4 py-3 border-b border-[#1f2d5e]">{h}</th>
          ))}</tr>
        </thead>
        <tbody className="bg-[#111c44]">
          {rows.length===0 ? (
            <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">{empty ?? "No data"}</td></tr>
          ) : rows.map((r,i)=>(
            <tr key={i} className="border-b border-[#1f2d5e] hover:bg-[#1a2755] transition">
              {r.map((c,j)=><td key={j} className="px-4 py-3 text-sm text-gray-200">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
