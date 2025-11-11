#!/usr/bin/env node

/**
 * SMASH SCRAP - Complete Interface Setup Script
 * Automatically creates all necessary files for a working interface
 * 
 * Usage: node setup-interface.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 SMASH SCRAP Interface Setup\n');
console.log('Creating directories and files...\n');

// Create directories
const directories = [
  'src/components/layout',
  'src/components/ui',
  'src/pages',
  'src/hooks'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created: ${dir}`);
  }
});

// File contents
const files = {
  // ========================================
  // HOOKS
  // ========================================
  'src/hooks/useUserRole.ts': `import { useEffect, useState } from 'react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

export interface UserRole {
  email: string;
  userId: string;
  groups: string[];
  role?: string;
  orgID?: string;
  loading: boolean;
}

export function useUserRole(): UserRole {
  const [userRole, setUserRole] = useState<UserRole>({
    email: '',
    userId: '',
    groups: [],
    loading: true,
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        const [session, attributes] = await Promise.all([
          fetchAuthSession(),
          fetchUserAttributes(),
        ]);

        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];

        setUserRole({
          email: attributes.email || '',
          userId: attributes.sub || '',
          groups,
          role: attributes['custom:role'],
          orgID: attributes['custom:orgID'],
          loading: false,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserRole(prev => ({ ...prev, loading: false }));
      }
    }

    loadUserData();
  }, []);

  return userRole;
}
`,

  // ========================================
  // LAYOUT COMPONENTS
  // ========================================
  'src/components/layout/MainLayout.tsx': `import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
  user: any;
  signOut: () => void;
}

export function MainLayout({ children, user, signOut }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#000000]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar 
          user={user} 
          signOut={signOut}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
`,

  'src/components/layout/Sidebar.tsx': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useUserRole } from '../../hooks/useUserRole';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { groups } = useUserRole();

  const canManageOrg = groups.includes('SuperAdmin') || groups.includes('SellerAdmin');
  const canManageInventory = groups.includes('SuperAdmin') || groups.includes('SellerAdmin') || groups.includes('YardOperator');

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', show: true },
    { path: '/boxes', icon: CubeIcon, label: 'Boxes', show: canManageInventory },
    { path: '/parts', icon: ChartBarIcon, label: 'Parts', show: canManageInventory },
    { path: '/marketplace', icon: ShoppingCartIcon, label: 'Marketplace', show: true },
    { path: '/organizations', icon: BuildingOfficeIcon, label: 'Organizations', show: canManageOrg },
    { path: '/users', icon: UsersIcon, label: 'Users', show: canManageOrg },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings', show: true },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={\`
          fixed lg:sticky top-0 left-0 z-50 lg:z-0
          w-64 h-screen
          bg-[#1a1a1a] border-r border-[#404040]
          flex flex-col
          transition-transform duration-300 lg:translate-x-0
          \${isOpen ? 'translate-x-0' : '-translate-x-full'}
        \`}
      >
        <div className="p-6 border-b border-[#404040] flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-[#dc2626]">SMASH</span>
            <span className="text-white"> SCRAP</span>
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={\`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      font-medium transition-all
                      \${isActive
                        ? 'bg-[#dc2626] text-white'
                        : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                      }
                    \`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-[#404040]">
          <p className="text-xs text-gray-500 text-center">© 2025 SMASH SCRAP</p>
        </div>
      </aside>
    </>
  );
}
`,

  'src/components/layout/TopBar.tsx': `import React from 'react';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  Bars3Icon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

interface TopBarProps {
  user: any;
  signOut: () => void;
  onMenuClick: () => void;
}

export function TopBar({ user, signOut, onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 bg-[#1a1a1a] border-b border-[#404040] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626] transition-colors"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-colors relative"
          title="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-[#dc2626] rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-[#404040] hidden sm:block" />
        <div className="hidden sm:block text-right">
          <p className="text-sm text-white">{user?.signInDetails?.loginId}</p>
          <p className="text-xs text-gray-400">Authenticated</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
`,

  // ========================================
  // UI COMPONENTS
  // ========================================
  'src/components/ui/Card.tsx': `import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={\`bg-[#2d2d2d] border border-[#404040] rounded-xl shadow-lg \${className}\`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[#404040] flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
`,

  'src/components/ui/Button.tsx': `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white',
    secondary: 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white',
    danger: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white',
    ghost: 'bg-transparent border border-[#404040] hover:bg-[#2a2a2a] text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}
`,

  'src/components/ui/StatCard.tsx': `import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#2d2d2d] border border-[#404040] rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-4 bg-[#3a3a3a] rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-[#3a3a3a] rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2d2d] border border-[#404040] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={\`text-sm mt-2 \${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }\`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-[#dc2626]/10 rounded-lg">
            <Icon className="h-6 w-6 text-[#dc2626]" />
          </div>
        )}
      </div>
    </div>
  );
}
`,

  // ========================================
  // PAGES
  // ========================================
  'src/pages/Dashboard.tsx': `import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CubeIcon, CurrencyDollarIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useUserRole } from '../hooks/useUserRole';

export default function Dashboard() {
  const client = generateClient<Schema>();
  const { email, userId, groups, role, orgID } = useUserRole();
  const [stats, setStats] = useState({
    totalBoxes: 0,
    activeAuctions: 0,
    completedSales: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: boxes } = await client.models.Box.list();
      const { data: sales } = await client.models.Sale.list();

      const activeSales = sales?.filter((s) => s.status === 'ACTIVE') || [];
      const completedSales = sales?.filter((s) => s.status === 'SOLD') || [];
      const revenue = completedSales.reduce((sum, sale) => sum + (sale.currentBid || 0), 0);

      setStats({
        totalBoxes: boxes?.length || 0,
        activeAuctions: activeSales.length,
        completedSales: completedSales.length,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome to SMASH SCRAP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Boxes" value={stats.totalBoxes} icon={CubeIcon} loading={loading} />
        <StatCard title="Active Auctions" value={stats.activeAuctions} icon={ShoppingCartIcon} loading={loading} />
        <StatCard title="Completed Sales" value={stats.completedSales} icon={CheckCircleIcon} loading={loading} />
        <StatCard title="Total Revenue" value={\`$\${stats.totalRevenue.toLocaleString()}\`} icon={CurrencyDollarIcon} loading={loading} />
      </div>

      <Card title="User Information">
        <div className="space-y-2 text-white">
          <p><strong>Email:</strong> {email}</p>
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Groups:</strong> {groups.join(', ') || 'None'}</p>
          <p><strong>Role:</strong> {role || 'Not assigned'}</p>
          <p><strong>Organization ID:</strong> {orgID || 'Not assigned'}</p>
        </div>
      </Card>
    </div>
  );
}
`,

  // ========================================
  // CSS FILES
  // ========================================
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #000000;
  color: #ffffff;
}

#root {
  width: 100%;
  min-height: 100vh;
}

*, *::before, *::after {
  box-sizing: inherit;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #dc2626;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b91c1c;
}

button {
  cursor: pointer;
}
`,

  'src/App.css': `/* SMASH SCRAP Custom Authenticator Styling */
