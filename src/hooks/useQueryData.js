"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getClients } from "@/api/client";
import { getUser } from "@/api/User/getUser";

// Client Settings hook
export function useClients(enabled = true) {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await getClients({ skip: 0, limit: 5, enabledOnly: true });
      return res?.response || [];
    },
    enabled,
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
