import { useEffect, useLayoutEffect, useState } from "react";

const MARGIN = 8;

/**
 * Anchored, viewport-clamped popover that opens upward.
 * Uses `position: fixed` so it escapes any `overflow-hidden` ancestor.
 * Handles outside-click dismissal and live re-positioning.
 */
export function useUpwardPopover({ open, anchorRef, panelId, width, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width });

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el || typeof window === "undefined") return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const w = Math.min(width, vw - MARGIN * 2);
      const left = Math.min(Math.max(r.left, MARGIN), vw - w - MARGIN);
      setPos({ top: r.top - MARGIN, left, width: w });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const inAnchor = anchorRef.current?.contains(e.target);
      const inPanel = document.getElementById(panelId)?.contains(e.target);
      if (!inAnchor && !inPanel) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, anchorRef, panelId, onClose]);

  return {
    id: panelId,
    style: {
      position: "fixed",
      top: pos.top,
      left: pos.left,
      width: pos.width,
      transform: "translateY(-100%)",
      maxHeight: "calc(100vh - 24px)",
    },
  };
}
