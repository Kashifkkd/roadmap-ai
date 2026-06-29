import { graphqlClient } from "@/lib/graphql-client";

const DEFAULT_TITLE = "Untitled Cycle";

export function getCycleDisplayTitle(sessionData) {
  if (!sessionData || typeof sessionData !== "object") return "";
  const basic = sessionData.cycle_creation_data?.["Basic Information"];
  return (
    basic?.["Cycle Title"]?.trim() ||
    basic?.["Comet Title"]?.trim() ||
    (typeof sessionData.cometTitle === "string"
      ? sessionData.cometTitle.trim()
      : "") ||
    ""
  );
}

export function readSessionDataFromStorage() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("sessionData") || "{}");
  } catch {
    return {};
  }
}

/** Persist sessionData and notify Header / EditableCycleTitle / document title. */
export function writeSessionDataToStorage(sessionData) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sessionData", JSON.stringify(sessionData));
  window.dispatchEvent(new Event("sessionDataChanged"));
}

export function applyCycleTitleLocally(sessionData, newTitle) {
  const trimmed = (newTitle ?? "").trim() || DEFAULT_TITLE;
  const updated = {
    ...sessionData,
    cycle_creation_data: {
      ...(sessionData.cycle_creation_data || {}),
      "Basic Information": {
        ...(sessionData.cycle_creation_data?.["Basic Information"] || {}),
        "Cycle Title": trimmed,
      },
    },
  };

  if (typeof window !== "undefined") {
    writeSessionDataToStorage(updated);
  }

  return { updatedSessionData: updated, title: trimmed };
}

export async function persistCycleTitle(newTitle) {
  const sessionData = readSessionDataFromStorage();
  const sessionId =
    sessionData?.session_id ||
    (typeof window !== "undefined" && localStorage.getItem("sessionId"));

  if (!sessionId) {
    throw new Error("No cycle session found");
  }

  const { updatedSessionData, title } = applyCycleTitleLocally(
    sessionData,
    newTitle
  );

  const cometJsonForSave = JSON.stringify({
    session_id: sessionId,
    input_type: sessionData.input_type || "source_material_based_outliner",
    cycle_creation_data: updatedSessionData.cycle_creation_data,
    response_outline: sessionData.response_outline || [],
    response_path: sessionData.response_path || {},
    chatbot_conversation: sessionData.chatbot_conversation || [],
    to_modify: sessionData.to_modify || {},
    webpage_url: sessionData.webpage_url || [],
  });

  await graphqlClient.autoSaveComet(cometJsonForSave);
  return title;
}
