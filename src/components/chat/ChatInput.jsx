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
        setFiles((prev) => [...prev, ...uploaded]);
        // Await each record so localStorage read-modify-write in ChatWindow does not race
        // (parallel calls would share the same prevConv and drop earlier uploads).
        for (const item of uploaded) {
          await onUploadRecorded?.({ sourceMaterial: item });
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
      setLinks((prev) => [...prev, link]);
      onUploadRecorded?.({ webLink: link });
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

  const toggleAttach = () => {
    setLinkOpen(false);
    setAttachOpen((p) => { if (p) setPending([]); return !p; });
  };
  const toggleLink = () => {
    setAttachOpen(false);
    setLinkOpen((p) => !p);
    setLinkUrl(""); setLinkComment("");
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const toolbarDisabled = disabled || isLoading;

  return (
    <div className="w-full p-2 bg-accent flex flex-col items-center gap-2 rounded-xl h-[100px] sm:h-[130px]">
      <div className="relative w-full h-full rounded-xl text-[#717680]">
        <Search className="absolute top-3 left-2 w-4 h-4 text-[#717680]" />
        <Textarea
          placeholder={placeholder || "Ask me anything"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
          }}
          disabled={disabled}
          className={`pl-[30px] pt-2 pb-12 pr-2 text-sm text-gray-900 placeholder:text-[#717680] shadow-none border-0 rounded-xl bg-background w-full min-h-full max-h-full overflow-y-auto focus-visible:ring-primary-300 focus-visible:ring-1 focus-visible:ring-offset-2 leading-6 break-words resize-none ${disabled ? "cursor-not-allowed" : ""}`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-10 rounded-b-xl" />

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => { stageFiles(e.target.files); e.target.value = ""; }}
        />

        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <div className="relative" ref={attachRef}>
            <TriggerBtn
              icon={<Paperclip className="w-3 h-3" />}
              label="Attach"
              active={attachOpen}
              onClick={toggleAttach}
              disabled={toolbarDisabled}
            />
          </div>
          <div className="relative" ref={linkRef}>
            <TriggerBtn
              icon={<Link2 className="w-3 h-3" />}
              label="Link"
              active={linkOpen}
              onClick={toggleLink}
              disabled={toolbarDisabled}
            />
          </div>
        </div>

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
      variant="default"
      size="xs"
      onClick={onClick}
      disabled={disabled}
      className={`p-1 flex items-center gap-1 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? "text-primary-600 bg-primary-50" : "text-gray-500 bg-white hover:text-primary-600 hover:bg-primary-50"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
