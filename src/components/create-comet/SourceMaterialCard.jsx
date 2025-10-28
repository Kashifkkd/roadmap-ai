import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { FileIcon, MessageCircleMore, X, Check } from "lucide-react";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";

export default function SourceMaterialCard({ files, setFiles }) {
  const sessionId = localStorage.getItem("sessionId");

  const uploadFile = useCallback(
    async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("session_id", sessionId);

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

  const handleDrop = (acceptedFiles, fileRejections, event) => {
    if (acceptedFiles && Array.isArray(acceptedFiles)) {
      setFiles(acceptedFiles);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    console.log("Files selected:", selectedFiles.length);
    console.log("Session ID:", sessionId);
    setFiles(selectedFiles);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.uploadAllFiles = async () => {
        if (files && files.length > 0 && sessionId) {
          console.log("Uploading all files on submit...");
          for (const file of files) {
            await uploadFile(file);
          }
        } else if (files.length === 0) {
          console.log("No files to upload");
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
            <FileIcon className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Click to upload files or drag and drop
            </span>
            <span className="text-xs text-gray-500">
              PDF, DOC, DOCX, TXT (max 10MB each)
            </span>
          </label>
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
  const [openComment, setOpenComment] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col bg-muted p-1 rounded-xl">
      <CardContent className="bg-background flex items-center justify-between p-4 border rounded-xl">
        <div className="flex items-center gap-4">
          <div className="bg-accent text-primary p-2 rounded-full">
            <FileIcon className="w-6 h-6" fill="white" stroke="#746bda" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {truncateFileName(file.name)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatFileSize(file.size)})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="border p-1 rounded-full text-gray-500 hover:text-green-600 transition-colors">
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOpenComment(!openComment)}
            className="border p-1 rounded-full text-gray-500 hover:text-red-600 transition-colors"
          >
            <MessageCircleMore className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={() => setFiles(files.filter((f) => f !== file))}
            className="border p-1 rounded-full text-gray-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
      {openComment && (
        <div className="mt-1">
          <Textarea
            placeholder="Add comment..."
            className="w-full bg-background rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
