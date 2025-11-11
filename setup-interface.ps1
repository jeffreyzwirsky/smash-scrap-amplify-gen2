# SMASH SCRAP - PowerShell Setup Script
# Run this in PowerShell from your project root directory
# Location: C:\Users\jeffz\OneDrive\Documents\GitHub\smash-scrap-amplify-gen2

# ========================================
# PART 1: Create Directory Structure
# ========================================

Write-Host "Creating directory structure..." -ForegroundColor Cyan

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path "src\components\layout" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components\ui" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null

Write-Host "✓ Directories created" -ForegroundColor Green

# ========================================
# PART 2: Write CSS File
# ========================================

Write-Host "Writing index.css..." -ForegroundColor Cyan

$indexCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Root Styling - FIXED */
html {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  background-color: #0b1437;
  color: #ffffff;
}

#root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #0b1437;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

button {
  font-family: inherit;
  cursor: pointer;
}

html {
  scroll-behavior: smooth;
}
"@

$indexCss | Out-File -FilePath "src\index.css" -Encoding UTF8
Write-Host "✓ index.css written" -ForegroundColor Green

# ========================================
# PART 3: Write MainLayout Component
# ========================================

Write-Host "Writing MainLayout.tsx..." -ForegroundColor Cyan

$mainLayout = @"
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-dark">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-dark">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
"@

$mainLayout | Out-File -FilePath "src\components\layout\MainLayout.tsx" -Encoding UTF8
Write-Host "✓ MainLayout.tsx written" -ForegroundColor Green

# ========================================
# PART 4: Write Sidebar Component
# ========================================

Write-Host "Writing Sidebar.tsx..." -ForegroundColor Cyan

$sidebar = @"
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/boxes', icon: CubeIcon, label: 'Boxes' },
    { path: '/parts', icon: ChartBarIcon, label: 'Parts' },
    { path: '/marketplace', icon: ShoppingCartIcon, label: 'Marketplace' },
    { path: '/organizations', icon: BuildingOfficeIcon, label: 'Organizations' },
    { path: '/users', icon: UsersIcon, label: 'Users' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={``
          fixed lg:sticky top-0 left-0 z-50 lg:z-0
          w-64 h-screen
          bg-dark-100 border-r border-slate-800
          flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ``${isOpen ? 'translate-x-0' : '-translate-x-full'}``
        ``}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-brand-red">SMASH</span>
            <span className="text-white"> SCRAP</span>
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={``
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      font-medium transition-all
                      ``${
                        isActive
                          ? 'bg-brand-red text-white shadow-glow-red'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }``
                    ``}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            © 2025 SMASH SCRAP
          </p>
        </div>
      </aside>
    </>
  );
}
"@ -replace '``', '`'

$sidebar | Out-File -FilePath "src\components\layout\Sidebar.tsx" -Encoding UTF8
Write-Host "✓ Sidebar.tsx written" -ForegroundColor Green

# ========================================
# PART 5: Write TopBar Component
# ========================================

Write-Host "Writing TopBar.tsx..." -ForegroundColor Cyan

$topBar = @"
import React from 'react';
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'aws-amplify/auth';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 bg-dark-100 border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative"
          title="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-brand-red rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-800 hidden sm:block" />

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-red hover:bg-brand-redDark text-white font-medium rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
"@

$topBar | Out-File -FilePath "src\components\layout\TopBar.tsx" -Encoding UTF8
Write-Host "✓ TopBar.tsx written" -ForegroundColor Green

# ========================================
# PART 6: Write Card Component
# ========================================

Write-Host "Writing Card.tsx..." -ForegroundColor Cyan

$card = @"
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div
      className={``bg-dark-100 border border-slate-700 rounded-xl shadow-card ``${className}``}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
"@ -replace '``', '`'

$card | Out-File -FilePath "src\components\ui\Card.tsx" -Encoding UTF8
Write-Host "✓ Card.tsx written" -ForegroundColor Green

# ========================================
# PART 7: Write Button Component
# ========================================

Write-Host "Writing Button.tsx..." -ForegroundColor Cyan

