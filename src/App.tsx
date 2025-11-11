import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { BrowserRouter } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

import { MainLayout } from "./components/layout/MainLayout";
import { ToastProvider } from "./components/ui/Toast";
import { applyBranding } from "./utils/branding";
import AutoRoutes from "./auto-routes";

function BrandBoot() {
  React.useEffect(() => { try { applyBranding(); } catch {} }, []);
  return null;
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <ToastProvider>
            <BrandBoot />
            <MainLayout user={user} signOut={signOut}>
              <AutoRoutes />
            </MainLayout>
          </ToastProvider>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
