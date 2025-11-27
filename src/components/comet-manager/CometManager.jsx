"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  File,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  GripVertical,
  PanelsTopLeft,
  BarChart3,
  Columns,
  MessageSquare,
  FileQuestion,
  X,
  Users,
  Target,
  Menu,
  Expand,
  Maximize2,
  ExpandIcon,
  FileImage,
  FileVideo,
  FileIcon,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SCREEN_TYPE_CONSTANTS } from "@/types/comet-manager";
import { useCometManager } from "@/hooks/useCometManager";
import { useCometSettings } from "@/contexts/CometSettingsContext";
import CometManagerSidebar from "./CometManagerSidebar";
import DynamicForm from "./DynamicForm";
import ScreenCard from "./ScreenCard";
import AddScreenPopup from "./AddScreenPopup";
import DevicePreview from "./DevicePreview";
import FromDoerToEnabler from "./FromDoerToEnabler";
import PDFPreview from "./PDFPreview";
import ImagePreview from "./ImagePreview";
import CometSettingsDialog from "./CometSettingsDialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Grouped screen types for Add dialog
const SCREEN_TYPE_GROUPS = [
  {
    group: "Content & Learning",
    items: [
      {
        id: "content",
        name: "Content",
        icon: <PanelsTopLeft size={20} />,
        color: "bg-blue-100 border-blue-300",
        description: "Text, images, and embedded media.",
      },
    ],
  },
  {
    group: "Polls & Surveys",
    items: [
      {
        id: "multiple_choice",
        name: "Multiple Choice/Survey",
        icon: <Columns size={20} />,
        color: "bg-purple-100 border-purple-300",
        description: "Select one or more options.",
      },
      {
        id: "force_question",
        name: "Force Question",
        icon: <Target size={20} />,
        color: "bg-yellow-100 border-yellow-300",
        description: "Rearrange responses.",
      },
      {
        id: "linear_poll",
        name: "Linear Poll",
        icon: <BarChart3 size={20} />,
        color: "bg-green-100 border-green-300",
        description: "Slider based rating.",
      },
      {
        id: "assessment",
        name: "Assessment",
        icon: <FileQuestion size={20} />,
        color: "bg-red-100 border-red-300",
        description: "Quizzes or graded questions.",
      },
    ],
  },
  {
    group: "Prompts",
    items: [
      {
        id: "reflection",
        name: "Reflection",
        icon: <MessageSquare size={20} />,
        color: "bg-orange-100 border-orange-300",
        description: "Open-ended prompts.",
      },
      {
        id: "action",
        name: "Action",
        icon: <Columns size={20} />,
        color: "bg-indigo-100 border-indigo-300",
        description: "To-do items or practical exercises.",
      },
      {
        id: "discussion",
        name: "Discussion",
        icon: <Users size={20} />,
        color: "bg-teal-100 border-teal-300",
        description: "Peer conversations, group prompts.",
      },
      {
        id: "habits",
        name: "Habits",
        icon: <Eye size={20} />,
        color: "bg-gray-100 border-gray-300",
        description: "Step-by-step tasks.",
      },
    ],
  },
];

const EASE_CATEGORIES = ["Engagement", "Aha", "Support", "Execution"];

