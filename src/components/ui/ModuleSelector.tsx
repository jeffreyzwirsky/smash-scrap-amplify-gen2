import React, { useState } from 'react';
import { Squares2X2Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function ModuleSelector() {
  const [isOpen, setIsOpen] = useState(false);

  const modules = [
    { id: 'inventory', name: 'Inventory', color: 'bg-blue-600', enabled: true },
    { id: 'marketplace', name: 'Marketplace', color: 'bg-green-600', enabled: true },
    { id: 'analytics', name: 'Analytics', color: 'bg-purple-600', enabled: false },
    { id: 'reports', name: 'Reports', color: 'bg-orange-600', enabled: false },
  ];

  return (
    <>
      {/* Module Selector Button - Bottom Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl shadow-lg transition-all hover:scale-105"
        title="Module Selector"
      >
        <Squares2X2Icon className="h-6 w-6" />
      </button>

      {/* Module Selector Popup */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup */}
          <div className="fixed bottom-24 right-6 z-50 w-80 bg-[#1a1a1a] border border-[#404040] rounded-xl shadow-2xl">
            <div className="p-4 border-b border-[#404040] flex items-center justify-between">
              <h3 className="text-white font-semibold">Module Selector</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#2a2a2a] rounded-lg text-gray-400"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full `} />
                    <span className="text-white text-sm font-medium">{module.name}</span>
                  </div>
                  {!module.enabled && (
                    <span className="text-xs text-gray-500">Coming Soon</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
