"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Lightbulb,
  Target,
  Wrench,
  Plus,
  Pencil,
  Check,
  X,
  Paperclip,
} from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import AskOutlineKyper from "./AskOutlineKyper";
import { graphqlClient } from "@/lib/graphql-client";
import Image from "next/image";

const StepsDisplay = ({
  selectedChapter,
  chapterNumber,
  setAllMessages,
  sessionData,
  selectedStep,
  isAskingKyper = false,
  setIsAskingKyper = () => {},
}) => {
  const [focusedField, setFocusedField] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedStepInfo, setSelectedStepInfo] = useState(null);
  const selectionRef = useRef(null);
  const inputRef = useRef(null);
  const [chapterSteps, setChapterSteps] = useState(
    selectedChapter?.steps || []
  );
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [stepPrompt, setStepPrompt] = useState("");
  const [includeSourceMaterial, setIncludeSourceMaterial] = useState(false);
  const [sourceMaterialNotes, setSourceMaterialNotes] = useState("");
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [addStepError, setAddStepError] = useState(null);
  const [storedSessionId, setStoredSessionId] = useState(null);
  const subscriptionCleanupRef = useRef(null);
  const targetChapterRef = useRef(null);
  const targetChapterIndexRef = useRef(null);
  const stepRefs = useRef({});

  useEffect(() => {
    setChapterSteps(selectedChapter?.steps || []);
  }, [selectedChapter]);

  // Scroll to selected step when it changes
  useEffect(() => {
    if (selectedStep && stepRefs.current) {
      const stepTitle = selectedStep?.title;
      if (stepTitle && stepRefs.current[stepTitle]) {
        setTimeout(() => {
          stepRefs.current[stepTitle]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [selectedStep]);

  useEffect(() => {
    if (storedSessionId) return;
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("sessionId");
      if (existing) {
        setStoredSessionId(existing);
      }
    } catch {}
  }, [storedSessionId]);

  useEffect(() => {
    return () => {
      if (subscriptionCleanupRef.current) {
        subscriptionCleanupRef.current();
        subscriptionCleanupRef.current = null;
      }
    };
  }, []);

  const getLatestSessionSnapshot = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sessionData");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed) return parsed;
        }
      } catch {}
    }
    // Fallback to sessionData prop
    return sessionData;
  }, [sessionData]);

  const cleanupSubscription = useCallback(() => {
    if (subscriptionCleanupRef.current) {
      try {
        subscriptionCleanupRef.current();
      } catch (error) {
        console.error("Error cleaning up subscription:", error);
      }
      subscriptionCleanupRef.current = null;
    }
  }, []);

  const ensureSessionContext = useCallback(async () => {
    let currentSessionId = storedSessionId;

    if (!currentSessionId && typeof window !== "undefined") {
      try {
        currentSessionId = localStorage.getItem("sessionId");
      } catch {}
    }

    if (!currentSessionId) {
      const sessionResponse = await graphqlClient.createSession();
      currentSessionId = sessionResponse?.createSession?.sessionId;
      const cometJson = sessionResponse?.createSession?.cometJson;

      if (currentSessionId && typeof window !== "undefined") {
        try {
          localStorage.setItem("sessionId", currentSessionId);
        } catch {}
      }

      if (cometJson && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "sessionData",
            JSON.stringify(JSON.parse(cometJson))
          );
        } catch {}
      }

      setStoredSessionId(currentSessionId);
    } else if (!storedSessionId) {
      setStoredSessionId(currentSessionId);
    }

    return {
      sessionId: currentSessionId,
      snapshot: getLatestSessionSnapshot(),
    };
  }, [storedSessionId, getLatestSessionSnapshot]);

  const findUpdatedChapterFromSession = useCallback((sessionPayload) => {
    if (!isArrayWithValues(sessionPayload?.response_outline)) return null;

    const targetName = targetChapterRef.current;
    let updatedChapter = null;

    if (targetName) {
      updatedChapter = sessionPayload.response_outline.find(
        (chapter) => chapter?.chapter === targetName
      );
    }

    if (!updatedChapter) {
      const chapterIndex = targetChapterIndexRef.current;
      if (
        typeof chapterIndex === "number" &&
        chapterIndex >= 0 &&
        chapterIndex < sessionPayload.response_outline.length
      ) {
        updatedChapter = sessionPayload.response_outline[chapterIndex];
      }
    }

    return updatedChapter;
  }, []);

  const handleSelectStart = () => {
    setIsSelecting(true);
  };

  const handleMouseUp = useCallback(
    (e) => {
      if (!isSelecting) return;

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 0) {
          const target = e.target;
          const stepElement = target.closest("[data-step-index]");

          if (!stepElement) {
            setIsSelecting(false);
            return;
          }

          const stepIndex = stepElement?.getAttribute("data-step-index");
          const fieldType = stepElement?.getAttribute("data-field-type");

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          selectionRef.current = {
            text: text,
            range: range.cloneRange(),
          };

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
              stepTitle: chapterSteps[stepIndexNum]?.title || "Untitled Step",
              fieldType: fieldType || "unknown",
              chapterName: selectedChapter?.chapter || "Untitled Chapter",
              chapterNumber:
                chapterNumber ||
                selectedChapter?.chapterNumber ||
                selectedChapter?.step ||
                "Unknown",
            });
          }
        } else {
          handleClosePopup();
        }
        setIsSelecting(false);
      }, 10);
    },
    [chapterSteps, chapterNumber, isSelecting, selectedChapter]
  );

  useEffect(() => {
    if (focusedField && selectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRef.current.range);
    }
  }, [focusedField]);

  useEffect(() => {
    const handleDocumentMouseUp = (e) => {
      const target = e.target;
      const stepElement = target.closest("[data-step-index]");
      if (stepElement) {
        handleMouseUp(e);
      } else if (isSelecting) {
        setIsSelecting(false);
      }
    };

    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("mouseup", handleDocumentMouseUp);

    return () => {
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
  }, [handleMouseUp, isSelecting]);

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

  const handleOpenAddStepModal = () => {
    if (!selectedChapter) return;
    targetChapterRef.current = selectedChapter?.chapter || null;
    const numericChapter = Number(chapterNumber);
    targetChapterIndexRef.current = Number.isFinite(numericChapter)
      ? numericChapter - 1
      : null;
    setStepPrompt("");
    setSourceMaterialNotes("");
    setIncludeSourceMaterial(false);
    setAddStepError(null);
    setIsAddStepModalOpen(true);
  };

  const handleCloseAddStepModal = () => {
    if (isSubmittingStep) return;
    cleanupSubscription();
    setIsAddStepModalOpen(false);
    setStepPrompt("");
    setSourceMaterialNotes("");
    setIncludeSourceMaterial(false);
    setAddStepError(null);
  };

  const handleToggleSourceMaterial = () => {
    setIncludeSourceMaterial((prev) => {
      const nextValue = !prev;
      if (!nextValue) {
        setSourceMaterialNotes("");
      }
      return nextValue;
    });
  };

  const handleAddStepSubmit = async () => {
    if (!selectedChapter) {
      setAddStepError("Select a chapter before adding a step.");
      return;
    }

    if (!stepPrompt.trim()) {
      setAddStepError("Please describe the new step.");
      return;
    }

    try {
      setIsSubmittingStep(true);
      setAddStepError(null);
      setIsAddStepModalOpen(false);

      const { sessionId, snapshot } = await ensureSessionContext();

      if (!sessionId) {
        throw new Error("Unable to establish a Kyper session.");
      }

      targetChapterRef.current = selectedChapter?.chapter || null;
      const numericChapter = Number(chapterNumber);
      targetChapterIndexRef.current = Number.isFinite(numericChapter)
        ? numericChapter - 1
        : null;

      cleanupSubscription();

      let handledUpdate = false;

      const cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionPayload) => {
          if (handledUpdate) return;

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                "sessionData",
                JSON.stringify(sessionPayload)
              );
            } catch {}
          }

          const updatedChapter = findUpdatedChapterFromSession(sessionPayload);
          if (!updatedChapter) {
            return;
          }

          handledUpdate = true;
          setChapterSteps(updatedChapter?.steps || []);
          setIsSubmittingStep(false);
          setIsAddStepModalOpen(false);
          setStepPrompt("");
          setSourceMaterialNotes("");
          setIncludeSourceMaterial(false);
          setAddStepError(null);
          cleanupSubscription();
        },
        (error) => {
          console.error("Subscription error while adding step:", error);
          if (handledUpdate) return;
          handledUpdate = true;
          setAddStepError("Unable to receive update from Kyper.");
          setIsSubmittingStep(false);
          cleanupSubscription();
        }
      );

      subscriptionCleanupRef.current = cleanup;

      const baseInstruction = stepPrompt.trim();
      const supplementalNotes =
        includeSourceMaterial && sourceMaterialNotes.trim().length
          ? `\n\nSource Material:\n${sourceMaterialNotes.trim()}`
          : "";

      const userInstruction = `${baseInstruction}${supplementalNotes}`;
      const chapterLabel =
        selectedChapter?.chapter ||
        (chapterNumber ? `Chapter ${chapterNumber}` : "current chapter");

      const payloadObject = JSON.stringify({
        session_id: sessionId,
        input_type: "outline_updation",
        comet_creation_data: snapshot?.comet_creation_data || {},
        response_outline: snapshot?.response_outline || {},
        response_path: snapshot?.response_path || {},
        chatbot_conversation: [
          {
            user: `add a step in chapter: '${chapterLabel}', description: ${userInstruction}`,
          },
        ],
        to_modify: {},
      });

      const messageResponse = await graphqlClient.sendMessage(payloadObject);

      if (typeof setAllMessages === "function") {
        // const botMessage = messageResponse?.sendMessage || "";

        setAllMessages((prev) => [
          ...prev,
          { from: "user", content: userInstruction },
          { from: "bot", content: messageResponse?.sendMessage || "" },
          // ...(isProcessingMessage
          //   ? []
          //   : [{ from: "bot", content: botMessage }]),
        ]);
      }
    } catch (error) {
      console.error("Error adding step:", error);
      setAddStepError(error?.message || "Unable to add step right now.");
      setIsSubmittingStep(false);
      cleanupSubscription();
    }
  };

  const handleAskKyper = async (query) => {
    try {
      setIsAskingKyper(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const { sessionId, snapshot } = await ensureSessionContext();

      if (!sessionId) {
        throw new Error("Unable to establish a Kyper session.");
      }

      targetChapterRef.current = selectedChapter?.chapter || null;
      const numericChapter = Number(chapterNumber);
      targetChapterIndexRef.current = Number.isFinite(numericChapter)
        ? numericChapter - 1
        : null;

      cleanupSubscription();

      let handledUpdate = false;

      const cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionPayload) => {
          if (handledUpdate) return;

          // Update localStorage with new session data
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                "sessionData",
                JSON.stringify(sessionPayload)
              );
            } catch {}
          }

          // update the chapter
          const updatedChapter = findUpdatedChapterFromSession(sessionPayload);
          if (updatedChapter) {
            handledUpdate = true;
            setChapterSteps(updatedChapter?.steps || []);
            setIsAskingKyper(false);
            cleanupSubscription();
          }
        },
        (error) => {
          console.error("Subscription error while asking Kyper:", error);
          if (handledUpdate) return;
          handledUpdate = true;
          setIsAskingKyper(false);
          cleanupSubscription();
        }
      );

      subscriptionCleanupRef.current = cleanup;

      setAllMessages((prev) => [
        ...prev,
        { from: "user", content: query || "" },
      ]);

      const conversationMessage = `{ 'field': '${selectedStepInfo?.fieldType}', 'value': '${selectedText}', 'instruction': '${query}' }`;

      // update the response outline
      let currentResponseOutline = snapshot?.response_outline || [];

      if (selectedChapter && isArrayWithValues(chapterSteps)) {
        currentResponseOutline = currentResponseOutline.map((ch) => {
          if (ch?.chapter === selectedChapter?.chapter) {
            return {
              ...ch,
              steps: chapterSteps,
            };
          }
          return ch;
        });
      }

      const existingConversation = snapshot?.chatbot_conversation || [];
      const updatedConversation = [
        ...existingConversation,
        { user: conversationMessage },
      ];

      const payloadObject = JSON.stringify({
        session_id: sessionId,
        input_type: "outline_updation",
        comet_creation_data: snapshot?.comet_creation_data || {},
        response_outline: currentResponseOutline,
        response_path: snapshot?.response_path || {},
        // chatbot_conversation: [{ user: conversationMessage }],
        chatbot_conversation: updatedConversation,
        to_modify: {},
      });

      const messageResponse = await graphqlClient.sendMessage(payloadObject);
      setAllMessages((prev) => [
        ...prev,
        // { from: "bot", content: messageResponse.sendMessage },
      ]);

      // const botMessage = messageResponse.sendMessage;

      // if (botMessage) {
      //   setAllMessages((prev) => [
      //     ...prev,
      //     { from: "bot", content: botMessage },
      //   ]);
      // }

      handleClosePopup();
    } catch (error) {
      console.error("Error sending message to Kyper:", error);
      setAllMessages((prev) => [
        ...prev,
        { from: "bot", content: "Error: Unable to get response from Kyper" },
      ]);
      setIsAskingKyper(false);
      cleanupSubscription();
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

    setEditingField(`${stepIndex}-${fieldType}`);
    setEditValue(currentValue);

    // Close selection popup when editing
    handleClosePopup();
  };

  const handleSaveEdit = (stepIndex, fieldType) => {
    const currentChapterNumber =
      chapterNumber ||
      selectedChapter?.chapterNumber ||
      selectedChapter?.step ||
      "Unknown";

    // TODO: Implement actual save logic here
    // await graphqlClient.updateStepContent(...)

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
            <Button
              variant="outline"
              className="text-primary border-2 border-primary"
              onClick={handleOpenAddStepModal}
              disabled={isSubmittingStep}
            >
              <Plus size={16} />
              Add Step
            </Button>
          </div>
          <p className="text-lg text-start text-gray-900 font-semibold w-full">
            {selectedChapter?.chapter || "Untitled Chapter"}
          </p>
        </div>

        {/* Steps List */}
        <div
          className="flex-1 overflow-y-scroll py-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#9ca3af #e5e7eb",
          }}
        >
          <div className="space-y-4 bg-primary-50 px-2 py-4 rounded">
            {isArrayWithValues(chapterSteps) ? (
              chapterSteps.map((step, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el && step?.title) {
                      stepRefs.current[step.title] = el;
                    }
                  }}
                  className="border-b border-primary-300 pb-4"
                >
                  {/* Step Header */}
                  <div className="mb-4 ml-4">
                    <p className="text-xs text-gray-900 mb-1">
                      Step {index + 1}
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
                        <div className="shrink-0 mt-1">
                          {/* <Lightbulb className="w-5 h-5 text-yellow-500" /> */}
                          <Image
                            src="/bulb.svg"
                            alt="Aha"
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className="flex-1 pr-8">
                          <p className="font-medium text-gray-900 mb-1">Aha</p>
                          {editingField === `${index}-aha` ? (
                            <div className="space-y-2">
                              <textarea
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full min-h-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(index, "aha")}
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
                              {step.aha}
                            </p>
                          )}
                        </div>
                        {/* {editingField !== `${index}-aha` && (
                          <button
                            onClick={() =>
                              handleEditStep(index, "aha", step.aha)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit Aha Moment"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )} */}
                      </div>
                    )}

                    {/* Action */}
                    {step?.action && (
                      <div
                        className="flex gap-3 px-3 py-4 bg-white rounded-xl relative"
                        data-step-index={index}
                        data-field-type="action"
                      >
                        <div className="shrink-0 mt-1">
                          <Image
                            src="/markup.svg"
                            alt="Action"
                            width={24}
                            height={24}
                          />
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
                                className="w-full min-h-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                        {/* {editingField !== `${index}-action` && (
                          <button
                            onClick={() =>
                              handleEditStep(index, "action", step.action)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit Action"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )} */}
                      </div>
                    )}

                    {/* Tool */}
                    {step?.tool && (
                      <div
                        className="flex gap-3 px-3 py-4 bg-white rounded-xl relative"
                        data-step-index={index}
                        data-field-type="tool"
                      >
                        <div className="shrink-0 mt-1">
                          <Image
                            src="/tool.svg"
                            alt="Tool"
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className="flex-1 pr-8">
                          <p className="font-medium text-gray-900 mb-1">Tool</p>
                          {editingField === `${index}-tool` ? (
                            <div className="space-y-2">
                              <textarea
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full min-h-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveEdit(index, "tool")}
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
                              {step.tool}
                            </p>
                          )}
                        </div>
                        {/* {editingField !== `${index}-tool` && (
                          <button
                            onClick={() =>
                              handleEditStep(index, "tool", step.tool)
                            }
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit Tool"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )} */}
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

      <AddStepModal
        isOpen={isAddStepModalOpen}
        onClose={handleCloseAddStepModal}
        promptValue={stepPrompt}
        onPromptChange={setStepPrompt}
        onSubmit={handleAddStepSubmit}
        isSubmitting={isSubmittingStep}
        error={addStepError}
        includeSourceMaterial={includeSourceMaterial}
        onToggleSourceMaterial={handleToggleSourceMaterial}
        sourceMaterialValue={sourceMaterialNotes}
        onSourceMaterialChange={setSourceMaterialNotes}
      />

      {focusedField && fieldPosition && (
        <AskOutlineKyper
          focusedField={focusedField}
          fieldPosition={fieldPosition}
          onClose={handleClosePopup}
          onAskKyper={handleAskKyper}
          onPopupInteract={handlePopupInteract}
          isLoading={isAskingKyper}
          selectedText={selectedText}
          selectedStepInfo={selectedStepInfo}
        />
      )}
    </>
  );
};

