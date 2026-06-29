"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getClients, updateClientDetails, getRecentClients, getClientDetails ,updateClientCohortDetails } from "@/api/client";
import { getUser } from "@/api/User/getUser";

/** Throw on auth/network failures so ClientAccessGuard won't treat them as "client disabled". */
function assertGuardApiSuccess(res, { allowNotFound = false } = {}) {
  if (res?.unauthorized || res?.status === 401) {
    throw new Error("Unauthorized");
  }
  if (res?.error) {
    throw new Error(res.message || "Network error");
  }
  if (!res?.success) {
    if (allowNotFound && res?.status === 404) return;
    const detail =
      typeof res?.response?.detail === "string"
        ? res.response.detail
        : "Request failed";
    throw new Error(detail);
  }
}

function parseRecentClientsPayload(res) {
  const payload = res?.response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.clients)) return payload.clients;
  return [];
}

// Client Settings hook
export function useClients(
  enabled = true,
  { skip = 0, limit = 5, enabledOnly = true, search = "" } = {}
) {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await getClients({ skip, limit, enabledOnly, search });
      return res?.response || [];
    },
    enabled,
  });
}

export function useUpsertClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["upsertClient"],
    mutationFn: async (clientData) => {
      let res;
      if(clientData.id){
        res = await updateClientDetails(clientData);
      }else{
        res = await updateClientCohortDetails(clientData)
      }
      if (res?.error) {
        throw new Error(errorMessage);
      }

      if (res?.response?.detail && res?.status > 400) {
        throw new Error(res.response.detail || "Unable to save client");
      }
      return res?.response || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

// Recent Clients hook
export function useRecentClients(enabled = true) {
  return useQuery({
    queryKey: ["recentClients"],
    queryFn: async () => {
      const res = await getRecentClients();
      assertGuardApiSuccess(res);
      return parseRecentClientsPayload(res);
    },
    enabled,
  });
}

// Client Details hook
export function useClientDetails(clientId, enabled = true) {
  return useQuery({
    queryKey: ["clientDetails", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const res = await getClientDetails(clientId);
      assertGuardApiSuccess(res, { allowNotFound: true });
      return res?.response || null;
    },
    enabled: enabled && !!clientId,
  });
}

// My Account hook
export function useUser(enabled = true) {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await getUser();
      return res?.response || null;
    },
    enabled,
  });
}

// Invalidate Data hooks
export function useRefreshData() {
  const queryClient = useQueryClient();

  return {
    refreshClients: () =>
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
    refreshUser: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  };
}
