"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  SquareKanban,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stack } from "@mui/material";
import DevicePreview from "./DevicePreview";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";

// Asset category buttons
const ASSET_CATEGORIES = [
  {
    id: "image",
    name: "Images & Graphic",
    icon: FileImage,
  },
  {
    id: "video",
    name: "Video and Animation",
    icon: FileVideo,
  },
  {
    id: "tool",
    name: "Tools",
    icon: FileIcon,
  },
];

// Filter assets by asset_type
function filterAssetsByType(assets, assetType) {
  if (!Array.isArray(assets) || assets.length === 0) return [];
  return assets.filter((asset) => {
    const type = asset?.asset_type?.toLowerCase() || "";
    return type === assetType.toLowerCase();
  });
}

export default function CometManagerSidebar({
  selectedScreen,
  onAddScreen,
  chapters = [],
  onChapterClick,
  sessionId,
  selectedStepId,
  setSelectedStep: setSelectedStepFromHook,
  onMaterialSelect,
  onAssetCategorySelect,
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
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState(null);

  // Filter assets by selected category
  const filteredAssets = useMemo(() => {
    if (!selectedAssetCategory) return [];
    return filterAssetsByType(assets, selectedAssetCategory);
  }, [assets, selectedAssetCategory]);

  useEffect(() => {
    if (selectedAssetCategory && onAssetCategorySelect) {
      const category = ASSET_CATEGORIES.find(
        (cat) => cat.id === selectedAssetCategory
      );
      if (category) {
        onAssetCategorySelect(category, filteredAssets);
      }
    }
  }, [filteredAssets, selectedAssetCategory, onAssetCategorySelect]);
  useEffect(() => {
    if (!selectedStepId) {
      return;
    }

    const chapterIndex = chapters.findIndex((chapter) =>
      Array.isArray(chapter.steps)
        ? chapter.steps.some((step) => step.id === selectedStepId)
        : false
    );

    if (chapterIndex === -1) {
      return;
    }

    const chapter = chapters[chapterIndex];
    const chapterId = chapter.id || `chapter-${chapterIndex}`;

    setSelectedChapter(chapterId);
    setExpandedChapters(new Set([chapterId]));
    setSelectedStep(selectedStepId);
    setExpandedSteps(new Set([selectedStepId]));
  }, [selectedStepId, chapters]);
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
    setSelectedStep(stepId);
    if (setSelectedStepFromHook) {
      setSelectedStepFromHook(stepId);
    }
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

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // categories
  const organizeMaterialsByCategory = (materials) => {
    const categories = [
      { id: "training-manuals", name: "Training Manuals", materials: [] },
      {
        id: "presentations",
        name: "Presentations & Slide Decks",
        materials: [],
      },
      { id: "other", name: "Other", materials: [] },
    ];

    materials.forEach((material) => {
      const extension =
        material.source_name?.split(".").pop()?.toLowerCase() || "";

      if (extension === "pdf") {
        // PDFs
        categories[0].materials.push(material);
      } else if (["ppt", "pptx", "key"].includes(extension)) {
        // Presentations
        categories[1].materials.push(material);
      } else {
        categories[2].materials.push(material);
      }
    });

    return categories.filter((cat) => cat.materials.length > 0);
  };

  const fetchSourceMaterialsData = useCallback(async () => {
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
        throw new Error(
          response.error?.message || "Failed to fetch source materials"
        );
      }

      if (response.response) {
        // Handle both array and object responses
        const materials = Array.isArray(response?.response)
          ? response.response
          : [];
        setSourceMaterials(materials);
        // console.log(">>> materials", materials);
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
  }, [sessionId]);
  const fetchAssetsData = useCallback(async () => {
    if (!sessionId) {
      setAssetsError("Session ID is required to fetch source materials");
      setIsLoadingAssets(false);
      return;
    }

    setIsLoadingAssets(true);
    setAssetsError(null);

    try {
      const response = await apiService({
        endpoint: endpoints.getAssets,
        method: "GET",
        params: {
          session_id: "80ee921a-2f4b-4611-80c2-649bae82467b",
        },
      });
      if (response.error) {
        throw new Error(response.error?.message || "Failed to fetch assets");
      }

      if (response.response) {
        const assetsData = response?.response?.assets || [];
        const materials = Array.isArray(assetsData) ? assetsData : [];
        setAssets(materials);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setAssetsError(error.message || "Failed to load assets");
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [sessionId]);

  // Fetch source materials when Sources tab is selected
  useEffect(() => {
    if (tab === 1 && sessionId) {
      fetchSourceMaterialsData();
    }
  }, [tab, sessionId, fetchSourceMaterialsData]);
  useEffect(() => {
    if (tab === 2 && sessionId) {
      fetchAssetsData();
    }
  }, [tab, sessionId, fetchAssetsData]);

  // Get material file size
  const getMaterialSize = (material) => {
    if (material.file_size) return formatFileSize(material.file_size);
    if (material.size) return formatFileSize(material.size);
    return null;
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
        <div className="flex items-center gap-1">
          <SquareKanban size={18} className="rotate-180 rounded-md" />
          {/* <Image src="/chart.svg" alt="Steps" width={16} height={16} /> */}
          <span className="text-xs sm:text-sm">Steps</span>
        </div>
      ),
    },
    {
      onClick: () => handleTabChange(1),
      children: (
        <div className="flex items-center gap-1">
          <File size={18} />
          <span className="text-xs sm:text-sm">Sources</span>
        </div>
      ),
    },
    {
      onClick: () => handleTabChange(2),
      children: (
        <div className="flex items-center gap-1">
          <Paperclip size={18} />
          <span className="text-xs sm:text-sm">Assets</span>
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
          className="bg-background rounded-xl w-full justify-between"
        >
          {buttons.map((button, index) => (
            <Button
              size="sm"
              variant="default"
              key={index}
              onClick={button.onClick}
              className={`text-xs sm:text-sm p-2 ${
                index === tab
                  ? "bg-primary text-background"
                  : "bg-background text-gray-400 hover:bg-primary-100 hover:text-primary shadow-none"
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
                    className={`flex flex-col border-2 border-gray-300 rounded-sm transition-all ${
                      isSelected && isExpanded ? "bg-primary-100" : "bg-white"
                    }`}
                  >
                    {/* Chapter Header */}
                    <div
                      onClick={() => {
                        setSelectedChapter(chapterId);
                        toggleChapter(chapterId);
                        // Clear step selection when clicking chapter
                        setSelectedStep(null);
                        if (setSelectedStepFromHook) {
                          setSelectedStepFromHook(null);
                        }
                        setExpandedSteps(new Set());
                        if (onChapterClick) {
                          onChapterClick(chapterId, chapter);
                        }
                      }}
                      className="flex items-center gap-2 p-3 sm:p-4 cursor-pointer transition-all"
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
                          } transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-gray-900">
                          Chapter {index + 1}
                        </p>
                        <p
                          className={`text-sm sm:text-sm font-medium ${
                            isSelected ? "text-gray-900" : "text-primary"
                          }`}
                        >
                          {chapter.chapter ||
                            chapter.name ||
                            "Untitled Chapter"}
                        </p>
                        {/* <p className="text-xs text-gray-500 mt-1">
                          {stepCount} {stepCount === 1 ? "step" : "steps"}
                        </p> */}
                      </div>
                    </div>

                    {/* Expanded Steps - Inside the same card */}
                    {isExpanded &&
                      chapter.steps &&
                      chapter.steps.length > 0 && (
                        <div className="flex flex-col gap-2 px-3 pb-3">
                          {chapter.steps.map((step, stepIndex) => {
                            // Create unique step ID that includes chapter index and step index
                            const stepId =
                              step.id || `step-${chapterId}-${stepIndex}`;
                            const isStepSelected = selectedStep === stepId;
                            const isStepExpanded = expandedSteps.has(stepId);
                            return (
                              <div
                                key={stepId}
                                className={`flex flex-col rounded-sm transition-all ${
                                  isStepExpanded
                                    ? "bg-primary-700"
                                    : isStepSelected
                                    ? "bg-primary-700"
                                    : "bg-gray-100"
                                }`}
                              >
                                {/* Step Header */}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStep(stepId);
                                    if (setSelectedStepFromHook) {
                                      setSelectedStepFromHook(stepId);
                                    }
                                  }}
                                  className={`flex items-center gap-2 p-2 sm:p-3 cursor-pointer transition-all ${
                                    isStepSelected || isStepExpanded
                                      ? "text-white"
                                      : "hover:bg-gray-200"
                                  }`}
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleStep(stepId);
                                    }}
                                    className={`rounded-full p-1 shrink-0 ${
                                      isStepSelected || isStepExpanded
                                        ? "bg-white"
                                        : "bg-primary-100"
                                    }`}
                                  >
                                    <ChevronDown
                                      size={12}
                                      className={`transition-transform ${
                                        isStepExpanded ? "rotate-180" : ""
                                      } ${
                                        isStepSelected || isStepExpanded
                                          ? "text-primary-700"
                                          : "text-primary"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex flex-col py-1 flex-1 min-w-0">
                                    <p
                                      className={`text-xs sm:text-xs  ${
                                        isStepSelected || isStepExpanded
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      Step {index + 1}.{stepIndex + 1}
                                    </p>
                                    <p
                                      className={`text-xs sm:text-sm font-semibold ${
                                        isStepSelected || isStepExpanded
                                          ? ""
                                          : ""
                                      } ${
                                        isStepSelected || isStepExpanded
                                          ? "text-white"
                                          : "text-gray-900"
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
                                            {step.name ||
                                              `Step ${stepIndex + 1}`}
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
          {tab === 1 &&
            (isLoadingSources ? (
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
              organizeMaterialsByCategory(sourceMaterials).map(
                (category, categoryIndex) => {
                  const categoryId = category.id || `category-${categoryIndex}`;
                  const isSelected = selectedCategory === categoryId;
                  const isExpanded = expandedCategories.has(categoryId);

                  return (
                    <>
                      <div
                        className="flex items-center justify-between px-2 
              bg-background rounded-md border border-gray-200 
              hover:border-primary-500"
                      >
                        <Search
                          className="w-5 h-5 text-gray-400 ml-2 
                hover:text-primary-400"
                        />
                        <input
                          type="search"
                          className="w-full p-1 focus:outline-none 
                  hover:border-primary-500"
                          placeholder="Search"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-h-0 justify-between gap-87">
                        <div
                          key={categoryId}
                          className={`flex flex-col border-2 border-gray-300 rounded-sm transition-all ${
                            isSelected && isExpanded
                              ? "bg-primary-100"
                              : "bg-white"
                          }`}
                        >
                          {/* Category Header */}
                          <div
                            onClick={() => {
                              setSelectedCategory(categoryId);
                              toggleCategory(categoryId);
                              // Clear material selection when clicking category
                              setSelectedMaterial(null);
                            }}
                            className="flex items-center gap-2 p-3 sm:p-4 cursor-pointer transition-all"
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
                                } transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <p
                                className={`text-sm sm:text-sm font-medium ${
                                  isSelected ? "text-gray-900" : "text-gray-900"
                                }`}
                              >
                                {category.name}
                              </p>
                            </div>
                          </div>

                          {/* Expanded Materials */}
                          {isExpanded &&
                            category.materials &&
                            category.materials.length > 0 && (
                              <div className="flex flex-col gap-2 px-3 pb-3">
                                {category.materials.map(
                                  (material, materialIndex) => {
                                    const materialId =
                                      material.id ||
                                      material.uuid ||
                                      `material-${categoryId}-${materialIndex}`;
                                    const isMaterialSelected =
                                      selectedMaterial === materialId;
                                    const fileSize = getMaterialSize(material);
                                    const extension =
                                      material.source_name
                                        ?.split(".")
                                        .pop()
                                        ?.toLowerCase() || "";
                                    const isPdf = extension === "pdf";

                                    return (
                                      <div
                                        key={materialId}
                                        className={`flex flex-col rounded-sm transition-all ${
                                          isMaterialSelected
                                            ? "bg-primary-700"
                                            : "bg-gray-100"
                                        }`}
                                      >
                                        {/* Material Header */}
                                        <div
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const newSelectedState =
                                              isMaterialSelected
                                                ? null
                                                : materialId;
                                            setSelectedMaterial(
                                              newSelectedState
                                            );

                                            if (
                                              newSelectedState &&
                                              selectedAssetCategory
                                            ) {
                                              setSelectedAssetCategory(null);
                                            }

                                            if (isPdf && onMaterialSelect) {
                                              onMaterialSelect(
                                                newSelectedState
                                                  ? material
                                                  : null
                                              );
                                            }
                                          }}
                                          className={`flex items-center gap-2 p-2 sm:p-3 cursor-pointer transition-all ${
                                            isMaterialSelected
                                              ? "text-white"
                                              : "hover:bg-gray-200"
                                          }`}
                                        >
                                          <div className="flex flex-col py-1 flex-1 min-w-0">
                                            {/* <p
                                            className={`text-xs sm:text-xs ${
                                              isMaterialSelected
                                                ? "text-white"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            Document {categoryIndex + 1}.
                                            {materialIndex + 1}
                                          </p> */}
                                            <p
                                              className={`text-xs sm:text-sm font-semibold truncate ${
                                                isMaterialSelected
                                                  ? "text-white"
                                                  : "text-gray-900"
                                              }`}
                                              title={
                                                material.source_name ||
                                                `Document ${materialIndex + 1}`
                                              }
                                            >
                                              {material.source_name ||
                                                `Document ${materialIndex + 1}`}
                                            </p>
                                            {fileSize && (
                                              <p
                                                className={`text-xs mt-0.5 ${
                                                  isMaterialSelected
                                                    ? "text-white"
                                                    : "text-gray-500"
                                                }`}
                                              >
                                                {fileSize || "123"}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                        </div>
                        <div className=" m-auto bottom-6 z-50 w-full shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex items-center gap-1 w-full"
                          >
                            <Plus size={16} />
                            Add Source
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                }
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-gray-500">
                  No source materials found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload documents to see them here
                </p>
              </div>
            ))}

          {/* Assets Tab Content */}
          {tab === 2 && (
            <div className="flex flex-1 flex-col">
              {isLoadingAssets ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading assets...
                </div>
              ) : assetsError ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-4">
                  <div className="rounded-full bg-red-50 p-3">
                    <Paperclip size={24} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Unable to load assets
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{assetsError}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAssetsData}
                    className="text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : assets.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                  <div className="rounded-full bg-primary-50 p-3">
                    <Paperclip size={24} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    No assets available yet
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Assets you upload or attach will appear here for quick reuse
                    across your Comet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-500 placeholder:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Category Buttons */}
                  <div className="flex flex-col gap-2">
                    {ASSET_CATEGORIES.map((category) => {
                      const isActive = selectedAssetCategory === category.id;
                      const categoryAssets = filterAssetsByType(
                        assets,
                        category.id
                      );
                      const assetCount = categoryAssets.length;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setSelectedAssetCategory(category.id);
                            // Clear material selection in sidebar when asset category is selected
                            // This prevents conflicts with the parent component's state
                            if (selectedMaterial) {
                              setSelectedMaterial(null);
                            }
                          }}
                          className={`flex flex-col gap-1 rounded-sm border px-4 py-3 text-left transition-all ${
                            isActive
                              ? "border-primary bg-primary-600 text-white shadow-md"
                              : "border-gray-300 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary-100/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center p-2 gap-2">
                              <span className="text-md font-semibold">
                                {category.name}
                              </span>
                            </div>
                            {/* <span
                              className={`text-xs font-medium ${
                                isActive ? "text-white/80" : "text-primary"
                              }`}
                            >
                              {assetCount}
                            </span> */}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
