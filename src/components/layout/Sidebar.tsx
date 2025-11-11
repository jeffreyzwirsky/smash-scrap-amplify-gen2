import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";

const icons = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  boxes: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  marketplace: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  organizations: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export function Sidebar() {
  const loc = useLocation();
  const { groups } = useUserRole();
  const canManage = groups.includes("SuperAdmin") || groups.includes("SellerAdmin") || groups.includes("YardOperator");
  const isAdmin = groups.includes("SuperAdmin") || groups.includes("SellerAdmin");

  const sections = [
    {
      title: "Core Operations",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: icons.dashboard, show: true },
        { to: "/boxes", label: "Inventory", icon: icons.boxes, show: canManage },
        { to: "/marketplace", label: "Marketplace", icon: icons.marketplace, show: true },
      ],
    },
    {
      title: "Management",
      links: [
        { to: "/organizations", label: "Organizations", icon: icons.organizations, show: groups.includes("SuperAdmin") },
        { to: "/users", label: "Users", icon: icons.users, show: isAdmin },
        { to: "/settings", label: "Settings", icon: icons.settings, show: true },
      ],
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#1e293b] border-r border-[#475569] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#475569]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg">S</div>
          <div>
            <h1 className="text-xl font-bold text-[#f1f5f9]">SMASH SCRAP</h1>
            <p className="text-xs text-[#94a3b8]">Management Console</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-6">
            <div className="px-3 mb-2 text-xs font-bold text-[#64748b] uppercase tracking-wider">{sec.title}</div>
            {sec.links.filter((l) => l.show).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-3 mb-1 rounded-lg text-sm font-medium transition-all ${
                  loc.pathname === link.to
                    ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/30"
                    : "text-[#cbd5e1] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-[#475569] text-xs text-[#64748b] text-center">© 2025 SMASH SCRAP</div>
    </aside>
  );
}
