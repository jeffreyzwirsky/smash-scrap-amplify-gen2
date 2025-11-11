import { useEffect, useState } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Diagnostics() {
  const [diag, setDiag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    try {
      const [session, attrs] = await Promise.all([
        fetchAuthSession(),
        fetchUserAttributes(),
      ]);

      const result = {
        timestamp: new Date().toISOString(),
        session: {
          accessToken: session.tokens?.accessToken ? "✅ Present" : "❌ Missing",
          idToken: session.tokens?.idToken ? "✅ Present" : "❌ Missing",
          groups: (session.tokens?.accessToken?.payload["cognito:groups"] as string[]) || [],
        },
        attributes: {
          sub: attrs.sub || "❌ Missing",
          email: attrs.email || "❌ Missing",
          email_verified: attrs.email_verified || "false",
          "custom:role": (attrs["custom:role"] as string) || "❌ Missing",
          "custom:orgID": (attrs["custom:orgID"] as string) || "❌ Missing",
        },
        permissions: {
          canCreateBoxes: false,
          canManageUsers: false,
          canViewOrgs: false,
        },
      };

      // Check permissions
      const groups = result.session.groups;
      result.permissions.canCreateBoxes =
        groups.includes("SuperAdmin") ||
        groups.includes("SellerAdmin") ||
        groups.includes("YardOperator");
      result.permissions.canManageUsers =
        groups.includes("SuperAdmin") || groups.includes("SellerAdmin");
      result.permissions.canViewOrgs = groups.includes("SuperAdmin");

      setDiag(result);
    } catch (e) {
      console.error("Diagnostic error:", e);
      setDiag({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
    alert("Diagnostics copied to clipboard!");
  }

  if (loading) return <div className="p-6 text-white">Running diagnostics...</div>;

  const hasOrgID = diag?.attributes?.["custom:orgID"] && diag.attributes["custom:orgID"] !== "❌ Missing";
  const hasGroups = diag?.session?.groups?.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#f1f5f9]">System Diagnostics</h1>
        <p className="text-[#cbd5e1] mt-1">Check user configuration and permissions</p>
      </div>

      {/* Status Overview */}
      <Card>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${hasOrgID ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`}>
            <div className="text-3xl mb-2">{hasOrgID ? "✅" : "❌"}</div>
            <div className="text-sm font-medium text-white">Organization ID</div>
            <div className="text-xs text-[#cbd5e1] mt-1">{hasOrgID ? "Configured" : "Missing"}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${hasGroups ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`}>
            <div className="text-3xl mb-2">{hasGroups ? "✅" : "❌"}</div>
            <div className="text-sm font-medium text-white">User Groups</div>
            <div className="text-xs text-[#cbd5e1] mt-1">{hasGroups ? `${diag.session.groups.length} group(s)` : "No groups"}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${diag?.permissions?.canCreateBoxes ? "bg-green-900/30 border border-green-700" : "bg-yellow-900/30 border border-yellow-700"}`}>
            <div className="text-3xl mb-2">{diag?.permissions?.canCreateBoxes ? "✅" : "⚠️"}</div>
            <div className="text-sm font-medium text-white">Can Create Boxes</div>
            <div className="text-xs text-[#cbd5e1] mt-1">{diag?.permissions?.canCreateBoxes ? "Yes" : "No permission"}</div>
          </div>
        </div>
      </Card>

      {/* Session Info */}
      <Card title="Authentication Session">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#94a3b8]">Access Token</div>
              <div className="text-[#f1f5f9] font-mono text-sm">{diag.session.accessToken}</div>
            </div>
            <div>
              <div className="text-sm text-[#94a3b8]">ID Token</div>
              <div className="text-[#f1f5f9] font-mono text-sm">{diag.session.idToken}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-[#94a3b8] mb-2">Cognito Groups</div>
            <div className="flex gap-2 flex-wrap">
              {diag.session.groups.length === 0 ? (
                <span className="badge badge-danger">No groups assigned</span>
              ) : (
                diag.session.groups.map((g: string) => (
                  <span key={g} className="badge badge-success">{g}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* User Attributes */}
      <Card title="User Attributes">
        <div className="space-y-2">
          {Object.entries(diag.attributes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-[#475569]">
              <div className="text-[#cbd5e1] font-mono text-sm">{key}</div>
              <div className={`font-mono text-sm ${String(value).includes("❌") ? "text-red-400" : "text-[#f1f5f9]"}`}>
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Permissions */}
      <Card title="Computed Permissions">
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(diag.permissions).map(([key, value]) => (
            <div key={key} className="p-3 bg-[#334155] rounded-lg">
              <div className="text-2xl mb-1">{value ? "✅" : "❌"}</div>
              <div className="text-sm text-[#cbd5e1]">{key.replace(/([A-Z])/g, " $1").trim()}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card title="Actions">
        <div className="space-y-3">
          <Button onClick={copyToClipboard} className="w-full">
            📋 Copy Full Report to Clipboard
          </Button>
          {!hasOrgID && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <div className="font-semibold text-red-400 mb-2">⚠️ Organization ID Missing</div>
              <div className="text-sm text-[#cbd5e1] mb-3">
                Your user account doesn't have an organization ID set. This is required to create boxes.
              </div>
              <div className="text-sm text-[#cbd5e1]">
                <strong>Fix:</strong> Contact your SuperAdmin to assign you to an organization via the Users page.
              </div>
            </div>
          )}
          {!hasGroups && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="font-semibold text-yellow-400 mb-2">⚠️ No User Groups</div>
              <div className="text-sm text-[#cbd5e1] mb-3">
                Your user account is not assigned to any Cognito groups.
              </div>
              <div className="text-sm text-[#cbd5e1]">
                <strong>Fix:</strong> Contact your SuperAdmin to assign you a role (YardOperator, SellerAdmin, etc.)
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
