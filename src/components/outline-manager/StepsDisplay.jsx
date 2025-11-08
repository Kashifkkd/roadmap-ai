"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Lightbulb,
  Target,
  Wrench,
  Plus,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import AskOutlineKyper from "./AskOutlineKyper";
import { graphqlClient } from "@/lib/graphql-client";

const StepsDisplay = ({ selectedChapter, chapterNumber }) => {
  const [focusedField, setFocusedField] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedStepInfo, setSelectedStepInfo] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const selectionRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelectStart = () => {
    setIsSelecting(true);
    setFocusedField(null);
    setFieldPosition(null);
  };

  const handleMouseUp = (e) => {
    if (!isSelecting) return;
    const target = e.target;
    const stepElement = target.closest("[data-step-index]");
    const stepIndex = stepElement?.getAttribute("data-step-index");
    const fieldType = stepElement?.getAttribute("data-field-type");

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        selectionRef.current = {
          text: text,
          range: selection.getRangeAt(0).cloneRange(),
        };

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectedText(text);
        setFocusedField("stepContent");
        setFieldPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX,
        });
        if (stepIndex !== null) {
          const stepIndexNum = parseInt(stepIndex);
          setSelectedStepInfo({
            stepIndex: stepIndexNum,
            stepNumber: stepIndexNum + 1,
            stepTitle:
              selectedChapter?.steps[stepIndexNum]?.title || "Untitled Step",
            fieldType: fieldType || "unknown",
            chapterName: selectedChapter?.chapter || "Untitled Chapter",
            chapterNumber:
              chapterNumber ||
              selectedChapter?.chapterNumber ||
              selectedChapter?.step ||
              "Unknown",
          });
        }
      }
      setIsSelecting(false);
    }, 10);
  };

  useEffect(() => {
    if (focusedField && selectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRef.current.range);
    }
  }, [focusedField]);

  useEffect(() => {
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSelecting, selectedChapter]);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const handlePopupInteract = () => {
    if (selectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRef.current.range);
    }
  };

  const handleAskKyper = async (query) => {
    const currentChapterNumber =
      chapterNumber ||
      selectedChapter?.chapterNumber ||
      selectedChapter?.step ||
      "Unknown";
    console.log("Chapter Number:", currentChapterNumber);
    console.log(
      "Selected Chapter:",
      selectedStepInfo?.chapterName ||
        selectedChapter?.chapter ||
        "Unknown Chapter"
    );
    console.log("Step Number:", selectedStepInfo?.stepNumber || "Unknown");
    console.log("Step Title:", selectedStepInfo?.stepTitle || "Unknown");
    console.log("Field Type:", selectedStepInfo?.fieldType || "Unknown");
    console.log("Selected Text:", selectedText);
    console.log("User Query:", query);

    try {
      setIsAskingKyper(true);

      let currentSessionId = localStorage.getItem("sessionId");
      const conversationMessageObj = {
        chapterNumber: currentChapterNumber,
        chapterName:
          selectedStepInfo?.chapterName ||
          selectedChapter?.chapter ||
          "Unknown Chapter",
        stepNumber: selectedStepInfo?.stepNumber || "Unknown",
        stepTitle: selectedStepInfo?.stepTitle || "Unknown",
        fieldType: selectedStepInfo?.fieldType || "Unknown",
        selectedText: selectedText || "",
        instruction: query,
      };

      const conversationMessage = JSON.stringify(conversationMessageObj);

      console.log(conversationMessageObj);

      console.log(conversationMessage);

      setAllMessages((prev) => [
        ...prev,
        { from: "user", content: query || "" },
      ]);

      const payloadObject = {
        session_id: currentSessionId,
        input_type: "step_content_update",
        chatbot_conversation: [{ user: conversationMessage }],
      };

      const cometJsonForMessage = JSON.stringify(payloadObject);

      console.log("Payload Object:", payloadObject);
      console.log("Payload String:", cometJsonForMessage);

      const messageResponse = await graphqlClient.sendMessage(
        cometJsonForMessage
      );

      console.log(
        "Message sent, waiting for AI response via WebSocket:",
        messageResponse
      );

      setAllMessages((prev) => [
        ...prev,
        { from: "bot", content: messageResponse.sendMessage },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAskingKyper(false);
    }
  };

  const handleClosePopup = () => {
    setFocusedField(null);
    setFieldPosition(null);
    setSelectedText("");
    setSelectedStepInfo(null);
    selectionRef.current = null;
    const selection = window.getSelection();
    selection.removeAllRanges();
  };

  const handleEditStep = (stepIndex, fieldType, currentValue) => {
    const currentChapterNumber =
      chapterNumber ||
      selectedChapter?.chapterNumber ||
      selectedChapter?.step ||
      "Unknown";

    console.log("Chapter Number:", currentChapterNumber);
    console.log(
      "Selected Chapter:",
      selectedChapter?.chapter || "Untitled Chapter"
    );
    console.log("Step Number:", stepIndex + 1);
    console.log(
      "Step Title:",
      selectedChapter?.steps[stepIndex]?.title || "Untitled Step"
    );
    console.log("Field Type:", fieldType);
    console.log("Current Value:", currentValue);

    setEditingField(`${stepIndex}-${fieldType}`);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (stepIndex, fieldType) => {
    const currentChapterNumber =
      chapterNumber ||
      selectedChapter?.chapterNumber ||
      selectedChapter?.step ||
      "Unknown";
    console.log("Chapter Number:", currentChapterNumber);
    console.log("Chapter:", selectedChapter?.chapter);
    console.log("Step:", stepIndex + 1);
    console.log("Field:", fieldType);
    console.log("New Value:", editValue);

    setEditingField(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

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
    <>
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="p-2 border-b border-gray-300 flex flex-col justify-between items-center">
          <div className="flex justify-between items-center gap-2 w-full">
            <Label className="text-base text-[#7367F0] font-medium">
              Steps
            </Label>
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
                      <div
                        className="flex gap-3 px-3 py-4 bg-white rounded-xl relative"
                        data-step-index={index}
                        data-field-type="aha"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1 pr-8">
                          <p className="font-medium text-gray-900 mb-1">
                            Aha Moment
                          </p>
                          {editingField === `${index}-aha` ? (
                            <div className="space-y-2">
                              <textarea
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full min-h-20  p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveEdit(index, "aha")}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm leading-relaxed select-text cursor-text">
                              {step.aha}
                            </p>
                          )}
                        </div>
                        {editingField !== `${index}-aha` && (
                          <button
                            onClick={() =>
                              handleEditStep(index, "aha", step.aha)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit Aha Moment"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action */}
                    {step?.action && (
                      <div
                        className="flex gap-3 px-3 py-4 bg-white rounded-xl relative"
                        data-step-index={index}
                        data-field-type="action"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <Target className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 pr-8">
                          <p className="font-medium text-gray-900 mb-1">
                            Action
                          </p>
                          {editingField === `${index}-action` ? (
                            <div className="space-y-2">
                              <textarea
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full min-h-20  p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleSaveEdit(index, "action")
                                  }
                                  className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                  <Check className="w-4 h-4" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 text-sm"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm leading-relaxed select-text cursor-text">
                              {step.action}
                            </p>
                          )}
                        </div>
                        {editingField !== `${index}-action` && (
                          <button
                            onClick={() =>
                              handleEditStep(index, "action", step.action)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit Action"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Tool */}
                    {step?.tool && (
                      <div
                        className="flex gap-3 px-3 py-4 bg-white rounded-xl relative"
                        data-step-index={index}
                        data-field-type="tool"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <Wrench className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1 pr-8">
                          <p className="font-medium text-gray-900 mb-1">Tool</p>
                          {editingField === `${index}-tool` ? (
                            <div className="space-y-2">
                              <textarea
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full min-h-20  p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(index, "tool")}
                                  className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                  <Check className="w-4 h-4" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 text-sm"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm leading-relaxed select-text cursor-text">
                              {step.tool}
                            </p>
                          )}
                        </div>
                        {editingField !== `${index}-tool` && (
                          <button
                            onClick={() =>
                              handleEditStep(index, "tool", step.tool)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit Tool"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
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

      <AskOutlineKyper
        focusedField={focusedField}
        fieldPosition={fieldPosition}
        onClose={handleClosePopup}
        onAskKyper={handleAskKyper}
        onPopupInteract={handlePopupInteract}
        isLoading={isAskingKyper}
      />
    </>
  );
};

export default StepsDisplay;
