import { Link, useLocation } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';

export function Sidebar() {
  const location = useLocation();
  const { groups } = useUserRole();
  
  const isAdmin = groups.includes('SuperAdmin') || groups.includes('SellerAdmin');
  const canManage = isAdmin || groups.includes('YardOperator');
  
  const links = [
    { to: '/dashboard', label: 'Dashboard', show: true },
    { to: '/boxes', label: 'Boxes', show: canManage },
    { to: '/parts', label: 'Parts', show: canManage },
    { to: '/marketplace', label: 'Marketplace', show: true },
    { to: '/organizations', label: 'Organizations', show: isAdmin },
    { to: '/settings', label: 'Settings', show: true },
  ];
  
  return (
    <aside className="w-56 bg-[#1a1a1a] border-r border-[#333] flex flex-col">
      <div className="p-4 border-b border-[#333]">
        <h1 className="text-xl font-bold">
          <span className="text-[#dc2626]">SMASH</span>
          <span className="text-white"> SCRAP</span>
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.filter(l => l.show).map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-3 py-2 rounded text-sm font-medium transition ${
              location.pathname === link.to
                ? 'bg-[#dc2626] text-white'
                : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[#333] text-xs text-gray-500 text-center">
        © 2025 SMASH SCRAP
      </div>
    </aside>
  );
}
