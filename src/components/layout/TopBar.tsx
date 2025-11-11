export function TopBar({ user, signOut, onToggleSidebar }:{
  user:any; signOut:()=>void; onToggleSidebar:()=>void;
}) {
  const username = user?.signInDetails?.loginId?.split?.("@")?.[0] ?? user?.username ?? "User";
  return (
    <header className="h-16 bg-[#111c44] border-b border-[#1f2d5e] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 rounded-lg bg-[#0b1437] border border-[#1f2d5e] hover:border-[#dc2626] lg:hidden" aria-label="Toggle menu">
          <div className="w-5 h-[2px] bg-white mb-1" /><div className="w-5 h-[2px] bg-white mb-1" /><div className="w-5 h-[2px] bg-white" />
        </button>
        <input type="search" placeholder="Search..." className="w-60 md:w-96 px-4 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#dc2626]" />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <div className="text-sm text-white font-medium">{username}</div>
          <div className="text-xs text-gray-400">Signed in</div>
        </div>
        <button onClick={signOut} className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg transition">Logout</button>
      </div>
    </header>
  );
}
