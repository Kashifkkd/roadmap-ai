"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  ArrowUp,
  Loader2,
  Search,
  Paperclip,
  X,
  FileText,
  Info,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { graphqlClient } from "@/lib/graphql-client";
import { toast } from "@/components/ui/toast";

const SOURCE_FORMATS_HOVER_TEXT =
  ".pdf, .doc, .docx, .txt, .pptx, .mp3, .wav, .m4a, .flac, .mp4, .webm";

export default function ChatInput({
  placeholder,
  disabled = false,
  onSubmit,
  value = "",
  onChange,
  isLoading,
}) {
  const [text, setText] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [isAttachActive, setIsAttachActive] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploadingSource, setIsUploadingSource] = useState(false);
  const [uploadedSourceMaterials, setUploadedSourceMaterials] = useState([]);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [linkCommentValue, setLinkCommentValue] = useState("");
  const [isUploadingLink, setIsUploadingLink] = useState(false);
  const [uploadedWebLinks, setUploadedWebLinks] = useState([]);
  const sourceFileInputRef = useRef(null);
  const attachWrapperRef = useRef(null);
  const attachPanelRef = useRef(null);
  const linkWrapperRef = useRef(null);
  const linkPanelRef = useRef(null);
  const linkInputRef = useRef(null);

  const [attachPanelPos, setAttachPanelPos] = useState({ top: 0, left: 0 });
  const [linkPanelPos, setLinkPanelPos] = useState({ top: 0, left: 0 });

  const computePanelPosition = (buttonEl, panelWidth) => {
    if (!buttonEl) return { top: 0, left: 0 };
    const rect = buttonEl.getBoundingClientRect();
    const viewportW =
      typeof window !== "undefined" ? window.innerWidth : panelWidth;
    const margin = 8;
    const effectiveWidth = Math.min(panelWidth, viewportW - margin * 2);
    let left = rect.left;
    if (left + effectiveWidth + margin > viewportW) {
      left = viewportW - effectiveWidth - margin;
    }
    if (left < margin) left = margin;
    const top = rect.top - margin;
    return { top, left, width: effectiveWidth };
  };

  const currentValue = value !== undefined ? value : text;

  const setCurrentValue = onChange || setText;

  const resetSourceUploadDialog = () => {
    setPendingFiles([]);
    setIsAttachActive(false);
  };

  const resetLinkPanel = () => {
    setLinkInputValue("");
    setLinkCommentValue("");
    setIsLinkActive(false);
  };

  const handleAttach = () => {
    setIsAttachActive((prev) => {
      const next = !prev;
      if (next) setIsLinkActive(false);
      return next;
    });
  };

  const handleToggleLink = () => {
    setIsLinkActive((prev) => {
      const next = !prev;
      if (next) setIsAttachActive(false);
      return next;
    });
    setLinkInputValue("");
    setLinkCommentValue("");
    setTimeout(() => linkInputRef.current?.focus(), 100);
  };

  const addFilesToPending = (files) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setPendingFiles((prev) => [
      ...prev,
      ...list.map((file) => ({ file, comment: "" })),
    ]);
  };

  useEffect(() => {
    if (!isAttachActive) return;

    const handleOutsidePointerDown = (e) => {
      const wrapper = attachWrapperRef.current;
      const panel = attachPanelRef.current;
      const inWrapper = wrapper && wrapper.contains(e.target);
      const inPanel = panel && panel.contains(e.target);
      if (inWrapper || inPanel) return;
      setIsAttachActive(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [isAttachActive]);

  useEffect(() => {
    if (!isLinkActive) return;

    const handleOutsidePointerDown = (e) => {
      const wrapper = linkWrapperRef.current;
      const panel = linkPanelRef.current;
      const inWrapper = wrapper && wrapper.contains(e.target);
      const inPanel = panel && panel.contains(e.target);
      if (inWrapper || inPanel) return;
      setIsLinkActive(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [isLinkActive]);

  useLayoutEffect(() => {
    if (!isAttachActive) return;
    const update = () => {
      setAttachPanelPos(computePanelPosition(attachWrapperRef.current, 300));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isAttachActive, pendingFiles.length]);

  useLayoutEffect(() => {
    if (!isLinkActive) return;
    const update = () => {
      setLinkPanelPos(computePanelPosition(linkWrapperRef.current, 320));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isLinkActive]);

  const ensureSessionId = async () => {
    let currentSessionId = localStorage.getItem("sessionId");
    if (currentSessionId) return currentSessionId;

    const sessionResponse = await graphqlClient.createSession();
    currentSessionId = sessionResponse?.createSession?.sessionId;
    if (!currentSessionId) {
      throw new Error("Failed to create a chat session for upload.");
    }

    localStorage.setItem("sessionId", currentSessionId);
    window.dispatchEvent(new Event("sessionIdChanged"));
    return currentSessionId;
  };

  const persistAssetsToBackend = async ({
    sessionId,
    addedSources = [],
    addedLinks = [],
  }) => {
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem("sessionData") || "{}") || {};
    } catch {}
    const arr = (v) => (Array.isArray(v) ? v : []);

    // Append new uploads to existing source_material with continued indexing.
    const existing = arr(stored.source_material);
    const source_material = [
      ...existing,
      ...addedSources.map((s, i) => {
        const n = existing.length + i + 1;
        const uid =
          s?.uid ??
          s?.uuid ??
          s?.s3_path?.match?.(/source_material\/([0-9a-f-]+)\//i)?.[1] ??
          null;
        return {
          [`source_material_${n}`]: s?.source_name ?? "",
          comment: s?.comment ?? "",
          [`uid_${n}`]: uid,
        };
      }),
    ];

    const webpage_url = [
      ...arr(stored.webpage_url),
      ...addedLinks.map((l) => ({
        webpage_url: l?.url ?? l?.webpage_url ?? "",
        title: l?.title ?? "",
        comment: l?.comment ?? "",
      })),
    ];

    // Readable chat entry
    const fmt = (k) =>
      k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const block = (heading, main, e) => {
      const fields = Object.entries(e)
        .filter(
          ([k, v]) =>
            k !== "comment" && v !== main && v && typeof v !== "object",
        )
        .map(([k, v]) => `${fmt(k)}: ${v}`);
      const c = (e.comment ?? "").trim();
      return [heading, main, ...fields, ...(c ? ["", "Comment", c] : [])].join(
        "\n",
      );
    };
    const blocks = [
      ...addedSources
        .filter((s) => s?.source_name)
        .map((s) => block("Attached file", s.source_name, s)),
      ...addedLinks
        .filter((l) => l?.url || l?.original_url)
        .map((l) => block("Attached link", l.url || l.original_url, l)),
    ];

    const chatbot_conversation = arr(stored.chatbot_conversation).slice();
    if (blocks.length) chatbot_conversation.push({ user: blocks.join("\n\n") });

    const payload = {
      session_id: sessionId,
      input_type: stored.input_type ?? "cycle_data_update",
      cycle_creation_data: stored.cycle_creation_data ?? {},
      response_outline: stored.response_outline ?? {},
      response_path: stored.response_path ?? {},
      to_modify: stored.to_modify ?? {},
      chatbot_conversation,
      source_material,
      webpage_url,
    };

    try {
      const response = await graphqlClient.autoSaveComet(JSON.stringify(payload));
      console.log("autoSaveComet (uploaded assets) →", response);
      localStorage.setItem(
        "sessionData",
        JSON.stringify({ ...stored, ...payload }),
      );
      window.dispatchEvent(new Event("chatConversationUpdated"));
    } catch (e) {
      console.error("autoSaveComet (uploaded assets) failed:", e);
      toast.error("Uploaded, but failed to sync to backend.");
    }
  };

  const handleUploadSourceMaterial = async () => {
    if (pendingFiles.length === 0) {
      sourceFileInputRef.current?.click();
      return;
    }

    setIsUploadingSource(true);
    setIsAttachActive(false);
    try {
      const sessionId = await ensureSessionId();
      const successfullyUploaded = [];

      for (const entry of pendingFiles) {
        const file = entry.file;
        const comment = (entry.comment ?? "").trim();

        try {
          const formData = new FormData();
          formData.append("file", file, file.name);
          formData.append("session_id", sessionId);
          formData.append("comment", comment);

          const result = await apiService({
            endpoint: endpoints.uploadSourceMaterial,
            method: "POST",
            data: formData,
          });

          if (!result?.success) {
            throw new Error(result?.message || "Source material upload failed");
          }

          const uploadedSource = result?.response ?? {};
          const sourcePayload = {
            ...uploadedSource,
            source_name: uploadedSource?.source_name ?? file?.name ?? "",
            comment,
          };

          if (
            sourcePayload.id ||
            sourcePayload.s3_path ||
            sourcePayload.source_name
          ) {
            successfullyUploaded.push(sourcePayload);
          }
        } catch (innerError) {
          console.error("Source material upload failed:", innerError);
          toast.error(
            innerError?.message ||
              `Failed to upload ${file?.name ?? "source material"}.`,
          );
        }
      }

      if (successfullyUploaded.length > 0) {
        setUploadedSourceMaterials((prev) => [
          ...prev,
          ...successfullyUploaded,
        ]);
        toast.success(
          successfullyUploaded.length === 1
            ? "Source material uploaded successfully."
            : `${successfullyUploaded.length} files uploaded successfully.`,
        );
        await persistAssetsToBackend({
          sessionId,
          addedSources: successfullyUploaded,
        });
      }

      resetSourceUploadDialog();
    } finally {
      setIsUploadingSource(false);
    }
  };

  const handleAddLink = async () => {
    const url = linkInputValue.trim();
    if (!url) {
      toast.error("Please enter a URL.");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL.");
      return;
    }
    const comment = linkCommentValue.trim();
    const alreadyAdded = uploadedWebLinks.some((entry) => entry.url === url);
    if (alreadyAdded) {
      toast.error("This link has already been added.");
      return;
    }

    setIsUploadingLink(true);
    setIsLinkActive(false);
    try {
      const sessionId = await ensureSessionId();
      const formData = new FormData();
      formData.append("url", url);
      formData.append("session_id", sessionId);
      if (comment) formData.append("comment", comment);

      const result = await apiService({
        endpoint: endpoints.uploadSourceMaterialWebLink,
        method: "POST",
        data: formData,
      });

      if (result?.error || result?.success === false) {
        throw new Error(result?.message || "Failed to upload link");
      }

      const rawPayload = result?.response;
      const payload = Array.isArray(rawPayload)
        ? (rawPayload[0] ?? {})
        : (rawPayload ?? {});
      const apiTitle =
        payload?.title || payload?.page_title || payload?.source_name || "";
      const fallbackTitle = (() => {
        try {
          return new URL(url).hostname;
        } catch {
          return url;
        }
      })();

      const linkEntry = {
        ...payload,
        url,
        title: apiTitle || fallbackTitle,
        comment,
        source_name: payload?.source_name || apiTitle || fallbackTitle,
      };

      setUploadedWebLinks((prev) => [...prev, linkEntry]);
      toast.success("Link uploaded successfully.");
      await persistAssetsToBackend({
        sessionId,
        addedLinks: [linkEntry],
      });
      resetLinkPanel();
    } catch (error) {
      console.error("Link upload failed:", error);
      toast.error(error?.message || "Failed to upload link.");
    } finally {
      setIsUploadingLink(false);
    }
  };

  const handleLinkInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === "Escape") {
      resetLinkPanel();
    }
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 1000);
    if (!currentValue.trim() || disabled) {
      return;
    }
    if (onSubmit) {
      onSubmit({
        text: currentValue,
        sourceMaterials: uploadedSourceMaterials,
        webLinks: uploadedWebLinks,
      });
    }
    setUploadedSourceMaterials([]);
    setUploadedWebLinks([]);
    if (value === undefined) {
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasPreviews =
    uploadedSourceMaterials.length > 0 || uploadedWebLinks.length > 0;

  return (
    <div
      className={`w-full p-2 bg-accent flex flex-col items-center gap-2 rounded-xl ${
        hasPreviews ? "h-[145px] sm:h-[175px]" : "h-[100px] sm:h-[130px]"
      }`}
    >
      <div className="relative w-full h-full rounded-xl  text-[#717680]">
        <Search className="absolute top-3 left-2 w-4 h-4 text-[#717680]" />
        <Textarea
          placeholder={placeholder || "Ask me anything"}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`pl-[30px] pt-2 ${
            hasPreviews ? "pb-24" : "pb-12"
          } pr-2 text-sm text-gray-900 placeholder:text-[#717680] shadow-none border-0 rounded-xl bg-background w-full min-h-full max-h-full overflow-y-auto focus-visible:ring-primary-300 focus-visible:ring-1 focus-visible:ring-offset-2 leading-6 break-words resize-none ${
            disabled ? " cursor-not-allowed" : ""
          }`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-10  rounded-b-xl" />
        {(isUploadingSource || isUploadingLink) && (
          <div className="absolute bottom-11 left-2 right-2 flex items-center gap-2.5 py-1">
            <div className="gradient-loader" />
            <span className="text-[13px] font-medium text-gray-600">
              {isUploadingSource ? "Uploading Files..." : "Uploading Link..."}
            </span>
          </div>
        )}
        {!isUploadingSource &&
          !isUploadingLink &&
          (uploadedSourceMaterials.length > 0 ||
            uploadedWebLinks.length > 0) && (
            <div className="absolute bottom-11 left-2 right-2">
              <div
                className="flex items-center gap-1 overflow-x-auto flex-nowrap pr-8"
                style={{ scrollbarWidth: "none" }}
              >
                {uploadedSourceMaterials.map((item, index) => (
                <div
                  key={`file-${item.source_name}-${index}`}
                  className="flex items-center gap-1.5 bg-primary-50 text-primary-700 pl-2 pr-1 py-1.5 rounded-lg text-xs max-w-[240px] border border-primary-200/60 shrink-0"
                  title={
                    item.source_name +
                    (item.comment ? ` — ${item.comment}` : "")
                  }
                >
                  <FileText className="w-3 h-3 shrink-0 mt-0.5 self-start" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium">
                      {(item.source_name ?? "").slice(0, 20)}
                      {(item.source_name ?? "").length > 20 ? "…" : ""}
                    </span>
                    {item.comment ? (
                      <span
                        className="flex items-start truncate text-gray-600 mt-0.5"
                        title={item.comment}
                      >
                        {item.comment.slice(0, 20)}
                        {item.comment.length > 20 ? "…" : ""}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="hover:text-red-500 transition-colors shrink-0 p-0.5 rounded-full hover:bg-primary-100"
                    onClick={() =>
                      setUploadedSourceMaterials((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    aria-label="Remove uploaded file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {uploadedWebLinks.map((entry, index) => (
                <div
                  key={`link-${entry.url}-${index}`}
                  className="flex items-center gap-1.5 bg-gray-50 text-gray-700 pl-2 pr-1 py-1.5 rounded-lg text-xs max-w-[240px] border border-gray-200 shrink-0"
                  title={
                    entry.url + (entry.comment ? ` — ${entry.comment}` : "")
                  }
                >
                  <Link2 className="w-3 h-3 shrink-0 mt-0.5 self-start text-gray-500" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium">
                      {(entry.title || entry.url).slice(0, 22)}
                      {(entry.title || entry.url).length > 22 ? "…" : ""}
                    </span>
                    {entry.comment ? (
                      <span
                        className="flex items-start truncate text-gray-500 mt-0.5"
                        title={entry.comment}
                      >
                        {entry.comment.slice(0, 22)}
                        {entry.comment.length > 22 ? "…" : ""}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="hover:text-red-500 transition-colors shrink-0 p-0.5 rounded-full hover:bg-gray-200 text-gray-400"
                    onClick={() =>
                      setUploadedWebLinks((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    aria-label="Remove uploaded link"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-lg bg-linear-to-l from-background via-background/80 to-transparent"
              />
            </div>
          )}
        <div className="absolute bottom-2 right-2">
          <Button
            variant="default"
            size="icon"
            onClick={handleSubmit}
            className="p-2 flex items-center gap-2 bg-primary text-background rounded-full hover:cursor-pointer group"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp
                size={16}
                className={`text-white transition-transform duration-300 ease-in-out ${
                  isClicked ? "rotate-90" : "group-hover:rotate-45"
                }`}
              />
            )}
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <div className="relative" ref={attachWrapperRef}>
            <Button
              variant="default"
              size="xs"
              className={`p-1 cursor-pointer flex text-center gap-0 rounded-sm ${
                isAttachActive
                  ? "text-white "
                  : "text-gray-500 bg-white hover:text-primary-600 hover:bg-primary-50"
              }`}
              onClick={handleAttach}
            >
              <Paperclip className="w-2 h-2" />
              <span className="text-xs">Attach</span>
            </Button>

            {isAttachActive && (
              <div
                ref={attachPanelRef}
                style={{
                  position: "fixed",
                  top: attachPanelPos.top,
                  left: attachPanelPos.left,
                  width: attachPanelPos.width ?? 300,
                  transform: "translateY(-100%)",
                  maxHeight: "calc(100vh - 24px)",
                }}
                className="z-50 bg-primary-50 border border-primary-400 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-y-auto"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  className="m-1 border-2 border-dashed border-gray-300 bg-white rounded-xl py-5 px-3 text-center cursor-pointer hover:border-primary-400 transition-all"
                  onClick={() => sourceFileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFilesToPending(e.dataTransfer?.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {pendingFiles.length > 0 ? (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                      </div>

                      <div
                        className="space-y-3 max-h-48 overflow-y-auto text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {pendingFiles.map((entry, idx) => {
                          const file = entry.file ?? entry;
                          return (
                            <div
                              key={`${file.name}-${idx}`}
                              className="flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[13px] font-medium text-gray-800 truncate flex-1 min-w-0">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingFiles((prev) =>
                                      prev.filter((_, i) => i !== idx),
                                    );
                                  }}
                                  className="shrink-0 text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                                  aria-label="Remove file"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <input
                                type="text"
                                placeholder="Add Comment"
                                value={entry.comment ?? ""}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const val = e.target.value;
                                  setPendingFiles((prev) =>
                                    prev.map((p, i) =>
                                      i === idx ? { ...p, comment: val } : p,
                                    ),
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[12px] bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none placeholder:text-gray-400 text-gray-700 w-full hover:border-primary-400 focus:border-primary-400 transition-all"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[12px] text-gray-400 mt-3 font-medium">
                        Click to add more files
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center mb-3">
                        <img
                          src="/upload2.png"
                          alt="Upload"
                          className="w-12 h-12"
                        />
                      </div>
                      <p className="text-[14px] font-semibold text-gray-700">
                        Drag files here or click to upload
                      </p>
                      <p className="text-[12px] text-gray-400 mt-1.5">
                        Image, Document, Video & Audio Formats{" "}
                        <span className="group relative inline-flex items-center align-middle">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="inline-flex cursor-default rounded-sm text-gray-400 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Supported file formats: ${SOURCE_FORMATS_HOVER_TEXT}`}
                          >
                            <Info size={14} className="shrink-0" aria-hidden />
                          </button>
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-1 w-max max-w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 rounded-md bg-popover px-2 py-1.5 text-left text-[11px] leading-snug text-popover-foreground shadow-lg ring-1 ring-black/10 dark:ring-white/15 opacity-0 invisible transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                          >
                            {SOURCE_FORMATS_HOVER_TEXT}
                          </span>
                        </span>
                        <br />
                        Max Size: 50MB
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={sourceFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.pptx,.mp3,.wav,.m4a,.flac,.mp4,.webm"
                  className="hidden"
                  onChange={(e) => {
                    addFilesToPending(e.target.files);
                    e.target.value = "";
                  }}
                />

                <div className="mx-2 mb-2 rounded-xl flex justify-end items-center gap-2 bg-white px-3 py-2">
                  <button
                    type="button"
                    onClick={handleUploadSourceMaterial}
                    disabled={pendingFiles.length === 0 || isUploadingSource}
                    className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isUploadingSource ? "Uploading..." : "Done"}
                  </button>
                  <button
                    type="button"
                    onClick={resetSourceUploadDialog}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close attach panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={linkWrapperRef}>
            <Button
              variant="default"
              size="xs"
              className={`p-1 cursor-pointer flex text-center gap-0 rounded-sm ${
                isLinkActive
                  ? "text-white bg-primary-600"
                  : "text-gray-500 bg-white hover:text-primary-600 hover:bg-primary-50"
              }`}
              onClick={handleToggleLink}
            >
              <Link2 className="w-2 h-2" />
              <span className="text-xs">Link</span>
            </Button>

            {isLinkActive && (
              <div
                ref={linkPanelRef}
                style={{
                  position: "fixed",
                  top: linkPanelPos.top,
                  left: linkPanelPos.left,
                  width: linkPanelPos.width ?? 320,
                  transform: "translateY(-100%)",
                  maxHeight: "calc(100vh - 24px)",
                }}
                className="z-50 bg-primary-50 border border-primary-400 rounded-2xl p-1 shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-y-auto"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 bg-primary-50 rounded-xl py-1 mb-0.5">
                  <div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg">
                    <Link2 className="w-5 h-5 text-gray-500 shrink-0" />
                  </div>
                  <input
                    ref={linkInputRef}
                    type="url"
                    placeholder="Paste link here"
                    value={linkInputValue}
                    onChange={(e) => setLinkInputValue(e.target.value)}
                    onKeyDown={handleLinkInputKeyDown}
                    className="flex-1 bg-white rounded-lg p-2 text-sm outline-none placeholder:text-gray-400 min-w-0"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1">
                  <input
                    type="text"
                    placeholder="Add Comment"
                    value={linkCommentValue}
                    onChange={(e) => setLinkCommentValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    className="flex-1 bg-transparent text-sm py-1.5 outline-none placeholder:text-gray-400 min-w-0"
                  />
                  <Button
                    variant="outline"
                    className="px-4 py-1.5 text-sm bg-primary text-white hover:bg-primary/90 h-8 rounded-lg shrink-0 disabled:opacity-50"
                    onClick={handleAddLink}
                    disabled={!linkInputValue.trim() || isUploadingLink}
                  >
                    {isUploadingLink ? "Adding..." : "Add"}
                  </Button>
                  <button
                    type="button"
                    onClick={resetLinkPanel}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 shrink-0"
                    aria-label="Close link panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
