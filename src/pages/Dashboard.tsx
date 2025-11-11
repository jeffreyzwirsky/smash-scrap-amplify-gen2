import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

function StatsCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div className="text-slate-300 text-sm">{label}</div>
        {delta && <div className="text-xs text-[#21808d]">{delta}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2">
        <Button>New Box</Button>
        <Button variant="secondary">Upload Parts CSV</Button>
        <Button variant="secondary">Create Listing</Button>
      </div>
    </Card>
  );
}

function RecentActivity({ items }: { items: { id: string; title: string; meta: string }[] }) {
  return (
    <Card title="Recent Activity">
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate">{i.title}</p>
              <p className="text-xs text-slate-400">{i.meta}</p>
            </div>
            <span className="text-xs text-slate-400">→</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard label="Active Boxes" value="42" delta="+3 today" />
        <StatsCard label="Listed Parts" value="1,284" />
        <StatsCard label="Open Bids" value="97" />
        <StatsCard label="24h Volume" value="$83,210" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Replace with chart */}
          <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-6 h-72 flex items-center justify-center text-slate-400">
            Chart placeholder
          </div>
        </div>
        <QuickActions />
      </div>

      <RecentActivity
        items={[
          { id: "1", title: "Lot 75 boxed and ready to list", meta: "2m ago • by Jeff" },
          { id: "2", title: "3 new bids on Listing #493", meta: "12m ago • Marketplace" },
          { id: "3", title: "Pd hedge applied to Lot 74", meta: "1h ago • Finance" },
        ]}
      />
    </div>
  );
}
