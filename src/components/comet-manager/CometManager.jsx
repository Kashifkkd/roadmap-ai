"use client";

import React, { useState, useEffect, useRef } from "react";
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
import CometManagerSidebar from "./CometManagerSidebar";
import DynamicForm from "./DynamicForm";
import ScreenCard from "./ScreenCard";
import AddScreenPopup from "./AddScreenPopup";
import DevicePreview from "./DevicePreview";
import FromDoerToEnabler from "./FromDoerToEnabler";
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
  isPreviewMode,
  setIsPreviewMode,
}) {
  // Use comet manager hook to get actual data
  const {
    isLoading,
    screens,
    chapters,
    updateScreen: updateScreenData,
    addScreen: addScreenData,
    deleteScreen: deleteScreenData,
    reorderScreensList,
    insertScreenAt,
  } = useCometManager(sessionData);

  // Extract session_id from sessionData or temp
  const sessionId =
    sessionData?.session_id ||
    (typeof window !== "undefined" && localStorage.getItem("sessionId")) ||
    null;

  const [currentScreen, setCurrentScreen] = useState(0);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addAtIndex, setAddAtIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const selectedScreenRef = useRef(null);

  console.log("chapters", chapters);
  console.log("selectedScreen", selectedScreen);

  // Update local screens when data changes
  useEffect(() => {
    if (screens && screens.length > 0 && !selectedScreen) {
      setSelectedScreen(screens[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screens]);

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
  }, [currentScreen, selectedScreen]);

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
    setSelectedScreen(screen);
    const screenIndex = screens.findIndex((s) => s.id === screen.id);
    setCurrentScreen(screenIndex);
  };

  const handleAddScreen = (insertIndex = null) => {
    setAddAtIndex(insertIndex);
    setShowAddPopup(true);
  };

  const handleAddNewScreen = (screenType) => {
    const newScreen = {
      id: `screen-new-${Date.now()}`,
      name: `Screen ${screens.length + 1}`,
      title: `New ${screenType.name}`,
      type: screenType.id,
      chapterId: chapters[0]?.id || "chapter-0",
      stepId: screens.length + 1,
      easeCategories: [],
      formData: {},
      order: screens.length,
    };

    if (addAtIndex !== null) {
      insertScreenAt(newScreen, addAtIndex);
    } else {
      addScreenData(newScreen);
    }

    setShowAddPopup(false);
    setAddAtIndex(null);
    setSelectedScreen(newScreen);
    setCurrentScreen(addAtIndex !== null ? addAtIndex : screens.length);
  };

  const handleUpdateScreen = (updatedScreen) => {
    // Update through the hook to persist changes
    updateScreenData(updatedScreen.id, updatedScreen);
    setSelectedScreen(updatedScreen);
  };

  const navigateScreen = (direction) => {
    if (direction === "prev" && currentScreen > 0) {
      const newIndex = currentScreen - 1;
      setCurrentScreen(newIndex);
      setSelectedScreen(screens[newIndex]);
    } else if (direction === "next" && currentScreen < screens.length - 1) {
      const newIndex = currentScreen + 1;
      setCurrentScreen(newIndex);
      setSelectedScreen(screens[newIndex]);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background rounded-xl h-full">
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading comet data...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row overflow-hidden h-full gap-2 p-2 lg:p-0">
            <div className="bg-background rounded-xl w-full lg:w-1/3 xl:w-1/4 h-auto lg:h-full overflow-hidden shrink-0">
              <CometManagerSidebar
                selectedScreen={selectedScreen}
                onAddScreen={handleAddScreen}
                chapters={chapters}
                sessionId={sessionId}
                onChapterClick={(chapterId, chapter) => {
                  console.log("Chapter clicked", chapterId, chapter);
                  // Filter screens for this chapter
                  const chapterScreens = screens.filter(
                    (s) => s.chapterId === chapterId
                  );
                  if (chapterScreens.length > 0) {
                    setSelectedScreen(chapterScreens[0]);
                    setCurrentScreen(screens.indexOf(chapterScreens[0]));
                  }
                }}
              />
            </div>

            {/* Right section - main content */}
            <div className="flex flex-col w-full lg:w-2/3 xl:w-3/4 h-full overflow-hidden min-w-0 bg-primary-50 rounded-xl my-2 mr-2">
              <div className="flex flex-col flex-1 overflow-hidden">
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
                      <img
                        src={selectedScreen.thumbnail || "/error-img.png"}
                        alt={selectedScreen.title || "Untitled Chapter"}
                        className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Scrollable children container */}
                <div className="overflow-y-auto p-2 sm:p-3 no-scrollbar flex flex-col gap-2 flex-1">
                  {/* Navigation - Screens */}
                  <div className="bg-background rounded-md p-2 sm:p-3 shrink-0">
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-start gap-2 w-full h-fit overflow-x-auto no-scrollbar -mx-2 px-2">
                        <div className="flex items-start gap-2 sm:gap-4 px-1">
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
                              Screen {currentScreen + 1} - {selectedScreen.name}
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
                        screen={selectedScreen}
                        onUpdate={handleUpdateScreen}
                        onClose={() => setSelectedScreen(null)}
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
              ? "w-screen"
              : "w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] xl:max-w-4xl"
          } h-screen bg-primary-50 p-0`}
        >
          {/* Preview Header */}
          <div className="bg-primary-50 border-b border-gray-200 py-3 px-3 sm:px-4 flex items-center justify-between">
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
          <div className="flex-1 overflow-hidden p-2 sm:p-3 border-lg bg-primary-50">
            <FromDoerToEnabler />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
