"use client";

import { useCallback, useEffect, useRef } from "react";

function storageKey(sessionId, keyPrefix) {
  return sessionId ? `${keyPrefix}:${sessionId}` : null;
}

export function applyTombstonesToOutline(outline, tombstones) {
  if (!outline || !tombstones || tombstones.size === 0) return outline;
  const cloned = JSON.parse(JSON.stringify(outline));
  cloned.chapters = (cloned.chapters || []).filter((chapter) => {
    const chapterId = chapter?.uuid || chapter?.uid || chapter?.id;
    if (chapterId && tombstones.has(String(chapterId))) return false;
    chapter.steps = (chapter.steps || []).filter((stepItem) => {
      const stepObj = stepItem?.step || {};
      const stepId = stepObj.uuid || stepObj.uid || stepObj.id;
      if (stepId && tombstones.has(String(stepId))) return false;
      stepItem.screens = (stepItem.screens || []).filter((screen) => {
        const screenId = screen?.uuid || screen?.uid || screen?.id;
        return !(screenId && tombstones.has(String(screenId)));
      });
      return true;
    });
    return true;
  });
  return cloned;
}

export function useDeletionTombstones(
  sessionId,
  options = { persist: true, keyPrefix: "kyper:deletedUuids" },
) {
  const { persist = true, keyPrefix = "kyper:deletedUuids" } = options;
  const deletedUuidsRef = useRef(new Set());
  const sessionIdRef = useRef(null);

  const persistTombstones = useCallback(
    (sid) => {
      if (!persist || typeof window === "undefined") return;
      const key = storageKey(sid, keyPrefix);
      if (!key) return;
      try {
        const arr = Array.from(deletedUuidsRef.current);
        if (arr.length === 0) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(arr));
        }
      } catch {
        // localStorage failures should never block saves
      }
    },
    [persist, keyPrefix],
  );

  const addPendingDeletion = useCallback(
    (uuid) => {
      if (uuid === undefined || uuid === null) return;
      const normalized = String(uuid).trim();
      if (!normalized) return;
      deletedUuidsRef.current.add(normalized);
      persistTombstones(sessionIdRef.current || sessionId);
    },
    [persistTombstones, sessionId],
  );

  const getDeletedUuids = useCallback(
    () => Array.from(deletedUuidsRef.current),
    [],
  );

  useEffect(() => {
    if (sessionId === sessionIdRef.current) return;
    sessionIdRef.current = sessionId || null;
    deletedUuidsRef.current = new Set();

    if (!persist || typeof window === "undefined" || !sessionId) return;

    try {
      const raw = localStorage.getItem(storageKey(sessionId, keyPrefix));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const uid of parsed) {
          if (typeof uid === "string" && uid) {
            deletedUuidsRef.current.add(uid);
          }
        }
      }
    } catch {
      // corrupted tombstones can be safely ignored
    }
  }, [sessionId, persist, keyPrefix]);

  return {
    deletedUuidsRef,
    addPendingDeletion,
    getDeletedUuids,
  };
}
