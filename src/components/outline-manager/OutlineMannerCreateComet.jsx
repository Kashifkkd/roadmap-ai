"use client";

import React, { useState, useMemo } from "react";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import SectionHeader from "@/components/section-header";
import OutlineMannerFooter from "./OutlineMannerFooter";
import StepsDisplay from "./StepsDisplay";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Plus, GripVertical, Zap, ChevronDown } from "lucide-react";
import SelectIcon from "@/components/icons/SelectIcon";
import ChapterTextarea from "./ChapterTextarea";
import { temp } from "../../hooks/temp";

export default function OutlineMannerCreateComet({
  sessionData,
  prefillData,
  setAllMessages,
}) {
  console.log("sessionData in OutlineMannerCreateComet:", sessionData);
  console.log("prefillData in OutlineMannerCreateComet:", prefillData);
  console.log("temp in OutlineMannerCreateComet:", temp);

  const sourceOutline = useMemo(() => {
    if (isArrayWithValues(prefillData?.response_outline))
      return prefillData.response_outline;
    if (isArrayWithValues(sessionData?.response_outline))
      return sessionData.response_outline;
    if (isArrayWithValues(temp[0]?.response_outline))
      return temp[0].response_outline;
    return [];
  }, [prefillData, sessionData]);

  const chapters = useMemo(() => {
    return isArrayWithValues(sourceOutline)
      ? sourceOutline.map((chapter) => ({
          chapter: chapter?.chapter || "Untitled Chapter",
          steps: isArrayWithValues(chapter?.steps) ? chapter.steps : [],
        }))
      : [];
  }, [sourceOutline]);

  console.log("chapters", chapters);
  const [expandedChapters, setExpandedChapters] = useState({});

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showChapterTextarea, setShowChapterTextarea] = useState(false);

  const handleChapterClick = (index, chapter) => {
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
    setSelectedChapter(chapter);
    setSelectedChapterNumber(chapterIndex + 1); // Chapter number (1-based index)
    setSelectedStep(step);
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-background rounded-xl overflow-hidden">
      <div className="w-full p-2 shrink-0">
        <SectionHeader title="New Manager Essentials" />
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
                        className={`border rounded-sm transition-all duration-200  ${
                          selectedChapter?.chapter === chapter?.chapter &&
                          expandedChapters[index]
                            ? "border-gray-300 bg-primary-100 shadow-sm"
                            : "border-gray-300 bg-white shadow-sm "
                        }`}
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
                                className="cursor-grab  text-gray-500"
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
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                      selectedStep?.title === step?.title
                                        ? "bg-primary-700 border border-primary shadow-sm text-white"
                                        : "bg-white hover:bg-accent hover:shadow-md text-gray-900"
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
                                        className="cursor-grab shrink-0"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0 ">
                                      <div
                                        className={`text-sm shrink-0 mt-0.5
                                          `}
                                      >
                                        step {index + 1}.{stepIndex + 1}
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
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0">
        <OutlineMannerFooter />
      </div>
    </div>
  );
}
