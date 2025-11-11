import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function MainLayout({ children, user, signOut }: {
  children: React.ReactNode;
  user: any;
  signOut: () => void;
}) {
  return (
    <div className="grid h-screen grid-cols-[16rem,1fr] bg-[#0b1437] text-white">
      {/* Left column: sticky sidebar */}
      <Sidebar />
      
      {/* Right column: content */}
      <div className="flex flex-col min-w-0">
        <TopBar user={user} signOut={signOut} onToggleSidebar={() => {}} />
        <main className="flex-1 overflow-auto p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
