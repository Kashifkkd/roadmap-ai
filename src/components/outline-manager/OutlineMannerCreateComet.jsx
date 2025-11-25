"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import SectionHeader from "@/components/section-header";
import OutlineMannerFooter from "./OutlineMannerFooter";
import StepsDisplay from "./StepsDisplay";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Plus, GripVertical, Zap, ChevronDown } from "lucide-react";
import SelectIcon from "@/components/icons/SelectIcon";
import ChapterTextarea from "./ChapterTextarea";
import ProgressbarLoader from "@/components/loader";
import { temp2 } from "../../hooks/temp2";

export default function OutlineMannerCreateComet({
  sessionData,
  prefillData,
  setAllMessages,
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

  // Chapter drag handlers
  const handleChapterDragStart = (e, index) => {
    setDraggedChapterIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleChapterDragEnd = () => {
    setDraggedChapterIndex(null);
  };

  const handleChapterDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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
  };

  const handleStepDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
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
                    sessionData={sessionData}
                    setAllMessages={setAllMessages}
                    onClose={() => setShowChapterTextarea(false)}
                  />
                </div>
              ) : null}
              <div className="py-2 flex flex-col gap-2">
                {isArrayWithValues(chapters) ? (
                  chapters.map((chapter, index) => (
                    <React.Fragment key={index}>
                      <div
                        draggable
                        onDragStart={(e) => handleChapterDragStart(e, index)}
                        onDragEnd={handleChapterDragEnd}
                        onDragOver={handleChapterDragOver}
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
                                  <div
                                    key={stepIndex}
                                    draggable
                                    onDragStart={(e) =>
                                      handleStepDragStart(e, index, stepIndex)
                                    }
                                    onDragEnd={handleStepDragEnd}
                                    onDragOver={handleStepDragOver}
                                    onDrop={(e) =>
                                      handleStepDrop(e, index, stepIndex)
                                    }
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 ${
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
                                    <div className="flex-1 min-w-0 ">
                                      <div
                                        className={`text-sm shrink-0 mt-0.5
                                          `}
                                      >
                                        step {stepIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-base font-medium`}>
                                          {step?.title ||
                                            `Step ${stepIndex + 1}`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
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
