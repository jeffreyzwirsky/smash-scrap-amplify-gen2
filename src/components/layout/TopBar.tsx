import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header
      className="
        h-16 bg-[#0f172a] border-b border-gray-800
        sticky top-0 z-40
        flex items-center justify-between
        px-4 sm:px-6 lg:px-8
      "
      role="banner"
    >
      {/* Left: mobile menu button + (optional) breadcrumb/search */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-md p-2 hover:bg-white/5"
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="hidden md:block text-sm text-slate-300 truncate">
          <span className="text-slate-400">Environment:</span> Production •{" "}
          <span className="text-slate-400">Region:</span> ca-central-1
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="rounded-md p-2 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#21808d]"
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6 text-slate-300" />
        </button>

        <div className="h-8 w-px bg-gray-800 mx-1 sm:mx-2" aria-hidden="true" />

        {/* Avatar placeholder */}
        <button
          className="
            h-8 w-8 rounded-full bg-gradient-to-br from-[#21808d] to-[#0b1437]
            ring-1 ring-gray-700 hover:ring-gray-600 transition
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#21808d]
          "
          aria-label="Open profile menu"
          title="Account"
        />
      </div>
    </header>
  );
}
