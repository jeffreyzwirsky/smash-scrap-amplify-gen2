import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Card } from "../components/ui/Card";
import { useUserRole } from "../hooks/useUserRole";

const client = generateClient<Schema>();

export default function Users() {
  const { orgID, groups } = useUserRole();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Buyer" });

  const isSuperAdmin = groups.includes("SuperAdmin");
  const isOrgAdmin = groups.includes("SellerAdmin") || isSuperAdmin;

  useEffect(() => {
    if (!orgID) return;
    loadUsers();
  }, [orgID]);

  async function loadUsers() {
    try {
      const filter = isSuperAdmin ? {} : { orgID: { eq: orgID } };
      const { data } = await client.models.User.list({ filter });
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function inviteUser() {
    if (!inviteForm.email.includes("@")) {
      alert("Invalid email");
      return;
    }
    try {
      await client.models.User.create({
        userID: `pending-${Date.now()}`,
        email: inviteForm.email,
        orgID,
        role: inviteForm.role,
        status: "INVITED",
      });
      alert(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ email: "", role: "Buyer" });
      setShowInvite(false);
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function updateUserRole(userID: string, newRole: string) {
    try {
      await client.models.User.update({ userID, role: newRole });
      alert("Role updated!");
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function deleteUser(userID: string, email: string) {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      await client.models.User.delete({ userID });
      alert("User deleted");
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (!isOrgAdmin) {
    return (
      <div className="p-6">
        <Card title="Access Denied">
          <div className="text-gray-400 text-center py-8">
            Only SuperAdmin and SellerAdmin can manage users.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-400 mt-1">Manage team members and permissions</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium"
        >
          + Invite User
        </button>
      </div>

      <Card title={`Team Members (${users.length})`}>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No users yet. Invite your first team member!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1f2d5e]">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userID} className="border-b border-[#1f2d5e]">
                    <td className="py-3 text-white">{user.email}</td>
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.userID, e.target.value)}
                        className="px-3 py-1 bg-[#1f2d5e] border border-[#2a3f6e] rounded text-white text-sm"
                        disabled={!isSuperAdmin && user.role === "SuperAdmin"}
                      >
                        <option value="Buyer">Buyer</option>
                        <option value="YardOperator">Yard Operator</option>
                        <option value="SellerAdmin">Seller Admin</option>
                        {isSuperAdmin && <option value="SuperAdmin">Super Admin</option>}
                      </select>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => deleteUser(user.userID, user.email)}
                        className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded text-white text-sm"
                      >
                        Delete
                      </button>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#111c44] border border-[#1f2d5e] rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Invite User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="user@company.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 bg-[#0b1437] border border-[#1f2d5e] rounded-lg text-white"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  <option value="Buyer">Buyer</option>
                  <option value="YardOperator">Yard Operator</option>
                  <option value="SellerAdmin">Seller Admin</option>
                  {isSuperAdmin && <option value="SuperAdmin">Super Admin</option>}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={inviteUser}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg text-white flex-1"
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 bg-[#1f2d5e] hover:bg-[#2a3f6e] rounded-lg text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
