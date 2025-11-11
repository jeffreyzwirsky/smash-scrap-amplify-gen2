import { useUserRole } from "../../hooks/useUserRole";

export function TopBar({ user, signOut }: { user: any; signOut: () => void }) {
  const { orgName, email } = useUserRole();
  
  return (
    <header className="h-16 bg-[#1e293b] border-b border-[#475569] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#334155] rounded-lg border border-[#475569]">
          <div className="w-2 h-2 bg-[#10b981] rounded-full shadow-lg shadow-green-500/50"></div>
          <div>
            <div className="text-sm text-[#f1f5f9] font-semibold">{orgName}</div>
            <div className="text-xs text-[#94a3b8]">{email.split("@")[0]}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-[#334155] text-[#cbd5e1] hover:text-[#f1f5f9] transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ef4444] rounded-full shadow-lg"></span>
        </button>
        <button onClick={signOut} className="px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all">
          Sign Out
        </button>
      </div>
    </header>
  );
}