$button = @"
import React from 'react';

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
  const baseClasses = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-brand-teal hover:bg-brand-tealDark text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    danger: 'bg-brand-red hover:bg-brand-redDark text-white',
    ghost: 'bg-transparent border border-slate-700 hover:bg-slate-800 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={``${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}``}
      {...props}
    >
      {children}
    </button>
  );
}
"@ -replace '``', '`'

$button | Out-File -FilePath "src\components\ui\Button.tsx" -Encoding UTF8
Write-Host "✓ Button.tsx written" -ForegroundColor Green

# ========================================
# PART 8: Write StatCard Component
# ========================================

Write-Host "Writing StatCard.tsx..." -ForegroundColor Cyan

$statCard = @"
import React from 'react';

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
      <div className="bg-dark-100 border border-slate-700 rounded-xl p-6 shadow-card animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-dark-100 border border-slate-700 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={``text-sm mt-2 ``${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }``}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-brand-teal/10 rounded-lg">
            <Icon className="h-6 w-6 text-brand-teal" />
          </div>
        )}
      </div>
    </div>
  );
}
"@ -replace '``', '`'

$statCard | Out-File -FilePath "src\components\ui\StatCard.tsx" -Encoding UTF8
Write-Host "✓ StatCard.tsx written" -ForegroundColor Green

# ========================================
# PART 9: Write Dashboard Page
# ========================================

Write-Host "Writing Dashboard.tsx..." -ForegroundColor Cyan

$dashboard = @"
import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  CubeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const client = generateClient<Schema>();

export function Dashboard() {
  const [stats, setStats] = useState({
    totalBoxes: 0,
    activeAuctions: 0,
    completedSales: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBoxes, setRecentBoxes] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: boxes } = await client.models.Box.list();
      const { data: sales } = await client.models.Sale.list();

      const activeSales = sales?.filter((s) => s.status === 'OPEN') || [];
      const completedSales = sales?.filter((s) => s.status === 'CLOSED') || [];
      const revenue = completedSales.reduce((sum, sale) => sum + (sale.currentBid || 0), 0);

      setStats({
        totalBoxes: boxes?.length || 0,
        activeAuctions: activeSales.length,
        completedSales: completedSales.length,
        totalRevenue: revenue,
      });

      setRecentBoxes(boxes?.slice(0, 5) || []);
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
          <p className="text-slate-400 mt-1">Welcome to SMASH SCRAP</p>
        </div>
        <Button variant="primary">Create Box</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Boxes"
          value={stats.totalBoxes}
          icon={CubeIcon}
          loading={loading}
        />
        <StatCard
          title="Active Auctions"
          value={stats.activeAuctions}
          icon={ShoppingCartIcon}
          loading={loading}
        />
        <StatCard
          title="Completed Sales"
          value={stats.completedSales}
          icon={CheckCircleIcon}
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={``$``${stats.totalRevenue.toLocaleString()}``}
          icon={CurrencyDollarIcon}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Boxes">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : recentBoxes.length > 0 ? (
            <div className="space-y-3">
              {recentBoxes.map((box) => (
                <div
                  key={box.boxID}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{box.boxNumber}</p>
                    <p className="text-slate-400 text-sm">{box.materialType || 'Unknown'}</p>
                  </div>
                  <span
                    className={``px-3 py-1 rounded-full text-xs font-medium ``${
                      box.status === 'finalized'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }``}
                  >
                    {box.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No boxes yet</p>
          )}
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Button variant="primary" className="w-full">
              Create New Box
            </Button>
            <Button variant="secondary" className="w-full">
              View Marketplace
            </Button>
            <Button variant="ghost" className="w-full">
              Manage Parts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
"@ -replace '``', '`'

$dashboard | Out-File -FilePath "src\pages\Dashboard.tsx" -Encoding UTF8
Write-Host "✓ Dashboard.tsx written" -ForegroundColor Green

# ========================================
# COMPLETE
# ========================================

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ All files created successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install dependencies: npm install @heroicons/react react-router-dom" -ForegroundColor White
Write-Host "2. Update your tailwind.config.js with SMASH colors" -ForegroundColor White
Write-Host "3. Update your App.tsx to use MainLayout" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host "`nDone! 🚀" -ForegroundColor Cyan
"@

$setupScript | Out-File -FilePath "setup-interface.ps1" -Encoding UTF8
Write-Host "✓ setup-interface.ps1 created" -ForegroundColor Green
