import { Authenticator } from "@aws-amplify/ui-react";
import { BrowserRouter } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import { MainLayout } from "./components/layout/MainLayout";
import AutoRoutes from "./auto-routes";

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <MainLayout user={user} signOut={signOut}>
            <AutoRoutes />
          </MainLayout>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
