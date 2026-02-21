import React, { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getSourceMaterials } from "@/api/getSourceMaterials";

import { Plus, CircleX, Link2, Trash2, ExternalLink } from "lucide-react";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SourceMaterialCard({
  files,
  setFiles,
  isNewComet = false,
  webpageUrls = [],
  setWebpageUrls = () => {},
}) {
  const [sessionId, setSessionId] = useState(null);

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

        setFiles(fileMaterials);
        if (linkMaterials.length > 0) {
          setWebpageUrls(linkMaterials);
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
          return;
        }

        const rawFile = fileOrItem?.file ?? fileOrItem;
        const comment = fileOrItem?.comment ?? "";

        if (!rawFile || !(rawFile instanceof File)) {
          console.error("Upload skipped: no File instance (got)", rawFile);
          return;
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
        } else {
          console.log("File uploaded successfully:", result.response);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
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
        if (!url) return;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          toast.error(`Invalid URL (must be http or https): ${url.slice(0, 50)}...`);
          return;
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
        } else {
          console.log("Web link uploaded successfully:", result.response);
        }
      } catch (error) {
        console.error("Error uploading web link:", error);
        toast.error("Failed to save web link");
      }
    },
    [sessionId],
  );

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);

    // Check for duplicate file
    const existingFile = new Set(files.map((f) => f.name));
    const duplicateFiles = selectedFiles.filter((file) =>
      existingFile.has(file.name),
    );

    if (duplicateFiles.length > 0) {
      const duplicateNames = duplicateFiles.map((f) => f.name).join(", ");
      toast.error(
        duplicateFiles.length === 1
          ? `"${duplicateNames}" is already uploaded`
          : `These files are already uploaded: ${duplicateNames}`,
      );
    }

    const newFiles = selectedFiles.filter(
      (file) => !existingFile.has(file.name),
    );

    if (newFiles.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...newFiles.map((f) => ({
          name: f.name,
          size: f.size,
          isUploaded: false,
          comment: "",
          file: f,
        })),
      ]);
    }

    // Reset the input so the same file can be selected again if needed
    event.target.value = "";
  };

  // Normalize: ensure each entry is { url, comment } (defined before useEffect that uses it)
  const normalizedUrls = Array.isArray(webpageUrls)
    ? webpageUrls.map((item) =>
        typeof item === "string"
          ? { url: item, comment: "" }
          : { url: item?.url ?? "", comment: item?.comment ?? "" }
      )
    : [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.uploadAllFiles = async () => {
        const currentSessionId = sessionId || localStorage.getItem("sessionId");

        // 1. Upload web links (entries with non-empty URL)
        const linksToUpload = normalizedUrls.filter(
          (entry) => (entry?.url ?? "").trim().length > 0,
        );
        if (linksToUpload.length > 0 && currentSessionId) {
          await Promise.all(linksToUpload.map((entry) => uploadWebLink(entry)));
        }

        // 2. Upload files that haven't been uploaded
        const newFiles = files.filter((file) => !file.isUploaded);
        if (newFiles.length > 0 && currentSessionId) {
          await Promise.all(newFiles.map((file) => uploadFile(file)));
        } else if (newFiles.length === 0 && linksToUpload.length === 0) {
          console.log("No new files or links to upload");
        } else if (!currentSessionId) {
          console.warn("Cannot upload: no session ID");
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
    setWebpageUrls([...normalizedUrls, { url: "", comment: "" }]);
  };

  const handleRemoveLink = (index) => {
    setWebpageUrls(normalizedUrls.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, field, value) => {
    const updated = normalizedUrls.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setWebpageUrls(updated);
  };

  const handleFileCommentChange = useCallback((fileItem, value) => {
    setFiles((prev) =>
      prev.map((item) => {
        if (item === fileItem) {
          if (item.file !== undefined) return { ...item, comment: value };
          return {
            name: item.name,
            size: item.size,
            isUploaded: false,
            comment: value,
            file: item,
          };
        }
        return item;
      })
    );
  }, [setFiles]);

  return (
    <Card className="border-none shadow-none p-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Source Materials
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col w-full border-2 border-gray-200 rounded-xl bg-gray-100 p-2 sm:p-2 gap-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors bg-white">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
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
          </div>
          <div className="flex flex-col gap-3 bg-white p-2 rounded-lg">
            {normalizedUrls.map((entry, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 flex-shrink-0">
                    <Link2 className="w-4 h-4 text-primary-500" />
                  </div>
                  <input
                    type="url"
                    placeholder="Paste link here"
                    value={entry.url}
                    onChange={(e) =>
                      handleLinkChange(index, "url", e.target.value)
                    }
                    title={entry.url || "Source link URL"}
                    className="flex-1 bg-white text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none placeholder:text-gray-400 focus:border-primary-400 min-w-0"
                  />
                  {entry.url &&
                    (entry.url.startsWith("http://") ||
                      entry.url.startsWith("https://")) && (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                        title="Open link in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
                    title="Remove link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Add a comment (optional)"
                  value={entry.comment}
                  onChange={(e) =>
                    handleLinkChange(index, "comment", e.target.value)
                  }
                  className="w-full bg-white text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none placeholder:text-gray-400 focus:border-primary-400"
                />
              </div>
            ))}

            <Button
              type="button"
              onClick={handleAddLink}
              className="w-full border-primary text-white bg-primary"
            >
              + Add Link
            </Button>
          </div>
        </div>
      </CardContent>

      {files && files.length > 0 && (
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
        </CardContent>
      )}
    </Card>
  );
}

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
            <div className="bg-accent text-primary p-2 rounded-full">
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
            <button className="cursor-pointer hover:text-green-600 transition-colors">
              <Image
                src="/Verified Check.svg"
                alt="Verified"
                width={24}
                height={24}
              />
              {/* <BadgeCheck className="w-6 h-6 font-bold text-green-600 " /> */}
            </button>

            {!isUploaded && (
              <button
                onClick={() => setFiles(files.filter((f) => f !== file))}
                className="cursor-pointer hover:text-red-600 transition-colors"
              >
                <CircleX className="w-4 h-4 font-bold" />
              </button>
            )}
          </div>
        </CardContent>
        <div className="m-2">
          <Input
            placeholder="Add comment..."
            className="w-full bg-background rounded-lg"
            value={file.comment ?? ""}
            onChange={(e) =>
              onCommentChange?.(file, e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};
