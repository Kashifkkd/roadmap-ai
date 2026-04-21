import React, { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getSourceMaterials } from "@/api/getSourceMaterials";

import {
  Plus,
  Link2,
  Trash2,
  CircleX,
  Loader2,
  AlertTriangle,
  FileText,
  Info,
} from "lucide-react";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { resolveSourceMaterialLinkUrl } from "@/lib/sourceMaterialLinkUrl";
import { toast } from "@/components/ui/toast";

function normalizeWebLink(item, defaultUploaded = false) {
  const urlValue = item?.url ?? item?.webpage_url ?? "";
  const inferredPreviewMeta = inferLinkPreviewMeta(urlValue);

  if (typeof item === "string") {
    return {
      url: item,
      comment: "",
      isUploaded: defaultUploaded,
      ...inferLinkPreviewMeta(item),
    };
  }

  return {
    id: item?.id ?? item?.material_id ?? item?.source_material_id,
    url: urlValue,
    comment: item?.comment ?? "",
    isUploaded:
      typeof item?.isUploaded === "boolean" ? item.isUploaded : defaultUploaded,
    linkType: item?.linkType ?? inferredPreviewMeta.linkType,
    previewWarning:
      typeof item?.previewWarning === "string"
        ? item.previewWarning
        : inferredPreviewMeta.previewWarning,
  };
}

function extractSourceMaterialId(payload) {
  if (!payload) return null;
  if (typeof payload === "number") return payload;
  if (typeof payload?.id === "number") return payload.id;
  if (typeof payload?.material_id === "number") return payload.material_id;
  if (typeof payload?.source_material_id === "number") {
    return payload.source_material_id;
  }
  if (typeof payload?.response?.id === "number") return payload.response.id;
  return null;
}

function getWebLinkKey(url = "") {
  return url.trim().toLowerCase().replace(/\/+$/, "");
}

function getFileKey(name = "") {
  return name.trim().toLowerCase();
}

