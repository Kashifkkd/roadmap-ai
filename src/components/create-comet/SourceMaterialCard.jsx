import React, { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getSourceMaterials } from "@/api/getSourceMaterials";

import { Plus, Link2, Trash2, CircleX, Loader2 } from "lucide-react";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

function normalizeWebLink(item, defaultUploaded = false) {
  if (typeof item === "string") {
    return { url: item, comment: "", isUploaded: defaultUploaded };
  }

  return {
    url: item?.url ?? item?.webpage_url ?? "",
    comment: item?.comment ?? "",
    isUploaded:
      typeof item?.isUploaded === "boolean" ? item.isUploaded : defaultUploaded,
  };
}

function getWebLinkKey(url = "") {
  return url.trim().toLowerCase().replace(/\/+$/, "");
}

function getFileKey(name = "") {
  return name.trim().toLowerCase();
}

function normalizeFileItem(item, defaultUploaded = false) {
  return {
    ...item,
    name: item?.name ?? item?.source_name ?? "Unknown File",
    isUploaded:
      typeof item?.isUploaded === "boolean" ? item.isUploaded : defaultUploaded,
    comment: item?.comment ?? "",
  };
}

function dedupeFiles(items = [], defaultUploaded = false) {
  const uniqueFiles = [];
  const seenFiles = new Map();

  items.forEach((item) => {
    const normalized = normalizeFileItem(item, defaultUploaded);
    const key = getFileKey(normalized.name);

    if (!key) {
      uniqueFiles.push(normalized);
      return;
    }

    const existingIndex = seenFiles.get(key);

    if (existingIndex === undefined) {
      seenFiles.set(key, uniqueFiles.length);
      uniqueFiles.push(normalized);
      return;
    }

    const existing = uniqueFiles[existingIndex];
    uniqueFiles[existingIndex] = {
      ...existing,
      comment: existing.comment || normalized.comment,
      isUploaded: existing.isUploaded || normalized.isUploaded,
      id: existing.id ?? normalized.id,
      output_presigned_url:
        existing.output_presigned_url ?? normalized.output_presigned_url,
      file: existing.file ?? normalized.file,
    };
  });

  return uniqueFiles;
}

function dedupeWebLinks(items = [], defaultUploaded = false) {
  const uniqueLinks = [];
  const seenUrls = new Map();

  items.forEach((item) => {
    const normalized = normalizeWebLink(item, defaultUploaded);
    const trimmedUrl = normalized.url.trim();

    if (!trimmedUrl) {
      uniqueLinks.push({ ...normalized, url: trimmedUrl });
      return;
    }

    const key = getWebLinkKey(trimmedUrl);
    const existingIndex = seenUrls.get(key);

    if (existingIndex === undefined) {
      seenUrls.set(key, uniqueLinks.length);
      uniqueLinks.push({ ...normalized, url: trimmedUrl });
      return;
    }

    const existing = uniqueLinks[existingIndex];
    uniqueLinks[existingIndex] = {
      ...existing,
      url: existing.url || trimmedUrl,
      comment: existing.comment || normalized.comment,
      isUploaded: existing.isUploaded || normalized.isUploaded,
    };
  });

  return uniqueLinks;
}

const SOURCE_ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "pptx",
  "mp3",
  "wav",
  "m4a",
  "flac",
  "mp4",
  "webm",
];

function partitionNewSourceFiles(existingFiles, filteredByType) {
  const existingFileNames = new Set(existingFiles.map((f) => getFileKey(f.name)));
  const seenSelectedNames = new Set();
  const duplicateFiles = filteredByType.filter((file) =>
    existingFileNames.has(getFileKey(file.name)) ||
    seenSelectedNames.has(getFileKey(file.name))
      ? true
      : (seenSelectedNames.add(getFileKey(file.name)), false),
  );
  const newFiles = filteredByType.filter(
    (file) =>
      !duplicateFiles.some(
        (duplicateFile) =>
          getFileKey(duplicateFile.name) === getFileKey(file.name),
      ),
  );
  return { duplicateFiles, newFiles };
}

