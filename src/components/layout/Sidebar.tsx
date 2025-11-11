import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";

export function Sidebar() {
  const loc = useLocation();
  const { groups } = useUserRole();
  const canManage = groups.includes("SuperAdmin") || groups.includes("SellerAdmin") || groups.includes("YardOperator");
  const isAdmin = groups.includes("SuperAdmin") || groups.includes("SellerAdmin");

  const sections = [
    {
      title: "Core Operations",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: "📊", show: true },
        { to: "/boxes", label: "Inventory Management", icon: "📦", show: canManage },
        { to: "/marketplace", label: "Auctions", icon: "🔨", show: true },
      ],
    },
    {
      title: "Business Management",
      links: [
        { to: "/organizations", label: "Organizations", icon: "🏢", show: isAdmin },
        { to: "/settings", label: "Settings", icon: "⚙️", show: true },
      ],
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#111c44] border-r border-[#1f2d5e] flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[#1f2d5e]">
        <h1 className="text-2xl font-bold"><span className="text-[#dc2626]">SMASH</span> SCRAP</h1>
        <p className="text-xs text-gray-400 mt-1">Management Console</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-6">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">{sec.title}</div>
            {sec.links.filter((l) => l.show).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition ${
                  loc.pathname === link.to ? "bg-[#dc2626] text-white shadow-lg" : "text-gray-300 hover:bg-[#1f2d5e]"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-[#1f2d5e] text-xs text-gray-500 text-center">© 2025 SMASH SCRAP</div>
    </aside>
  );
}