function inferLinkPreviewMeta(rawUrl = "") {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return { linkType: "web", previewWarning: "" };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const lowercasePathAndQuery = `${parsedUrl.pathname}${parsedUrl.search}`.toLowerCase();
    const pdfDetected =
      /\.pdf($|[?#])/i.test(lowercasePathAndQuery) ||
      parsedUrl.searchParams.get("format")?.toLowerCase() === "pdf";

    if (pdfDetected) {
      return { linkType: "pdf", previewWarning: "" };
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const hash = parsedUrl.hash.toLowerCase();
    const isHashRouteSpa = hash.startsWith("#/") || hash.startsWith("#!");
    const isLocalOrPrivateHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local");

    if (isLocalOrPrivateHost) {
      return {
        linkType: "web",
        previewWarning:
          "Preview is unlikely for local/private app URLs. Use a public URL or upload the file directly.",
      };
    }

    if (isHashRouteSpa) {
      return {
        linkType: "web",
        previewWarning:
          "This looks like a SPA hash route. Preview may fail because the content is rendered client-side.",
      };
    }
  } catch {
    return { linkType: "web", previewWarning: "" };
  }

  return { linkType: "web", previewWarning: "" };
}

function normalizeFileItem(item, defaultUploaded = false) {
  return {
    ...item,
    id: item?.id ?? item?.material_id ?? item?.source_material_id,
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
      id: existing.id ?? normalized.id,
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

const SOURCE_FORMATS_HOVER_TEXT =
  ".pdf, .docx, .pptx, .txt, .md, .mp3, .wav, .m4a, .flac, .mp4, .webm";

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
  const [isCheckingLinkPreview, setIsCheckingLinkPreview] = useState(false);
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
            const url = resolveSourceMaterialLinkUrl(material);
            if (url) {
              linkMaterials.push({
                id: material.id,
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
          return null;
        } else {
          console.log("File uploaded successfully:", result.response);
          return result.response ?? {};
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload source material file");
        return null;
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
        if (!url) return null;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          toast.error(
            `Invalid URL (must be http or https): ${url.slice(0, 50)}...`,
          );
          return null;
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
          return null;
        } else {
          console.log("Web link uploaded successfully:", result.response);
          return result.response ?? {};
        }
      } catch (error) {
        console.error("Error uploading web link:", error);
        toast.error("Failed to save web link");
        return null;
      }
    },
    [sessionId],
  );

  const deleteSourceMaterialById = useCallback(async (materialId) => {
    if (!materialId) return false;

    try {
      const result = await apiService({
        endpoint: endpoints.deleteSourceMaterial(materialId),
        method: "DELETE",
      });

      if (!result.success) {
        if (result.status === 404) {
          toast.error("Source material not found");
        } else {
          toast.error("Failed to delete source material");
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting source material:", error);
      toast.error("Failed to delete source material");
      return false;
    }
  }, []);

  const checkLinkPreviewability = useCallback(async (url) => {
    try {
      const result = await apiService({
        endpoint: endpoints.checkSourceMaterialLinkPreview,
        method: "GET",
        params: { url },
      });

      if (result.error) {
        return null;
      }

      return result.response ?? null;
    } catch (error) {
      console.error("Error checking link previewability:", error);
      return null;
    }
  }, []);

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
            const uploadedLinkMetaByKey = new Map();
            linkResults.forEach((result, index) => {
              const materialId = extractSourceMaterialId(result);
              if (!materialId) return;
              const key = getWebLinkKey(linksToUpload[index]?.url ?? "");
              if (key) uploadedLinkMetaByKey.set(key, materialId);
            });
            uploadedLinkCount = linkResults.filter(Boolean).length;
            setWebpageUrls((prev) =>
              prev.map((entry) => {
                const normalized = normalizeWebLink(entry);
                const key = getWebLinkKey(normalized.url);
                return key && linkResults.some((_, index) => getWebLinkKey(linksToUpload[index]?.url ?? "") === key && linkResults[index])
                  ? {
                      ...normalized,
                      isUploaded: true,
                      id: normalized.id ?? uploadedLinkMetaByKey.get(key),
                    }
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
            const uploadedFileMetaByKey = new Map();
            fileResults.forEach((result, index) => {
              const materialId = extractSourceMaterialId(result);
              const key = getFileKey(newFiles[index]?.name ?? "");
              if (materialId && key) uploadedFileMetaByKey.set(key, materialId);
            });
            // Mark files as uploaded so they aren't re-uploaded on next call
            setFiles((prev) =>
              prev.map((f) =>
                newFiles.some(
                  (newFile, index) =>
                    fileResults[index] &&
                    getFileKey(newFile.name) === getFileKey(f.name),
                )
                  ? {
                      ...f,
                      isUploaded: true,
                      id:
                        f.id ?? uploadedFileMetaByKey.get(getFileKey(f.name)),
                    }
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

  const handleAddLink = async () => {
    const url = linkDraft.url.trim();
    if (!url) return toast.error("Please enter a URL");
    if (!/^https?:\/\//i.test(url))
      return toast.error("URL must start with http:// or https://");
    if (
      normalizedUrls.some((e) => getWebLinkKey(e?.url) === getWebLinkKey(url))
    )
      return toast.error("This link is already added");

    let previewMeta = inferLinkPreviewMeta(url);
    if (!previewMeta.previewWarning) {
      setIsCheckingLinkPreview(true);
      const previewCheck = await checkLinkPreviewability(url);
      setIsCheckingLinkPreview(false);

      if (previewCheck?.is_pdf) {
        previewMeta = { ...previewMeta, linkType: "pdf", previewWarning: "" };
      } else if (previewCheck?.likely_previewable === false) {
        previewMeta = {
          ...previewMeta,
          previewWarning:
            "This link is likely not previewable in-app. Please use a different source link if preview is required.",
        };
      }
    }

    setWebpageUrls([...normalizedUrls, { url, comment: "", ...previewMeta }]);
    setLinkDraft({ url: "" });

    if (previewMeta.previewWarning) {
      toast.warning(previewMeta.previewWarning, {
        id: `source-material-preview-warning-${getWebLinkKey(url)}`,
      });
    }

    toast.success("Link attached. It will upload when you click Create Outline.", {
      id: "source-material-link-attached",
      description: "Link attached successfully."
    });
  };

  const handleRemoveLink = (index) => {
    const linkToRemove = normalizedUrls[index];
    if (!linkToRemove) return;

    const removeLocally = () =>
      setWebpageUrls((prev) => prev.filter((_, i) => i !== index));

    if (!linkToRemove.isUploaded || !linkToRemove.id) {
      removeLocally();
      return;
    }

    deleteSourceMaterialById(linkToRemove.id).then((deleted) => {
      if (!deleted) return;
      removeLocally();
      toast.success("Link source material deleted");
    });
  };

  const handleRemoveFile = useCallback(
    (fileToRemove, index) => {
      const removeLocally = () =>
        setFiles((prev) => prev.filter((_, i) => i !== index));

      if (!fileToRemove?.isUploaded || !fileToRemove?.id) {
        removeLocally();
        return;
      }

      deleteSourceMaterialById(fileToRemove.id).then((deleted) => {
        if (!deleted) return;
        removeLocally();
        toast.success("File source material deleted");
      });
    },
    [setFiles, deleteSourceMaterialById],
  );

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
      i === index
        ? field === "url"
          ? { ...entry, ...inferLinkPreviewMeta(value), [field]: value }
          : { ...entry, [field]: value }
        : entry,
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
              <span className="text-sm font-medium">Drag files here or click to upload</span>
              <span className="text-xs text-muted-foreground">
                Image, Document, Video & Audio Formats{" "}
                <span className="group relative inline-flex items-center align-middle">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="inline-flex cursor-default rounded-sm text-muted-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Supported file formats: ${SOURCE_FORMATS_HOVER_TEXT}`}
                  >
                    <Info size={14} className="shrink-0" aria-hidden />
                  </button>
                  <span
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-max max-w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 rounded-md bg-popover px-2 py-1.5 text-left text-[11px] leading-snug text-popover-foreground shadow-lg ring-1 ring-black/10 dark:ring-white/15",
                      "opacity-0 invisible transition-opacity duration-150",
                      "group-hover:visible group-hover:opacity-100",
                      "group-focus-within:visible group-focus-within:opacity-100",
                    )}
                  >
                    {SOURCE_FORMATS_HOVER_TEXT}
                  </span>
                </span>
                <br />
                Max Size: 50MB
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
              disabled={isCheckingLinkPreview}
              className="w-full h-11 border border-[#7C3AED] text-[#7C3AED] bg-transparent hover:bg-[#7C3AED]/5 rounded-xl text-[15px] font-medium shadow-sm transition-colors"
            >
              {isCheckingLinkPreview ? (
                <>
                  <Loader2 className="w-5 h-5 mr-1 animate-spin" /> Checking...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-1" /> Add Link
                </>
              )}
            </Button>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Note: Some websites do not allow in-app preview. If preview is
              blank, use Open link to view it in a new tab.
            </p>
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
              onCommentChange={handleFileCommentChange}
              onRemove={() => handleRemoveFile(file, index)}
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
      <div
        className={cn(
          "flex flex-col border bg-white rounded-xl",
          entry.previewWarning
            ? "border-amber-300 bg-amber-50/40"
            : "border-gray-200",
        )}
      >
        <CardContent className="flex items-center justify-between gap-2 p-4 rounded-xl">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="bg-primary-100 p-2 rounded-full shrink-0">
              {entry.linkType === "pdf" ? (
                <FileText className="w-5 h-5 text-primary-600" />
              ) : (
                <Link2 className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate" title={entry.url}>
                {truncateUrl(entry.url)}
              </span>
              {entry.linkType === "pdf" && (
                <span className="text-xs text-primary-700">PDF link detected</span>
              )}
              {entry.previewWarning && (
                <span className="text-xs text-amber-700 flex items-start gap-1 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-[1px]" />
                  <span>{entry.previewWarning}</span>
                </span>
              )}
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

const FilePreview = ({ file, onCommentChange, onRemove }) => {
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
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-gray-500 hover:text-gray-800 cursor-pointer"
              title="Remove file"
            >
              <CircleX className="w-4 h-4" />
            </button>
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
