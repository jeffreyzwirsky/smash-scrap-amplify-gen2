import { Link, useLocation } from "react-router-dom";

function NavItem({ to, label, active }:{
  to: string; label: string; active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`block px-4 py-2.5 mb-1 rounded-lg text-sm font-medium transition
      ${active ? "bg-[#dc2626] text-white shadow-lg" : "text-gray-300 hover:bg-[#1f2d5e]"}`}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  const loc = useLocation();
  const isAdmin = true; // TODO: wire to real role logic

  const sections = [
    {
      title: "Core Operations",
      links: [
        { to: "/dashboard", label: "Dashboard", show: true },
        { to: "/boxes", label: "Inventory Management", show: true },
        { to: "/parts", label: "Converter Builder", show: true },
        { to: "/marketplace", label: "Auctions", show: true },
      ],
    },
    {
      title: "Business Management",
      links: [
        { to: "/organizations", label: "Organizations", show: isAdmin },
        { to: "/settings", label: "Settings", show: true },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 bg-[#111c44] border-r border-[#1f2d5e] flex flex-col">
      <div className="p-5 border-b border-[#1f2d5e]">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#dc2626]">SMASH</span> <span>SCRAP</span>
        </h1>
        <div className="text-[11px] text-gray-400 mt-1">Professional Console</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-6">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">
              {sec.title}
            </div>
            {sec.links.filter(l => l.show).map(link => (
              <NavItem
                key={link.to}
                to={link.to}
                label={link.label}
                active={loc.pathname === link.to}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1f2d5e] text-xs text-gray-500 text-center">
        © 2025 SMASH SCRAP
      </div>
    </aside>
  );
}
