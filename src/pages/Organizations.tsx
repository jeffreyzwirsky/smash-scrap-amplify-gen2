import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Organizations() {
  const { groups } = useUserRole();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (groups.includes("SuperAdmin")) loadOrgs(); }, [groups]);

  async function loadOrgs() {
    try {
      const { data } = await client.models.Organization.list();
      setOrgs(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (!groups.includes("SuperAdmin")) {
    return <div className="p-6"><Card title="Access Denied"><div className="text-gray-400 text-center py-8">Only SuperAdmin can manage organizations</div></Card></div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Organizations</h1></div>
      <Card title={`Organizations (${orgs.length})`}>
        {loading ? <div className="text-gray-400">Loading...</div> : orgs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No organizations</div>
        ) : (
          <div className="space-y-2">
            {orgs.map((org) => (
              <div key={org.orgID} className="p-4 bg-[#1f2d5e] rounded-lg"><div className="text-white font-medium">{org.orgName}</div><div className="text-sm text-gray-400">{org.orgID}</div></div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
