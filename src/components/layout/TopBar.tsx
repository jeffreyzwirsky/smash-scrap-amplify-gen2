import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/**
 * Layout goals:
 * - Fixed (sticky) left sidebar on lg+ screens, slide-over drawer on mobile
 * - Sticky top bar
 * - Independently scrollable main content area
 * - Prevent flex overflow with min-w-0 and content container max width
 * - Dark navy brand background throughout
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1437] text-white">
      {/* App grid: 16rem sidebar on lg+, 1fr content */}
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar: sticky on desktop, slide-over on mobile */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right column (topbar + content) */}
        <div className="min-h-screen flex flex-col min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          {/* Scrollable content area, padded, centered */}
          <main
            className="
              flex-1 overflow-y-auto bg-[#0b1437]
              px-4 sm:px-6 lg:px-8 py-6
            "
          >
            <div className="mx-auto w-full max-w-[1600px] min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
