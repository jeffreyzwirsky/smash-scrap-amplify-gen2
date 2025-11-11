import { useUserRole } from "../../hooks/useUserRole";

export function TopBar({ user, signOut }: { user: any; signOut: () => void }) {
  const { orgName, email } = useUserRole();
  
  return (
    <header className="h-16 bg-[#111c44] border-b border-[#1f2d5e] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-sm text-white font-medium">{orgName}</div>
          <div className="text-xs text-gray-400">{email.split("@")[0]}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={signOut}
          className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
