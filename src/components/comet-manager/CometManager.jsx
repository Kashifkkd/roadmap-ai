"use client";

import React, { useState, useEffect } from "react";
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

const SCREEN_TYPES = [
  {
    id: "content",
    name: "Content",
    icon: <PanelsTopLeft size={20} />,
    color: "bg-blue-100 border-blue-300",
    description: "Text and media content",
  },
  {
    id: "poll",
    name: "Poll",
    icon: <BarChart3 size={20} />,
    color: "bg-green-100 border-green-300",
    description: "Interactive polling questions",
  },
  {
    id: "column",
    name: "Column Match",
    icon: <Columns size={20} />,
    color: "bg-purple-100 border-purple-300",
    description: "Matching activities",
  },
  {
    id: "reflection",
    name: "Reflection",
    icon: <MessageSquare size={20} />,
    color: "bg-orange-100 border-orange-300",
    description: "Reflection prompts",
  },
  {
    id: "assessment",
    name: "Assessment",
    icon: <FileQuestion size={20} />,
    color: "bg-red-100 border-red-300",
    description: "Assessment tools",
  },
  {
    id: "interactive",
    name: "Interactive",
    icon: <Target size={20} />,
    color: "bg-yellow-100 border-yellow-300",
    description: "Interactive elements",
  },
  {
    id: "video",
    name: "Video",
    icon: <Eye size={20} />,
    color: "bg-indigo-100 border-indigo-300",
    description: "Video content",
  },
  {
    id: "group",
    name: "Group Activity",
    icon: <Users size={20} />,
    color: "bg-teal-100 border-teal-300",
    description: "Group activities",
  },
];

const EASE_CATEGORIES = ["Engagement", "Aha", "Support", "Execution"];

export default function CometManager({ sessionData }) {
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

  console.log("screens", screens)
  console.log("chapters", chapters)
  console.log("sessionData", sessionData)

  const [currentScreen, setCurrentScreen] = useState(0);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addAtIndex, setAddAtIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Update local screens when data changes
  useEffect(() => {
    if (screens && screens.length > 0 && !selectedScreen) {
      setSelectedScreen(screens[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screens]);

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

    setScreens(newScreens);
    setDraggedIndex(null);
  };

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
          {/* Container for left */}
          <div className="grid grid-cols-16 overflow-hidden h-full gap-2">
            {/* Sidebar - middle section width */}
            <div className="bg-background rounded-xl col-span-5 h-full overflow-hidden">
              <CometManagerSidebar
                selectedScreen={selectedScreen}
                onAddScreen={handleAddScreen}
                chapters={chapters}
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

            {/*right section */}
            <div className="flex flex-col col-span-11 h-full overflow-hidden min-w-0 bg-primary-50 rounded-xl">
              <div className="flex flex-col flex-1 overflow-hidden">
                {selectedScreen && (
                  <div className="shrink-0 p-4 rounded-t-2xl">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-sm font-medium text-gray-900">
                        {selectedScreen.title || "Untitled Chapter"}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">
                          Step {currentScreen + 1}.1
                        </span>
                        <span className="text-xs text-primary">
                          {selectedScreen.name || "Untitled Step"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrollable children container */}
                <div className="overflow-y-auto p-2 no-scrollbar flex flex-col gap-2 flex-1">
                  {/* Navigation - Screens */}
                  <div className="bg-background rounded-md p-2 shrink-0">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col justify-between items-center gap-2 w-full">
                        <div className="flex items-center gap-2 w-full h-fit overflow-x-auto no-scrollbar">
                          <div className="flex items-center gap-4 px-2">
                            {screens.map((screen, index) => (
                              <ScreenCard
                                key={screen.id}
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
                            ))}
                          </div>
                        </div>
                        <div className="w-full flex justify-between items-center gap-2">
                          <button
                            onClick={() => navigateScreen("prev")}
                            disabled={currentScreen === 0}
                            className="p-2 bg-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          {/* Selected screen name */}
                          {selectedScreen && (
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">
                                Screen {currentScreen + 1} -{" "}
                                {selectedScreen.name}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => navigateScreen("next")}
                            disabled={currentScreen === screens.length - 1}
                            className="p-2 bg-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
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
        screenTypes={SCREEN_TYPES}
      />
    </div>
  );
}
