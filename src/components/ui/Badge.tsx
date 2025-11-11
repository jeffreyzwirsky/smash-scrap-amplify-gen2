export function Badge({
  children,
  tone = 'red'
}: {
  children: React.ReactNode;
  tone?: 'red' | 'green' | 'blue' | 'orange' | 'gray';
}) {
  const map: Record<string, string> = {
    red: 'bg-[#dc2626]',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    orange: 'bg-orange-600',
    gray: 'bg-gray-600'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${map[tone]}`}>
      {children}
    </span>
  );
}
