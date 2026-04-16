"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import SectionHeader from "@/components/section-header";
import OutlineMannerFooter from "./OutlineMannerFooter";
import StepsDisplay from "./StepsDisplay";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  GripVertical,
  Zap,
  ChevronDown,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import SelectIcon from "@/components/icons/SelectIcon";
import ChapterTextarea from "./ChapterTextarea";
import Loader from "@/components/loader2";
import GradientLoader from "@/components/ui/GradientLoader";
// import { temp2 } from "../../hooks/temp2";

export default function OutlineMannerCreateComet({
  sessionData,
  prefillData,
  setAllMessages,
  isAskingKyper = false,
  setIsAskingKyper = () => {},
  isSubmittingStep = false,
  setIsSubmittingStep = () => {},
  isSubmittingChapter = false,
  setIsSubmittingChapter = () => {},
}) {
  // console.log("sessionData in OutlineMannerCreateComet:", sessionData);
  // console.log("prefillData in OutlineMannerCreateComet:", prefillData);
  // console.log("temp in OutlineMannerCreateComet:", temp);

  const sourceOutline = useMemo(() => {
    if (isArrayWithValues(prefillData?.response_outline))
      return prefillData.response_outline;
    if (isArrayWithValues(sessionData?.response_outline))
      return sessionData.response_outline;
    // sample data for testing
    // if (isArrayWithValues(temp2[0]?.response_outline))
    //   return temp2[0].response_outline;
    return [];
  }, [prefillData, sessionData]);

  // Use state to allow local updates for drag and drop
  const [chapters, setChapters] = useState([]);

  // Update chapters when sourceOutline changes
  useEffect(() => {
    if (isArrayWithValues(sourceOutline)) {
      const mappedChapters = sourceOutline.map((chapter) => ({
        chapter: chapter?.chapter || chapter?.phase || "Untitled Chapter",
        steps: isArrayWithValues(chapter?.steps) 
          ? chapter.steps.map((step) => {
              // Map micro-action to action, and exclude micro-action field
              const { "micro-action": microAction, ...restStep } = step;
              return {
                ...restStep,
                action: step.action || microAction || "",
              };
            })
          : [],
      }));
      setChapters(mappedChapters);
    } else {
      setChapters([]);
    }
  }, [sourceOutline]);

  const [expandedChapters, setExpandedChapters] = useState({});

  const [text, setText] = useState("Untitled Cycle");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showChapterTextarea, setShowChapterTextarea] = useState(false);
  // const [isGenerating, setIsGenerating] = useState(false);

  // Drag and drop state
  const [draggedChapterIndex, setDraggedChapterIndex] = useState(null);
  const [draggedStepIndex, setDraggedStepIndex] = useState(null);
  const [draggedStepChapterIndex, setDraggedStepChapterIndex] = useState(null);
  const [dropTargetChapter, setDropTargetChapter] = useState(null);
  const [dropTargetStep, setDropTargetStep] = useState(null);

  // Chapter editing state
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editingChapterIndex, setEditingChapterIndex] = useState(null);
  const [chapterEditValue, setChapterEditValue] = useState("");

  // Step title editing state
  const [editingStepKey, setEditingStepKey] = useState(null); // "chapterIndex-stepIndex"
  const [stepEditValue, setStepEditValue] = useState("");

  // Step menu state
  const [openStepMenuKey, setOpenStepMenuKey] = useState(null);
  const [stepMenuPosition, setStepMenuPosition] = useState({ top: 0, left: 0 });
  const [deletingStepKey, setDeletingStepKey] = useState(null);

  // Step delete confirmation state
  const [stepDeleteConfirm, setStepDeleteConfirm] = useState(null); // { chapterIndex, stepIndex, stepTitle }

  // Chapter delete confirmation state
  const [chapterDeleteConfirmIndex, setChapterDeleteConfirmIndex] = useState(null);
  const [deletingChapterIndex, setDeletingChapterIndex] = useState(null);

  const selectedChapterNameRef = useRef(null);
  const selectedStepTitleRef = useRef(null);

  useEffect(() => {
    if (!isArrayWithValues(chapters)) {
      if (selectedChapterNameRef.current) {
        selectedChapterNameRef.current = null;
        selectedStepTitleRef.current = null;
        setSelectedChapter(null);
        setSelectedChapterNumber(null);
        setSelectedStep(null);
      }
      return;
    }
    const chapterName = selectedChapterNameRef.current;
    if (chapterName) {
      const chapterIndex = chapters.findIndex(
        (ch) => ch?.chapter === chapterName,
      );

      if (chapterIndex !== -1) {
        const updatedChapter = chapters[chapterIndex];
        setSelectedChapter(updatedChapter);
        setSelectedChapterNumber(chapterIndex + 1);
        const stepTitle = selectedStepTitleRef.current;
        if (stepTitle && isArrayWithValues(updatedChapter?.steps)) {
          const stepIndex = updatedChapter.steps.findIndex(
            (step) => step?.title === stepTitle,
          );
          if (stepIndex !== -1) {
            setSelectedStep(updatedChapter.steps[stepIndex]);
          } else {
            selectedStepTitleRef.current = null;
            setSelectedStep(null);
          }
        } else {
          if (!isArrayWithValues(updatedChapter?.steps)) {
            selectedStepTitleRef.current = null;
            setSelectedStep(null);
          }
        }
      } else {
        selectedChapterNameRef.current = null;
        selectedStepTitleRef.current = null;
        setSelectedChapter(null);
        setSelectedChapterNumber(null);
        setSelectedStep(null);
      }
    }
  }, [chapters]);

  const handleChapterClick = (index, chapter) => {
    selectedChapterNameRef.current = chapter?.chapter || null;
    selectedStepTitleRef.current = null;

    setSelectedChapter(chapter);
    setSelectedChapterNumber(index + 1);
    setSelectedStep(null);
    setOpenMenuIndex(null);
    if (isArrayWithValues(chapter?.steps)) {
      setExpandedChapters((prev) => ({ ...prev, [index]: !prev[index] }));
    } else {
      setExpandedChapters((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleStepClick = (e, chapter, step, chapterIndex) => {
    e.stopPropagation();
    selectedChapterNameRef.current = chapter?.chapter || null;
    selectedStepTitleRef.current = step?.title || null;

    setSelectedChapter(chapter);
    setSelectedChapterNumber(chapterIndex + 1);
    setSelectedStep(step);
  };

  const handleChapterMenuClick = (e, index) => {
    e.stopPropagation();
    if (openMenuIndex === index) {
      setOpenMenuIndex(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 100,
      });
      setOpenMenuIndex(index);
    }
  };

  const handleRequestDeleteChapter = (e, index) => {
    e.stopPropagation();
    setChapterDeleteConfirmIndex(index);
    setOpenMenuIndex(null);
  };

  const handleConfirmDeleteChapter = () => {
    if (chapterDeleteConfirmIndex === null) return;
    const index = chapterDeleteConfirmIndex;
    setDeletingChapterIndex(index);
    setChapterDeleteConfirmIndex(null);
    
    // Simulate delete operation
    setTimeout(() => {
      handleDeleteChapter(null, index);
      setDeletingChapterIndex(null);
    }, 300);
  };

  const handleEditChapterClick = (e, index, title) => {
    e.stopPropagation();
    setEditingChapterIndex(index);
    setChapterEditValue(title || "");
    setOpenMenuIndex(null);
  };

  const handleStepMenuClick = (e, chapterIndex, stepIndex) => {
    e.stopPropagation();
    const key = `${chapterIndex}-${stepIndex}`;
    if (openStepMenuKey === key) {
      setOpenStepMenuKey(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setStepMenuPosition({ top: rect.bottom + 4, left: rect.right - 100 });
      setOpenStepMenuKey(key);
    }
  };

  const handleDeleteStepWithLoader = (e, chapterIndex, stepIndex, stepTitle) => {
    if (e) e.stopPropagation();
    const key = `${chapterIndex}-${stepIndex}`;
    setDeletingStepKey(key);
    setOpenStepMenuKey(null);
    setTimeout(() => {
      handleDeleteStep(null, chapterIndex, stepIndex, stepTitle);
      setDeletingStepKey(null);
    }, 300);
  };

  const handleSaveChapterTitle = (e, index) => {
    e.stopPropagation();
    if (!chapterEditValue.trim()) {
      setEditingChapterIndex(null);
      setChapterEditValue("");
      return;
    }

    const newChapters = [...chapters];
    newChapters[index] = {
      ...newChapters[index],
      chapter: chapterEditValue.trim(),
    };

    setChapters(newChapters);
    setEditingChapterIndex(null);
    setChapterEditValue("");

    if (selectedChapterNumber === index + 1) {
      setSelectedChapter(newChapters[index]);
      selectedChapterNameRef.current = newChapters[index].chapter;
    }

    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      if (storedData) {
        storedData.response_outline = newChapters;
        localStorage.setItem("sessionData", JSON.stringify(storedData));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  const handleCancelChapterEdit = (e) => {
    e.stopPropagation();
    setEditingChapterIndex(null);
    setChapterEditValue("");
  };

  const handleChapterEditKeyDown = (e, index) => {
    if (e.key === "Enter") {
      handleSaveChapterTitle(e, index);
    } else if (e.key === "Escape") {
      handleCancelChapterEdit(e);
    }
  };

  const handleEditStepClick = (e, chapterIndex, stepIndex, title) => {
    e.stopPropagation();
    setEditingStepKey(`${chapterIndex}-${stepIndex}`);
    setStepEditValue(title || "");
  };

  const handleSaveStepTitle = (e, chapterIndex, stepIndex) => {
    e.stopPropagation();
    if (!stepEditValue.trim()) {
      setEditingStepKey(null);
      setStepEditValue("");
      return;
    }

    const newChapters = [...chapters];
    const newSteps = [...newChapters[chapterIndex].steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      title: stepEditValue.trim(),
    };
    newChapters[chapterIndex] = {
      ...newChapters[chapterIndex],
      steps: newSteps,
    };

    setChapters(newChapters);
    setEditingStepKey(null);
    setStepEditValue("");

    if (selectedStep?.title === chapters[chapterIndex].steps[stepIndex].title) {
      setSelectedStep(newSteps[stepIndex]);
      selectedStepTitleRef.current = newSteps[stepIndex].title;
    }

    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      if (storedData) {
        storedData.response_outline = newChapters;
        localStorage.setItem("sessionData", JSON.stringify(storedData));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  const handleCancelStepEdit = (e) => {
    e.stopPropagation();
    setEditingStepKey(null);
    setStepEditValue("");
  };

  const handleStepEditKeyDown = (e, chapterIndex, stepIndex) => {
    if (e.key === "Enter") {
      handleSaveStepTitle(e, chapterIndex, stepIndex);
    } else if (e.key === "Escape") {
      handleCancelStepEdit(e);
    }
  };

  // Chapter drag handlers
  const handleChapterDragStart = (e, index) => {
    e.stopPropagation();
    setDraggedChapterIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/chapter", index.toString());
  };

  const handleChapterDragEnd = (e) => {
    e.stopPropagation();
    setDraggedChapterIndex(null);
    setDropTargetChapter(null);
  };

  const handleChapterDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (draggedChapterIndex !== null && draggedChapterIndex !== index) {
      setDropTargetChapter(index);
    }
  };

  const handleChapterDragLeave = (e) => {
    e.stopPropagation();
    // Don't reset here - dragOver will set the correct target
    // and dragEnd/drop will reset it
  };

  const handleChapterDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedChapterIndex === null || draggedChapterIndex === dropIndex) {
      setDraggedChapterIndex(null);
      setDropTargetChapter(null);
      return;
    }

    // Reorder chapters logic
    const newChapters = [...chapters];
    const draggedChapter = newChapters[draggedChapterIndex];
    newChapters.splice(draggedChapterIndex, 1);
    newChapters.splice(dropIndex, 0, draggedChapter);

    // Update local state
    setChapters(newChapters);

    // Update localStorage to persist changes
    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      if (storedData) {
        storedData.response_outline = newChapters;
        localStorage.setItem("sessionData", JSON.stringify(storedData));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }

    setDraggedChapterIndex(null);
    setDropTargetChapter(null);
  };

  // Step drag handlers
  const handleStepDragStart = (e, chapterIndex, stepIndex) => {
    e.stopPropagation();
    setDraggedStepChapterIndex(chapterIndex);
    setDraggedStepIndex(stepIndex);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/step", `${chapterIndex}-${stepIndex}`);
  };

  const handleStepDragEnd = (e) => {
    e.stopPropagation();
    setDraggedStepChapterIndex(null);
    setDraggedStepIndex(null);
    setDropTargetStep(null);
  };

  const handleStepDragOver = (e, chapterIndex, stepIndex) => {
    if (draggedChapterIndex !== null) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (
      draggedStepIndex !== null &&
      !(
        draggedStepChapterIndex === chapterIndex &&
        draggedStepIndex === stepIndex
      )
    ) {
      setDropTargetStep({ chapterIndex, stepIndex });
    }
  };

  const handleStepDragLeave = (e) => {
    // If a chapter is being dragged, don't intercept
    if (draggedChapterIndex !== null) {
      return;
    }
    setDropTargetStep(null);
  };

  const handleStepDrop = (e, chapterIndex, dropIndex) => {
    if (draggedChapterIndex !== null) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    if (
      draggedStepIndex === null ||
      draggedStepChapterIndex === null ||
      draggedStepChapterIndex !== chapterIndex ||
      draggedStepIndex === dropIndex
    ) {
      setDraggedStepChapterIndex(null);
      setDraggedStepIndex(null);
      setDropTargetStep(null);
      return;
    }

    // Reorder steps within the same chapter
    const newChapters = [...chapters];
    const targetChapter = { ...newChapters[chapterIndex] };
    const newSteps = [...targetChapter.steps];
    const draggedStep = newSteps[draggedStepIndex];

    newSteps.splice(draggedStepIndex, 1);
    newSteps.splice(dropIndex, 0, draggedStep);

    targetChapter.steps = newSteps;
    newChapters[chapterIndex] = targetChapter;

    // Update local state
    setChapters(newChapters);

    // Update localStorage to persist changes
    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      if (storedData) {
        storedData.response_outline = newChapters;
        localStorage.setItem("sessionData", JSON.stringify(storedData));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }

    setDraggedStepChapterIndex(null);
    setDraggedStepIndex(null);
    setDropTargetStep(null);
  };

  const handleDeleteStep = (e, chapterIndex, stepIndex, stepTitle) => {
    if (e) e.stopPropagation();

    // Remove step from local state
    const newChapters = [...chapters];
    const targetChapter = { ...newChapters[chapterIndex] };
    const newSteps = [...targetChapter.steps];
    newSteps.splice(stepIndex, 1);
    targetChapter.steps = newSteps;
    newChapters[chapterIndex] = targetChapter;

    // Update local state
    setChapters(newChapters);

    // Clear selected step if it was the deleted one
    if (selectedStep?.title === stepTitle) {
      setSelectedStep(null);
      selectedStepTitleRef.current = null;
    }

    // Update localStorage to persist changes
    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      if (storedData) {
        storedData.response_outline = newChapters;
        localStorage.setItem("sessionData", JSON.stringify(storedData));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  const handleDeleteChapter = (e, chapterIndex) => {
    if (e) e.stopPropagation();
    const deletedChapter = chapters[chapterIndex];

    setOpenMenuIndex(null);
    setEditingChapterIndex((currentIndex) => {
      if (currentIndex === null) return null;
      if (currentIndex === chapterIndex) {
        setChapterEditValue("");
        return null;
      }
      return currentIndex > chapterIndex ? currentIndex - 1 : currentIndex;
    });
    setExpandedChapters((prev) =>
      Object.entries(prev).reduce((acc, [key, value]) => {
        const currentIndex = Number(key);
        if (currentIndex === chapterIndex) return acc;
        acc[currentIndex > chapterIndex ? currentIndex - 1 : currentIndex] = value;
        return acc;
      }, {}),
    );

    // Remove chapter from local state
    const newChapters = [...chapters];
    newChapters.splice(chapterIndex, 1);

    // Update local state
    setChapters(newChapters);

    // Clear selected chapter if it was the deleted one
    if (
      selectedChapterNumber === chapterIndex + 1 ||
      selectedChapterNameRef.current === deletedChapter?.chapter
    ) {
      setSelectedChapter(null);
      setSelectedChapterNumber(null);
      setSelectedStep(null);
      selectedChapterNameRef.current = null;
      selectedStepTitleRef.current = null;
    }

    // Update localStorage to persist changes
    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      if (storedData) {
        storedData.response_outline = newChapters;
        localStorage.setItem("sessionData", JSON.stringify(storedData));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  useEffect(() => {
    try {
      const sessionData = JSON.parse(
        localStorage.getItem("sessionData") || "{}",
      );
      setText(
        sessionData?.cycle_creation_data?.["Basic Information"]?.[
          "Cycle Title"
        ] || "Untitled Cycle",
      );
    } catch {
      setText("Untitled Cycle");
    }
  }, []);

  // if (isGenerating) {
  //   return (
  //     <div className="fixed  left-0 right-0 h-full">
  //       <ProgressbarLoader />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-background rounded-xl overflow-hidden ">
      <div className="w-full p-2 shrink-0">
        <SectionHeader title={text} />
      </div>
      <div className="p-2 w-full flex-1 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 bg-accent rounded-md h-full p-2">
          {/* Left Column */}
          <div className="flex p-2 w-full sm:w-1/3 h-full bg-background rounded-xl min-h-0 overflow-hidden">
            <div className="flex flex-1 flex-col border-2 p-2 h-full min-h-0 overflow-hidden">
              <div className="p-2 border-b border-gray-300 flex justify-between items-center">
                <Label className="text-base text-[#7367F0] font-medium">
                  Phases
                </Label>
                <Button
                  variant="outline"
                  className="text-primary border-2 border-primary"
                  onClick={() => setShowChapterTextarea(true)}
                  disabled={isSubmittingChapter}
                >
                  <Plus size={16} />
                  Add Phase
                </Button>
              </div>
              {showChapterTextarea ? (
                <div className="p-2 border-b border-gray-200">
                  <ChapterTextarea
                    sessionData={prefillData || sessionData}
                    setAllMessages={setAllMessages}
                    onClose={() => setShowChapterTextarea(false)}
                    isSubmittingChapter={isSubmittingChapter}
                    setIsSubmittingChapter={setIsSubmittingChapter}
                  />
                </div>
              ) : null}
              <div className="py-2 flex flex-col gap-2 flex-1 overflow-y-auto">
                {isArrayWithValues(chapters) ? (
                  chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="flex flex-col rounded-sm transition-all duration-200"
                      onDragOver={(e) => handleChapterDragOver(e, index)}
                      onDragLeave={(e) => handleChapterDragLeave(e)}
                      onDrop={(e) => handleChapterDrop(e, index)}
                    >
                      {dropTargetChapter === index &&
                        draggedChapterIndex !== null && (
                          <div className="h-1.5 bg-primary rounded-full mx-2 my-1 transition-all shadow-sm pointer-events-none" />
                        )}
                      <div
                        draggable
                        onDragStart={(e) => handleChapterDragStart(e, index)}
                        onDragEnd={(e) => handleChapterDragEnd(e)}
                        className={`border rounded-sm transition-all duration-200  ${
                          selectedChapter?.chapter === chapter?.chapter &&
                          expandedChapters[index]
                            ? "border-gray-300 bg-primary-100 shadow-sm"
                            : "border-gray-300 bg-white shadow-sm "
                        } ${draggedChapterIndex === index ? "opacity-50" : ""} ${
                          deletingChapterIndex === index
                            ? "opacity-50 pointer-events-none"
                            : ""
                        } group`}
                      >
                        <div
                          onClick={() => handleChapterClick(index, chapter)}
                          className="px-4 py-4 flex flex-col  cursor-pointer gap-2"
                        >
                          <div className="flex justify-between flex-row items-start  h-full shrink-0 ">
                            <div className="flex justify-start gap-4 h-full shrink-0">
                              <GripVertical
                                width={18}
                                height={18}
                                className="cursor-grab active:cursor-grabbing text-gray-500"
                              />
                              <p className="text-[10px] font-medium text-gray-900 px-2">
                                Phase {index + 1}
                              </p>
                            </div>
                            <div className="flex justify-end items-start gap-2 h-full shrink-0">
                              {/* <button
                                onClick={(e) => handleDeleteChapter(e, index)}
                                className={`p-1 rounded-md hover:bg-red-100 transition-colors ${
                                  selectedChapter?.chapter === chapter?.chapter
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                }`}
                                title="Delete Chapter"
                                aria-label={`Delete ${chapter?.chapter || `Chapter ${index + 1}`}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button> */}
                              <div
                                className={`p-1 flex gap-2 rounded-full text-nowrap ${
                                  selectedChapter?.chapter === chapter?.chapter
                                    ? "bg-gray-200"
                                    : "bg-gray-200"
                                }`}
                              >
                                <div
                                  className={`flex justify-center items-center size-[18px] rounded-full ${
                                    selectedChapter?.chapter ===
                                    chapter?.chapter
                                      ? "bg-white text-gray-800"
                                      : "bg-white text-gray-800"
                                  }`}
                                >
                                  <Zap size={12} />
                                </div>
                                <span
                                  className={`text-xs text-gray-800 font-medium px-1`}
                                >
                                  {chapter?.steps?.length || 0}{" "}
                                  {(chapter?.steps?.length || 0) === 1
                                    ? "Step"
                                    : "Steps"}
                                </span>
                              </div>
                            </div>
                            {/* <div className="flex justify-center items-center gap-2 size-5 rounded-full bg-[#C7C2F9]">
                              <ChevronDown
                                size={18}
                                className={`transition-transform duration-200 text-primary-600 ${
                                  expandedChapters[index]
                                    ? "rotate-180"
                                    : "rotate-0"
                                }`}
                              />
                            </div> */}
                          </div>
                          <div className="flex flex-row justify-start items-center h-full flex-1 min-w-0 gap-4">
                            {/* <p className="text-[10px] font-medium text-gray-900">
                              Chapter {index + 1}
                            </p> */}
                            <div className="flex justify-center items-center w-6 h-6 shrink-0 rounded-full bg-[#C7C2F9]">
                              <ChevronDown
                                size={18}
                                className={`transition-transform duration-200 text-primary-600 ${
                                  expandedChapters[index]
                                    ? "rotate-180"
                                    : "rotate-0"
                                }`}
                              />
                            </div>
                            {editingChapterIndex === index ? (
                              <div
                                className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <textarea
                                  value={chapterEditValue}
                                  onChange={(e) => {
                                    setChapterEditValue(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height =
                                      e.target.scrollHeight + "px";
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                      handleCancelChapterEdit(e);
                                    }
                                  }}
                                  className="w-full min-w-0 px-2 py-1 text-base font-medium border-2 shadow-md border-primary-400 rounded-md focus:outline-none focus:ring-primary resize-none overflow-hidden"
                                  autoFocus
                                  rows={1}
                                  ref={(el) => {
                                    if (el) {
                                      el.style.height = "auto";
                                      el.style.height = el.scrollHeight + "px";
                                    }
                                  }}
                                />
                                <div className="border-t border-gray-300 mt-1 mb-2"></div>
                                <div className="flex gap-2 items-end justify-end">
                                  <button
                                    onClick={(e) =>
                                      handleSaveChapterTitle(e, index)
                                    }
                                    className="flex items-center px-2 py-1 text-xs font-medium text-white bg-primary rounded-sm hover:bg-primary-700 transition-colors border border-primary"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelChapterEdit}
                                    className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white rounded-sm hover:bg-primary-100 transition-colors border border-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
                                {deletingChapterIndex === index ? (
                                  <div
                                    className="flex items-center gap-3 rounded-xl border border-[#D9D6FF] bg-gradient-to-r from-[#F4F2FF] via-white to-[#F8F7FF] px-3 py-3 shadow-sm w-full"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                      <GradientLoader size={20} />
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-[#352F6E]">
                                        Deleting phase
                                      </p>
                                      <p className="text-xs text-[#574EB6]">
                                        Please wait while we update this phase.
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                <p
                                  className={`text-base font-medium line-clamp-2 ${
                                    selectedChapter?.chapter ===
                                      chapter?.chapter &&
                                    expandedChapters[index]
                                      ? "text-primary font-medium"
                                      : "text-gray-900"
                                  }`}
                                  style={{
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {chapter?.chapter || "Untitled Chapter"}
                                </p>
                                <div className="relative">
                                  <button
                                    onClick={(e) =>
                                      handleChapterMenuClick(e, index)
                                    }
                                    className="p-1 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    title="Options"
                                    disabled={deletingChapterIndex !== null}
                                  >
                                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                  </button>
                                    {openMenuIndex === index &&
                                      ReactDOM.createPortal(
                                        <>
                                          <div
                                            className="fixed inset-0 z-[99]"
                                            onClick={() =>
                                              setOpenMenuIndex(null)
                                            }
                                          />
                                          <div
                                            className="fixed bg-white border border-gray-100 rounded-xl shadow-xl z-[100] min-w-[100px] py-1 overflow-hidden"
                                            style={{
                                              top: menuPosition.top,
                                              left: menuPosition.left,
                                            }}
                                          >
                                            <button
                                              onClick={(e) =>
                                                handleEditChapterClick(
                                                  e,
                                                  index,
                                                  chapter?.chapter,
                                                )
                                              }
                                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                              Edit
                                            </button>

                                            <button
                                              onClick={(e) =>
                                                handleRequestDeleteChapter(e, index)
                                              }
                                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </>,
                                        document.body,
                                      )}
                                  </div>
                                  </>
                                )}
                              </div>
                          )}
                          </div>
                          {/* <div className="flex justify-end items-start gap-2 h-full shrink-0">
                            <div
                              className={`p-1 flex gap-2 rounded-full text-nowrap ${
                                selectedChapter?.chapter === chapter?.chapter
                                  ? "bg-gray-200"
                                  : "bg-gray-200"
                              }`}
                            >
                              <div
                                className={`flex justify-center items-center size-[18px] rounded-full ${
                                  selectedChapter?.chapter === chapter?.chapter
                                    ? "bg-white text-gray-800"
                                    : "bg-white text-gray-800"
                                }`}
                              >
                                <Zap size={12} />
                              </div>
                              <span
                                className={`text-xs ${
                                  selectedChapter?.chapter === chapter?.chapter
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-800"
                                }`}
                              >
                                {chapter?.steps?.length || 0}{" "}
                                {(chapter?.steps?.length || 0) === 1
                                  ? "Step"
                                  : "Steps"}
                              </span>
                            </div>
                          </div> */}
                        </div>
                        {expandedChapters[index] &&
                          isArrayWithValues(chapter?.steps) && (
                            <div className="px-3 pb-3">
                              <div className="flex flex-col gap-2 p-2">
                                {chapter?.steps.map((step, stepIndex) => (
                                  <React.Fragment key={stepIndex}>
                                    {dropTargetStep?.chapterIndex === index &&
                                      dropTargetStep?.stepIndex === stepIndex &&
                                      draggedStepIndex !== null && (
                                        <div className="h-1 bg-primary rounded-full mx-2 my-1 transition-all" />
                                      )}
                                    <div
                                      draggable
                                      onDragStart={(e) =>
                                        handleStepDragStart(e, index, stepIndex)
                                      }
                                      onDragEnd={(e) => handleStepDragEnd(e)}
                                      onDragOver={(e) =>
                                        handleStepDragOver(e, index, stepIndex)
                                      }
                                      onDragLeave={(e) =>
                                        handleStepDragLeave(e)
                                      }
                                      onDrop={(e) =>
                                        handleStepDrop(e, index, stepIndex)
                                      }
                                      className={`group relative flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                        selectedStep?.title === step?.title
                                          ? "bg-primary-700 border border-primary shadow-sm text-white"
                                          : "bg-white hover:bg-accent hover:shadow-md text-gray-900"
                                      } ${
                                        draggedStepIndex === stepIndex &&
                                        draggedStepChapterIndex === index
                                          ? "opacity-50"
                                          : ""
                                      }`}
                                      onClick={(e) =>
                                        handleStepClick(e, chapter, step, index)
                                      }
                                    >
                                      <div
                                        className={`flex justify-center items-center gap-4 h-full shrink-0 ${
                                          selectedStep?.title === step?.title
                                            ? "text-white bg-primary-700 py-1 rounded-[4px]"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        <GripVertical
                                          width={18}
                                          height={18}
                                          className="cursor-grab active:cursor-grabbing shrink-0"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 pr-6">
                                        <div
                                          className={`font-medium base shrink-0 mt-0.5 ${
                                            selectedStep?.title === step?.title
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          Step {stepIndex + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                          {deletingStepKey === `${index}-${stepIndex}` ? (
                                            <div
                                              className="flex items-center gap-3 rounded-xl border border-[#D9D6FF] bg-gradient-to-r from-[#F4F2FF] via-white to-[#F8F7FF] px-3 py-2 shadow-sm"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                                <GradientLoader size={16} />
                                              </span>
                                              <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[#352F6E]">Deleting step</p>
                                                <p className="text-[11px] text-[#574EB6]">Please wait while we update this step.</p>
                                              </div>
                                            </div>
                                          ) : editingStepKey ===
                                          `${index}-${stepIndex}` ? (
                                            <div
                                              className="flex flex-col gap-1 min-w-0 w-full"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <textarea
                                                value={stepEditValue}
                                                onChange={(e) => {
                                                  setStepEditValue(
                                                    e.target.value,
                                                  );
                                                  e.target.style.height =
                                                    "auto";
                                                  e.target.style.height =
                                                    e.target.scrollHeight +
                                                    "px";
                                                }}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Escape") {
                                                    handleCancelStepEdit(e);
                                                  }
                                                }}
                                                className={`w-full min-w-0 px-2 py-1 text-sm font-medium border rounded-md focus:outline-none resize-none overflow-hidden ${
                                                  selectedStep?.title ===
                                                  step?.title
                                                    ? "bg-white/20 border-white/50 text-white placeholder-white/70 focus:ring-white/50"
                                                    : "bg-white border-primary-400 shadow-md border-2 text-gray-900 focus:ring-primary"
                                                }`}
                                                autoFocus
                                                rows={1}
                                                ref={(el) => {
                                                  if (el) {
                                                    el.style.height = "auto";
                                                    el.style.height =
                                                      el.scrollHeight + "px";
                                                  }
                                                }}
                                              />
                                              <div className="border-t border-gray-300 mt-1 mb-2"></div>
                                              <div className="flex gap-2 items-end justify-end">
                                                <button
                                                  onClick={(e) =>
                                                    handleSaveStepTitle(
                                                      e,
                                                      index,
                                                      stepIndex,
                                                    )
                                                  }
                                                  className="flex items-center px-2 py-1 text-xs font-medium text-white bg-primary rounded-sm hover:bg-primary-700 transition-colors border border-primary"
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  onClick={handleCancelStepEdit}
                                                  className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white rounded-sm hover:bg-primary-100 transition-colors border border-gray-300"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <p
                                              className={`text-sm line-clamp-2 ${selectedStep?.title === step?.title ? "text-white" : "text-gray-700"}`}
                                            >
                                              {step?.title ||
                                                `Step ${stepIndex + 1}`}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {!deletingStepKey && (
                                        <div className="absolute top-1 right-1">
                                          <button
                                            onClick={(e) => handleStepMenuClick(e, index, stepIndex)}
                                            className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 ${
                                              selectedStep?.title === step?.title
                                                ? "hover:bg-white/20 text-white"
                                                : "hover:bg-gray-200 text-gray-500"
                                            }`}
                                            title="Options"
                                          >
                                            <MoreHorizontal className="w-3 h-3" />
                                          </button>
                                          {openStepMenuKey === `${index}-${stepIndex}` &&
                                            ReactDOM.createPortal(
                                              <>
                                                <div
                                                  className="fixed inset-0 z-[99]"
                                                  onClick={() => setOpenStepMenuKey(null)}
                                                />
                                                <div
                                                  className="fixed bg-white border border-gray-100 rounded-xl shadow-xl z-[100] min-w-[100px] py-1 overflow-hidden"
                                                  style={{ top: stepMenuPosition.top, left: stepMenuPosition.left }}
                                                >
                                                  <button
                                                    onClick={(e) => {
                                                      handleEditStepClick(e, index, stepIndex, step?.title);
                                                      setOpenStepMenuKey(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setStepDeleteConfirm({ chapterIndex: index, stepIndex, stepTitle: step?.title });
                                                      setOpenStepMenuKey(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                  >
                                                    Delete
                                                  </button>
                                                </div>
                                              </>,
                                              document.body,
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-sm text-gray-500">
                      No phases available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Steps Display */}
          <div className="flex p-2 w-full sm:w-2/3 bg-background rounded-xl overflow-hidden">
            <StepsDisplay
              selectedChapter={selectedChapter}
              chapterNumber={selectedChapterNumber}
              setAllMessages={setAllMessages}
              sessionData={sessionData}
              selectedStep={selectedStep}
              isAskingKyper={isAskingKyper}
              setIsAskingKyper={setIsAskingKyper}
              isSubmittingStep={isSubmittingStep}
              setIsSubmittingStep={setIsSubmittingStep}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0">
        <OutlineMannerFooter
        // isGenerating={isGenerating}
        // setIsGenerating={setIsGenerating}
        />
      </div>

      {/* Step Delete Confirmation Dialog */}
      <Dialog
        open={stepDeleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setStepDeleteConfirm(null);
        }}
      >
        <DialogContent
          customPosition
          overlayClassName="top-[4.5rem] lg:left-[calc(360px+1rem)]"
          className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[408px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 p-0 shadow-xl lg:left-[calc(50%+11.5rem)] [&>button]:hidden"
        >
          <div className="px-5 py-4">
            <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3F2]">
                <img
                  src="/bins.svg"
                  alt="Delete"
                  className="h-[18px] w-[18px]"
                />
              </div>
              <div className="space-y-1.5">
                <DialogTitle className="text-[15px] font-semibold leading-6 text-[#181D27]">
                  Delete Step
                </DialogTitle>
                <DialogDescription className="text-sm leading-5 text-[#181D27]">
                  <span className="block">
                    This action will permanently remove this step from the cycle.
                  </span>
                  <span className="mt-1.5 block">Do you want to proceed?</span>
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
          <div className="border-t border-gray-200 px-5 py-3.5">
            <DialogFooter className="flex-row justify-end gap-3 space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-9 min-w-[92px] rounded-lg border-primary text-primary hover:bg-primary-50 active:bg-primary-100"
              onClick={() => setStepDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 min-w-[92px] rounded-lg"
              onClick={() => {
                if (!stepDeleteConfirm) return;
                const { chapterIndex, stepIndex, stepTitle } = stepDeleteConfirm;
                setStepDeleteConfirm(null);
                handleDeleteStepWithLoader(null, chapterIndex, stepIndex, stepTitle);
              }}
            >
              Delete
            </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chapter Delete Confirmation Dialog */}
      <Dialog
        open={chapterDeleteConfirmIndex !== null}
        onOpenChange={(open) => {
          if (!open) setChapterDeleteConfirmIndex(null);
        }}
      >
        <DialogContent
          customPosition
          overlayClassName="top-[4.5rem] lg:left-[calc(360px+1rem)]"
          className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[408px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 p-0 shadow-xl lg:left-[calc(50%+11.5rem)] [&>button]:hidden"
        >
          <div className="px-5 py-4">
            <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3F2]">
                <img
                  src="/bins.svg"
                  alt="Delete"
                  className="h-[18px] w-[18px]"
                />
              </div>
              <div className="space-y-1.5">
                <DialogTitle className="text-[15px] font-semibold leading-6 text-[#181D27]">
                  Delete Phase
                </DialogTitle>
                <DialogDescription className="text-sm leading-5 text-[#181D27]">
                  <span className="block">
                    This action will permanently remove this phase from the cycle.
                  </span>
                  <span className="mt-1.5 block">Do you want to proceed?</span>
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
          <div className="border-t border-gray-200 px-5 py-3.5">
            <DialogFooter className="flex-row justify-end gap-3 space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-9 min-w-[92px] rounded-lg border-primary text-primary hover:bg-primary-50 active:bg-primary-100"
              onClick={() => setChapterDeleteConfirmIndex(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 min-w-[92px] rounded-lg"
              onClick={handleConfirmDeleteChapter}
            >
              Delete
            </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
