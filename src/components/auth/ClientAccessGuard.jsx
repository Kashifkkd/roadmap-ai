"use client";

/**
 * ClientAccessGuard
 *
 * Blocks the rendering of any authenticated page when:
 *   - the Admin's currently selected client has been hidden in 1st90
 *     (`is_kyper_enabled === false`, or the backend returns 404 because
 *     it filters hidden clients out of /client_details), OR
 *   - the Admin has zero clients with `is_kyper_enabled === true`.
 *
 * On block we render a full-screen alert overlay and prevent the wrapped
 * children from executing — this is what stops direct-URL hits to
 * /cycle-manager, /configure-cycle, etc. for clients that 1st90 just
 * disabled.
 *
 * We intentionally do NOT redirect: per UX requirement we keep the user
 * on their current URL so they can pick another client from the header
 * dropdown (still rendered above the overlay) without losing their place.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecentClients, useClientDetails } from "@/hooks/useQueryData";
import { tokenManager } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";

const DISABLED_ALERT_MESSAGE =
  "This client has been disabled in 1st90 and is no longer accessible in Kyper.";

// Centralised so the guard, the dropdown, and the header agree on what
// "visible in Kyper" means. A client is visible only when:
//   - it has a real `id` (i.e. came back from the server, not a 404 body),
//   - 1st90 has not flipped `is_kyper_enabled` to `false`, AND
//   - the global `enabled` flag is not `false`.
// We treat `undefined` for either flag as visible because older API payloads
// may omit the field; only an explicit `false` blocks access.
const isClientVisibleInKyper = (client) =>
  client &&
  client.id &&
  client.is_kyper_enabled !== false &&
  client.enabled !== false;

const readStoredClientId = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("Client id");
  } catch {
    return null;
  }
};

const clearSelectedClient = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("Client id");
    localStorage.removeItem("ClientName");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionData");
    window.dispatchEvent(new Event("sessionIdChanged"));
  } catch {
    // best-effort cleanup; swallow storage errors
  }
};

export function ClientAccessGuard({ children }) {
  const router = useRouter();
  // Initialise from the token manager via a lazy initializer so the first
  // render sees the correct value without a setState-in-effect cascade.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return tokenManager.isAuthenticated();
    } catch {
      return false;
    }
  });

  // Same auth-watch pattern used in Header.jsx so the guard stays in sync
  // with login / logout / 401 events.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setIsAuthenticated(tokenManager.isAuthenticated());
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  // Re-read the selected client id whenever localStorage changes (other tabs,
  // dropdown selections, etc.) so the guard re-validates immediately.
  const [storedClientId, setStoredClientId] = useState(() =>
    readStoredClientId(),
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setStoredClientId(readStoredClientId());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const {
    data: recentClients = [],
    isLoading: recentLoading,
    isFetched: recentFetched,
  } = useRecentClients(isAuthenticated);

  const {
    data: selectedClientDetails,
    isLoading: detailsLoading,
    isFetched: detailsFetched,
  } = useClientDetails(storedClientId, isAuthenticated && !!storedClientId);

  const visibleRecentClients = useMemo(
    () => (recentClients || []).filter(isClientVisibleInKyper),
    [recentClients],
  );

  const hasNoVisibleClients =
    isAuthenticated && recentFetched && visibleRecentClients.length === 0;

  // The backend now returns 404 for hidden clients; useClientDetails maps a
  // 404 response into the `{ detail: "..." }` payload. So a real client comes
  // back with an `id`; a hidden / missing client does not. We also belt-and-
  // suspenders against `is_kyper_enabled === false`.
  const selectedIsHidden =
    isAuthenticated &&
    !!storedClientId &&
    detailsFetched &&
    !detailsLoading &&
    !isClientVisibleInKyper(selectedClientDetails);

  // The first render before queries resolve shouldn't flash the alert.
  const stillResolving =
    isAuthenticated &&
    (recentLoading ||
      (storedClientId && detailsLoading && !detailsFetched));

  const blocked = !stillResolving && (hasNoVisibleClients || selectedIsHidden);

  // When a previously-selected client just became hidden, drop it from
  // localStorage so a refresh starts clean.
  useEffect(() => {
    if (selectedIsHidden) {
      clearSelectedClient();
    }
  }, [selectedIsHidden]);

  const handleLogout = () => {
    try {
      tokenManager.removeToken();
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.dispatchEvent(new Event("auth-changed"));
      }
    } catch {
      // ignore
    }
    router.push("/");
  };

  if (!blocked) {
    return <>{children}</>;
  }

  // Full-screen blocking overlay. Rendered *instead of* the children so any
  // page logic that would otherwise fire on /cycle-manager, /configure-cycle,
  // etc. never runs for a hidden client.
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="client-access-guard-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2
          id="client-access-guard-title"
          className="text-lg font-semibold text-gray-900"
        >
          Client unavailable
        </h2>
        <p className="mt-3 text-sm text-gray-700">{DISABLED_ALERT_MESSAGE}</p>
        {hasNoVisibleClients ? (
          <p className="mt-2 text-sm text-gray-500">
            You don&apos;t have any clients enabled in Kyper right now. Ask your
            1st90 admin to enable a client for you.
          </p>
        ) : visibleRecentClients.length > 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            Use the client dropdown in the header to switch to another client.
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="px-4 py-2"
          >
            Log out
          </Button>
          {visibleRecentClients.length > 0 && (
            <Button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2"
            >
              Go to home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientAccessGuard;
