import { Authenticator } from "@aws-amplify/ui-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

import { MainLayout } from "./components/layout/MainLayout";
import { ToastProvider } from "./components/ui/Toast";
import { modules, userCanAccess } from "./config/modules";
import { useUserRole } from "./hooks/useUserRole";

// Pages (import directly to keep bundler simple)
import Dashboard from "./pages/Dashboard";
import Boxes from "./pages/Boxes";
import BoxDetail from "./pages/BoxDetail";
import Parts from "./pages/Parts";
import Marketplace from "./pages/Marketplace";
import SaleDetail from "./pages/SaleDetail";
import Organizations from "./pages/Organizations";
import Settings from "./pages/Settings";

const componentMap: Record<string, React.ComponentType<any>> = {
  dashboard: Dashboard,
  boxes: Boxes,
  "box-detail": BoxDetail,
  parts: Parts,
  marketplace: Marketplace,
  "sale-detail": SaleDetail,
  organizations: Organizations,
  settings: Settings,
};

function AutoRoutes() {
  const { groups } = useUserRole() as any;
  const allowed = modules.filter(m => userCanAccess(groups || [], m.roles));
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {allowed.map(m => {
        const C = componentMap[m.id] ?? (() => <div className="p-6 text-white">Not implemented</div>);
        return <Route key={m.path} path={m.path} element={<C />} />;
      })}
      <Route path="*" element={<div className="p-6 text-white">Not found</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <ToastProvider>
            <MainLayout user={user} signOut={signOut}>
              <AutoRoutes />
            </MainLayout>
          </ToastProvider>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
