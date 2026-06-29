"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  filterDynamicTags,
  matchDynamicTagAtCursor,
} from "@/lib/pathEmailDynamicTags";

export function useQuillDynamicTags(editor, enabled) {
  const [menu, setMenu] = useState(null);
  const menuRef = useRef(null);
  const activeIndexRef = useRef(0);
  const updateTimerRef = useRef(null);

  useEffect(() => {
    menuRef.current = menu;
  }, [menu]);

  const closeMenu = useCallback(() => {
    activeIndexRef.current = 0;
    setMenu(null);
  }, []);

  const insertTag = useCallback(
    (tag) => {
      const editorInstance = editor;
      const currentMenu = menuRef.current;
      if (!editorInstance || !currentMenu || !tag) return;

      editorInstance.deleteText(
        currentMenu.atIndex,
        currentMenu.replaceLength,
        "user"
      );
      editorInstance.insertText(currentMenu.atIndex, tag, "user");
      editorInstance.setSelection(currentMenu.atIndex + tag.length, 0, "user");
      closeMenu();
    },
    [editor, closeMenu]
  );

  const updateMenu = useCallback(() => {
    if (!editor) return;

    const range = editor.getSelection(true);
    if (!range) return;

    const textBefore = editor.getText(0, range.index);
    const match = matchDynamicTagAtCursor(textBefore, range.index);
    if (!match) {
      closeMenu();
      return;
    }

    const items = filterDynamicTags(match.query);
    if (!items.length) {
      closeMenu();
      return;
    }

    const bounds = editor.getBounds(range.index);
    const editorRect = editor.root.getBoundingClientRect();
    const nextIndex = Math.min(activeIndexRef.current, items.length - 1);
    activeIndexRef.current = nextIndex;

    setMenu({
      top: editorRect.top + bounds.bottom + 4,
      left: editorRect.left + bounds.left,
      items,
      activeIndex: nextIndex,
      atIndex: match.atIndex,
      replaceLength: match.replaceLength,
    });
  }, [editor, closeMenu]);

  const scheduleUpdateMenu = useCallback(() => {
    if (updateTimerRef.current) {
      window.cancelAnimationFrame(updateTimerRef.current);
    }
    updateTimerRef.current = window.requestAnimationFrame(() => {
      updateTimerRef.current = window.requestAnimationFrame(() => {
        updateMenu();
      });
    });
  }, [updateMenu]);

  useEffect(() => {
    if (!enabled || !editor) return undefined;

    const root = editor.root;

    const handleTextChange = (_delta, _old, source) => {
      if (source === "user") scheduleUpdateMenu();
    };

    const handleSelectionChange = (range) => {
      if (range) scheduleUpdateMenu();
      else closeMenu();
    };

    const handleKeyDown = (event) => {
      if (event.key === "@") {
        scheduleUpdateMenu();
        window.setTimeout(scheduleUpdateMenu, 0);
      }

      const currentMenu = menuRef.current;
      if (!currentMenu) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = (currentMenu.activeIndex + 1) % currentMenu.items.length;
        activeIndexRef.current = next;
        setMenu({ ...currentMenu, activeIndex: next });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const next =
          (currentMenu.activeIndex - 1 + currentMenu.items.length) %
          currentMenu.items.length;
        activeIndexRef.current = next;
        setMenu({ ...currentMenu, activeIndex: next });
        return;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        insertTag(currentMenu.items[currentMenu.activeIndex]);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };

    const handleBlur = () => {
      window.setTimeout(() => closeMenu(), 200);
    };

    editor.on("text-change", handleTextChange);
    editor.on("selection-change", handleSelectionChange);
    root.addEventListener("keydown", handleKeyDown);
    root.addEventListener("blur", handleBlur, true);

    return () => {
      if (updateTimerRef.current) {
        window.cancelAnimationFrame(updateTimerRef.current);
      }
      editor.off("text-change", handleTextChange);
      editor.off("selection-change", handleSelectionChange);
      root.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("blur", handleBlur, true);
    };
  }, [editor, enabled, scheduleUpdateMenu, updateMenu, insertTag, closeMenu]);

  return { menu, insertTag, closeMenu };
}
