export function TopBar({ user, signOut }: { user: any; signOut: () => void }) {
  return (
    <header className="h-14 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-6">
      <div className="text-sm text-gray-400">{user?.signInDetails?.loginId}</div>
      <button
        onClick={signOut}
        className="px-4 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm rounded transition"
      >
        Logout
      </button>
    </header>
  );
}
