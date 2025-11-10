import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

/**
 * Sidebar supports:
 * - Mobile: slide-over <Dialog>
 * - Desktop: sticky panel
 * - Active link styling with NavLink
 */
type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const nav = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/boxes", label: "Boxes", icon: "📦" },
  { to: "/parts", label: "Parts", icon: "🧩" },
  { to: "/marketplace", label: "Marketplace", icon: "🏷️" },
  { to: "/users", label: "Users", icon: "👥" },
];

function NavItems({ onSelect }: { onSelect?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1 px-3">
        {nav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onSelect}
              className={({ isActive }) =>
                `
                group flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                transition
                ${isActive
                  ? "bg-[#0b1437]/60 text-white ring-1 ring-gray-700"
                  : "text-slate-300 hover:text-white hover:bg-white/5"}
              `
              }
              aria-label={item.label}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile drawer */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative w-72 max-w-full bg-[#0f172a] border-r border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="font-semibold">SMASH SCRAP</div>
                  <button
                    onClick={onClose}
                    className="rounded-md p-2 hover:bg-white/5"
                    aria-label="Close sidebar"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <NavItems onSelect={onClose} />
                <div className="p-4 border-t border-gray-800 text-xs text-slate-400">
                  v0.1 • ca-central-1
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sticky sidebar */}
      <aside
        className="
          hidden lg:flex lg:flex-col
          bg-[#0f172a] border-r border-gray-800
          sticky top-0 h-screen
        "
      >
        <div className="p-6 border-b border-gray-800">
          {/* Replace with your SVG logo as needed */}
          <div className="text-lg font-semibold tracking-wide">
            SMASH <span className="text-[#c0152f]">SCRAP</span>
          </div>
          <div className="text-xs text-slate-400">The Scrap Metal Auction Hub</div>
        </div>

        <NavItems />

        <div className="p-4 border-t border-gray-800 text-xs text-slate-400">
          © {new Date().getFullYear()} SMASH
        </div>
      </aside>
    </>
  );
}
