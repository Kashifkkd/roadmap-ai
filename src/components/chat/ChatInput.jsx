"use client";

import React, { useState, useRef } from "react";
import { ArrowUp, Loader2, Search, Paperclip, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/components/ui/toast";

import { useUpwardPopover } from "./chat-input/useUpwardPopover";
import AttachPopover from "./chat-input/AttachPopover";
import LinkPopover from "./chat-input/LinkPopover";
import {
  ACCEPT,
  ensureSessionId,
  isValidUrl,
  uploadFile,
  uploadLink,
  classifyFiles,
} from "./chat-input/uploadAttachment";

/**
 * Chat composer with file + link attach popovers.
 */
export default function ChatInput({
  placeholder,
  disabled = false,
  onSubmit,
  onUploadRecorded,
  value = "",
  onChange,
  isLoading,
}) {
  // Text
  const [internalText, setInternalText] = useState("");
  const text = value !== undefined ? value : internalText;
  const setText = onChange || setInternalText;

  // Send animation
  const [isClicked, setIsClicked] = useState(false);

  // Queued attachments for the next outgoing message
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);

  // Attach popover state
  const [attachOpen, setAttachOpen] = useState(false);
  const [pending, setPending] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Link popover state
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkComment, setLinkComment] = useState("");
  const [uploadingLink, setUploadingLink] = useState(false);

  const fileInputRef = useRef(null);
  const attachRef = useRef(null);
  const linkRef = useRef(null);
  const linkInputRef = useRef(null);

  const closeAttach = () => { setAttachOpen(false); setPending([]); };
  const closeLink = () => { setLinkOpen(false); setLinkUrl(""); setLinkComment(""); };

  const attachPopover = useUpwardPopover({
    open: attachOpen, anchorRef: attachRef, panelId: "ci-attach", width: 300, onClose: closeAttach,
  });
  const linkPopover = useUpwardPopover({
    open: linkOpen, anchorRef: linkRef, panelId: "ci-link", width: 340, onClose: closeLink,
  });

  const stageFiles = (fileList) => {
    const taken = new Set([
      ...files.map((f) => f.source_name),
      ...pending.map((p) => p.file.name),
    ]);
    const { supported, unsupported, duplicates } = classifyFiles(fileList, taken);
    if (unsupported.length) toast.error(`Unsupported: ${unsupported.map((f) => f.name).join(", ")}`);
    if (duplicates.length) toast.error(`Already attached: ${duplicates.map((f) => f.name).join(", ")}`);
    if (supported.length) {
      setPending((prev) => [...prev, ...supported.map((file) => ({ file, comment: "" }))]);
    }
  };

  const handleConfirmAttach = async () => {
    if (!pending.length) return fileInputRef.current?.click();
    setUploadingFiles(true);
    try {
      const sessionId = await ensureSessionId();
      const uploaded = [];
      for (const { file, comment } of pending) {
        try {
          uploaded.push(await uploadFile({ file, sessionId, comment: comment.trim() }));
        } catch (err) {
          console.error(`Upload failed for ${file.name}:`, err);
          toast.error(err?.message || `Failed to upload ${file.name}.`);
        }
      }
      if (uploaded.length) {
        if (onUploadRecorded) {
          for (const item of uploaded) {
            await onUploadRecorded({ sourceMaterial: item });
          }
        } else {
          setFiles((prev) => [...prev, ...uploaded]);
        }
        toast.success(uploaded.length === 1 ? "File attached." : `${uploaded.length} files attached.`);
      }
    } finally {
      setUploadingFiles(false);
      closeAttach();
    }
  };

  const handleAddLink = async () => {
    const url = linkUrl.trim();
    if (!url) return toast.error("Please enter a URL.");
    if (!isValidUrl(url)) return toast.error("Please enter a valid URL (e.g. https://example.com).");
    if (links.some((l) => l.webpage_url === url)) return toast.error("This link has already been attached.");

    setUploadingLink(true);
    try {
      const sessionId = await ensureSessionId();
      const link = await uploadLink({ url, sessionId, comment: linkComment.trim() });
      if (onUploadRecorded) {
        await onUploadRecorded({ webLink: link });
      } else {
        setLinks((prev) => [...prev, link]);
      }
      toast.success("Link attached.");
      closeLink();
    } catch (err) {
      console.error("Link upload failed:", err);
      toast.error(err?.message || "Failed to upload link.");
    } finally {
      setUploadingLink(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1000);
    if (!text.trim() || disabled) return;
    onSubmit?.({ text, sourceMaterials: files, webLinks: links });
    setFiles([]); setLinks([]);
    if (value === undefined) setInternalText("");
  };

  const clearComposerText = () => {
    setText("");
  };

  const toggleAttach = () => {
    setLinkOpen(false);
    setAttachOpen((p) => {
      if (p) setPending([]);
      else clearComposerText();
      return !p;
    });
  };
  const toggleLink = () => {
    setAttachOpen(false);
    setLinkOpen((p) => {
      const opening = !p;
      if (opening) clearComposerText();
      return opening;
    });
    setLinkUrl("");
    setLinkComment("");
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const toolbarDisabled = disabled || isLoading;

  return (
    <div className="flex h-[100px] w-full flex-col items-center gap-2 rounded-xl bg-accent p-2 sm:h-[130px]">
      <div className="relative h-full w-full overflow-visible rounded-xl text-[#717680]">
        <Search className="pointer-events-none absolute left-2 top-3 z-10 h-4 w-4 text-[#717680]" />
        <Textarea
          placeholder={placeholder || "Ask me anything"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={disabled}
          spellCheck={false}
          className={`min-h-full max-h-full w-full resize-none overflow-y-auto rounded-xl border-0 bg-background pb-12 pl-[30px] pr-2 pt-2 text-sm leading-6 break-words text-gray-900 shadow-none placeholder:text-[#717680] focus-visible:ring-1 focus-visible:ring-primary-300 focus-visible:ring-offset-2 ${disabled ? "cursor-not-allowed" : ""}`}
        />

        {/* Solid footer strip so attach/link are not clipped by rounded corners */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-11 rounded-b-xl bg-background"
          aria-hidden
        />

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            stageFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <div className="relative" ref={attachRef}>
            <TriggerBtn
              icon={<Paperclip className="h-3 w-3 shrink-0" />}
              label="Attach"
              active={attachOpen}
              onClick={toggleAttach}
              disabled={toolbarDisabled}
            />
          </div>
          <div className="relative" ref={linkRef}>
            <TriggerBtn
              icon={<Link2 className="h-3 w-3 shrink-0" />}
              label="Link"
              active={linkOpen}
              onClick={toggleLink}
              disabled={toolbarDisabled}
            />
          </div>
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-10">
          <Button
            variant="default"
            size="icon"
            onClick={handleSubmit}
            disabled={toolbarDisabled}
            className="flex items-center gap-2 rounded-full bg-primary p-2 text-background hover:cursor-pointer group"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp
                size={16}
                className={`text-white transition-transform duration-300 ease-in-out ${isClicked ? "rotate-90" : "group-hover:rotate-45"}`}
              />
            )}
          </Button>
        </div>
      </div>

      {attachOpen && (
        <AttachPopover
          popover={attachPopover}
          pending={pending}
          setPending={setPending}
          onPick={() => fileInputRef.current?.click()}
          onDrop={stageFiles}
          onConfirm={handleConfirmAttach}
          onClose={closeAttach}
          uploading={uploadingFiles}
        />
      )}

      {linkOpen && (
        <LinkPopover
          popover={linkPopover}
          inputRef={linkInputRef}
          url={linkUrl}
          setUrl={setLinkUrl}
          comment={linkComment}
          setComment={setLinkComment}
          onAdd={handleAddLink}
          onClose={closeLink}
          uploading={uploadingLink}
        />
      )}
    </div>
  );
}

function TriggerBtn({ icon, label, active, onClick, disabled }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 shrink-0 items-center gap-1 rounded-sm border-0 px-2 py-1 shadow-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-primary-50 text-primary-600 hover:bg-primary-50 hover:text-primary-600"
          : "bg-white text-gray-500 hover:bg-primary-50 hover:text-primary-600"
      }`}
    >
      {icon}
      <span className="text-xs leading-none">{label}</span>
    </Button>
  );
}
