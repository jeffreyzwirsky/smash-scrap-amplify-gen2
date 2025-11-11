import { useEffect, useState } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export function useUserRole() {
  const [state, setState] = useState({
    email: "",
    userId: "",
    groups: [] as string[],
    role: "",
    orgID: "",
    orgName: "",
    loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [session, attrs] = await Promise.all([fetchAuthSession(), fetchUserAttributes()]);
        const userId = attrs.sub || "";
        const orgID = (attrs["custom:orgID"] as string) || "default-org";

        // Fetch organization name
        let orgName = "Default Organization";
        try {
          const { data: org } = await client.models.Organization.get({ orgID });
          if (org) orgName = org.orgName;
        } catch (e) {
          console.warn("Could not fetch organization name");
        }

        setState({
          email: attrs.email || "",
          userId,
          groups: (session.tokens?.accessToken?.payload["cognito:groups"] as string[]) || [],
          role: (attrs["custom:role"] as string) || "Buyer",
          orgID,
          orgName,
          loading: false,
        });
      } catch (e) {
        console.error(e);
        setState((p) => ({ ...p, loading: false }));
      }
    })();
  }, []);

  return state;
}