const AddStepModal = ({
  isOpen,
  onClose,
  promptValue,
  onPromptChange,
  onSubmit,
  isSubmitting,
  error,
  includeSourceMaterial,
  onToggleSourceMaterial,
  sourceMaterialValue,
  onSourceMaterialChange,
}) => {
  if (!isOpen) return null;

  const trimmedPrompt = promptValue?.trim() || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={isSubmitting ? undefined : onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none"
          aria-label="Close add step modal"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900">Add New Step</h3>

        <div className="mt-4 space-y-4">
          <textarea
            value={promptValue}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-900 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            rows={5}
            placeholder="Describe the new step you'd like Kyper to create..."
            disabled={isSubmitting}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onToggleSourceMaterial}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                includeSourceMaterial
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <Paperclip className="h-4 w-4" />
              Add Source Material
            </button>
            {isSubmitting && (
              <p className="text-xs font-medium text-primary">Sending...</p>
            )}
          </div>

          {includeSourceMaterial ? (
            <textarea
              value={sourceMaterialValue}
              onChange={(e) => onSourceMaterialChange(e.target.value)}
              className="w-full rounded-2xl border border-dashed border-gray-300 bg-white/70 p-3 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              placeholder="Paste supporting content for this step..."
              disabled={isSubmitting}
            />
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !trimmedPrompt}
            className="min-w-[96px]"
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepsDisplay;
