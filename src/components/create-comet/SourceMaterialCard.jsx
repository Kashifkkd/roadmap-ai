import React, { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getSourceMaterials } from "@/api/getSourceMaterials";

import { Plus, CircleX } from "lucide-react";
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
        const uploadedMaterials = materials.map((material) => ({
          name: material.source_name || "Unknown File",
          isUploaded: true,
        }));

        setFiles(uploadedMaterials);
      }
    } catch (error) {
      console.error("Error fetching source materials:", error);
    }
  }, [sessionId, setFiles]);

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
    async (file) => {
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

        const formData = new FormData();
        formData.append("file", file);
        formData.append("session_id", currentSessionId);

        const result = await apiService({
          endpoint: endpoints.uploadSourceMaterial,
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
    [sessionId]
  );

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);

    // Check for duplicate file
    const existingFile = new Set(files.map((f) => f.name));
    const duplicateFiles = selectedFiles.filter((file) =>
      existingFile.has(file.name)
    );

    if (duplicateFiles.length > 0) {
      const duplicateNames = duplicateFiles.map((f) => f.name).join(", ");
      toast.error(
        duplicateFiles.length === 1
          ? `"${duplicateNames}" is already uploaded`
          : `These files are already uploaded: ${duplicateNames}`
      );
    }

    const newFiles = selectedFiles.filter(
      (file) => !existingFile.has(file.name)
    );

    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }

    // Reset the input so the same file can be selected again if needed
    event.target.value = "";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.uploadAllFiles = async () => {
        // Only upload files that haven't been uploaded
        const newFiles = files.filter((file) => !file.isUploaded);

        // Get sessionId from state or localStorage
        const currentSessionId = sessionId || localStorage.getItem("sessionId");

        if (newFiles.length > 0 && currentSessionId) {
          console.log("newfiles>>>>>>>>>>", newFiles.length);
          await Promise.all(newFiles.map((file) => uploadFile(file)));
        } else if (newFiles.length === 0) {
          console.log("No new files to upload");
        } else {
          console.warn("Cannot upload: no session ID");
        }
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.uploadAllFiles;
      }
    };
  }, [files, sessionId, uploadFile]);

  return (
    <Card className="border-none shadow-none p-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Source Materials
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col w-full border-2 border-gray-200 rounded-xl bg-gray-100 p-2 sm:p-2">
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
                  "flex items-center gap-2 border-primary text-primary cursor-pointer"
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
        </div>
      </CardContent>

      {files && files.length > 0 && (
        <CardContent className="mt-2 text-sm space-y-2 overflow-auto no-scrollbar">
          {files.map((file, index) => (
            <FilePreview
              file={file}
              setFiles={setFiles}
              files={files}
              key={file.name || index}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

const FilePreview = ({ file, setFiles, files }) => {
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

            {!file.isUploaded && (
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
          />
        </div>
      </div>
    </div>
  );
};
