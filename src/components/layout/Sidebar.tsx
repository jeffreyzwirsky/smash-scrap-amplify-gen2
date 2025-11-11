import { Link, useLocation } from "react-router-dom";
import { modules, userCanAccess } from "../../config/modules";
import { useUserRole } from "../../hooks/useUserRole";
import { readBranding } from "../../utils/branding";

export function Sidebar() {
  const loc = useLocation();
  const { groups } = useUserRole() as any;

  const branding = typeof window !== "undefined" ? readBranding() : {};
  const visible = modules.filter(m => m.inNav && userCanAccess(groups || [], m.roles));
  const sections = Array.from(new Set(visible.map(v => v.section || "Core Operations")));

  return (
    <aside className="sticky top-0 h-screen w-64 bg-[#111c44] border-r border-[#1f2d5e] flex flex-col">
      <div className="p-5 border-b border-[#1f2d5e] flex items-center gap-3">
        {branding.brandLogoUrl ? (
          <img
            src={branding.brandLogoUrl}
            alt={branding.brandName || "Brand"}
            className="h-10 w-auto rounded-md object-contain bg-transparent"
          />
        ) : (
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#dc2626]">SMASH</span> <span>SCRAP</span>
          </h1>
        )}
        <div className="ml-auto text-[11px] text-gray-400">Professional Console</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map(sec => (
          <div key={sec} className="mb-6">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">{sec}</div>
            {visible
              .filter(v => (v.section || "Core Operations") === sec)
              .map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2.5 mb-1 rounded-lg text-sm font-medium transition
                    ${loc.pathname === link.path ? "bg-[#dc2626] text-white shadow-lg" : "text-gray-300 hover:bg-[#1f2d5e]"}`}
                >
                  {link.label}
                </Link>
              ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1f2d5e] text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} {branding.brandName || "SMASH SCRAP"}
      </div>
    </aside>
  );
}