[data-amplify-authenticator] {
  --amplify-colors-background-primary: #000000;
  --amplify-colors-background-secondary: #1a1a1a;
  --amplify-colors-font-primary: #ffffff;
  --amplify-colors-brand-primary-10: #dc2626;
  --amplify-colors-brand-primary-80: #ef4444;
  --amplify-colors-brand-primary-90: #f87171;
  --amplify-colors-brand-primary-100: #fca5a5;
}

[data-amplify-authenticator] [data-amplify-container] {
  background-color: #1a1a1a;
  border: 1px solid #404040;
}

[data-amplify-authenticator] button[type='submit'] {
  background-color: #dc2626;
}

[data-amplify-authenticator] button[type='submit']:hover {
  background-color: #b91c1c;
}
`
};

// Write all files
console.log('\nWriting files...\n');
Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Created: ${filePath}`);
});

console.log('\n========================================');
console.log('✅ ALL FILES CREATED SUCCESSFULLY!');
console.log('========================================\n');

console.log('📦 Next steps:\n');
console.log('1. Install dependencies:');
console.log('   npm install @heroicons/react react-router-dom\n');
console.log('2. Update your App.tsx with the router setup');
console.log('3. Run: npm run dev\n');
console.log('🚀 Your SMASH SCRAP interface is ready!\n');
