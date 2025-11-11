import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Boxes from "./pages/Boxes";
import BoxDetail from "./pages/BoxDetail";
import Parts from "./pages/Parts";
import Marketplace from "./pages/Marketplace";
import Organizations from "./pages/Organizations";
import Settings from "./pages/Settings";
import SaleDetail from "./pages/SaleDetail";

export default function AutoRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/boxes" element={<Boxes />} />
      <Route path="/boxes/:boxId" element={<BoxDetail />} />
      <Route path="/parts" element={<Parts />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/:saleId" element={<SaleDetail />} />
      <Route path="/organizations" element={<Organizations />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<div className="p-6 text-white">Page not found</div>} />
    </Routes>
  );
}
