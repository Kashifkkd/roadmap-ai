import { graphqlClient } from "@/lib/graphql-client";
import { serializeKickOffDatesForResponsePath } from "@/lib/kickoff-dates";

/**
 * Writes kick-off rows to localStorage sessionData and auto-saves to the backend
 * so all_kickoff_dates updates without requiring the full Settings Save flow.
 *
 * @param {Array<{ date: string, time: string }>} rows
 * @param {{ isCycle?: boolean }} [options] — cycle sessions use cycle_creation_data; comet uses comet_creation_data
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function persistKickOffDatesToSessionAndBackend(
  rows,
  { isCycle = true } = {},
) {
  if (typeof window === "undefined") {
    return { ok: false, error: "no_window" };
  }
  const raw = localStorage.getItem("sessionData");
  if (!raw) return { ok: false, error: "no_session" };

  let sessionData;
  try {
    sessionData = JSON.parse(raw);
  } catch {
    return { ok: false, error: "parse" };
  }

  const sessionId =
    sessionData.session_id || localStorage.getItem("sessionId") || null;
  if (!sessionId) return { ok: false, error: "no_session_id" };

  const creationKey = isCycle ? "cycle_creation_data" : "comet_creation_data";
  const creationData = sessionData[creationKey] || {};

  const updatedResponsePath = {
    ...(sessionData.response_path || {}),
    all_kickoff_dates: serializeKickOffDatesForResponsePath(rows),
  };

  const updatedSession = {
    ...sessionData,
    response_path: updatedResponsePath,
  };
  localStorage.setItem("sessionData", JSON.stringify(updatedSession));

  try {
    const cometJsonForSave = JSON.stringify({
      session_id: sessionId,
      input_type: "source_material_based_outliner",
      [creationKey]: creationData,
      response_outline: sessionData.response_outline || {},
      response_path: updatedResponsePath,
      chatbot_conversation: sessionData.chatbot_conversation || [],
      to_modify: sessionData.to_modify || {},
      webpage_url: sessionData.webpage_url || [],
    });
    const response = await graphqlClient.autoSaveComet(cometJsonForSave);
    if (!response?.autoSaveComet) {
      return { ok: false, error: "save_rejected" };
    }
    return { ok: true };
  } catch (e) {
    console.error("persistKickOffDatesToSessionAndBackend:", e);
    return { ok: false, error: "network" };
  }
}
