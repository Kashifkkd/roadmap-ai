import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { FileIcon, MessageCircleMore, X, Check } from "lucide-react";

export default function SourceMaterialCard({ files, setFiles }) {
  const handleDrop = (acceptedFiles, fileRejections, event) => {
    if (acceptedFiles && Array.isArray(acceptedFiles)) {
      setFiles(acceptedFiles);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

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
