import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; title: string; desc?: string };
type Ctx = { push: (t: Omit<Toast,"id">) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast,"id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems(s => [...s, { id, ...t }]);
    setTimeout(() => setItems(s => s.filter(x => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[9999]">
        {items.map(t => (
          <div key={t.id} className="bg-[#111c44] border border-[#1f2d5e] rounded-xl px-4 py-3 shadow-xl max-w-sm">
            <div className="text-sm font-semibold text-white">{t.title}</div>
            {t.desc && <div className="text-xs text-gray-300 mt-1">{t.desc}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
