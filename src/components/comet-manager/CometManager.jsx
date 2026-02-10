"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  User,
  Mail,
  Target,
  Menu,
  Expand,
  Maximize2,
  ExpandIcon,
  FileImage,
  FileVideo,
  FileIcon,
  Paperclip,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { graphqlClient } from "@/lib/graphql-client";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";
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
import VideoPreview from "./VideoPreview";
import CometSettingsDialog from "./CometSettingsDialog";
import GenerateStepImageButton from "./GenerateStepImageButton";
import UploadStepImageDialog from "./UploadStepImageDialog";
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
      {
        id: "profile",
        name: "Profile",
        icon: <User size={20} />,
        color: "bg-violet-100 border-violet-300",
        description: "Heading, body, and profile photo upload.",
      },
      {
        id: "path_personalization",
        name: "Path Personalization",
        icon: <Sparkles size={20} />,
        color: "bg-pink-100 border-pink-300",
        description: "Personalize path with heading, body, and media.",
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
  {
    group: "Email",
    items: [
      {
        id: "manager_email",
        name: "Manager Email",
        icon: <Mail size={20} />,
        color: "bg-sky-100 border-sky-300",
        description: "Prompt user to add manager email.",
      },
      {
        id: "accountability_partner_email",
        name: "Accountability Partner Email",
        icon: <Mail size={20} />,
        color: "bg-amber-100 border-amber-300",
        description: "Prompt user to add accountability partner email.",
      },
    ],
  },
];

const EASE_CATEGORIES = ["Engagement", "Aha", "Support", "Execution"];