export default function SourceMaterialCard({
  files,
  setFiles,
  isNewComet = false,
  webpageUrls = [],
  setWebpageUrls = () => {},
  onUploadingChange = () => {},
}) {
  const [sessionId, setSessionId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [linkDraft, setLinkDraft] = useState({ url: "" });
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSessionId = () => {
      const currentId = localStorage.getItem("sessionId");
      setSessionId(currentId);
    };

    // Initial read
    updateSessionId();

    // Listen for sessionId changes from chatwindow
    window.addEventListener("sessionIdChanged", updateSessionId);

    return () => {
      window.removeEventListener("sessionIdChanged", updateSessionId);
    };
  }, []);

  const fetchSourceMaterials = useCallback(async () => {
    try {
      const materials = await getSourceMaterials(sessionId);

      if (materials && materials.length > 0) {
        const fileMaterials = [];
        const linkMaterials = [];

        for (const material of materials) {
          if (material.type === "link") {
            const url =
              material.source_path ||
              material.output_presigned_url ||
              material.source_name ||
              "";
            if (url) {
              linkMaterials.push({
                url: url.trim(),
                comment: material.comment ?? "",
                isUploaded: true,
              });
            }
          } else {
            fileMaterials.push({
              name: material.source_name || "Unknown File",
              isUploaded: true,
              comment: material.comment ?? "",
              id: material.id,
              output_presigned_url: material.output_presigned_url,
            });
          }
        }

        setFiles(dedupeFiles(fileMaterials, true));
        if (linkMaterials.length > 0) {
          setWebpageUrls(dedupeWebLinks(linkMaterials, true));
        }
      }
    } catch (error) {
      console.error("Error fetching source materials:", error);
    }
  }, [sessionId, setFiles, setWebpageUrls]);

  useEffect(() => {
    // Skip fetching if new comet is created
    if (isNewComet) {
      return;
    }

    if (sessionId) {
      fetchSourceMaterials();
    }
  }, [sessionId, isNewComet, fetchSourceMaterials]);

  const uploadFile = useCallback(
    async (fileOrItem) => {
      try {
        const currentSessionId =
          sessionId ||
          (typeof window !== "undefined"
            ? localStorage.getItem("sessionId")
            : null);

        if (!currentSessionId) {
          console.error("Cannot upload file: no session ID available");
          toast.error("Please wait for session to be created");
          return false;
        }

        const rawFile = fileOrItem?.file ?? fileOrItem;
        const comment = fileOrItem?.comment ?? "";

        if (!rawFile || !(rawFile instanceof File)) {
          console.error("Upload skipped: no File instance (got)", rawFile);
          return false;
        }

        const formData = new FormData();
        formData.append("file", rawFile, rawFile.name);
        formData.append("session_id", currentSessionId);
        formData.append("comment", comment);

        const result = await apiService({
          endpoint: endpoints.uploadSourceMaterial,
          method: "POST",
          data: formData,
          // Do not set Content-Type: axios sets multipart/form-data with boundary for FormData
        });

        if (result.error) {
          console.error("Error uploading file:", result.error);
          toast.error(`Failed to upload file: ${rawFile.name}`);
          return false;
        } else {
          console.log("File uploaded successfully:", result.response);
          return true;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload source material file");
        return false;
      }
    },
    [sessionId],
  );

  const uploadWebLink = useCallback(
    async (entry) => {
      try {
        const currentSessionId =
          sessionId ||
          (typeof window !== "undefined"
            ? localStorage.getItem("sessionId")
            : null);

        const url = (entry?.url ?? "").trim();
        if (!url) return false;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          toast.error(
            `Invalid URL (must be http or https): ${url.slice(0, 50)}...`,
          );
          return false;
        }

        const formData = new FormData();
        formData.append("url", url);
        if (currentSessionId) formData.append("session_id", currentSessionId);
        const comment = (entry?.comment ?? "").trim();
        if (comment) formData.append("comment", comment);

        const result = await apiService({
          endpoint: endpoints.uploadSourceMaterialWebLink,
          method: "POST",
          data: formData,
        });

        if (result.error) {
          console.error("Error uploading web link:", result.error);
          toast.error(`Failed to save link: ${url.slice(0, 40)}...`);
          return false;
        } else {
          console.log("Web link uploaded successfully:", result.response);
          return true;
        }
      } catch (error) {
        console.error("Error uploading web link:", error);
        toast.error("Failed to save web link");
        return false;
      }
    },
    [sessionId],
  );

  const addSourceFiles = useCallback(
    (incomingFiles) => {
      const selectedFiles = Array.from(incomingFiles || []);
      if (selectedFiles.length === 0) return;

      const invalidFiles = selectedFiles.filter((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        return !SOURCE_ALLOWED_EXTENSIONS.includes(ext);
      });

      const invalidFileMessage =
        invalidFiles.length === 0
          ? null
          : invalidFiles.length === 1
            ? `Unsupported file type: ${invalidFiles.map((f) => f.name).join(", ")}.`
            : `Some files have unsupported types and were skipped: ${invalidFiles
                .map((f) => f.name)
                .join(", ")}.`;

      const filteredByType = selectedFiles.filter(
        (file) => !invalidFiles.includes(file),
      );
      if (filteredByType.length === 0) {
        if (invalidFileMessage) {
          toast.error(invalidFileMessage, {
            id: "source-material-invalid-types",
          });
        }
        return;
      }

      setFiles((prev) => {
        const { duplicateFiles, newFiles } = partitionNewSourceFiles(
          prev,
          filteredByType,
        );

        if (duplicateFiles.length > 0) {
          const duplicateNames = duplicateFiles.map((f) => f.name).join(", ");
          queueMicrotask(() => {
            toast.error(
              duplicateFiles.length === 1
                ? `"${duplicateNames}" is already uploaded`
                : `These files are already uploaded: ${duplicateNames}`,
              { id: "source-material-duplicate-names" },
            );
          });
        }

        if (newFiles.length === 0) {
          if (invalidFileMessage) {
            queueMicrotask(() => {
              toast.error(invalidFileMessage, {
                id: "source-material-invalid-types",
              });
            });
          }
          return prev;
        }

        queueMicrotask(() => {
          toast.success(
            newFiles.length === 1
              ? "Files attached and will be uploaded during outline creation."
              : "Files attached and will be uploaded during outline creation.",
            { id: "source-material-files-attached" },
          );

          if (invalidFileMessage) {
            setTimeout(() => {
              toast.error(invalidFileMessage, {
                id: "source-material-invalid-types",
              });
            }, 120);
          }
        });

        // Don't upload immediately — let the user add comments first.
        // Files will be uploaded when "Create Outline" is clicked (via uploadAllFiles).
        return dedupeFiles([
          ...prev,
          ...newFiles.map((file) => ({
            name: file.name,
            size: file.size,
            isUploaded: false,
            comment: "",
            file,
          })),
        ]);
      });
    },
    [setFiles],
  );

  const handleFileSelect = (event) => {
    addSourceFiles(event.target.files);
    event.target.value = "";
  };

  const resetDragState = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (![...event.dataTransfer.types].includes("Files")) return;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const next = event.relatedTarget;
      if (next && event.currentTarget.contains(next)) return;
      resetDragState();
    },
    [resetDragState],
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if ([...event.dataTransfer.types].includes("Files")) {
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetDragState();
      const dropped = event.dataTransfer?.files;
      if (!dropped?.length) return;
      addSourceFiles(dropped);
    },
    [addSourceFiles, resetDragState],
  );

  // Normalize: ensure each entry is { url, comment } (defined before useEffect that uses it)
  const normalizedUrls = Array.isArray(webpageUrls)
    ? webpageUrls.map((item) => normalizeWebLink(item))
    : [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.uploadAllFiles = async () => {
        const currentSessionId = sessionId || localStorage.getItem("sessionId");
        setIsUploading(true);
        onUploadingChange(true);
        try {
          const linksToUpload = dedupeWebLinks(normalizedUrls).filter(
            (entry) =>
              (entry?.url ?? "").trim().length > 0 && !entry.isUploaded,
          );
          let uploadedLinkCount = 0;
          let uploadedFileCount = 0;
          if (linksToUpload.length > 0 && currentSessionId) {
            const linkResults = await Promise.all(
              linksToUpload.map((entry) => uploadWebLink(entry)),
            );
            uploadedLinkCount = linkResults.filter(Boolean).length;
            const uploadedUrls = new Set(
              linksToUpload
                .filter((_, index) => linkResults[index])
                .map((entry) => entry.url.trim().toLowerCase()),
            );
            setWebpageUrls((prev) =>
              prev.map((entry) => {
                const normalized = normalizeWebLink(entry);
                const key = normalized.url.trim().toLowerCase();
                return uploadedUrls.has(key)
                  ? { ...normalized, isUploaded: true }
                  : normalized;
              }),
            );
          }

          // 2. Upload files that haven't been uploaded
          const newFiles = dedupeFiles(files).filter(
            (file) => !file.isUploaded,
          );
          if (newFiles.length > 0 && currentSessionId) {
            const fileResults = await Promise.all(
              newFiles.map((file) => uploadFile(file)),
            );
            uploadedFileCount = fileResults.filter(Boolean).length;
            // Mark files as uploaded so they aren't re-uploaded on next call
            setFiles((prev) =>
              prev.map((f) =>
                newFiles.some(
                  (newFile, index) =>
                    fileResults[index] &&
                    getFileKey(newFile.name) === getFileKey(f.name),
                )
                  ? { ...f, isUploaded: true }
                  : f,
              ),
            );
          } else if (newFiles.length === 0 && linksToUpload.length === 0) {
            console.log("No new files or links to upload");
          } else if (!currentSessionId) {
            console.warn("Cannot upload: no session ID");
          }

          if (uploadedFileCount > 0 || uploadedLinkCount > 0) {
            const successParts = [];
            if (uploadedFileCount > 0) {
              successParts.push(
                `${uploadedFileCount} file${uploadedFileCount === 1 ? "" : "s"}`,
              );
            }
            if (uploadedLinkCount > 0) {
              successParts.push(
                `${uploadedLinkCount} link${uploadedLinkCount === 1 ? "" : "s"}`,
              );
            }
            toast.success(
              `Source material uploaded: ${successParts.join(" and ")}.`,
            );
          }
        } finally {
          setIsUploading(false);
          onUploadingChange(false);
        }
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.uploadAllFiles;
      }
    };
  }, [files, sessionId, uploadFile, uploadWebLink, normalizedUrls]);

  const handleAddLink = () => {
    const url = linkDraft.url.trim();
    if (!url) return toast.error("Please enter a URL");
    if (!/^https?:\/\//i.test(url))
      return toast.error("URL must start with http:// or https://");
    if (
      normalizedUrls.some((e) => getWebLinkKey(e?.url) === getWebLinkKey(url))
    )
      return toast.error("This link is already added");

    setWebpageUrls([...normalizedUrls, { url, comment: "" }]);
    setLinkDraft({ url: "" });
    toast.success("Link attached. It will upload when you click Create Outline.", {
      id: "source-material-link-attached",
    });
  };

  const handleRemoveLink = (index) => {
    setWebpageUrls(normalizedUrls.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, field, value) => {
    if (field === "url") {
      const nextKey = getWebLinkKey(value);
      if (nextKey) {
        const isDuplicate = normalizedUrls.some(
          (entry, i) => i !== index && getWebLinkKey(entry?.url) === nextKey,
        );
        if (isDuplicate) {
          toast.error("This link is already added");
          return;
        }
      }
    }

    const updated = normalizedUrls.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry,
    );
    setWebpageUrls(updated);
  };

  const handleFileCommentChange = useCallback(
    (fileItem, value) => {
      setFiles((prev) =>
        prev.map((item) => {
          if (item === fileItem) {
            return { ...item, comment: value };
          }
          return item;
        }),
      );
    },
    [setFiles],
  );

  return (
    <Card className="border-none shadow-none p-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Source Materials
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col w-full border-2 border-gray-200 rounded-xl bg-gray-100 p-2 sm:p-2 gap-2">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors bg-white",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.pptx,.mp3,.wav,.m4a,.flac,.mp4,.webm"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="flex size-[42px] items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Image src="/upload.svg" alt="Icon" width={42} height={42} />
              </div>
              <span className="text-sm font-medium">Click to upload</span>
              <span className="text-xs text-muted-foreground">
                or drag and drop files here
              </span>
              <Button
                variant="outline"
                className={cn(
                  "flex items-center gap-2 border-primary text-primary cursor-pointer",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("file-upload").click();
                }}
              >
                <Plus />
                <span>Upload File</span>
              </Button>
            </label>
            {isUploading && (
              <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Uploading files...</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 bg-white p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#F4F4F5] shrink-0">
                <Link2 className="w-5 h-5 text-gray-500 rotate-[-45deg]" />
              </div>
              <input
                type="url"
                value={linkDraft.url}
                onChange={(e) =>
                  setLinkDraft((prev) => ({ ...prev, url: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
                className="flex-1 bg-white text-base border border-gray-200 rounded-xl px-4 h-11 outline-none placeholder:text-gray-400 focus:border-primary-400 min-w-0"
              />
              <button
                type="button"
                onClick={() => setLinkDraft({ url: "" })}
                className="flex items-center justify-center w-11 h-11 bg-[#EF4444] text-white rounded-xl hover:bg-red-600 transition-colors shrink-0"
                title="Clear link"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <Button
              type="button"
              onClick={handleAddLink}
              variant="outline"
              className="w-full h-11 border border-[#7C3AED] text-[#7C3AED] bg-transparent hover:bg-[#7C3AED]/5 rounded-xl text-[15px] font-medium shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5 mr-1" /> Add Link
            </Button>
          </div>
        </div>
      </CardContent>

      {(files?.length > 0 ||
        normalizedUrls.some(
          (entry) => (entry?.url ?? "").trim().length > 0,
        )) && (
        <CardContent className="mt-2 text-sm space-y-2 overflow-auto no-scrollbar">
          {files.map((file, index) => (
            <FilePreview
              file={file}
              setFiles={setFiles}
              files={files}
              onCommentChange={handleFileCommentChange}
              key={file.name || index}
            />
          ))}
          {normalizedUrls.map((entry, index) => {
            if (!(entry?.url ?? "").trim()) return null;
            return (
              <LinkPreview
                key={`link-${index}-${getWebLinkKey(entry.url)}`}
                entry={entry}
                onCommentChange={(value) =>
                  handleLinkChange(index, "comment", value)
                }
                onRemove={() => handleRemoveLink(index)}
              />
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

const LinkPreview = ({ entry, onCommentChange, onRemove }) => {
  const truncateUrl = (url, maxLength = 36) => {
    if (!url || url.length <= maxLength) return url || "";
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col bg-gray-100 rounded-xl p-1">
      <div className="flex flex-col border border-gray-200 bg-white rounded-xl">
        <CardContent className="flex items-center justify-between gap-2 p-4 rounded-xl">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="bg-primary-100 p-2 rounded-full shrink-0">
              <Link2 className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate" title={entry.url}>
                {truncateUrl(entry.url)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-gray-500 hover:text-gray-800 cursor-pointer"
              title="Remove link"
            >
              <CircleX className="w-4 h-4" />
            </button>
            <div className="shrink-0" aria-hidden="true" title="Saved">
              <Image
                src="/Verified Check.svg"
                alt="Verified"
                width={24}
                height={24}
              />
            </div>
          </div>
        </CardContent>
        <div className="m-2">
          <Input
            placeholder="Add comment..."
            className="w-full bg-background rounded-lg"
            value={entry.comment ?? ""}
            onChange={(e) => onCommentChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const FilePreview = ({ file, setFiles, files, onCommentChange }) => {
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return " ";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const truncateFileName = (name, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  const isUploaded = file.isUploaded === true;

  return (
    <div className="flex flex-col bg-gray-100  rounded-xl p-1">
      <div className="flex flex-col border border-gray-200 bg-white rounded-xl">
        <CardContent className=" flex items-center justify-between p-4  rounded-xl">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 text-white p-2 rounded-full">
              <Image src="/file.png" alt="File icon" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {truncateFileName(file.name)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex-shrink-0"
              aria-hidden="true"
              title="Upload complete"
            >
              <Image
                src="/Verified Check.svg"
                alt="Verified"
                width={24}
                height={24}
              />
            </div>

            {/* {!isUploaded && (
              <button
                onClick={() => setFiles(files.filter((f) => f !== file))}
                className="cursor-pointer hover:text-red-600 transition-colors"
              >
                <CircleX className="w-4 h-4 font-bold" />
              </button>
            )} */}
          </div>
        </CardContent>
        <div className="m-2">
          <Input
            placeholder="Add comment..."
            className="w-full bg-background rounded-lg"
            value={file.comment ?? ""}
            onChange={(e) => onCommentChange?.(file, e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
