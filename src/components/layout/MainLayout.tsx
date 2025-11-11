import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function MainLayout({
  children,
  user,
  signOut
}: {
  children: ReactNode;
  user: any;
  signOut: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#0b1437] text-white overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={user}
          signOut={signOut}
          onToggleSidebar={() => setOpen((s) => !s)}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
