import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Boxes from "./pages/Boxes";
import BoxDetail from "./pages/BoxDetail";
import Marketplace from "./pages/Marketplace";
import Organizations from "./pages/Organizations";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import OperatorApp from "./pages/OperatorApp";
import Diagnostics from "./pages/Diagnostics";

export default function AutoRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/boxes" element={<Boxes />} />
      <Route path="/boxes/:boxId" element={<BoxDetail />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/organizations" element={<Organizations />} />
      <Route path="/users" element={<Users />} />
      <Route path="/operator" element={<OperatorApp />} />
      <Route path="/diagnostics" element={<Diagnostics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<div className="p-6 text-white">Page not found</div>} />
    </Routes>
  );
}
