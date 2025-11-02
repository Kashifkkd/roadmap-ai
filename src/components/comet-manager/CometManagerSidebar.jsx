"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  File,
  ChevronDown,
  Paperclip,
  FileText,
  Download,
  Loader2,
  FileImage,
  FileVideo,
  FileAudio,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stack } from "@mui/material";
import DevicePreview from "./DevicePreview";

export default function CometManagerSidebar({
  selectedScreen,
  onAddScreen,
  chapters = [],
  onChapterClick,
}) {
  const [tab, setTab] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  // Source materials state
  const [sourceMaterials, setSourceMaterials] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [sourcesError, setSourcesError] = useState(null);

  const handleTabChange = (index) => {
    setTab(index);
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // Fetch source materials when Sources tab is selected
  useEffect(() => {
    if (tab === 1) {
      fetchSourceMaterialsData();
    }
  }, [tab]);

  const fetchSourceMaterialsData = async () => {
    setIsLoadingSources(true);
    setSourcesError(null);

    try {
      // Mock data for now - replace with actual API call
      const mockMaterials = [
        {
          id: 1,
          source_name: "document.pdf",
          uuid: "abc12345-def6-7890-ghij-klmnopqrstuv",
          source_path: "/path/to/document.pdf",
          output_presigned_url: "https://example.com/processed/document.pdf",
        },
        {
          id: 2,
          source_name: "image.jpg",
          uuid: "xyz98765-4321-0987-wxyz-abcdefghijkl",
          source_path: "/path/to/image.jpg",
          output_presigned_url: "https://example.com/processed/image.jpg",
        },
      ];
      setSourceMaterials(mockMaterials);
    } catch (error) {
      console.error("Failed to fetch source materials:", error);
      setSourcesError(error.message || "Failed to load source materials");
    } finally {
      setIsLoadingSources(false);
    }
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file type icon
  const getFileIcon = (fileName) => {
    if (!fileName) return FileText;

    const extension = fileName.split(".").pop()?.toLowerCase();
    if (!extension) return FileText;

    // PDF files
    if (extension === "pdf") return FileIcon;

    // Image files
    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)
    ) {
      return FileImage;
    }

    // Video files
    if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(extension)
    ) {
      return FileVideo;
    }

    // Audio files
    if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(extension)) {
      return FileAudio;
    }

    // Document files
    if (["doc", "docx", "txt", "rtf"].includes(extension)) {
      return FileText;
    }

    return FileText;
  };

  const buttons = [
    {
      onClick: () => handleTabChange(0),
      children: (
        <div className="flex items-center gap-2">
          <File size={16} />
          Steps
        </div>
      ),
    },
    {
      onClick: () => handleTabChange(1),
      children: (
        <div className="flex items-center gap-2">
          <File size={16} />
          Sources
        </div>
      ),
    },
    {
      onClick: () => handleTabChange(2),
      children: (
        <div className="flex items-center gap-2">
          <Paperclip size={16} />
          Assets
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full p-2 gap-2 h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex justify-between w-full rounded-xl shrink-0">
        <Stack
          direction="row"
          className="bg-background rounded-xl w-full gap-1 sm:gap-2 justify-between"
        >
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={button.onClick}
              className={`text-xs sm:text-sm ${
                index === tab
                  ? "bg-primary text-background"
                  : "bg-background text-gray-400 hover:bg-primary hover:text-background shadow-none"
              }`}
            >
              {button.children}
            </Button>
          ))}
        </Stack>
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-2 bg-primary-50 p-2 rounded-xl flex-1 overflow-auto">
        <div className="flex flex-col gap-2">
          {/* Steps Tab Content */}
          {tab === 0 &&
            (chapters && chapters.length > 0 ? (
              chapters.map((chapter, index) => {
                const chapterId = chapter.id || `chapter-${index}`;
                const stepCount = chapter.steps?.length || 0;
                const isSelected = selectedChapter === chapterId;
                const isExpanded = expandedChapters.has(chapterId);

                return (
                  <div key={chapterId} className="flex flex-col gap-2">
                    {/* Chapter Header */}
                    <div
                      onClick={() => {
                        setSelectedChapter(chapterId);
                        toggleChapter(chapterId);
                        if (onChapterClick) {
                          onChapterClick(chapterId, chapter);
                        }
                      }}
                      className={`flex items-center gap-2 p-3 sm:p-4 bg-white border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div
                        className={`rounded-full p-1 ${
                          isSelected ? "bg-primary" : "bg-primary-100"
                        }`}
                      >
                        <ChevronDown
                          size={16}
                          className={`${
                            isSelected ? "text-white" : "text-primary"
                          } transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                      <div className="flex flex-col font-semibold flex-1 min-w-0">
                        <h2 className="text-xs text-gray-900">
                          Chapter {index + 1}
                        </h2>
                        <p
                          className={`text-sm sm:text-base truncate ${
                            isSelected ? "text-primary" : "text-gray-800"
                          }`}
                        >
                          {chapter.chapter || chapter.name || "Untitled Chapter"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stepCount} {stepCount === 1 ? "step" : "steps"}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Steps */}
                    {isExpanded && chapter.steps && chapter.steps.length > 0 && (
                      <div className="flex flex-col gap-2 ml-4">
                        {chapter.steps.map((step, stepIndex) => {
                          const stepId = step.id || `step-${index}-${stepIndex}`;
                          return (
                            <div
                              key={stepId}
                              className="flex items-center gap-2 p-2 sm:p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-gray-400"
                            >
                              <div className="rounded-full p-1.5 bg-gray-100 shrink-0">
                                <File size={14} className="text-gray-600" />
                              </div>
                              <div className="flex flex-col font-medium flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-900 truncate">
                                  {step.name || `Step ${stepIndex + 1}`}
                                </p>
                                {step.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {step.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-gray-500">No chapters available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Complete the outline to see chapters here
                </p>
              </div>
            ))}

          {/* Sources Tab Content */}
          {tab === 1 && (
            <>
              {/* Sources Header with Refresh */}
              <div className="flex items-center justify-between p-2 bg-background rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <span className="text-sm font-medium text-gray-900">
                    Source Materials ({sourceMaterials.length})
                  </span>
                </div>
                <Button
                  onClick={fetchSourceMaterialsData}
                  variant="ghost"
                  size="sm"
                  disabled={isLoadingSources}
                  className="p-1 h-auto"
                >
                  {isLoadingSources ? (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  ) : (
                    <FileText
                      size={14}
                      className="text-gray-400 hover:text-primary"
                    />
                  )}
                </Button>
              </div>

              {isLoadingSources ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">
                    Loading source materials...
                  </p>
                </div>
              ) : sourcesError ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-sm text-red-500 mb-2">
                    Error loading source materials
                  </p>
                  <p className="text-xs text-gray-400 mb-4">{sourcesError}</p>
                  <Button
                    onClick={fetchSourceMaterialsData}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              ) : sourceMaterials && sourceMaterials.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {sourceMaterials.map((material, index) => {
                    const FileIcon = getFileIcon(material.source_name);
                    return (
                      <div
                        key={material.id || index}
                        className="flex items-center gap-3 p-3 bg-background border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="rounded-full p-2 bg-primary-100">
                          <FileIcon size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p
                            className="text-sm font-medium text-gray-900 truncate"
                            title={
                              material.source_name || `Document ${index + 1}`
                            }
                          >
                            {material.source_name || `Document ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {material.source_name
                              ?.split(".")
                              .pop()
                              ?.toUpperCase() || "Unknown type"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {material.uuid?.substring(0, 8)}...
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "Download original material:",
                                material
                              );
                              if (material.source_path) {
                                // Create a temporary link to download the file
                                const link = document.createElement("a");
                                link.href = material.source_path;
                                link.download =
                                  material.source_name || "download";
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            title="Download original file"
                          >
                            <Download
                              size={14}
                              className="text-gray-400 hover:text-primary"
                            />
                          </Button>
                          {material.output_presigned_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "View processed content:",
                                  material
                                );
                                window.open(
                                  material.output_presigned_url,
                                  "_blank"
                                );
                              }}
                              title="View processed text content"
                            >
                              <FileText
                                size={14}
                                className="text-gray-400 hover:text-primary"
                              />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="rounded-full p-3 bg-gray-100 mb-3">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No source materials found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload documents to see them here
                  </p>
                </div>
              )}
            </>
          )}

          {/* Assets Tab Content */}
          {tab === 2 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="rounded-full p-3 bg-gray-100 mb-3">
                <Paperclip size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No assets available</p>
              <p className="text-xs text-gray-400 mt-1">
                Assets will appear here when available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Device Preview */}
      {/* <div className="shrink-0 p-2 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
          <DevicePreview selectedScreen={selectedScreen} />
        </div>
      </div> */}
    </div>
  );
}
