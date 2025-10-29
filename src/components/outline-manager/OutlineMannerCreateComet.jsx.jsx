"use client";

import React, { useState } from "react";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import SectionHeader from "@/components/section-header";
import OutlineMannerFooter from "./OutlineMannerFooter";
import StepsDisplay from "./StepsDisplay";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Plus, GripVertical, Zap, ChevronDown } from "lucide-react";
import SelectIcon from "@/components/icons/SelectIcon";

export default function OutlineMannerCreateComet({ sessionData }) {
  // Use session data for chapters if available, otherwise fall back to default health model
  console.log("sessionData in OutlineMannerCreateComet:", sessionData);
  const chapters = isArrayWithValues(sessionData?.response_outline)
    ? sessionData.response_outline.map((chapter) => ({
        chapter: chapter?.chapter || "Untitled Chapter",
        steps: isArrayWithValues(chapter?.steps) ? chapter.steps : [],
      }))
    : [];
  console.log("chapters", chapters);
  const [expandedChapters, setExpandedChapters] = useState([]);

  // State for selected chapter
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  const handleChapterClick = (index, chapter) => {
    setSelectedChapter(chapter);
    if (isArrayWithValues(chapter?.steps)) {
      setExpandedChapters((prev) => ({ ...prev, [index]: !prev[index] }));
    } else {
      setExpandedChapters((prev) => ({ ...prev, [index]: false }));
    }
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
            <div className="flex flex-1 flex-col border p-2 overflow-y-auto">
              <div className="p-2 border-b border-gray-300 flex justify-between items-center">
                <Label className="text-base text-[#7367F0] font-medium">
                  Chapters
                </Label>
                <Button
                  variant="outline"
                  className="text-primary border-primary"
                >
                  <Plus size={16} />
                  Add Chapter
                </Button>
              </div>
              <div className="py-2 flex flex-col gap-2">
                {isArrayWithValues(chapters) ? (
                  chapters.map((chapter, index) => (
                    <React.Fragment key={index}>
                      <div
                        className={`border rounded-md transition-all duration-200 ${
                          selectedChapter?.chapter === chapter?.chapter
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-300 hover:shadow-md hover:border-gray-400"
                        }`}
                      >
                        <div
                          onClick={() => handleChapterClick(index, chapter)}
                          className="px-3 py-4 flex items-center gap-2 cursor-pointer"
                        >
                          <div className="flex justify-start flex-col items-start gap-4 h-full shrink-0">
                            <GripVertical
                              width={18}
                              height={18}
                              className="cursor-grab shrink-0"
                            />
                            <div className="flex justify-end items-center gap-2 size-4 rounded-full bg-primary/10">
                              <ChevronDown
                                size={16}
                                className={`transition-transform ${
                                  expandedChapters[index]
                                    ? "rotate-180"
                                    : "rotate-0"
                                }`}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col justify-start items-start h-full flex-1 min-w-0">
                            <p className="text-[10px] font-medium">
                              Chapter {index + 1}
                            </p>
                            <p
                              className={`text-base ${
                                selectedChapter?.chapter === chapter?.chapter
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {chapter?.chapter || "Untitled Chapter"}
                            </p>
                          </div>
                          <div className="flex justify-end items-start gap-2 h-full shrink-0">
                            <div
                              className={`p-1 flex gap-2 rounded-full text-nowrap ${
                                selectedChapter?.chapter === chapter?.chapter
                                  ? "bg-primary/10"
                                  : "bg-gray-100"
                              }`}
                            >
                              <div
                                className={`flex justify-center items-center size-[18px] rounded-full ${
                                  selectedChapter?.chapter === chapter?.chapter
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-gray-800"
                                }`}
                              >
                                <Zap size={16} />
                              </div>
                              <span
                                className={`text-xs ${
                                  selectedChapter?.chapter === chapter?.chapter
                                    ? "text-primary font-medium"
                                    : "text-gray-800"
                                }`}
                              >
                                {chapter?.steps?.length || 0} Steps
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedChapters[index] &&
                          isArrayWithValues(chapter?.steps) && (
                            <div className="px-3 pb-3">
                              <div className="flex flex-col gap-2 p-2">
                                {chapter?.steps.map((step, stepIndex) => (
                                  <div
                                    key={stepIndex}
                                    className="flex items-center gap-3 bg-white p-2 hover:bg-accent cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedChapter(chapter);
                                      setSelectedStep(step);
                                    }}
                                  >
                                    <div className="flex justify-center items-center gap-4 h-full shrink-0">
                                      <GripVertical
                                        width={18}
                                        height={18}
                                        className="cursor-grab shrink-0"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-md font-medium text-primary shrink-0 mt-0.5">
                                        step 1.{stepIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-base font-medium text-primary">
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
            <StepsDisplay selectedChapter={selectedChapter} />
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
