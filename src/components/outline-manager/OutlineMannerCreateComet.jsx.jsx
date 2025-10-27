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

// Default health model data structure
const defaultHealthModel = [
  {
    chapter: "Foundations of Health",
    steps: [
      {
        step: 1,
        title: "Discovering What Health Really Means",
        aha: "Health is more than the absence of illness; it's the dynamic balance of physical, mental, and social well-being.",
        action:
          "Reflect on your current understanding of health and list areas where you feel balanced or imbalanced.",
        tool: "Health Self-Assessment Checklist",
      },
      {
        step: 2,
        title: "The Pillars of a Holistic Health Model",
        aha: "A comprehensive health model integrates multiple dimensions: physical, emotional, social, and environmental factors.",
        action:
          "Map out the key pillars of your own health and identify which require more attention.",
        tool: "Holistic Health Pillars Framework",
      },
    ],
  },
  {
    chapter: "Designing Your Health Model",
    steps: [
      {
        step: 3,
        title: "Personalizing Health Goals through Lifestyle Choices",
        aha: "Effective health models align with individual lifestyle preferences and behaviors for sustainable impact.",
        action:
          "Set SMART goals related to nutrition, exercise, sleep, and stress management based on personal preferences.",
        tool: "SMART Goal Setting Template",
      },
      {
        step: 4,
        title: "Recognizing Barriers to Health and Overcoming Them",
        aha: "Awareness of internal and external barriers empowers you to strategize solutions proactively.",
        action:
          "Identify common obstacles in your health journey and brainstorm practical ways to overcome them.",
        tool: "Barrier Analysis Worksheet",
      },
      {
        step: 5,
        title: "Incorporating Mental and Emotional Wellness",
        aha: "Mental and emotional health profoundly influence physical well-being and behavior patterns.",
        action:
          "Integrate mindfulness or stress reduction techniques into your daily routine.",
        tool: "Mindfulness Practice Guide",
      },
    ],
  },
  {
    chapter: "Sustaining Your Health Model",
    steps: [
      {
        step: 6,
        title: "Building Supportive Social Connections",
        aha: "Strong social relationships provide motivation and accountability essential for lasting health improvements.",
        action:
          "Identify your support network and plan ways to engage them in your health goals.",
        tool: "Social Support Mapping Tool",
      },
      {
        step: 7,
        title: "Adapting to Environmental Influences",
        aha: "Your environment shapes lifestyle choices; aligning it with your health goals enhances success.",
        action:
          "Assess your physical and digital environment and make adjustments that promote healthy habits.",
        tool: "Environment Assessment Checklist",
      },
      {
        step: 8,
        title: "Tracking Progress and Making Adjustments",
        aha: "Continuous monitoring and flexibility in your health model help sustain progress and adaptability.",
        action:
          "Set up a tracking system to monitor key health metrics and schedule regular reviews.",
        tool: "Health Progress Tracker",
      },
      {
        step: 9,
        title: "Leveraging Technology for Health Management",
        aha: "Digital tools can enhance awareness, motivation, and consistency in health behaviors.",
        action:
          "Choose and use health apps or wearable devices that align with your goals.",
        tool: "Health Apps and Wearables Guide",
      },
      {
        step: 10,
        title: "Celebrating Successes and Planning Next Steps",
        aha: "Recognizing achievements boosts motivation and sets the stage for continuous improvement.",
        action:
          "Reflect on your health journey so far, celebrate milestones, and update your health model accordingly.",
        tool: "Health Reflection and Planning Worksheet",
      },
    ],
  },
];

export default function OutlineMannerCreateComet({ sessionData }) {
  // Use session data for chapters if available, otherwise fall back to default health model
  const chapters = isArrayWithValues(sessionData?.response_outline)
    ? sessionData.response_outline.map((chapter) => ({
        chapter: chapter?.chapter || "Untitled Chapter",
        steps: isArrayWithValues(chapter?.steps) ? chapter.steps : [],
      }))
    : defaultHealthModel;

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
