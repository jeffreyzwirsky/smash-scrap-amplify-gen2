export function TopBar({ user, signOut }: { user: any; signOut: () => void }) {
  return (
    <header className="h-16 bg-[#111c44] border-b border-[#1f2d5e] flex items-center justify-between px-6">
      <div className="flex-1">
        <input type="search" placeholder="Search..." className="w-96 px-4 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#dc2626]" />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-white font-medium">{user?.signInDetails?.loginId?.split('@')[0]}</div>
          <div className="text-xs text-gray-400">Administrator</div>
        </div>
        <button onClick={signOut} className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg transition">Logout</button>
      </div>
    </header>
  );
}
