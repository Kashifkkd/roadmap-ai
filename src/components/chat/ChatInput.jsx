"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Loader2,
  Search,
  Paperclip,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { graphqlClient } from "@/lib/graphql-client";
import { toast } from "@/components/ui/toast";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingSource, setIsUploadingSource] = useState(false);
  const [uploadedSourceMaterials, setUploadedSourceMaterials] = useState([]);
  const textareaRef = useRef(null);
  const sourceFileInputRef = useRef(null);

  const currentValue = value !== undefined ? value : text;

  // Auto scroll to bottom in textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [currentValue]);
  const setCurrentValue = onChange || setText;

  const resetSourceUploadDialog = () => {
    setSelectedFile(null);
    setIsAttachActive(false);
  };

  const handleAttach = () => {
    setIsAttachActive(true);
  };

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

  const handleUploadSourceMaterial = async () => {
    if (!selectedFile) {
      toast.error("Please choose a file first.");
      return;
    }

    setIsUploadingSource(true);
    try {
      const sessionId = await ensureSessionId();
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);
      formData.append("session_id", sessionId);
      formData.append("comment", "");

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
        id: uploadedSource?.id ?? uploadedSource?.material_id ?? null,
        s3_path: uploadedSource?.s3_path ?? "",
        source_name: uploadedSource?.source_name ?? selectedFile?.name ?? "",
      };

      if (sourcePayload.id || sourcePayload.s3_path || sourcePayload.source_name) {
        setUploadedSourceMaterials((prev) => [...prev, sourcePayload]);
      }

      toast.success("Source material uploaded successfully.");
      resetSourceUploadDialog();
    } catch (error) {
      console.error("Source material upload failed:", error);
      toast.error(error?.message || "Failed to upload source material.");
    } finally {
      setIsUploadingSource(false);
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
      });
    }
    setUploadedSourceMaterials([]);
    // Only clear if using internal state
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

  return (
    <div className="w-full p-2 bg-accent flex flex-col items-center gap-2 rounded-xl h-[100px] sm:h-[130px]">
      <div className="relative w-full h-full rounded-xl  text-[#717680]">
        <Search className="absolute top-3 left-2 w-4 h-4 text-[#717680]" />
        <Textarea
          ref={textareaRef}
          placeholder={placeholder || "Ask me anything"}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`pl-[30px] pt-2 pb-12 pr-2 text-sm text-gray-900 placeholder:text-[#717680] shadow-none border-0 rounded-xl bg-background w-full min-h-full focus-visible:ring-primary-300 focus-visible:ring-1 focus-visible:ring-offset-2 leading-5 resize-none ${
            disabled ? " cursor-not-allowed" : ""
          }`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-10  rounded-b-xl" />
        {uploadedSourceMaterials.length > 0 && (
          <div className="absolute bottom-11 left-2 right-2 flex gap-1 overflow-x-auto no-scrollbar">
            {uploadedSourceMaterials.map((item, index) => (
              <div
                key={`${item.source_name}-${index}`}
                className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs border border-primary-200 shrink-0"
                title={item.source_name}
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[130px] truncate">{item.source_name}</span>
                <button
                  type="button"
                  className="hover:text-red-500"
                  onClick={() =>
                    setUploadedSourceMaterials((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Button
            variant="default"
            size="icon"
            onClick={handleSubmit}
            // disabled={disabled || !currentValue.trim()}
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
        {/* <Button
          variant="default"
          size="xs"
          className={`absolute p-1 bottom-2 left-2 cursor-pointer flex text-center gap-0 rounded-sm ${
            isAttachActive
              ? "text-white bg-primary-600"
              : "text-white bg-primary  hover:text-primary-600 hover:bg-primary-50"
          }`}
          onClick={handleAttach}
        >
          <Paperclip className="w-2 h-2" />
          <span className="text-xs">Attach</span>
        </Button> */}
      </div>

      <Dialog open={isAttachActive} onOpenChange={(open) => !open && resetSourceUploadDialog()}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              Upload Source Material
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div
              onClick={() => sourceFileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary-50/30 transition-colors"
            >
              <Upload className="w-7 h-7 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : "Click to choose a file"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Upload source material for this chat session
              </p>
            </div>

            <input
              ref={sourceFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.pptx,.mp3,.wav,.m4a,.flac,.mp4,.webm"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />

            {selectedFile && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetSourceUploadDialog}
              disabled={isUploadingSource}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleUploadSourceMaterial}
              disabled={!selectedFile || isUploadingSource}
            >
              {isUploadingSource ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