export default function CometManager({
  sessionData,
  setAllMessages,
  isPreviewMode,
  setIsPreviewMode,
  onOutlineChange,
  isAskingKyper = false,
  setIsAskingKyper = () => {},
}) {
  // Use comet manager hook to get actual data
  const {
    isLoading,
    screens,
    allScreens,
    chapters,
    selectedStepId,
    setSelectedStep,
    updateScreen: updateScreenData,
    addScreen: addScreenData,
    deleteScreen: deleteScreenData,
    reorderScreensList,
    insertScreenAt,
    outline,
    setOutline,
  } = useCometManager(sessionData);

  useEffect(() => {
    if (onOutlineChange && outline !== null) {
      onOutlineChange(outline);
    }
  }, [outline, onOutlineChange]);

  // Extract session_id from sessionData or temp
  const sessionId =
    sessionData?.session_id ||
    (typeof window !== "undefined" && localStorage.getItem("sessionId")) ||
    null;

  const [currentScreen, setCurrentScreen] = useState(0);
  const [selectedScreenId, setSelectedScreenId] = useState(null); // Store ID instead of object
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addAtIndex, setAddAtIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Track active tab: 0=Steps, 1=Sources, 2=Assets
  const { isCometSettingsOpen, setIsCometSettingsOpen } = useCometSettings();
  const selectedScreenRef = useRef(null);

  // Derive selectedScreen from screens array using selectedScreenId - always has latest data
  const selectedScreen = useMemo(() => {
    if (!selectedScreenId || !screens || screens.length === 0) return null;
    return screens.find((screen) => screen.id === selectedScreenId) || null;
  }, [selectedScreenId, screens]);
  // console.log("selectedScreen", selectedScreen);

  // Select first screen by default when screens are first loaded
  useEffect(() => {
    if (!screens || screens.length === 0) return;

    // If no screen is selected, select the first one
    if (!selectedScreenId) {
      const firstScreen = screens[0];
      if (firstScreen && firstScreen.id) {
        setSelectedScreenId(firstScreen.id);
      }
      return;
    }

    // If selected screen is no longer in the screens array, select the first one
    const selectedScreenExists = screens.some(
      (screen) => screen.id === selectedScreenId
    );
    if (!selectedScreenExists) {
      const firstScreen = screens[0];
      if (firstScreen && firstScreen.id) {
        setSelectedScreenId(firstScreen.id);
      }
    }
  }, [screens, selectedScreenId]);

  // Update currentScreen index when selectedScreenId changes
  useEffect(() => {
    if (!selectedScreenId || !screens || screens.length === 0) {
      if (currentScreen !== 0) {
        setCurrentScreen(0);
      }
      return;
    }

    const screenIndex = screens.findIndex(
      (screen) => screen.id === selectedScreenId
    );
    if (screenIndex >= 0 && currentScreen !== screenIndex) {
      setCurrentScreen(screenIndex);
    }
  }, [selectedScreenId, screens]);

  // Ensure the selected screen is visible in the horizontal list
  // useEffect(() => {
  //   const target = selectedScreenRef.current;
  //   if (target && typeof target.scrollIntoView === "function") {
  //     target.scrollIntoView({
  //       behavior: "smooth",
  //       inline: "center",
  //       block: "nearest",
  //     });
  //   }
  // }, [currentScreen, selectedScreen]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newScreens = [...screens];
    const draggedScreen = newScreens[draggedIndex];
    newScreens.splice(draggedIndex, 1);
    newScreens.splice(dropIndex, 0, draggedScreen);

    reorderScreensList(newScreens);
    setDraggedIndex(null);
  };

  // selected chapter for header
  const currentChapter = Array.isArray(chapters)
    ? chapters.find((chapter) => chapter.id === selectedScreen?.chapterId)
    : null;

  const handleScreenClick = (screen) => {
    setSelectedMaterial(null);
    // Clear selected material when screen is clicked
    setSelectedAssetCategory(null);
    setSelectedAssets([]);
    setSelectedImageAsset(null);
    setActiveTab(0);
    setSelectedScreenId(screen.id);
    const screenIndex = screens.findIndex((s) => s.id === screen.id);
    setCurrentScreen(screenIndex);
  };

  const handleAddScreen = (insertIndex = null) => {
    setAddAtIndex(insertIndex);
    setShowAddPopup(true);
  };

  const handleAddNewScreen = (screenType) => {
    // Get current chapter and step
    const targetChapter = currentChapter || chapters[0] || null;
    const targetChapterId =
      targetChapter?.id || chapters[0]?.id || "#chapter_1";

    // Get step ID - use selectedStepId if available, otherwise get first step from chapter
    let targetStepId = selectedStepId;
    if (
      !targetStepId &&
      targetChapter?.steps &&
      targetChapter.steps.length > 0
    ) {
      targetStepId = targetChapter.steps[0].id;
    }
    if (!targetStepId) {
      targetStepId = "#step_1";
    }

    // Generate screen ID -  like #screen_2_2
    const chapterNum =
      targetChapter?.order !== undefined
        ? targetChapter.order + 1
        : chapters.findIndex(
            (ch) => String(ch.id) === String(targetChapterId)
          ) + 1 || 1;
    const stepNum =
      targetChapter?.steps?.findIndex(
        (step) => String(step.id) === String(targetStepId)
      ) + 1 || 1;
    const screenNum =
      allScreens.filter(
        (s) =>
          String(s.chapterId) === String(targetChapterId) &&
          String(s.stepId) === String(targetStepId)
      ).length + 1;
    const screenId = `#screen_${chapterNum}_${stepNum}_${screenNum}`;
    const screenContentId = `#screen_content_${chapterNum}_${stepNum}_${screenNum}`;

    // Get position - count screens in the same step
    const position =
      allScreens.filter((s) => String(s.stepId) === String(targetStepId))
        .length + 1;

    // Map screenType.id to contentType
    const contentTypeMap = {
      content: "content",
      multiple_choice: "mcq",
      force_question: "force_rank",
      linear_poll: "linear",
      assessment: "assessment",
      reflection: "reflection",
      action: "action",
      discussion: "social_discussion",
      habits: "habits",
    };

    const contentType = contentTypeMap[screenType.id] || screenType.id;

    // Initialize screen based on type
    let newScreen = {};

    if (screenType.id === "action") {
      // Action screen structure
      const actionTitle = "";
      const actionText = "";

      newScreen = {
        id: screenId,
        screenType: "action",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "action",
          content: {
            title: actionTitle,
            text: actionText,
            can_scheduled: true,
            can_complete_now: true,
            reply_count: 0,
            votescount: 0,
            tool_link: "",
            image_url: "",
            reflection_prompt: "",
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: actionTitle,
        formData: {
          actionTitle: actionTitle,
          actionDescription: actionText,
          actionCanSchedule: true,
          actionCanCompleteImmediately: true,
          actionHasReflectionQuestion: false,
          actionToolLink: "",
          actionToolPrompt: "",
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "content") {
      // Content screen structure
      const contentTitle = "";
      newScreen = {
        id: screenId,
        screenType: "content",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "content",
          content: {
            heading: contentTitle,
            body: "",
            media: {
              type: "",
              url: "",
              alt: "",
            },
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: contentTitle,
        formData: {
          contentSimpleTitle: contentTitle,
          contentSimpleDescription: "",
          contentMediaLink: "",
          contentFullBleed: false,
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "multiple_choice") {
      // Multiple Choice/Survey screen structure
      const mcqTitle = "";
      newScreen = {
        id: screenId,
        screenType: "multiple_choice",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "mcq",
          content: {
            title: mcqTitle,
            question: mcqTitle,
            top_label: "",
            bottom_label: "",
            key_learning: "",
            options: [],
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: mcqTitle,
        formData: {
          mcqTitle: mcqTitle,
          question: mcqTitle,
          mcqTopLabel: "",
          mcqBottomLabel: "",
          mcqKeyLearning: "",
          mcqOptions: [],
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "force_question") {
      // Force Rank screen structure
      const forceRankTitle = "";
      newScreen = {
        id: screenId,
        screenType: "force_question",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "force_rank",
          content: {
            title: forceRankTitle,
            high_label: "",
            low_label: "",
            key_learning: "",
            options: [],
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: forceRankTitle,
        formData: {
          pollTitle: forceRankTitle,
          topLabel: "",
          bottomLabel: "",
          keyLearning: "",
          mcqOptions: [],
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "linear_poll") {
      // Linear Poll screen structure
      const linearTitle = "";
      newScreen = {
        id: screenId,
        screenType: "linear_poll",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "linear",
          content: {
            title: linearTitle,
            high_label: "",
            low_label: "",
            key_learning: "",
            lowerscale: 1,
            higherscale: 10,
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: linearTitle,
        formData: {
          linearTitle: linearTitle,
          linearTopLabel: "",
          linearBottomLabel: "",
          linearKeyLearning: "",
          linearScaleMin: 1,
          linearScaleMax: 10,
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "assessment") {
      // Assessment screen structure
      const assessmentTitle = "";
      newScreen = {
        id: screenId,
        screenType: "assessment",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "assessment",
          content: {
            title: assessmentTitle,
            questions: [],
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: assessmentTitle,
        formData: {
          assessmentTitle: assessmentTitle,
          assessmentQuestions: [],
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "reflection") {
      // Reflection screen structure
      const reflectionTitle = "";
      newScreen = {
        id: screenId,
        screenType: "reflection",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "reflection",
          content: {
            title: reflectionTitle,
            prompt: "",
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: reflectionTitle,
        formData: {
          reflectionTitle: reflectionTitle,
          reflectionPrompt: "",
          reflectionDescription: "",
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "discussion") {
      // Social Discussion screen structure
      const discussionTitle = "";
      newScreen = {
        id: screenId,
        screenType: "discussion",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "social_discussion",
          content: {
            title: discussionTitle,
            question: "",
            posts: [],
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: discussionTitle,
        formData: {
          socialTitle: discussionTitle,
          discussionQuestion: "",
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "habits") {
      // Habits screen structure
      const habitsTitle = "";
      newScreen = {
        id: screenId,
        screenType: "habits",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "habits",
          content: {
            title: habitsTitle,
            habit_image: {
              url: "",
              description: "",
            },
            enabled: false,
            habits: [],
          },
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: habitsTitle,
        formData: {
          title: habitsTitle,
          description: "",
          url: "",
          habitsIsMandatory: false,
          habits: [],
        },
        assessment: null,
        order: allScreens.length,
      };
    } else {
      // Default structure for unknown screen types (fallback)
      newScreen = {
        id: screenId,
        screenType: screenType.id,
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: contentType,
          content: {},
        },
        assets: [],
        image_status: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: "",
        formData: {},
        assessment: null,
        order: allScreens.length,
      };
    }

    if (addAtIndex !== null) {
      insertScreenAt(newScreen, addAtIndex);
    } else {
      addScreenData(newScreen);
    }

    setShowAddPopup(false);
    setAddAtIndex(null);
    setSelectedScreenId(newScreen.id);
    setCurrentScreen(addAtIndex !== null ? addAtIndex : screens.length);
  };

  const navigateScreen = (direction) => {
    if (direction === "prev" && currentScreen > 0) {
      const newIndex = currentScreen - 1;
      setCurrentScreen(newIndex);
      if (screens[newIndex]) {
        setSelectedScreenId(screens[newIndex].id);
      }
    } else if (direction === "next" && currentScreen < screens.length - 1) {
      const newIndex = currentScreen + 1;
      setCurrentScreen(newIndex);
      if (screens[newIndex]) {
        setSelectedScreenId(screens[newIndex].id);
      }
    }
  };

  const chapterNumber =
    typeof currentChapter?.position === "number"
      ? currentChapter.position
      : chapters.findIndex(
          (ch) => String(ch.id) === String(selectedScreen?.chapterId)
        ) + 1 || 1;

  const stepNumber =
    (currentChapter?.steps?.findIndex(
      (step) => String(step.id) === String(selectedScreen?.stepId)
    ) ?? -1) + 1 || 1;

  return (
    <div className="flex flex-col w-full bg-background rounded-xl h-full relative">
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading comet data...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row overflow-hidden rounded-xl h-full gap-2 p-2 lg:p-2">
            <div className="bg-background rounded-xl w-full lg:w-1/3 xl:w-1/4 h-auto lg:h-full overflow-hidden shrink-0">
              <CometManagerSidebar
                selectedScreen={selectedScreen}
                onAddScreen={handleAddScreen}
                chapters={chapters}
                sessionId={sessionId}
                selectedStepId={selectedStepId}
                setSelectedStep={setSelectedStep}
                externalTab={activeTab}
                onMaterialSelect={(material) => {
                  setSelectedMaterial(material);
                  // Clear selected screen and assets when material is selected
                  if (material) {
                    setSelectedScreenId(null);
                    setSelectedAssetCategory(null);
                    setSelectedAssets([]);
                    setSelectedImageAsset(null);
                  }
                }}
                onAssetCategorySelect={(category, assets) => {
                  setSelectedAssetCategory(category);
                  setSelectedAssets(assets || []);
                  // Clear selected screen and material when assets are selected
                  setSelectedScreenId(null);
                  setSelectedMaterial(null);
                  setSelectedImageAsset(null);
                }}
                onTabChange={(tabIndex) => {
                  setActiveTab(tabIndex);
                  // Clear all selections when tab changes
                  setSelectedMaterial(null);
                  setSelectedAssetCategory(null);
                  setSelectedAssets([]);
                  setSelectedImageAsset(null);
                }}
                onStepClick={(stepId, step) => {}}
                onChapterClick={(chapterId, chapter) => {
                  // Clear material and assets when chapter is clicked
                  setSelectedMaterial(null);
                  setSelectedAssetCategory(null);
                  setSelectedAssets([]);
                  setSelectedImageAsset(null);
                  setActiveTab(0);
                  // Filter screens for this chapter (use allScreens to get screens from all steps)
                  const chapterScreens = allScreens.filter(
                    (s) => s.chapterId === chapterId
                  );
                  if (chapterScreens.length > 0) {
                    // Find the first screen's index in the filtered screens array
                    const firstScreen = chapterScreens[0];
                    const screenIndex = screens.findIndex(
                      (s) => s.id === firstScreen.id
                    );
                    if (screenIndex >= 0) {
                      setSelectedScreenId(firstScreen.id);
                      setCurrentScreen(screenIndex);
                    } else {
                      // If screen is not in current filtered screens, select the first step of the chapter
                      const firstStep = chapter.steps?.[0];
                      if (firstStep) {
                        setSelectedStep(firstStep.id);
                        // The screens will update via useEffect, then we can select the first screen
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Right section - main content */}
            <div className="flex flex-col w-full lg:w-2/3 xl:w-3/4 h-full overflow-hidden min-w-0 bg-primary-50 rounded-xl ">
              <div className="flex flex-col  flex-1 overflow-hidden">
                {/* Show Image Preview if image is selected*/}
                {selectedImageAsset ? (
                  <div className="flex-1 overflow-hidden p-4">
                    <ImagePreview
                      asset={selectedImageAsset}
                      category={selectedAssetCategory}
                      onClose={() => setSelectedImageAsset(null)}
                    />
                  </div>
                ) : selectedAssetCategory && selectedAssets ? (
                  <div className="flex-1 overflow-hidden p-4">
                    <div className="flex flex-col h-full gap-4">
                      {/* Header */}
                      <div className="shrink-0">
                        <h2 className="text-lg font-semibold text-gray-900 capitalize">
                          {selectedAssetCategory.name}
                        </h2>
                      </div>

                      {/* Assets Grid */}
                      {selectedAssets.length > 0 ? (
                        <div className="flex-1 bg-white p-6 rounded-md overflow-y-auto">
                          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {selectedAssets.map((asset) => {
                              const assetType =
                                asset?.asset_type?.toLowerCase() || "";
                              const assetUrl = asset?.asset_url || "";
                              const isImage = assetType === "image";

                              // Get file name from URL
                              const getFileNameFromUrl = (url) => {
                                if (!url) return "Untitled Asset";
                                const urlPath = url.split("?")[0];
                                const fileName = urlPath.split("/").pop();
                                return fileName || "Untitled Asset";
                              };

                              const assetName = getFileNameFromUrl(assetUrl);

                              // Get icon based on asset type
                              const getIcon = () => {
                                if (assetType === "image") return FileImage;
                                if (assetType === "video") return FileVideo;
                                return FileIcon;
                              };

                              const FileIconComponent = getIcon();

                              return (
                                <div
                                  key={asset.id}
                                  className="flex flex-col overflow-hidden bg-white cursor-pointer hover:shadow-lg transition-shadow"
                                  onClick={() => {
                                    if (isImage && assetUrl) {
                                      setSelectedImageAsset(asset);
                                    }
                                  }}
                                >
                                  <div className="relative h-50 w-full bg-primary-50">
                                    {isImage && assetUrl ? (
                                      <img
                                        src={assetUrl}
                                        alt={assetName}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary">
                                        <FileIconComponent size={32} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 p-3">
                                    <span className="text-sm font-semibold text-gray-900 line-clamp-2">
                                      {assetName}
                                    </span>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span className="capitalize">
                                        {assetType || "file"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">
                              No assets found in this category
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedMaterial ? (
                  <div className="flex-1 overflow-hidden p-4">
                    <PDFPreview
                      material={selectedMaterial}
                      sessionId={sessionId}
                      onClose={() => setSelectedMaterial(null)}
                    />
                  </div>
                ) : activeTab === 0 ? (
                  <>
                    {selectedScreen && chapters && (
                      <div className="shrink-0 p-3 ml-4 sm:p-4 flex justify-between items-center rounded-t-2xl">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-sm sm:text-md font-bold text-gray-900 truncate">
                            {currentChapter?.chapter ||
                              currentChapter?.name ||
                              "Untitled Chapter"}
                          </h2>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-primary">
                              {selectedScreen.title || "Untitled Chapter"}
                            </span>
                            {/* <span className="text-xs text-primary truncate">
                              {selectedScreen.name || "Untitled Step"}
                            </span> */}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedScreen.thumbnail ? (
                            <img
                              src={selectedScreen.thumbnail}
                              alt={selectedScreen.title || "Untitled Chapter"}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                              {/* <FileImage className="w-5 h-5 text-muted-foreground" /> */}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Scrollable children container */}
                    <div className="overflow-y-auto p-2 sm:p-3 no-scrollbar flex flex-col gap-2 flex-1">
                      {/* Navigation - Screens */}
                      <div className="bg-background rounded-md p-2 sm:p-3 shrink-0">
                        <div className="flex flex-col gap-3 w-full">
                          <div className="flex items-start gap-2 w-full h-fit overflow-x-auto no-scrollbar -mx-2 px-2">
                            <div className="flex items-start gap-2 sm:gap-2 px-1">
                              {screens.map((screen, index) => (
                                <div
                                  key={screen.id}
                                  ref={
                                    index === currentScreen
                                      ? selectedScreenRef
                                      : null
                                  }
                                >
                                  <ScreenCard
                                    screen={screen}
                                    selectedScreen={selectedScreen}
                                    index={index}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={handleScreenClick}
                                    onAddScreen={(insertIndex) =>
                                      handleAddScreen(insertIndex)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Navigation controls */}
                          <div className="w-full flex justify-between items-center gap-2">
                            <button
                              onClick={() => navigateScreen("prev")}
                              disabled={currentScreen === 0}
                              className="p-2 bg-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Previous screen"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {/* Selected screen name */}
                            {selectedScreen && (
                              <div className="flex items-center gap-2 min-w-0 flex-1 justify-center px-2">
                                <p className="text-xs sm:text-sm font-semibold text-center truncate">
                                  Screen {currentScreen + 1} -{" "}
                                  {selectedScreen.name}
                                </p>
                              </div>
                            )}
                            <button
                              onClick={() => navigateScreen("next")}
                              disabled={currentScreen === screens.length - 1}
                              className="p-2 bg-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Next screen"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Form */}
                      {selectedScreen && (
                        <div className="shrink-0">
                          <DynamicForm
                            key={selectedScreen.id}
                            screen={selectedScreen}
                            sessionData={sessionData}
                            setAllMessages={setAllMessages}
                            setOutline={setOutline}
                            onClose={() => setSelectedScreenId(null)}
                            chapterNumber={chapterNumber}
                            stepNumber={stepNumber}
                            isAskingKyper={isAskingKyper}
                            setIsAskingKyper={setIsAskingKyper}
                          />
                        </div>
                      )}

                      {/* {selectedScreen && (
                        <div className="shrink-0 p-4 bg-white rounded-lg overflow-auto max-h-full">
                          <h1>hellllo</h1>
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(
                              selectedScreen?.screenContents,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )} */}
                    </div>
                  </>
                ) : activeTab === 1 ? (
                  <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center">
                      <File size={48} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a Source Material
                      </h3>
                      <p className="text-sm text-gray-500">
                        Choose a document from the sidebar to preview it here
                      </p>
                    </div>
                  </div>
                ) : activeTab === 2 ? (
                  <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center">
                      <Paperclip
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select an Asset Category
                      </h3>
                      <p className="text-sm text-gray-500">
                        Choose a category from the sidebar to view assets
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Add Screen Popup */}
      <AddScreenPopup
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onAddScreen={handleAddNewScreen}
        screenTypeGroups={SCREEN_TYPE_GROUPS}
      />
      {/* Comet Settings Dialog */}
      <CometSettingsDialog
        open={isCometSettingsOpen}
        onOpenChange={setIsCometSettingsOpen}
      />
      {/* Preview Drawer */}
      <Drawer
        direction="right"
        open={isPreviewMode}
        onOpenChange={(open) => {
          setIsPreviewMode(open);
          if (!open) setIsMaximized(false);
        }}
      >
        <DrawerContent
          className={`${
            isMaximized
              ? "w-screen! sm:w-[90vw]! md:w-[70vw]! lg:w-[50vw]! xl:max-w-4xl!"
              : "w-screen! sm:w-[90vw]! md:w-[70vw]! lg:w-[50vw]! xl:max-w-4xl!"
          } max-w-none! h-screen! bg-primary-50 p-0`}
        >
          {/* Preview Header */}
          <div className="bg-primary-50 border-b border-gray-200 py-2 px-3 sm:px-4 flex items-center justify-between">
            <h3 className="text-base sm:text-[1.125rem] font-bold text-gray-900">
              Preview
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 sm:p-1 hover:bg-gray-200 cursor-pointer rounded border border-black transition-colors"
                aria-label={isMaximized ? "Minimize" : "Maximize"}
              >
                <ExpandIcon size={14} className="text-black stroke-[2.5]" />
              </button>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="p-1.5 sm:p-1 hover:bg-gray-200 cursor-pointer rounded transition-colors"
                aria-label="Close preview"
              >
                <X
                  size={18}
                  className="sm:w-5 sm:h-5 text-black stroke-[2.5]"
                />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div
            className={`flex-1 overflow-hidden border-lg bg-primary-50 ${
              isMaximized ? "p-0 sm:p-2 md:p-3" : "p-0 sm:p-2 md:p-3"
            }`}
          >
            <FromDoerToEnabler
              selectedScreen={selectedScreen}
              isMaximized={isMaximized}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
