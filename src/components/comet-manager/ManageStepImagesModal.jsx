"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, ImageIcon, RefreshCw, X, Pencil, StopCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStepImageDetails,
  regenerateSelectedImages,
  setImageAttributes,
  cancelStepImages,
} from "@/api/generateStepImages";
import { ART_STYLE_KEYS } from "@/constants/artStyles";

const STEP_WALLPAPER_KEY = "__step_wallpaper__";

function StatusPill({ status }) {
  const map = {
    completed: { label: "Generated", cls: "bg-green-100 text-green-700" },
    failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
    empty: { label: "Not Generated", cls: "bg-gray-100 text-gray-600" },
    pending: { label: "Generating...", cls: "bg-purple-100 text-purple-700" },
  };
  const cfg = map[status] || map.empty;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.cls}`}
    >
      {status === "pending" && <Loader2 className="w-3 h-3 animate-spin" />}
      {cfg.label}
    </span>
  );
}

function Thumbnail({ url, status, isWallpaper }) {
  const size = isWallpaper ? "w-16 h-10" : "w-12 h-12";
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={`${size} rounded object-cover bg-gray-50 shrink-0`}
      />
    );
  }
  if (status === "failed") {
    return (
      <div
        className={`${size} rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0`}
      >
        <AlertCircle className="w-4 h-4 text-red-400" />
      </div>
    );
  }
  return (
    <div
      className={`${size} rounded bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center shrink-0`}
    >
      <ImageIcon className="w-4 h-4 text-gray-400" />
    </div>
  );
}

export default function ManageStepImagesModal({
  open,
  onOpenChange,
  sessionId,
  chapterUid,
  stepUid,
  onRegenerateStart,
  onEditSelected,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [details, setDetails] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [artStyle, setArtStyle] = useState("Editorial Illustration");
  const [imageGuidance, setImageGuidance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const allItems = useMemo(() => {
    if (!details) return [];
    const items = [];
    if (details.step_wallpaper) {
      items.push({
        identifier: STEP_WALLPAPER_KEY,
        title: "Step Wallpaper",
        contentType: "step_wallpaper",
        url: details.step_wallpaper.url,
        status: details.step_wallpaper.status,
        isWallpaper: true,
      });
    }
    for (const s of details.screens || []) {
      items.push({
        identifier: s.screen_uid,
        title: s.title,
        contentType: s.content_type,
        url: s.url,
        status: s.status,
        isWallpaper: false,
      });
    }
    return items;
  }, [details]);

  const hasPending = useMemo(
    () => allItems.some((it) => it.status === "pending"),
    [allItems],
  );

  const fetchDetails = async () => {
    if (!sessionId || !chapterUid || !stepUid) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getStepImageDetails({ sessionId, chapterUid, stepUid });
      const data = res?.response ?? res;
      if (!data || res?.error) {
        throw new Error(res?.message || "Failed to load image details");
      }
      setDetails(data);
      if (data.art_style) setArtStyle(data.art_style);
      setImageGuidance(data.image_guidance || "");
      setSelected(new Set());
    } catch (e) {
      setLoadError(e?.message || "Failed to load image details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDetails();
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId, chapterUid, stepUid]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectableItems = useMemo(
    () => allItems.filter((it) => it.status !== "pending"),
    [allItems],
  );

  const setAll = (filterFn) => {
    setSelected(
      new Set(selectableItems.filter(filterFn).map((it) => it.identifier)),
    );
  };

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    setSubmitError(null);
    try {
      await cancelStepImages({ sessionId, chapterUid, stepUid });
      await fetchDetails();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to cancel";
      setSubmitError(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRegenerate = async () => {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Persist current attributes first so the worker uses them.
      await setImageAttributes({ sessionId, artStyle, imageGuidance });

      const screenUids = [];
      let includeStepWallpaper = false;
      for (const id of selected) {
        if (id === STEP_WALLPAPER_KEY) includeStepWallpaper = true;
        else screenUids.push(id);
      }

      const res = await regenerateSelectedImages({
        sessionId,
        chapterUid,
        stepUid,
        screenUids,
        includeStepWallpaper,
        artStyle,
        imageGuidance,
      });

      const ok =
        res?.success ||
        res?.status === "enqueued" ||
        res?.response?.status === "enqueued";
      if (!ok) {
        throw new Error(res?.message || "Failed to start regeneration");
      }

      onRegenerateStart?.(stepUid);
      onOpenChange?.(false);
    } catch (e) {
      const msg =
        e?.response?.data?.detail || e?.message || "Failed to start regeneration";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Manage Step Images</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 py-2 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-600">Loading images...</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-red-600">{loadError}</p>
              <Button variant="outline" size="sm" onClick={fetchDetails}>
                Try again
              </Button>
            </div>
          ) : details ? (
            <>
              {/* Quick actions */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={() => setAll(() => true)}
                  disabled={selectableItems.length === 0}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={() => setAll((it) => it.status === "failed")}
                  disabled={!selectableItems.some((it) => it.status === "failed")}
                >
                  Select Failed
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={() => setAll((it) => it.status === "empty")}
                  disabled={!selectableItems.some((it) => it.status === "empty")}
                >
                  Select Empty
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={() => setSelected(new Set())}
                  disabled={selected.size === 0}
                >
                  Deselect All
                </button>
              </div>

              {/* Image list */}
              <div className="border border-gray-100 rounded-md">
                {allItems.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    No image-eligible screens in this step.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {allItems.map((it) => {
                      const disabled = it.status === "pending";
                      const isSelected = selected.has(it.identifier);
                      return (
                        <li
                          key={it.identifier}
                          className={`flex items-center gap-3 px-3 py-2 ${
                            disabled ? "opacity-60" : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 cursor-pointer accent-primary-500"
                            checked={isSelected}
                            disabled={disabled}
                            onChange={() => toggle(it.identifier)}
                          />
                          <Thumbnail
                            url={it.url}
                            status={it.status}
                            isWallpaper={it.isWallpaper}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {it.title || it.identifier}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {it.contentType}
                            </p>
                          </div>
                          <StatusPill status={it.status} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Attributes */}
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="manage-art-style">Art Style</Label>
                  <Select value={artStyle} onValueChange={setArtStyle}>
                    <SelectTrigger id="manage-art-style" className="w-full">
                      <SelectValue placeholder="Select art style" />
                    </SelectTrigger>
                    <SelectContent>
                      {ART_STYLE_KEYS.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manage-image-guidance">Image Guidance</Label>
                  <Input
                    id="manage-image-guidance"
                    type="text"
                    value={imageGuidance}
                    onChange={(e) => setImageGuidance(e.target.value)}
                    placeholder="Optional guidance applied to selected images"
                  />
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 text-sm text-red-600">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-gray-100 pt-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isSubmitting || isCancelling}
          >
            Close
          </Button>
          {hasPending && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || isCancelling}
              className="border-red-200 text-red-600 hover:bg-red-50"
              title="Mark stuck generations as failed so you can retry"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Generation
                </>
              )}
            </Button>
          )}
          {onEditSelected && (
            <Button
              variant="outline"
              onClick={() => {
                const items = allItems.filter((it) => selected.has(it.identifier));
                onEditSelected(items);
                onOpenChange?.(false);
              }}
              disabled={
                isSubmitting ||
                isLoading ||
                !!loadError ||
                selected.size === 0 ||
                hasPending
              }
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Image ({selected.size})
            </Button>
          )}
          <Button
            onClick={handleRegenerate}
            disabled={
              isSubmitting ||
              isLoading ||
              !!loadError ||
              selected.size === 0 ||
              hasPending
            }
            title={
              hasPending
                ? "Wait for in-progress generations to finish"
                : undefined
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Starting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Selected ({selected.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
