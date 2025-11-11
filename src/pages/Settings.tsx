import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";

type SettingsState = {
  brandName: string;
  primaryColor: string;
  currency: "USD" | "CAD";
  exchangeSource: "manual" | "bank" | "spot";
  storageBucket: string;
  storagePattern: string;
  featureFlags: { liveBids: boolean; antiSniping: boolean; thumbnails: boolean };
};
const KEY = "smash_settings";

const DEFAULTS: SettingsState = {
  brandName: "SMASH SCRAP",
  primaryColor: "#dc2626",
  currency: "USD",
  exchangeSource: "spot",
  storageBucket: "smash-scrap-images-production",
  storagePattern: "{orgID}/boxes/{boxID}/*",
  featureFlags: { liveBids: true, antiSniping: true, thumbnails: false },
};

export default function Settings() {
  const { push } = useToast();
  const [state, setState] = useState<SettingsState>(DEFAULTS);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { setState({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {}
    }
  }, []);

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    push({ title: "Settings saved", desc: "Your configuration was stored locally (MVP)." });
  }
  function reset() {
    setState(DEFAULTS);
    push({ title: "Settings reset" });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Branding">
          <div className="space-y-3">
            <label className="block text-sm text-gray-300">Brand name</label>
            <input className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
              value={state.brandName} onChange={e=>setState(s=>({ ...s, brandName: e.target.value }))} />
            <label className="block text-sm text-gray-300 mt-4">Primary color (hex)</label>
            <input className="w-44 px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
              value={state.primaryColor} onChange={e=>setState(s=>({ ...s, primaryColor: e.target.value }))} />
          </div>
        </Card>

        <Card title="Currency & Exchange">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-300 mb-1">Currency</div>
              <select className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
                value={state.currency} onChange={e=>setState(s=>({ ...s, currency: e.target.value as any }))}>
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-300 mb-1">Exchange Source</div>
              <select className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
                value={state.exchangeSource} onChange={e=>setState(s=>({ ...s, exchangeSource: e.target.value as any }))}>
                <option value="manual">Manual</option>
                <option value="bank">Bank</option>
                <option value="spot">Spot</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="Storage">
          <div className="space-y-3">
            <label className="block text-sm text-gray-300">Bucket</label>
            <input className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
              value={state.storageBucket} onChange={e=>setState(s=>({ ...s, storageBucket: e.target.value }))} />
            <label className="block text-sm text-gray-300 mt-3">Path Pattern</label>
            <input className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
              value={state.storagePattern} onChange={e=>setState(s=>({ ...s, storagePattern: e.target.value }))} />
          </div>
        </Card>

        <Card title="Feature Flags">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(["liveBids","antiSniping","thumbnails"] as const).map(k => (
              <label key={k} className="flex items-center gap-2 text-sm text-gray-200">
                <input type="checkbox" checked={state.featureFlags[k]} onChange={e=>setState(s=>({ ...s, featureFlags: { ...s.featureFlags, [k]: e.target.checked } }))} />
                <span className="capitalize">{k}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <button onClick={save} className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg text-white text-sm">Save</button>
        <button onClick={reset} className="px-4 py-2 bg-[#1f2d5e] hover:bg-[#2a3f6e] rounded-lg text-white text-sm">Reset</button>
      </div>
    </div>
  );
}
