export type Role = "SuperAdmin" | "SellerAdmin" | "YardOperator" | "Buyer" | "Inspector" | "*";

export type ModuleConfig = {
  id: string;
  path: string;
  label: string;
  roles: Role[];
  inNav?: boolean;
  section?: "Core Operations" | "Business Management";
};

export const modules: ModuleConfig[] = [
  { id: "dashboard",   path: "/dashboard",            label: "Dashboard",            roles: ["*"], inNav: true, section: "Core Operations" },
  { id: "boxes",       path: "/boxes",                label: "Inventory Management", roles: ["SuperAdmin","SellerAdmin","YardOperator"], inNav: true, section: "Core Operations" },
  { id: "box-detail",  path: "/boxes/:boxId",         label: "Box Detail",           roles: ["SuperAdmin","SellerAdmin","YardOperator"], inNav: false },
  { id: "parts",       path: "/parts",                label: "Converter Builder",    roles: ["SuperAdmin","SellerAdmin","YardOperator"], inNav: true, section: "Core Operations" },
  { id: "marketplace", path: "/marketplace",          label: "Auctions",             roles: ["*"], inNav: true, section: "Core Operations" },
  { id: "sale-detail", path: "/marketplace/:saleId",  label: "Sale Detail",          roles: ["*"], inNav: false },
  { id: "organizations", path: "/organizations",      label: "Organizations",        roles: ["SuperAdmin","SellerAdmin"], inNav: true, section: "Business Management" },
  { id: "settings",    path: "/settings",             label: "Settings",             roles: ["*"], inNav: true, section: "Business Management" },
];

export function userCanAccess(groups: string[], allowed: Role[]) {
  if (allowed.includes("*")) return true;
  const set = new Set((groups || []).map(g => g.trim()));
  return allowed.some(r => set.has(r));
}
