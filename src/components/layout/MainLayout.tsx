import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function MainLayout({ children, user, signOut }: { children: ReactNode; user: any; signOut: () => void }) {
  return (
    <div className="flex h-screen bg-[#0b1437] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar user={user} signOut={signOut} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
