import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Users() {
  const { orgID, groups } = useUserRole();
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Buyer", orgID: "" });

  const isSuperAdmin = groups.includes("SuperAdmin");
  const isOrgAdmin = groups.includes("SellerAdmin") || isSuperAdmin;

  useEffect(() => {
    if (isOrgAdmin) {
      loadUsers();
      if (isSuperAdmin) loadOrgs();
    }
  }, [isOrgAdmin, isSuperAdmin]);

  async function loadUsers() {
    try {
      const filter = isSuperAdmin ? {} : { orgID: { eq: orgID } };
      const { data } = await client.models.User.list({ filter });
      console.log("Users loaded:", data);
      setUsers(data || []);
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrgs() {
    try {
      const { data } = await client.models.Organization.list();
      console.log("Organizations loaded:", data);
      setOrgs(data || []);
    } catch (e) {
      console.error("Error loading orgs:", e);
    }
  }

  async function inviteUser() {
    if (!inviteForm.email.includes("@")) {
      alert("Invalid email");
      return;
    }
    
    const targetOrgID = isSuperAdmin ? inviteForm.orgID : orgID;
    if (!targetOrgID) {
      alert("Organization required");
      return;
    }

    try {
      await client.models.User.create({
        userID: `pending-${Date.now()}`,
        email: inviteForm.email,
        orgID: targetOrgID,
        role: inviteForm.role,
        status: "INVITED",
      });
      alert(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ email: "", role: "Buyer", orgID: "" });
      setShowInvite(false);
      loadUsers();
    } catch (e: any) {
      console.error("Error inviting user:", e);
      alert(`Error: ${e.message}`);
    }
  }

  async function updateUser(userID: string, field: string, value: string) {
    try {
      await client.models.User.update({ userID, [field]: value });
      alert(`User ${field} updated!`);
      loadUsers();
    } catch (e: any) {
      console.error("Error updating user:", e);
      alert(`Error: ${e.message}`);
    }
  }

  async function deleteUser(userID: string, email: string) {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      await client.models.User.delete({ userID });
      alert("User deleted");
      loadUsers();
    } catch (e: any) {
      console.error("Error deleting user:", e);
      alert(`Error: ${e.message}`);
    }
  }

  if (!isOrgAdmin) {
    return (
      <div className="p-6">
        <Card title="Access Denied">
          <div className="text-[#94a3b8] text-center py-12">Only SuperAdmin and SellerAdmin can manage users.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">User Management</h1>
          <p className="text-[#cbd5e1] mt-1">Manage team members and permissions</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Invite User
        </Button>
      </div>

      <Card title={`Team Members (${users.length})`}>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#334155] rounded-lg skeleton"></div>)}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#94a3b8] mb-4">No users yet</p>
            <Button onClick={() => setShowInvite(true)}>Invite your first team member</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#475569]">
                <tr className="text-left text-[#94a3b8] text-sm">
                  <th className="pb-3 font-semibold">Email</th>
                  {isSuperAdmin && <th className="pb-3 font-semibold">Organization</th>}
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userID} className="border-b border-[#475569]">
                    <td className="py-3 text-[#f1f5f9]">{user.email}</td>
                    {isSuperAdmin && (
                      <td className="py-3">
                        <select
                          value={user.orgID}
                          onChange={(e) => updateUser(user.userID, "orgID", e.target.value)}
                          className="px-3 py-1.5 bg-[#334155] border border-[#475569] rounded text-[#f1f5f9] text-sm"
                        >
                          <option value="">Select org...</option>
                          {orgs.map((org) => (
                            <option key={org.orgID} value={org.orgID}>{org.orgName}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(user.userID, "role", e.target.value)}
                        className="px-3 py-1.5 bg-[#334155] border border-[#475569] rounded text-[#f1f5f9] text-sm"
                        disabled={!isSuperAdmin && user.role === "SuperAdmin"}
                      >
                        <option value="Buyer">Buyer</option>
                        <option value="YardOperator">Yard Operator</option>
                        <option value="SellerAdmin">Seller Admin</option>
                        {isSuperAdmin && <option value="SuperAdmin">Super Admin</option>}
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${user.status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Button size="sm" variant="danger" onClick={() => deleteUser(user.userID, user.email)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#475569] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#f1f5f9] mb-6">Invite User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Email <span className="text-[#ef4444]">*</span></label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="user@company.com"
                />
              </div>
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Organization <span className="text-[#ef4444]">*</span></label>
                  <select
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                    value={inviteForm.orgID}
                    onChange={(e) => setInviteForm({ ...inviteForm, orgID: e.target.value })}
                  >
                    <option value="">Select organization...</option>
                    {orgs.map((org) => (
                      <option key={org.orgID} value={org.orgID}>{org.orgName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Role</label>
                <select
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#475569] rounded-lg text-[#f1f5f9]"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  <option value="Buyer">Buyer</option>
                  <option value="YardOperator">Yard Operator</option>
                  <option value="SellerAdmin">Seller Admin</option>
                  {isSuperAdmin && <option value="SuperAdmin">Super Admin</option>}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={inviteUser} className="flex-1">Send Invitation</Button>
                <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
