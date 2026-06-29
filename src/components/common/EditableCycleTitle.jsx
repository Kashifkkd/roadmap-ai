"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  getCycleDisplayTitle,
  persistCycleTitle,
  readSessionDataFromStorage,
} from "@/lib/cycleTitle";
import { toast } from "@/components/ui/toast";

const VARIANT_STYLES = {
  header: {
    title:
      "text-[#574EB6] truncate text-base sm:text-xl md:text-2xl font-medium font-serif min-w-0",
    input: "text-base sm:text-xl md:text-2xl font-medium font-serif h-9 sm:h-10",
    wrapper: "flex flex-1 items-center min-w-0 gap-2",
  },
  section: {
    title:
      "text-[24px] font-medium text-[#574EB6] font-serif truncate min-w-0",
    input: "text-lg font-medium font-serif h-10",
    wrapper: "flex items-center gap-2 min-w-0 flex-1",
  },
};

export default function EditableCycleTitle({ variant = "header", className }) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.header;
  const inputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const syncFromStorage = useCallback(() => {
    const sessionData = readSessionDataFromStorage();
    const next =
      getCycleDisplayTitle(sessionData) || "Untitled Cycle";
    setTitle(next);
    if (!isEditing) {
      setDraft(next);
    }
  }, [isEditing]);

  useEffect(() => {
    syncFromStorage();

    if (typeof window === "undefined") return undefined;

    const handleSessionUpdate = () => syncFromStorage();
    window.addEventListener("storage", handleSessionUpdate);
    window.addEventListener("sessionDataChanged", handleSessionUpdate);
    window.addEventListener("sessionIdChanged", handleSessionUpdate);

    return () => {
      window.removeEventListener("storage", handleSessionUpdate);
      window.removeEventListener("sessionDataChanged", handleSessionUpdate);
      window.removeEventListener("sessionIdChanged", handleSessionUpdate);
    };
  }, [syncFromStorage]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(title);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(title);
    setIsEditing(false);
  };

  const saveTitle = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error("Cycle title cannot be empty");
      return;
    }

    if (trimmed === title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const saved = await persistCycleTitle(trimmed);
      setTitle(saved);
      setDraft(saved);
      setIsEditing(false);
      toast.success("Cycle title updated");
    } catch (error) {
      console.error("Failed to save cycle title:", error);
      toast.error(
        error?.message === "No cycle session found"
          ? "No cycle session found. Please open a cycle first."
          : "Failed to save cycle title. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveTitle();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <div className={cn(styles.wrapper, className)}>
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          wrapperClassName="min-w-0 flex-1 bg-white"
          className={cn("min-w-0 flex-1", styles.input)}
          aria-label="Cycle title"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0 text-primary hover:bg-primary-50"
          onClick={() => void saveTitle()}
          disabled={isSaving}
          aria-label="Save cycle title"
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0 text-gray-600 hover:bg-gray-100"
          onClick={cancelEditing}
          disabled={isSaving}
          aria-label="Cancel editing cycle title"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(styles.wrapper, className)}>
      <h1 className={styles.title} title={title}>
        {title || "Untitled Cycle"}
      </h1>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="shrink-0 text-[#574EB6] hover:bg-primary-50"
        onClick={startEditing}
        aria-label="Edit cycle title"
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}
