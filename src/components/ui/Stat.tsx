export function Stat({ label, value, hint, gradient="from-blue-500 to-blue-600", loading }:{
  label: string; value: string|number; hint?: string; gradient?: string; loading?: boolean;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-2xl`}>
      <div className="text-white/80 text-sm mb-2">{label}</div>
      <div className="text-4xl font-extrabold text-white tracking-tight mb-1">{loading ? "..." : value}</div>
      {hint && <div className="text-white/80 text-xs">{hint}</div>}
    </div>
  );
}
