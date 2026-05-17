import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { graphqlClient } from "@/lib/graphql-client";

export const ALLOWED_EXTS = [
  "pdf", "doc", "docx", "txt", "pptx", "mp3", "wav", "m4a", "flac", "mp4", "webm",
];
export const ACCEPT = ALLOWED_EXTS.map((e) => `.${e}`).join(",");
export const FORMATS_TEXT = ALLOWED_EXTS.map((e) => `.${e}`).join(", ");

export const isValidUrl = (s) => {
  try { new URL(s); return true; } catch { return false; }
};

const hostOf = (u) => {
  try { return new URL(u).hostname; } catch { return u; }
};

/** Returns an existing sessionId or lazily creates one. */
export async function ensureSessionId() {
  const stored = localStorage.getItem("sessionId");
  if (stored) return stored;
  const id = (await graphqlClient.createSession())?.createSession?.sessionId;
  if (!id) throw new Error("Failed to create a chat session for upload.");
  localStorage.setItem("sessionId", id);
  window.dispatchEvent(new Event("sessionIdChanged"));
  return id;
}

/** Upload one file. Returns the normalized attachment shape. */
export async function uploadFile({ file, sessionId, comment = "" }) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("session_id", sessionId);
  if (comment) fd.append("comment", comment);

  const res = await apiService({
    endpoint: endpoints.uploadSourceMaterial,
    method: "POST",
    data: fd,
  });
  if (!res?.success) throw new Error(res?.message || "Upload failed");

  const r = res.response ?? {};
  return {
    id: r.id ?? r.material_id ?? null,
    s3_path: r.s3_path ?? "",
    source_name: r.source_name ?? file.name,
    comment,
  };
}

/** Upload one web link. Returns the normalized link shape. */
export async function uploadLink({ url, sessionId, comment = "" }) {
  const fd = new FormData();
  fd.append("url", url);
  fd.append("session_id", sessionId);
  if (comment) fd.append("comment", comment);

  const res = await apiService({
    endpoint: endpoints.uploadSourceMaterialWebLink,
    method: "POST",
    data: fd,
  });
  if (res?.error || res?.success === false) {
    throw new Error(res?.message || "Failed to upload link.");
  }

  const raw = res?.response;
  const payload = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
  const title =
    payload.title || payload.page_title || payload.source_name || hostOf(url);

  return { ...payload, webpage_url: url, title, source_name: title, comment };
}

/**
 * Split a FileList into supported, unsupported, and duplicates given the
 * names that are already attached or staged.
 */
export function classifyFiles(fileList, takenNames) {
  const taken = takenNames instanceof Set ? takenNames : new Set(takenNames);
  const supported = [];
  const unsupported = [];
  const duplicates = [];
  for (const f of Array.from(fileList || [])) {
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTS.includes(ext)) unsupported.push(f);
    else if (taken.has(f.name)) duplicates.push(f);
    else supported.push(f);
  }
  return { supported, unsupported, duplicates };
}