export default function CometManager({
  sessionData,
  setSessionData = () => {},
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
    reorderChapters,
    insertScreenAt,
    outline,
    setOutline,
  } = useCometManager(sessionData);
  console.log("screens >>>>>>>>>>>>>>>>>>>>>>>", screens);

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
  const [selectedVideoAsset, setSelectedVideoAsset] = useState(null);
  const [selectedToolAsset, setSelectedToolAsset] = useState(null);
  const [selectedRemainingChapter, setSelectedRemainingChapter] =
    useState(null);
  const [scrollToStepIndex, setScrollToStepIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Track active tab: 0=Steps, 1=Sources, 2=Assets
  const { isCometSettingsOpen, setIsCometSettingsOpen } = useCometSettings();
  const selectedScreenRef = useRef(null);
  const remainingChapterStepsRef = useRef(null);
  const isAskingKyperRef = useRef(false);
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false);

  useEffect(() => {
    isAskingKyperRef.current = isAskingKyper;
  }, [isAskingKyper]);

  // Next Chapter state
  const router = useRouter();
  const [isGeneratingNextChapter, setIsGeneratingNextChapter] = useState(false);
  const [nextChapterError, setNextChapterError] = useState(null);
  const [isAnalyzingTextCollapsed, setIsAnalyzingTextCollapsed] =
    useState(false);
  const [showNextChapter, setShowNextChapter] = useState(true);
  // Bump when session updates (subscription) so DynamicForm remounts and shows fresh data
  const [sessionUpdateKey, setSessionUpdateKey] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const shouldOpen =
        localStorage.getItem("openCometSettingsFromAllComets") === "true";
      if (shouldOpen) {
        setIsCometSettingsOpen(true);
        localStorage.removeItem("openCometSettingsFromAllComets");
      }
    } catch {}
  }, [setIsCometSettingsOpen]);
  useEffect(() => {
    const outline = sessionData?.response_outline;
    const path = sessionData?.response_path;

    let outlineCount = 0;
    let pathCount = 0;

    // outline count
    if (Array.isArray(outline)) {
      outlineCount = outline.length;
    } else if (Array.isArray(outline?.chapters)) {
      outlineCount = outline.chapters.length;
    } else if (outline && typeof outline === "object") {
      outlineCount = Object.keys(outline).length;
    }

    // path count
    if (Array.isArray(path?.chapters)) {
      pathCount = path.chapters.length;
    } else if (Array.isArray(path)) {
      pathCount = path.length;
    }

    // hide button if path >= outline
    if (outlineCount > 0 && pathCount >= outlineCount) {
      setShowNextChapter(false);
    } else {
      setShowNextChapter(true);
    }
  }, [sessionData]);

  // Bump sessionUpdateKey when sessionData changes (subscription or chat response)
  // so DynamicForm remounts and shows fresh data. Skip initial load.
  const prevSessionDataRef = useRef(undefined);
  useEffect(() => {
    if (sessionData == null) return;
    if (prevSessionDataRef.current === undefined) {
      prevSessionDataRef.current = sessionData;
      return;
    }
    if (prevSessionDataRef.current !== sessionData) {
      prevSessionDataRef.current = sessionData;
      setSessionUpdateKey((k) => k + 1);
    }
  }, [sessionData]);

  // Subscribe to session updates - persistent subscription for comet-manager
  // This will reuse the existing subscription if one exists
  useSessionSubscription(
    sessionId,
    (updatedSessionData) => {
      try {
        localStorage.setItem("sessionData", JSON.stringify(updatedSessionData));
        setSessionData(updatedSessionData);
        const hasPathUpdate = Boolean(
          updatedSessionData?.response_path?.chapters?.length,
        );
        if (isAskingKyperRef.current && hasPathUpdate) {
          setIsAskingKyper(false);
        }
      } catch {}
    },
    (err) => {
      console.error("Subscription error:", err);
      if (isGeneratingNextChapter) {
        setNextChapterError(err?.message || "Subscription failed");
        setIsGeneratingNextChapter(false);
      }
      if (isAskingKyperRef.current) {
        setIsAskingKyper(false);
      }
    },
  );

  // Scroll to step in remaining chapter panel when step is clicked in sidebar
  useEffect(() => {
    if (scrollToStepIndex !== null && remainingChapterStepsRef.current) {
      const stepElement = document.getElementById(
        `remaining-step-${scrollToStepIndex}`,
      );
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [scrollToStepIndex]);

  // Handle Next Chapter click
  const handleNextChapter = async () => {
    try {
      setNextChapterError(null);
      setIsGeneratingNextChapter(true);

      // Ensure session exists
      let currentSessionId = sessionId || localStorage.getItem("sessionId");
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem("sessionId", currentSessionId);
        const cometJson = sessionResponse.createSession.cometJson;
        if (cometJson) {
          try {
            localStorage.setItem(
              "sessionData",
              JSON.stringify(JSON.parse(cometJson)),
            );
          } catch {}
        }
      }

      // Get parsed session data
      let parsedSessionData = null;
      try {
        const raw = localStorage.getItem("sessionData");
        if (raw) parsedSessionData = JSON.parse(raw);
      } catch {}

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "continued_chapter_creation",
        comet_creation_data: parsedSessionData?.comet_creation_data || {},
        enabled_attributes: parsedSessionData?.enabled_attributes || {},
        // additional_data: {

        //   personalization_enabled:
        //     parsedSessionData?.additional_data?.personalization_enabled ||
        //     false,
        //   habit_enabled:
        //     parsedSessionData?.additional_data?.habit_enabled || false,
        //   habit_description:
        //     parsedSessionData?.additional_data?.habit_description || "",
        // },

        response_outline: parsedSessionData?.response_outline || {},
        response_path: parsedSessionData?.response_path || {},
        chatbot_conversation: parsedSessionData?.chatbot_conversation || [],
        to_modify: {},
      });

      await graphqlClient.sendMessage(cometJsonForMessage);
      console.log("Next Chapter - cometJsonForMessage sent");
    } catch (error) {
      console.error("Error in handleNextChapter:", error);
      setNextChapterError(error?.message || "Unexpected error");
      setIsGeneratingNextChapter(false);
    }
  };

  // Derive selectedScreen from screens array using selectedScreenId - always has latest data
  const selectedScreen = useMemo(() => {
    if (!selectedScreenId || !screens || screens.length === 0) return null;
    return screens.find((screen) => screen.id === selectedScreenId) || null;
  }, [selectedScreenId, screens]);
  console.log("selectedScreen", selectedScreen);

  // Select first screen by default when screens are first loaded
  useEffect(() => {
    console.log("screen is not selected");
    console.log("screens >>>>>>>>>>>>>>>>>>>>>>>", screens);
    if (!screens || screens.length === 0) return;

    console.log("selectedScreenId >>>>>>>>>>>>>>>>>>>>>>>", selectedScreenId);

    // If no screen is selected, select the first one
    if (!selectedScreenId) {
      console.log("no screen is selected, selecting the first one");
      const firstScreen = screens[0];
      if (firstScreen && firstScreen.id) {
        setSelectedScreenId(firstScreen.id);
      }
      return;
    }
    console.log("selectedScreenId >>>>>>>>>>>>>>>>>>>>>>>", selectedScreenId);

    // If selected screen is no longer in the screens array, select the first one
    const selectedScreenExists = screens.some(
      (screen) => screen.id === selectedScreenId,
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
      (screen) => screen.id === selectedScreenId,
    );
    if (screenIndex >= 0 && currentScreen !== screenIndex) {
      setCurrentScreen(screenIndex);
    }
  }, [selectedScreenId, screens]);

  // Ensure the selected screen is visible in the horizontal list
  useEffect(() => {
    const target = selectedScreenRef.current;
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentScreen]);

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

  const currentChapter =
    chapters?.find((ch) =>
      ch.steps?.some((step) => String(step.id) === String(selectedStepId)),
    ) || null;

  const handleScreenClick = (screen) => {
    setSelectedMaterial(null);
    // Clear selected material when screen is clicked
    setSelectedAssetCategory(null);
    setSelectedAssets([]);
    setSelectedImageAsset(null);
    setSelectedVideoAsset(null);
    setSelectedToolAsset(null);
    setSelectedRemainingChapter(null);
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
    console.log("targetStepId>>>>>>>>>>>>>>>>>>>>>>>>", targetStepId);
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
            (ch) => String(ch.id) === String(targetChapterId),
          ) + 1 || 1;
    console.log("chapterNum>>>>>>>>>>>>>>>>>>>>>>>>", chapterNum);
    const stepNum =
      targetChapter?.steps?.findIndex(
        (step) => String(step.id) === String(targetStepId),
      ) + 1 || 1;
    console.log("stepNum>>>>>>>>>>>>>>>>>>>>>>>>", stepNum);
    const screenNum =
      allScreens.filter(
        (s) =>
          String(s.chapterId) === String(targetChapterId) &&
          String(s.stepId) === String(targetStepId),
      ).length + 1;
    console.log("screenNum>>>>>>>>>>>>>>>>>>>>>>>>", screenNum);
    const screenId = `#screen_${chapterNum}_${stepNum}_${screenNum}`;
    console.log("screenId>>>>>>>>>>>>>>>>>>>>>>>>", screenId);
    const screenContentId = `#screen_content_${chapterNum}_${stepNum}_${screenNum}`;
    console.log("screenContentId>>>>>>>>>>>>>>>>>>>>>>>>", screenContentId);
    const screenUuid = crypto.randomUUID();
    console.log("screenUuid>>>>>>>>>>>>>>>>>>>>>>>>", screenUuid);
    console.log(currentChapter, "currentChapter>>>>>>>>>>>>>>>>>>>>>>>>");
    // Get position: when inserting between screens use insert index + 1 (1-based);
    // when appending, use count of screens in step + 1
    const screensInStep = allScreens.filter(
      (s) => String(s.stepId) === String(targetStepId),
    );
    const position =
      addAtIndex !== null ? addAtIndex + 1 : screensInStep.length + 1;
    console.log("position>>>>>>>>>>>>>>>>>>>>>>>>", position);
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
      profile: "profile",
      manager_email: "manager_email",
      accountability_partner_email: "accountability_partner_email",
      path_personalization: "pathPersonalization",
    };

    const contentType = contentTypeMap[screenType.id] || screenType.id;
    console.log("contentType>>>>>>>>>>>>>>>>>>>>>>>>", contentType);
    // Initialize screen based on type
    let newScreen = {};
    console.log("newScreen>>>>>>>>>>>>>>>>>>>>>>>>", newScreen);
    if (screenType.id === "action") {
      // Action screen structure
      const actionTitle = "";
      const actionText = "";
      console.log("actionTitle>>>>>>>>>>>>>>>>>>>>>>>>", actionTitle);
      console.log("actionText>>>>>>>>>>>>>>>>>>>>>>>>", actionText);
      newScreen = {
        id: screenId,
        uuid: screenUuid,
        screenType: "action",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "action",
          content: {
            title: actionTitle,
            text: actionText,
            canSchedule: true,
            canCompleteNow: true,
            replyCount: 0,
            votesCount: 0,
            toolLink: "",
            ImageUrl: "",
            reflectionPrompt: "",
          },
        },
        assets: [],
        imageStatus: "pending",
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
        uuid: screenUuid,
        screenType: "content",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "content",
          content: {
            heading: contentTitle,
            body: "",
            fullBleed: true,
            media: {
              type: "",
              url: "",
              alt: "",
            },
          },
        },
        assets: [],
        imageStatus: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: contentTitle,
        formData: {
          contentSimpleTitle: contentTitle,
          contentSimpleDescription: "",
          contentMediaLink: "",
          contentFullBleed: true,
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "multiple_choice") {
      // Multiple Choice/Survey screen structure
      const mcqTitle = "";
      newScreen = {
        id: screenId,
        uuid: screenUuid,
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
        imageStatus: "pending",
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
        uuid: screenUuid,
        screenType: "force_question",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "force_rank",
          content: {
            title: forceRankTitle,
            highLabel: "",
            lowLabel: "",
            key_learning: "",
            options: [],
          },
        },
        assets: [],
        imageStatus: "pending",
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
        uuid: screenUuid,
        screenType: "linear_poll",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "linear",
          content: {
            title: linearTitle,
            highLabel: "",
            lowLabel: "",
            key_learning: "",
            lowerScale: 1,
            higherScale: 10,
          },
        },
        assets: [],
        imageStatus: "pending",
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
        uuid: screenUuid,
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
        imageStatus: "pending",
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
        uuid: screenUuid,
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
        imageStatus: "pending",
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
        uuid: screenUuid,
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
        imageStatus: "pending",
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
        uuid: screenUuid,
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
        imageStatus: "pending",
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
    } else if (screenType.id === "profile") {
      // Profile screen structure
      const profileTitle = "";
      newScreen = {
        id: screenId,
        uuid: screenUuid,
        screenType: "profile",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "profile",
          content: {
            heading: "",
            body: "",
          },
        },
        assets: [],
        imageStatus: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: profileTitle,
        formData: {
          heading: "",
          body: "",
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "path_personalization") {
      // Path Personalization screen structure
      newScreen = {
        id: screenId,
        uuid: screenUuid,
        screenType: "path_personalization",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "pathPersonalization",
          content: {
            heading: "",
            body: "",
            media: {
              type: "",
              url: "",
              alt: "",
            },
          },
        },
        assets: [],
        imageStatus: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: "",
        formData: {
          heading: "",
          body: "",
          mediaType: "",
          mediaUrl: "",
          mediaAlt: "",
        },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "manager_email") {
      newScreen = {
        id: screenId,
        uuid: screenUuid,
        screenType: "manager_email",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "manager_email",
          content: { heading: "", body: "", email: "" },
        },
        assets: [],
        imageStatus: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: "",
        formData: { heading: "", body: "", email: "" },
        assessment: null,
        order: allScreens.length,
      };
    } else if (screenType.id === "accountability_partner_email") {
      newScreen = {
        id: screenId,
        uuid: screenUuid,
        screenType: "accountability_partner_email",
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: "accountability_partner_email",
          content: { heading: "", body: "", emails: [""] },
        },
        assets: [],
        imageStatus: "pending",
        chapterId: targetChapterId,
        stepId: targetStepId,
        thumbnail: "",
        title: "",
        formData: { heading: "", body: "", emails: [""] },
        assessment: null,
        order: allScreens.length,
      };
    } else {
      // Default structure for unknown screen types (fallback)
      newScreen = {
        id: screenId,
        uuid: screenUuid,
        screenType: screenType.id,
        position: position,
        screenContents: {
          id: screenContentId,
          contentType: contentType,
          content: {},
        },
        assets: [],
        imageStatus: "pending",
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
      console.log(
        "newScreen inserted at index>>>>>>>>>>>>>>>>>>>>>>>>",
        newScreen,
      );
    } else {
      addScreenData(newScreen);
      console.log("newScreen added>>>>>>>>>>>>>>>>>>>>>>>>", newScreen);
    }

    setShowAddPopup(false);
    setAddAtIndex(null);
    setSelectedScreenId(newScreen.id);
    setCurrentScreen(addAtIndex !== null ? addAtIndex : screens.length);
    console.log(
      "newScreen set selected screen id>>>>>>>>>>>>>>>>>>>>>>>>",
      newScreen.id,
    );
    console.log(
      "newScreen set current screen>>>>>>>>>>>>>>>>>>>>>>>>",
      addAtIndex !== null ? addAtIndex : screens.length,
    );
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
          (ch) => String(ch.id) === String(selectedScreen?.chapterId),
        ) + 1 || 1;

  const stepNumber =
    (currentChapter?.steps?.findIndex(
      (step) => String(step.id) === String(selectedScreen?.stepId),
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
                onReorderChapters={reorderChapters}
                remainingChapters={
                  sessionData?.response_path?.remaining_chapters || []
                }
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
                    setSelectedVideoAsset(null);
                    setSelectedToolAsset(null);
                  }
                }}
                onAssetCategorySelect={(category, assets) => {
                  setSelectedAssetCategory(category);
                  setSelectedAssets(assets || []);
                  // Clear selected screen and material when assets are selected
                  setSelectedScreenId(null);
                  setSelectedMaterial(null);
                  setSelectedImageAsset(null);
                  setSelectedVideoAsset(null);
                  setSelectedToolAsset(null);
                }}
                onTabChange={(tabIndex) => {
                  setActiveTab(tabIndex);
                  // Clear all selections when tab changes
                  setSelectedMaterial(null);
                  setSelectedAssetCategory(null);
                  setSelectedAssets([]);
                  setSelectedImageAsset(null);
                  setSelectedVideoAsset(null);
                  setSelectedToolAsset(null);
                  setSelectedRemainingChapter(null);
                }}
                onStepClick={(stepId, step) => {}}
                onChapterClick={(chapterId, chapter) => {
                  // Clear material and assets when chapter is clicked
                  setSelectedMaterial(null);
                  setSelectedAssetCategory(null);
                  setSelectedAssets([]);
                  setSelectedImageAsset(null);
                  setSelectedVideoAsset(null);
                  setSelectedToolAsset(null);
                  setSelectedRemainingChapter(null);
                  setActiveTab(0);
                  // Filter screens for this chapter (use allScreens to get screens from all steps)
                  const chapterScreens = allScreens.filter(
                    (s) => s.chapterId === chapterId,
                  );
                  console.log(
                    "chapterScreens>>>>>>>>>>>>>>>>>>>>>>>>",
                    chapterScreens,
                  );
                  if (chapterScreens.length > 0) {
                    // Find the first screen's index in the filtered screens array
                    const firstScreen = chapterScreens[0];
                    console.log(
                      "firstScreen>>>>>>>>>>>>>>>>>>>>>>>>",
                      firstScreen,
                    );
                    const screenIndex = screens.findIndex(
                      (s) => s.id === firstScreen.id,
                    );
                    console.log(
                      "screenIndex>>>>>>>>>>>>>>>>>>>>>>>>",
                      screenIndex,
                    );
                    if (screenIndex >= 0) {
                      setSelectedScreenId(firstScreen.id);
                      console.log(
                        "selectedScreenId>>>>>>>>>>>>>>>>>>>>>>>>",
                        firstScreen.id,
                      );
                      setCurrentScreen(screenIndex);
                      console.log(
                        "currentScreen>>>>>>>>>>>>>>>>>>>>>>>>",
                        screenIndex,
                      );
                    } else {
                      // If screen is not in current filtered screens, select the first step of the chapter
                      const firstStep = chapter.steps?.[0];
                      if (firstStep) {
                        setSelectedStep(firstStep.id);
                        console.log(
                          "selectedStep>>>>>>>>>>>>>>>>>>>>>>>>",
                          firstStep.id,
                        );
                        // The screens will update via useEffect, then we can select the first screen
                      }
                    }
                  }
                }}
                onRemainingChapterClick={(chapter) => {
                  // Clear all other selections when remaining chapter is clicked
                  setSelectedMaterial(null);
                  setSelectedAssetCategory(null);
                  setSelectedAssets([]);
                  setSelectedImageAsset(null);
                  setSelectedVideoAsset(null);
                  setSelectedToolAsset(null);
                  setSelectedScreenId(null);
                  setSelectedRemainingChapter(chapter);
                  setScrollToStepIndex(null); // Reset scroll target when chapter changes
                }}
                onRemainingStepClick={(stepIndex) => {
                  // Set the step index to scroll to in the right panel
                  setScrollToStepIndex(stepIndex);
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
                ) : selectedVideoAsset ? (
                  <div className="flex-1 overflow-hidden p-4">
                    <VideoPreview
                      asset={selectedVideoAsset}
                      category={selectedAssetCategory}
                      onClose={() => setSelectedVideoAsset(null)}
                    />
                  </div>
                ) : selectedToolAsset ? (
                  <div className="flex-1 overflow-hidden p-4">
                    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${selectedToolAsset.fileTypeInfo?.color || "bg-gray-100"} flex items-center justify-center text-sm font-bold`}
                          >
                            {selectedToolAsset.fileTypeInfo?.customIcon || (
                              <FileIcon size={20} />
                            )}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                              {selectedToolAsset.name}
                            </h2>
                            <span className="text-xs text-gray-500 uppercase">
                              {selectedToolAsset.fileExtension || "File"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedToolAsset(null)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X size={20} className="text-gray-500" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden flex items-center justify-center">
                        {selectedToolAsset.fileExtension === "pdf" ? (
                          <iframe
                            src={selectedToolAsset.asset_url}
                            className="w-full h-full border-0"
                            title={selectedToolAsset.name}
                          />
                        ) : (
                          <a
                            href={selectedToolAsset.asset_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-4 p-8 hover:opacity-80"
                          >
                            <div
                              className={`w-24 h-24 rounded-2xl ${selectedToolAsset.fileTypeInfo?.color || "bg-gray-100"} flex items-center justify-center text-4xl font-bold`}
                            >
                              {selectedToolAsset.fileTypeInfo?.customIcon || (
                                <FileIcon size={48} />
                              )}
                            </div>
                            <span className="text-primary font-medium">
                              Click to Open
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
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
                              const normalizedType =
                                assetType === "animation" ? "video" : assetType;
                              const isImage = normalizedType === "image";
                              const isVideo = normalizedType === "video";
                              const isTool = assetType === "tool";

                              // Get file name from URL or use name property
                              const getFileNameFromUrl = (url) => {
                                if (!url) return "Untitled Asset";
                                const urlPath = url.split("?")[0];
                                const fileName = urlPath.split("/").pop();
                                return fileName || "Untitled Asset";
                              };

                              const assetName =
                                asset?.name || getFileNameFromUrl(assetUrl);

                              // Get file extension
                              const getFileExtension = (url) => {
                                if (!url) return "";
                                const urlPath = url.split("?")[0];
                                const parts = urlPath.split(".");
                                return parts.length > 1
                                  ? parts.pop()?.toLowerCase()
                                  : "";
                              };

                              const fileExtension = getFileExtension(assetUrl);

                              // Get icon and color based on file type
                              const getFileTypeInfo = () => {
                                if (isImage)
                                  return {
                                    icon: FileImage,
                                    color: "bg-green-100 text-green-600",
                                    label: "Image",
                                  };
                                if (isVideo)
                                  return {
                                    icon: FileVideo,
                                    color: "bg-purple-100 text-purple-600",
                                    label: "Video",
                                  };

                                // For tools and documents, map extensions to icons/colors
                                if (
                                  isTool ||
                                  assetType === "file" ||
                                  !assetType
                                ) {
                                  switch (fileExtension) {
                                    case "ppt":
                                    case "pptx":
                                      return {
                                        icon: null,
                                        color: "bg-orange-100 text-orange-600",
                                        label: "PowerPoint",
                                        customIcon: "PPT",
                                      };
                                    case "doc":
                                    case "docx":
                                      return {
                                        icon: null,
                                        color: "bg-blue-100 text-blue-600",
                                        label: "Word",
                                        customIcon: "DOC",
                                      };
                                    case "xls":
                                    case "xlsx":
                                      return {
                                        icon: null,
                                        color: "bg-green-100 text-green-600",
                                        label: "Excel",
                                        customIcon: "XLS",
                                      };
                                    case "pdf":
                                      return {
                                        icon: null,
                                        color: "bg-red-100 text-red-600",
                                        label: "PDF",
                                        customIcon: "PDF",
                                      };
                                    case "txt":
                                      return {
                                        icon: File,
                                        color: "bg-gray-100 text-gray-600",
                                        label: "Text",
                                      };
                                    case "zip":
                                    case "rar":
                                      return {
                                        icon: null,
                                        color: "bg-yellow-100 text-yellow-700",
                                        label: "Archive",
                                        customIcon: "ZIP",
                                      };
                                    case "mp3":
                                    case "wav":
                                    case "m4a":
                                      return {
                                        icon: null,
                                        color: "bg-pink-100 text-pink-600",
                                        label: "Audio",
                                        customIcon: "MP3",
                                      };
                                    case "csv":
                                      return {
                                        icon: null,
                                        color: "bg-teal-100 text-teal-600",
                                        label: "CSV",
                                        customIcon: "CSV",
                                      };
                                    case "json":
                                      return {
                                        icon: null,
                                        color: "bg-amber-100 text-amber-600",
                                        label: "JSON",
                                        customIcon: "JSON",
                                      };
                                    default:
                                      return {
                                        icon: FileIcon,
                                        color: "bg-gray-100 text-gray-500",
                                        label: "File",
                                      };
                                  }
                                }

                                return {
                                  icon: FileIcon,
                                  color: "bg-gray-100 text-gray-500",
                                  label: "File",
                                };
                              };

                              const fileTypeInfo = getFileTypeInfo();

                              return (
                                <div
                                  key={asset.id}
                                  className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg hover:border-primary-300 transition-all"
                                  onClick={() => {
                                    if (!assetUrl) return;
                                    if (isImage) setSelectedImageAsset(asset);
                                    else if (isVideo)
                                      setSelectedVideoAsset(asset);
                                    else if (
                                      isTool ||
                                      assetType === "file" ||
                                      !assetType
                                    ) {
                                      setSelectedToolAsset({
                                        ...asset,
                                        asset_url: assetUrl,
                                        name: assetName,
                                        fileExtension: fileExtension,
                                        fileTypeInfo: fileTypeInfo,
                                      });
                                    }
                                  }}
                                >
                                  <div
                                    className={`relative h-32 w-full ${fileTypeInfo.color} flex items-center justify-center`}
                                  >
                                    {isImage && assetUrl ? (
                                      <img
                                        src={assetUrl}
                                        alt={assetName}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : fileTypeInfo.customIcon ? (
                                      <div className="flex flex-col items-center justify-center gap-2">
                                        <span className="text-3xl font-bold">
                                          {fileTypeInfo.customIcon}
                                        </span>
                                        <span className="text-xs font-medium opacity-70">
                                          {fileTypeInfo.label}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center gap-2">
                                        {fileTypeInfo.icon && (
                                          <fileTypeInfo.icon size={40} />
                                        )}
                                        <span className="text-xs font-medium opacity-70">
                                          {fileTypeInfo.label}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 p-3 border-t border-gray-100">
                                    <span
                                      className="text-sm font-semibold text-gray-900 line-clamp-2"
                                      title={assetName}
                                    >
                                      {assetName}
                                    </span>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${fileTypeInfo.color}`}
                                      >
                                        {fileExtension?.toUpperCase() ||
                                          fileTypeInfo.label}
                                      </span>
                                      {asset?.description && (
                                        <span
                                          className="truncate ml-2"
                                          title={asset.description}
                                        >
                                          {asset.description}
                                        </span>
                                      )}
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
                ) : selectedRemainingChapter ? (
                  <div className="flex flex-col w-full h-full bg-background rounded-xl overflow-hidden">
                    {/* Header - matching outline manager StepsDisplay */}
                    <div className="p-2 border-b border-gray-300 flex flex-col justify-between items-center shrink-0">
                      <div className="flex justify-between items-center gap-2 w-full">
                        <span className="text-base text-[#7367F0] font-medium">
                          Steps
                        </span>
                        <button
                          onClick={() => setSelectedRemainingChapter(null)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X size={18} className="text-gray-500" />
                        </button>
                      </div>
                      <p className="text-lg text-start text-gray-900 font-semibold w-full">
                        {selectedRemainingChapter.chapter || "Untitled Chapter"}
                      </p>
                    </div>

                    {/* Steps List - matching outline manager StepsDisplay */}
                    <div
                      ref={remainingChapterStepsRef}
                      className="flex-1 overflow-y-auto py-2"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#9ca3af #e5e7eb",
                      }}
                    >
                      <div className="space-y-4 bg-primary-50 px-2 py-4 rounded">
                        {selectedRemainingChapter.steps &&
                        selectedRemainingChapter.steps.length > 0 ? (
                          selectedRemainingChapter.steps.map(
                            (step, stepIndex) => (
                              <div
                                key={stepIndex}
                                id={`remaining-step-${stepIndex}`}
                                className="border-b border-primary-300 pb-4"
                              >
                                {/* Step Header */}
                                <div className="mb-4 ml-4">
                                  <p className="text-xs text-gray-900 mb-1">
                                    Step {stepIndex + 1}
                                  </p>
                                  <h3 className="text-base font-semibold text-primary">
                                    {step.title ||
                                      `Step ${step.step || stepIndex + 1}`}
                                  </h3>
                                </div>

                                {/* Step Content */}
                                <div className="space-y-4">
                                  {/* Aha Moment */}
                                  {step.aha && (
                                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                                      <div className="shrink-0 mt-1">
                                        <img
                                          src="/bulb.svg"
                                          alt="Aha"
                                          width={24}
                                          height={24}
                                          className="w-6 h-6"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">
                                          Aha
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                          {step.aha}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Action */}
                                  {step.action && (
                                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                                      <div className="shrink-0 mt-1">
                                        <img
                                          src="/markup.svg"
                                          alt="Action"
                                          width={24}
                                          height={24}
                                          className="w-6 h-6"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">
                                          Action
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                          {step.action}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Tool */}
                                  {step.tool && (
                                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                                      <div className="shrink-0 mt-1">
                                        <img
                                          src="/tool.svg"
                                          alt="Tool"
                                          width={24}
                                          height={24}
                                          className="w-6 h-6"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">
                                          Tool
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                          {step.tool}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Description */}
                                  {step.description && (
                                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                                      <div className="shrink-0 mt-1">
                                        <img
                                          src="/tool.svg"
                                          alt="Description"
                                          width={24}
                                          height={24}
                                          className="w-6 h-6"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">
                                          Description
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                          {step.description}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <p className="text-sm text-gray-500">
                              No steps available for this chapter
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeTab === 0 ? (
                  <>
                    {selectedScreen && chapters && (
                      <div className="shrink-0 p-3 ml-4 sm:p-4 flex justify-between items-center rounded-t-2xl">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-sm sm:text-md font-bold text-gray-900 truncate">
                            {currentChapter?.steps?.find(
                              (step) =>
                                String(step.id) ===
                                String(selectedScreen?.stepId),
                            )?.name || "Untitled Step"}
                          </h2>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-primary text-truncate">
                              {(
                                currentChapter?.steps?.find(
                                  (step) =>
                                    String(step.id) ===
                                    String(selectedScreen?.stepId),
                                )?.description || "Untitled Step"
                              ).slice(0, 80)}
                              ...
                            </span>
                            {/* <span className="text-xs text-primary truncate">
                              {selectedScreen.name || "Untitled Step"}
                            </span> */}
                          </div>
                        </div>
                        <div>
                          <GenerateStepImageButton
                            sessionId={sessionId}
                            sessionData={sessionData}
                            setSessionData={setSessionData}
                            chapterUid={(() => {
                              // Find chapter UUID from outline using stepUid (more reliable than chapterId)
                              const stepUid = selectedScreen?.stepUid;
                              if (!stepUid || !outline?.chapters) {
                                return null;
                              }
                              // Search through chapters to find the one containing this step
                              for (const chapter of outline.chapters) {
                                if (chapter.steps) {
                                  for (const stepItem of chapter.steps) {
                                    const step = stepItem?.step;
                                    if (step && step.uuid === stepUid) {
                                      return chapter.uuid || null;
                                    }
                                  }
                                }
                              }
                              return null;
                            })()}
                            stepUid={selectedScreen?.stepUid}
                            onSuccess={(response) => {
                              console.log("Step image generated:", response);
                            }}
                            onError={(error) => {
                              console.error(
                                "Step image generation failed:",
                                error,
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => setIsUploadImageDialogOpen(true)}
                            className="w-20 h-10 rounded-md bg-primary-50 border border-primary-200 flex items-center justify-center overflow-hidden shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {selectedScreen?.stepImageUrl && (
                              <img
                                src={selectedScreen.stepImageUrl}
                                alt="Step image"
                                className="w-full h-full object-cover"
                              />
                            )}
                            {!selectedScreen?.stepImageUrl && (
                              <FileImage className="w-5 h-5 text-primary-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scrollable children container */}
                    <div className="overflow-y-auto p-2 sm:p-3 no-scrollbar flex flex-col  flex-1 ">
                      {/* Navigation - Screens */}
                      <div className="bg-background rounded-md p-2 sm:p-3 shrink-0 mb-2">
                        <div className="flex flex-col gap-3 w-full">
                          <div className="flex items-start gap-2 w-full h-fit overflow-x-auto no-scrollbar -mx-2 px-2">
                            <div className="flex items-start gap-2 sm:gap-2 px-1">
                              {screens.map((screen, index) => (
                                <div
                                  key={screen.uuid || `${screen.id}-${index}`}
                                  ref={
                                    index === currentScreen
                                      ? selectedScreenRef
                                      : null
                                  }
                                >
                                  <ScreenCard
                                    screen={screen}
                                    chapter={currentChapter}
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
                              className="p-2 bg-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              aria-label="Previous screen"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {/* Selected screen name */}
                            {selectedScreen && (
                              <div className="flex items-center gap-2 min-w-0 flex-1 justify-center px-2">
                                <p className="text-xs sm:text-sm font-semibold text-center truncate">
                                  Screen {currentScreen + 1}{" "}
                                  {selectedScreen.name}
                                </p>
                              </div>
                            )}
                            <button
                              onClick={() => navigateScreen("next")}
                              disabled={currentScreen === screens.length - 1}
                              className="p-2 bg-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                            key={`${selectedScreen.id}-${sessionUpdateKey}`}
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

                    <div className="border-t p-3 bg-primary-50 w-full rounded-b-xl shrink-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 px-1 py-1 rounded-xl bg-[#E9EAEB]">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              setIsAnalyzingTextCollapsed(
                                !isAnalyzingTextCollapsed,
                              )
                            }
                          >
                            <Zap size={14} className="text-gray-900" />
                          </div>
                          {!isAnalyzingTextCollapsed && (
                            <span className="text-gray-700 text-sm">
                              {sessionData?.meta?.state ||
                                "Analyzing instructions and source materials"}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="default"
                          className="ml-auto bg-primary-100 hover:bg-primary-600 text-primary hover:text-white border-0 flex items-center justify-center gap-2 px-4 py-3 disabled:opacity-50 cursor-pointer"
                          onClick={handleNextChapter}
                          disabled={isGeneratingNextChapter}
                        >
                          <span>Generate Remaining Chapters</span>
                          <ArrowRight size={16} />
                        </Button>
                      </div>
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

          {/* Footer Navigation */}
          {/* {showNextChapter && (
            <div className="border-t p-4 bg-background w-full rounded-b-xl shrink-0">
              <div className="flex items-center justify-end">
                <Button
                  variant="default"
                  className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
                  onClick={handleNextChapter}
                  disabled={isGeneratingNextChapter}
                >
                  <span>Next Chapter</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )} */}
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
      {/* Upload Step Image Dialog */}
      <UploadStepImageDialog
        open={isUploadImageDialogOpen}
        onOpenChange={setIsUploadImageDialogOpen}
        sessionId={sessionId}
        stepUid={selectedScreen?.stepUid}
        onSuccess={(response) => {
          console.log("Step image uploaded:", response);
        }}
        onError={(error) => {
          console.error("Step image upload failed:", error);
        }}
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
