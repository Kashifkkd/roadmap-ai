import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export async function getClients({
  skip = 0,
  limit = 10,
  enabledOnly = true,
  search = "",
} = {}) {
  const res = await apiService({
    endpoint: `${endpoints.getClients}`,
    method: "GET",
    params: {
      skip,
      limit,
      enabled_only: enabledOnly,
      search,
    },
  });
  return res;
}

export async function getClientDetails(clientId) {
  const res = await apiService({
    endpoint: endpoints.getClientDetails(clientId),
    method: "GET",
  });
  return res;
}

export async function getRecentClients() {
  const res = await apiService({
    endpoint: endpoints.getRecentClients,
    method: "GET",
  });
  return res;
}

export async function updateClientDetails(clientData) {
  const res = await apiService({
    endpoint: endpoints.updateClient,
    method: "POST",
    data: clientData,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function updateClientCohortDetails(clientData) {
  const res = await apiService({
    endpoint: endpoints.updateWithCohort,
    method: "POST",
    data: clientData,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
}

export async function deleteClient(clientId) {
  const res = await apiService({
    endpoint: endpoints.deleteClient(clientId),
    method: "DELETE",
  });
  return res;
}