"use client";

import React, { useState } from "react";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import SectionHeader from "@/components/section-header";
import OutlineMannerFooter from "./OutlineMannerFooter";
import StepsDisplay from "./StepsDisplay";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Plus, GripVertical, Zap } from "lucide-react";
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

  // State for selected chapter
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-background rounded-xl overflow-hidden">
      <div className="w-full p-2 flex-shrink-0">
        <SectionHeader title="New Manager Essentials" />
      </div>
      <div className="p-2 w-full flex-1 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 bg-accent rounded-xl h-full p-2">
          {/* Left Column */}
          <div className="flex p-2 w-full sm:w-2/5 bg-background rounded-xl overflow-hidden">
            <div className="flex flex-1 flex-col border rounded-xl p-2 overflow-y-auto">
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
                    <div
                      key={index}
                      onClick={() => setSelectedChapter(chapter)}
                      className={`px-3 py-4 flex items-center gap-2 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedChapter?.chapter === chapter?.chapter
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-start items-start gap-2 h-full flex-shrink-0">
                        <GripVertical
                          width={18}
                          height={18}
                          className="cursor-grab flex-shrink-0"
                        />
                        <SelectIcon />
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
                      <div className="flex justify-end items-start gap-2 h-full flex-shrink-0">
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
          <div className="flex p-2 w-full sm:w-3/5 bg-background rounded-xl overflow-hidden">
            <StepsDisplay selectedChapter={selectedChapter} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <OutlineMannerFooter />
      </div>
    </div>
  );
}
