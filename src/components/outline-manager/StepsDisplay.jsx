import React from "react";
import { Lightbulb, Target, Wrench, Plus } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { isArrayWithValues } from "@/utils/isArrayWithValues";

const StepsDisplay = ({ selectedChapter }) => {
  if (!selectedChapter) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center p-8">
        <div className="text-gray-400 mb-4">
          <Target size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Select a Chapter
        </h3>
        <p className="text-sm text-gray-500">
          Click on a chapter from the left to view its steps
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="p-2 border-b border-gray-300 flex flex-col justify-between items-center">
        <div className="flex justify-between items-center gap-2 w-full">
          <Label className="text-base text-[#7367F0] font-medium">Steps</Label>
          <Button variant="outline" className="text-primary border-primary">
            <Plus size={16} />
            Add Step
          </Button>
        </div>
        <p className="text-base text-start text-gray-900 font-medium w-full">
          {selectedChapter?.chapter || "Untitled Chapter"}
        </p>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
        <div className="space-y-4 bg-primary-50 px-2 py-4 rounded">
          {isArrayWithValues(selectedChapter?.steps) ? (
            selectedChapter.steps.map((step, index) => (
              <div key={index} className="border-b border-primary-300 pb-4">
                {/* Step Header */}
                <div className="mb-4 ml-4">
                  <p className="text-xs text-gray-900 mb-1">
                    Step {step?.step || index + 1}
                  </p>
                  <h3 className="text-base font-semibold text-primary">
                    {step?.title || "Untitled Step"}
                  </h3>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  {/* Aha Moment */}
                  {step?.aha && (
                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                      <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          Aha Moment
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {step.aha}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  {step?.action && (
                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                      <div className="flex-shrink-0 mt-1">
                        <Target className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">Action</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {step.action}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tool */}
                  {step?.tool && (
                    <div className="flex gap-3 px-3 py-4 bg-white rounded-xl">
                      <div className="flex-shrink-0 mt-1">
                        <Wrench className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">Tool</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {step.tool}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
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
  );
};

export default StepsDisplay;
