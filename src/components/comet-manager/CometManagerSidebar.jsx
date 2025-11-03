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
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";

export default function CometManagerSidebar({
  selectedScreen,
  onAddScreen,
  chapters = [],
  onChapterClick,
  sessionId,
}) {
  const [tab, setTab] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [expandedSteps, setExpandedSteps] = useState(new Set());

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

  const toggleStep = (stepId) => {
    setExpandedSteps((prev) => {
      const newSet = new Set();
      // If clicking on the same step that's already expanded, collapse it
      // Otherwise, expand only the clicked step (close others)
      if (!prev.has(stepId)) {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // Fetch source materials when Sources tab is selected
  useEffect(() => {
    if (tab === 1 && sessionId) {
      fetchSourceMaterialsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sessionId]);

  const fetchSourceMaterialsData = async () => {
    if (!sessionId) {
      setSourcesError("Session ID is required to fetch source materials");
      setIsLoadingSources(false);
      return;
    }

    setIsLoadingSources(true);
    setSourcesError(null);

    try {
      const response = await apiService({
        endpoint: endpoints.getSourceMaterials,
        method: "GET",
        params: {
          session_id: sessionId,
        },
      });

      if (response.error) {
        throw new Error(response.error?.message || "Failed to fetch source materials");
      }

      if (response.response) {
        // Handle both array and object responses
        const materials = Array.isArray(response?.response)
          ? response.response
          : [];
        setSourceMaterials(materials);
      } else {
        setSourceMaterials([]);
      }
    } catch (error) {
      console.error("Failed to fetch source materials:", error);
      setSourcesError(error.message || "Failed to load source materials");
      setSourceMaterials([]);
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
              className={`text-xs sm:text-sm ${index === tab
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
                  <div
                    key={chapterId}
                    className={`flex flex-col rounded-lg transition-all ${isSelected || isExpanded
                        ? "bg-primary-100"
                        : "bg-gray-50"
                      }`}
                  >
                    {/* Chapter Header */}
                    <div
                      onClick={() => {
                        setSelectedChapter(chapterId);
                        toggleChapter(chapterId);
                        // Clear step selection when clicking chapter
                        setSelectedStep(null);
                        setExpandedSteps(new Set());
                        if (onChapterClick) {
                          onChapterClick(chapterId, chapter);
                        }
                      }}
                      className="flex items-center gap-2 p-3 sm:p-4 cursor-pointer transition-all"
                    >
                      <div
                        className={`rounded-full p-1 ${isSelected ? "bg-primary" : "bg-primary-100"
                          }`}
                      >
                        <ChevronDown
                          size={16}
                          className={`${isSelected ? "text-white" : "text-primary"
                            } transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                      <div className="flex flex-col font-semibold flex-1 min-w-0">
                        <h2 className="text-xs text-gray-900">
                          Chapter {index + 1}
                        </h2>
                        <p
                          className={`text-sm sm:text-base truncate ${isSelected ? "text-primary" : "text-gray-800"
                            }`}
                        >
                          {chapter.chapter || chapter.name || "Untitled Chapter"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stepCount} {stepCount === 1 ? "step" : "steps"}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Steps - Inside the same card */}
                    {isExpanded && chapter.steps && chapter.steps.length > 0 && (
                      <div className="flex flex-col gap-2 px-3 pb-3">
                        {chapter.steps.map((step, stepIndex) => {
                          // Create unique step ID that includes chapter index and step index
                          const stepId = step.id || `step-${chapterId}-${stepIndex}`;
                          const isStepSelected = selectedStep === stepId;
                          const isStepExpanded = expandedSteps.has(stepId);
                          return (
                            <div
                              key={stepId}
                              className={`flex flex-col rounded-lg transition-all ${isStepSelected || isStepExpanded
                                  ? "bg-primary-700"
                                  : "bg-gray-100"
                                }`}
                            >
                              {/* Step Header */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Only select the clicked step, deselect others
                                  if (selectedStep === stepId && expandedSteps.has(stepId)) {
                                    // If clicking the same step that's already expanded, collapse it
                                    setSelectedStep(null);
                                    setExpandedSteps(new Set());
                                  } else {
                                    // Select new step and collapse others
                                    setSelectedStep(stepId);
                                    // Close all other expanded steps, only expand the clicked one
                                    setExpandedSteps(new Set([stepId]));
                                  }
                                }}
                                className={`flex items-center gap-2 p-2 sm:p-3 cursor-pointer transition-all ${isStepSelected || isStepExpanded
                                    ? "text-white"
                                    : "hover:bg-gray-200"
                                  }`}
                              >
                                <div
                                  className={`rounded-full p-1 shrink-0 ${isStepSelected || isStepExpanded ? "bg-white" : "bg-primary-100"
                                    }`}
                                >
                                  <ChevronDown
                                    size={12}
                                    className={`transition-transform ${isStepExpanded ? "rotate-180" : ""
                                      } ${isStepSelected || isStepExpanded ? "text-primary-700" : "text-primary"
                                      }`}
                                  />
                                </div>
                                <div className="flex flex-col font-medium flex-1 min-w-0">
                                  <p
                                    className={`text-xs sm:text-sm truncate ${isStepSelected || isStepExpanded ? "text-white" : "text-gray-900"
                                      }`}
                                  >
                                    Step {index + 1}.{stepIndex + 1}
                                  </p>
                                  <p
                                    className={`text-xs sm:text-sm font-semibold truncate ${isStepSelected || isStepExpanded ? "text-white" : "text-gray-900"
                                      }`}
                                  >
                                    {step.name || `Step ${stepIndex + 1}`}
                                  </p>
                                </div>
                              </div>

                              {/* Step Details (Expanded) - Inside the same card */}
                              {isStepExpanded && (
                                <div className="px-2 pb-2">
                                  <div className="px-3 py-3 bg-white rounded-lg">
                                    <div className="flex flex-col gap-2">
                                      <div>
                                        <h4 className="text-sm font-semibold text-black mb-1">
                                          {step.name || `Step ${stepIndex + 1}`}
                                        </h4>
                                        {step.description && (
                                          <p className="text-xs text-black leading-relaxed">
                                            {step.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
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
