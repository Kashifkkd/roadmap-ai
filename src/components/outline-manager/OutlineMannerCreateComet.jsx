"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import SectionHeader from "@/components/section-header";
import OutlineMannerFooter from "./OutlineMannerFooter";
import StepsDisplay from "./StepsDisplay";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Plus, GripVertical, Zap, ChevronDown, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import SelectIcon from "@/components/icons/SelectIcon";
import ChapterTextarea from "./ChapterTextarea";
import Loader from "@/components/loader2";
import { temp2 } from "../../hooks/temp2";

export default function OutlineMannerCreateComet({
  sessionData,
  prefillData,
  setAllMessages,
  isAskingKyper = false,
  setIsAskingKyper = () => {},
  isSubmittingStep = false,
  setIsSubmittingStep = () => {},
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
        chapter: chapter?.chapter || "Untitled Chapter",
        steps: isArrayWithValues(chapter?.steps) ? chapter.steps : [],
      }));
      setChapters(mappedChapters);
    } else {
      setChapters([]);
    }
  }, [sourceOutline]);

  const [expandedChapters, setExpandedChapters] = useState({});

  const [text, setText] = useState("New Manager Essentials");
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
  const [editingChapterIndex, setEditingChapterIndex] = useState(null);
  const [chapterEditValue, setChapterEditValue] = useState("");

  // Step title editing state
  const [editingStepKey, setEditingStepKey] = useState(null); // "chapterIndex-stepIndex"
  const [stepEditValue, setStepEditValue] = useState("");

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
        (ch) => ch?.chapter === chapterName
      );

      if (chapterIndex !== -1) {
        const updatedChapter = chapters[chapterIndex];
        setSelectedChapter(updatedChapter);
        setSelectedChapterNumber(chapterIndex + 1);
        const stepTitle = selectedStepTitleRef.current;
        if (stepTitle && isArrayWithValues(updatedChapter?.steps)) {
          const stepIndex = updatedChapter.steps.findIndex(
            (step) => step?.title === stepTitle
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
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleEditChapterClick = (e, index, title) => {
    e.stopPropagation();
    setEditingChapterIndex(index);
    setChapterEditValue(title || "");
    setOpenMenuIndex(null);
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
        localStorage.getItem("sessionData") || "{}"
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
        localStorage.getItem("sessionData") || "{}"
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
    setDraggedChapterIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleChapterDragEnd = () => {
    setDraggedChapterIndex(null);
    setDropTargetChapter(null);
  };

  const handleChapterDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedChapterIndex !== null && draggedChapterIndex !== index) {
      setDropTargetChapter(index);
    }
  };

  const handleChapterDragLeave = () => {
    setDropTargetChapter(null);
  };

  const handleChapterDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedChapterIndex === null || draggedChapterIndex === dropIndex) {
      setDraggedChapterIndex(null);
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
        localStorage.getItem("sessionData") || "{}"
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
  };

  const handleStepDragEnd = (e) => {
    e.stopPropagation();
    setDraggedStepChapterIndex(null);
    setDraggedStepIndex(null);
    setDropTargetStep(null);
  };

  const handleStepDragOver = (e, chapterIndex, stepIndex) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (draggedStepIndex !== null && !(draggedStepChapterIndex === chapterIndex && draggedStepIndex === stepIndex)) {
      setDropTargetStep({ chapterIndex, stepIndex });
    }
  };

  const handleStepDragLeave = () => {
    setDropTargetStep(null);
  };

  const handleStepDrop = (e, chapterIndex, dropIndex) => {
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
        localStorage.getItem("sessionData") || "{}"
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
    e.stopPropagation();

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
        localStorage.getItem("sessionData") || "{}"
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
    e.stopPropagation();

    // Remove chapter from local state
    const newChapters = [...chapters];
    newChapters.splice(chapterIndex, 1);

    // Update local state
    setChapters(newChapters);

    // Clear selected chapter if it was the deleted one
    if (selectedChapterNumber === chapterIndex + 1) {
      setSelectedChapter(null);
      setSelectedChapterNumber(null);
      setSelectedStep(null);
      selectedChapterNameRef.current = null;
      selectedStepTitleRef.current = null;
    }

    // Update localStorage to persist changes
    try {
      const storedData = JSON.parse(
        localStorage.getItem("sessionData") || "{}"
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
        localStorage.getItem("sessionData") || "{}"
      );
      setText(
        sessionData?.comet_creation_data?.["Basic Information"]?.[
        "Comet Title"
        ] || "New Manager Essentials"
      );
    } catch {
      setText("New Manager Essentials");
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
          <div className="flex p-2 w-full sm:w-1/3 bg-background rounded-xl overflow-hidden">
            <div className="flex flex-1 flex-col border-2 p-2 overflow-y-auto">
              <div className="p-2 border-b border-gray-300 flex justify-between items-center">
                <Label className="text-base text-[#7367F0] font-medium">
                  Chapters
                </Label>
                <Button
                  variant="outline"
                  className="text-primary border-2 border-primary"
                  onClick={() => setShowChapterTextarea(true)}
                >
                  <Plus size={16} />
                  Add Chapter
                </Button>
              </div>
              {showChapterTextarea ? (
                <div className="p-2 border-b border-gray-200">
                  <ChapterTextarea
                    sessionData={prefillData || sessionData}
                    setAllMessages={setAllMessages}
                    onClose={() => setShowChapterTextarea(false)}
                  />
                </div>
              ) : null}
              <div className="py-2 flex flex-col gap-2">
                {isArrayWithValues(chapters) ? (
                  chapters.map((chapter, index) => (
                    <React.Fragment key={index}>
                      {dropTargetChapter === index && draggedChapterIndex !== null && (
                        <div className="h-1 bg-primary rounded-full mx-2 my-1 transition-all" />
                      )}
                      <div
                        draggable
                        onDragStart={(e) => handleChapterDragStart(e, index)}
                        onDragEnd={handleChapterDragEnd}
                        onDragOver={(e) => handleChapterDragOver(e, index)}
                        onDragLeave={handleChapterDragLeave}
                        onDrop={(e) => handleChapterDrop(e, index)}
                        className={`border rounded-sm transition-all duration-200  ${
                          selectedChapter?.chapter === chapter?.chapter &&
                            expandedChapters[index]
                            ? "border-gray-300 bg-primary-100 shadow-sm"
                            : "border-gray-300 bg-white shadow-sm "
                          } ${draggedChapterIndex === index ? "opacity-50" : ""}`}
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
                                Chapter {index + 1}
                              </p>
                            </div>
                            <div className="flex justify-end items-start gap-2 h-full shrink-0">
                              {/* <button
                                onClick={(e) => handleDeleteChapter(e, index)}
                                className="p-1 rounded-md hover:bg-red-100 transition-colors"
                                title="Delete Chapter"
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
                                  {chapter?.steps?.length || 0} Steps
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
                              <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={chapterEditValue}
                                  onChange={(e) => setChapterEditValue(e.target.value)}
                                  onKeyDown={(e) => handleChapterEditKeyDown(e, index)}
                                  className="flex-1 px-2 py-1 text-base font-medium border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => handleSaveChapterTitle(e, index)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  title="Save"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelChapterEdit}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center gap-2">
                                <p
                                  className={`text-base font-medium ${
                                    selectedChapter?.chapter === chapter?.chapter &&
                                      expandedChapters[index]
                                      ? "text-primary font-medium"
                                      : "text-gray-900"
                                    }`}
                                >
                                  {chapter?.chapter || "Untitled Chapter"}
                                </p>
                                {(selectedChapter?.chapter === chapter?.chapter || expandedChapters[index]) && (
                                  <div className="relative">
                                    <button
                                      onClick={(e) => handleChapterMenuClick(e, index)}
                                      className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                                      title="Options"
                                    >
                                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                    </button>
                                    {openMenuIndex === index && (
                                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[100px]">
                                        <button
                                          onClick={(e) => handleEditChapterClick(e, index, chapter?.chapter)}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          onClick={(e) => handleDeleteChapter(e, index)}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          Delete
                                        </button>

                                      </div>
                                    )}
                                  </div>
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
                                {chapter?.steps?.length || 0} Steps
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
                                    {dropTargetStep?.chapterIndex === index && dropTargetStep?.stepIndex === stepIndex && draggedStepIndex !== null && (
                                      <div className="h-1 bg-primary rounded-full mx-2 my-1 transition-all" />
                                    )}
                                    <div
                                      draggable
                                      onDragStart={(e) =>
                                        handleStepDragStart(e, index, stepIndex)
                                      }
                                      onDragEnd={handleStepDragEnd}
                                      onDragOver={(e) => handleStepDragOver(e, index, stepIndex)}
                                      onDragLeave={handleStepDragLeave}
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
                                      {/* Delete Step Button - Top Right */}
                                      <button
                                        onClick={(e) => handleDeleteStep(e, index, stepIndex, step?.title)}
                                        className={`absolute top-1 right-1 p-1 rounded-md transition-colors z-10 opacity-0 group-hover:opacity-100 ${selectedStep?.title === step?.title
                                          ? "hover:bg-red-500/30 text-white"
                                          : "hover:bg-red-100 text-red-500"
                                          }`}
                                        title="Delete Step"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>

                                      <button
                                        onClick={(e) => handleEditStepClick(e, index, stepIndex, step?.title)}
                                        className={`absolute top-10 right-1 p-1 rounded-md transition-colors z-10 opacity-0 group-hover:opacity-100 ${selectedStep?.title === step?.title
                                          ? "hover:bg-white/20 text-white"
                                          : "hover:bg-gray-200 text-gray-500"
                                          }`}
                                        title="Edit Step Title"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>

                                      <div
                                        className={`flex justify-center items-center gap-4 h-full shrink-0 ${selectedStep?.title === step?.title
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
                                          className={`font-medium base text-gray-900 shrink-0 mt-0.5
                                          `}
                                        >
                                          Step {stepIndex + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                          {editingStepKey === `${index}-${stepIndex}` ? (
                                            <div className="flex items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                              <input
                                                type="text"
                                                value={stepEditValue}
                                                onChange={(e) => setStepEditValue(e.target.value)}
                                                onKeyDown={(e) => handleStepEditKeyDown(e, index, stepIndex)}
                                                className="flex-1 min-w-0 px-1 py-0.5 text-sm font-medium border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary text-gray-900"
                                                autoFocus
                                              />
                                              <button
                                                onClick={(e) => handleSaveStepTitle(e, index, stepIndex)}
                                                className="p-0.5 text-green-600 hover:bg-green-100 rounded"
                                                title="Save"
                                              >
                                                ✓
                                              </button>
                                              <button
                                                onClick={handleCancelStepEdit}
                                                className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                                                title="Cancel"
                                              >
                                                ✕
                                              </button>
                                            </div>
                                          ) : (
                                            <p className={`text-sm text-gray-700`}>
                                              {step?.title ||
                                                `Step ${stepIndex + 1}`}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-sm text-gray-500">
                      No chapters available
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
    </div>
  );
}
