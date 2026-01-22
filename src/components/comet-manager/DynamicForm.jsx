"use client";

import React, { useState, useMemo } from "react";
import ForceRankForm from "./forms/ForceRankForm";
import PollMcqForm from "./forms/PollMcqForm";
import PollLinearForm from "./forms/PollLinearForm";
import ContentForm from "./forms/ContentForm";
import HabitOptInForm from "./forms/HabitOptInForm";
import ReflectionForm from "./forms/ReflectionForm";
import ActionsForm from "./forms/ActionsForm";
import SocialDiscussionForm from "./forms/SocialDiscussionForm";
import AssessmentForm from "./forms/AssessmentForm";
import NotificationsForm from "./forms/NotificationsForm";
import MiniAppForm from "./forms/MiniAppForm";
import AskKyperPopup from "@/components/create-comet/AskKyperPopup";
import { graphqlClient } from "@/lib/graphql-client";

// Helper to extract plain text from Quill delta JSON
// Always converts delta format to plain text to prevent crashes
const extractPlainTextFromDelta = (value) => {
  // Handle null/undefined
  if (value == null) return "";

  // If not a string, return as-is (for numbers, booleans, etc.)
  if (typeof value !== "string") return value;

  // Empty string
  if (value.trim() === "") return value;

  // Check if it's a JSON string that might be a Quill delta
  if (value.trim().startsWith("{")) {
    try {
      const delta = JSON.parse(value);
      if (delta && delta.ops && Array.isArray(delta.ops)) {
        // Extract plain text from Quill delta ops
        const plainText = delta.ops
          .map((op) => {
            if (typeof op.insert === "string") {
              return op.insert;
            } else if (op.insert && typeof op.insert === "object") {
              // Handle embedded objects (like images, formulas, etc.)
              return "";
            }
            return "";
          })
          .join("");
        return plainText || value; // Return plain text, or original if empty
      }
    } catch (e) {
      // If parsing fails, it's not valid JSON - return as-is (plain text)
      console.log(
        "🔵 Not a valid JSON delta, treating as plain text:",
        e.message
      );
      return value;
    }
  }

  // Not a delta format, return as plain text
  return value;
};

// Helper to get form values directly from screen content (no local state)
// Uses actual keys from the structure as defined in temp2.js
const getFormValuesFromScreen = (screen) => {
  if (!screen) return {};
  const contentType = screen.screenContents?.contentType;
  const content = screen.screenContents?.content || {};

  // Use actual keys from the structure (temp2.js)
  const values = {};

  if (contentType === "content") {
    values.heading = content.heading || "";
    values.body = content.body || "";
    values.mediaUrl = content.media?.url || "";
    values.mediaType = content.media?.type || "";
    values.contentFullBleed = content.fullBleed ?? false;
    values.media = content.media || {};
  }

  if (contentType === "mcq") {
    values.title = content.title || "";
    values.question = content.question || "";
    values.top_label = content.top_label || "";
    values.bottom_label = content.bottom_label || "";
    values.key_learning = content.key_learning || content.keyLearning || "";
    values.options = content.options || [];
  }

  if (contentType === "force_rank") {
    values.title = content.title || "";
    values.question = content.question || "";
    values.highLabel = content.highLabel || "";
    values.lowLabel = content.lowLabel || "";
    values.key_learning = content.key_learning || "";
    values.options = content.options || [];
  }

  if (contentType === "linear") {
    values.title = content.title || "";
    values.question = content.question || "";
    values.highLabel = content.highLabel || "";
    values.lowLabel = content.lowLabel || "";
    values.key_learning = content.key_learning || "";
    values.lowerScale = content.lowerScale;
    values.higherScale = content.higherScale;
    values.linearBenchmarkType =
      content.benchmark_type || content.benchmarkType || "";
  }

  if (contentType === "reflection") {
    // Some reflection screens may still use heading/body from older schema
    values.title = content.title || content.heading || "";
    values.prompt = content.prompt || content.body || "";
  }

  if (contentType === "action" || contentType === "actions") {
    values.title = content.title || "";
    values.text = content.text || "";
    values.canSchedule = content.canSchedule ?? false;
    values.canCompleteNow = content.canCompleteNow ?? false;
    values.hasReflectionQuestion = content.hasReflectionQuestion ?? false;
    values.toolLink = content.toolLink || "";
    values.toolName = content.toolName || "";
    values.reflectionPrompt = content.reflectionPrompt || "";
    values.reflection_question = content.reflection_question || "";
  }

  if (contentType === "habits") {
    values.title = content.title || "";
    // habit_image is a string URL, not an object
    values.habit_image =
      typeof content.habit_image === "string"
        ? content.habit_image
        : content.habit_image?.url || content.habit_image?.ImageUrl || "";
    values.description = content.habit_image?.description || "";
    values.enabled = content.enabled ?? false;
    values.habits = content.habits || [];
  }

  if (contentType === "socialDiscussion" || contentType === "social") {
    values.title = content.title || content.heading || "";
    values.question = content.question || content.body || "";
  }

  if (contentType === "assessment") {
    values.title = content.title || "";
    values.questions = content.questions || [];
  }

  if (contentType === "notifications") {
    values.title = content.heading || "";
    values.message = content.body || "";
    values.icon =
      typeof content.icon === "string"
        ? content.icon
        : content.icon?.url || content.icon?.ImageUrl || "";
  }

  if (contentType === "miniapp" || contentType === "miniApp") {
    // For miniApp, the content itself is HTML string
    values.htmlContent = typeof content === "string" ? content : "";
  }

  return values;
};

export default function DynamicForm({
  screen,
  sessionData,
  setAllMessages,
  setOutline,
  onClose,
  chapterNumber,
  stepNumber,
  isAskingKyper = false,
  setIsAskingKyper = () => { },
}) {
  // No local state - derive form values directly from screen
  const formData = useMemo(() => {
    const values = getFormValuesFromScreen(screen);
    // console.log("🟢 FormData derived from screen:", {
    //   heading: values.heading,
    //   body: values.body?.substring(0, 50) + "...",
    //   screenContent: screen?.screenContents?.content,
    // });
    return values;
  }, [screen]);

  const [focusedField, setFocusedField] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [askContext, setAskContext] = useState(null);
  const [blurTimeout, setBlurTimeout] = useState(null);

  // Update field directly in outline - use setOutline(prev => ...) to always work with latest state
  const updateField = (field, value) => {
    const screenId = screen?.id;
    if (!screenId) return;

    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];

      // Find the screen in the outline using latest state from prev
      for (const chapter of pathChapters) {
        for (const stepItem of chapter.steps || []) {
          const screenIndex = stepItem.screens?.findIndex(
            (s) => s.id === screenId
          );
          if (screenIndex !== undefined && screenIndex >= 0) {
            // Get current screen from latest state (prevOutline)
            const currentScreen = stepItem.screens[screenIndex];
            const contentType = currentScreen?.screenContents?.contentType;

            // Ensure screenContents and content exist
            if (!currentScreen.screenContents) {
              currentScreen.screenContents = { contentType, content: {} };
            }
            if (!currentScreen.screenContents.content) {
              currentScreen.screenContents.content = {};
            }

            // Map form fields to content structure using actual keys from temp2.js structure
            // Update directly on currentScreen since we're working with the latest state from prev
            if (contentType === "content") {
              if (field === "heading") {
                currentScreen.screenContents.content.heading = value;
              } else if (field === "body") {
                // RichTextArea stores Quill delta as JSON string - extract plain text
                const bodyValue = extractPlainTextFromDelta(value);
                currentScreen.screenContents.content.body = bodyValue;
              } else if (field === "mediaUrl") {
                if (!currentScreen.screenContents.content.media) {
                  currentScreen.screenContents.content.media = {};
                }
                currentScreen.screenContents.content.media.url = value;
              } else if (field === "mediaType") {
                if (!currentScreen.screenContents.content.media) {
                  currentScreen.screenContents.content.media = {};
                }
                currentScreen.screenContents.content.media.type = value;
              } else if (field === "mediaName") {
                if (!currentScreen.screenContents.content.media) {
                  currentScreen.screenContents.content.media = {};
                }
                currentScreen.screenContents.content.media.title = value;
              } else if (field === "contentFullBleed") {
                currentScreen.screenContents.content.fullBleed = value;
              }
            } else if (contentType === "action" || contentType === "actions") {
              if (field === "title") {
                currentScreen.screenContents.content.title = value;
              } else if (field === "text") {
                // RichTextArea - extract plain text from Quill delta
                const textValue = extractPlainTextFromDelta(value);
                currentScreen.screenContents.content.text = textValue;
              } else if (field === "canSchedule") {
                currentScreen.screenContents.content.canSchedule = value;
              } else if (field === "canCompleteNow") {
                currentScreen.screenContents.content.canCompleteNow = value;
              } else if (field === "hasReflectionQuestion") {
                currentScreen.screenContents.content.hasReflectionQuestion =
                  value;
              } else if (field === "toolLink") {
                currentScreen.screenContents.content.toolLink = value;
              } else if (field === "toolName") {
                currentScreen.screenContents.content.toolName = value;
              } else if (field === "reflectionPrompt") {
                currentScreen.screenContents.content.reflectionPrompt = value;
              }

              stepItem.screens[screenIndex] = {
                ...currentScreen,
                screenContents: {
                  ...currentScreen.screenContents,
                  content: {
                    ...currentScreen.screenContents.content,
                  },
                },
              };
            } else if (contentType === "mcq") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "question") {
                currentScreen.screenContents.content.question =
                  extractPlainTextFromDelta(value);
              } else if (field === "top_label")
                currentScreen.screenContents.content.top_label = value;
              else if (field === "bottom_label")
                currentScreen.screenContents.content.bottom_label = value;
              else if (field === "key_learning")
                currentScreen.screenContents.content.key_learning = value;
              else if (field === "options")
                currentScreen.screenContents.content.options = value;
            } else if (contentType === "force_rank") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "question") {
                currentScreen.screenContents.content.question =
                  extractPlainTextFromDelta(value);
              } else if (field === "highLabel")
                currentScreen.screenContents.content.highLabel = value;
              else if (field === "lowLabel")
                currentScreen.screenContents.content.lowLabel = value;
              else if (field === "key_learning")
                currentScreen.screenContents.content.key_learning = value;
              else if (field === "options")
                currentScreen.screenContents.content.options = value;
            } else if (contentType === "linear") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "question") {
                currentScreen.screenContents.content.question =
                  extractPlainTextFromDelta(value);
              } else if (field === "highLabel")
                currentScreen.screenContents.content.highLabel = value;
              else if (field === "lowLabel")
                currentScreen.screenContents.content.lowLabel = value;
              else if (field === "key_learning")
                currentScreen.screenContents.content.key_learning = value;
              else if (field === "lowerScale")
                currentScreen.screenContents.content.lowerScale = value;
              else if (field === "higherScale")
                currentScreen.screenContents.content.higherScale = value;
              else if (field === "linearBenchmarkType")
                currentScreen.screenContents.content.benchmark_type = value;
            } else if (contentType === "reflection") {
              if (field === "title") {
                // Write to both title and heading to support mixed schemas
                currentScreen.screenContents.content.title = value;
                if (!currentScreen.screenContents.content.heading) {
                  currentScreen.screenContents.content.heading = value;
                }
              } else if (field === "prompt") {
                const promptValue = extractPlainTextFromDelta(value);
                currentScreen.screenContents.content.prompt = promptValue;
                if (!currentScreen.screenContents.content.body) {
                  currentScreen.screenContents.content.body = promptValue;
                }
              }
            } else if (contentType === "socialdiscussion") {
              if (field === "title") {
                currentScreen.screenContents.content.title = value;
                if (!currentScreen.screenContents.content.heading) {
                  currentScreen.screenContents.content.heading = value;
                }
              } else if (field === "question") {
                const questionValue = extractPlainTextFromDelta(value);
                currentScreen.screenContents.content.question = questionValue;
                if (!currentScreen.screenContents.content.body) {
                  currentScreen.screenContents.content.body = questionValue;
                }
              }
            } else if (contentType === "assessment") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "questions") {
                // Extract plain text from delta for nested question.text fields
                if (Array.isArray(value)) {
                  currentScreen.screenContents.content.questions = value.map(
                    (question) => {
                      if (
                        question &&
                        typeof question === "object" &&
                        question.text
                      ) {
                        return {
                          ...question,
                          text: extractPlainTextFromDelta(question.text),
                        };
                      }
                      return question;
                    }
                  );
                } else {
                  currentScreen.screenContents.content.questions = value;
                }
              }
            } else if (contentType === "habits") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "description") {
                if (
                  !currentScreen.screenContents.content.habit_image ||
                  typeof currentScreen.screenContents.content.habit_image ===
                  "string"
                ) {
                  currentScreen.screenContents.content.habit_image = {
                    url: currentScreen.screenContents.content.habit_image || "",
                    description: "",
                  };
                }
                currentScreen.screenContents.content.habit_image.description =
                  extractPlainTextFromDelta(value);
              } else if (field === "habit_image") {
                if (
                  !currentScreen.screenContents.content.habit_image ||
                  typeof currentScreen.screenContents.content.habit_image ===
                  "string"
                ) {
                  currentScreen.screenContents.content.habit_image = {
                    url: value,
                    description: "",
                  };
                } else {
                  currentScreen.screenContents.content.habit_image.url = value;
                }
              } else if (field === "enabled") {
                currentScreen.screenContents.content.enabled = value;
              } else if (field === "habits") {
                // Extract plain text from delta for nested habit.text fields
                if (Array.isArray(value)) {
                  const existingHabits =
                    currentScreen.screenContents.content.habits || [];

                  currentScreen.screenContents.content.habits = value.map(
                    (habit, idx) => {
                      if (habit && typeof habit === "object") {
                        const existing = existingHabits[idx] || {};
                        const nextTitle =
                          habit.title !== undefined && habit.title !== ""
                            ? habit.title
                            : existing.title ?? "";
                        const nextReps =
                          habit.reps !== undefined && habit.reps !== ""
                            ? habit.reps
                            : existing.reps ?? "";
                        const nextText =
                          habit.text !== undefined && habit.text !== ""
                            ? extractPlainTextFromDelta(habit.text)
                            : existing.text ?? "";

                        return {
                          ...existing,
                          ...habit,
                          title: nextTitle,
                          reps: nextReps,
                          text: nextText,
                        };
                      }
                      return habit;
                    }
                  );
                } else {
                  currentScreen.screenContents.content.habits = value;
                }
              }
            } else if (contentType === "notifications") {
              if (field === "title") {
                currentScreen.screenContents.content.heading = value;
              } else if (field === "message") {
                const messageValue = extractPlainTextFromDelta(value);
                currentScreen.screenContents.content.message = messageValue;
                // Also update body for backward compatibility
                if (!currentScreen.screenContents.content.body) {
                  currentScreen.screenContents.content.body = messageValue;
                }
              } else if (field === "icon") {
                if (
                  !currentScreen.screenContents.content.icon ||
                  typeof currentScreen.screenContents.content.icon === "string"
                ) {
                  currentScreen.screenContents.content.icon = {
                    url: value,
                  };
                } else {
                  currentScreen.screenContents.content.icon.url = value;
                }
              }
            }

            // Update title for display
            if (currentScreen.screenContents.content.title) {
              currentScreen.title = currentScreen.screenContents.content.title;
            } else if (currentScreen.screenContents.content.heading) {
              currentScreen.title =
                currentScreen.screenContents.content.heading;
            }

            // Explicitly preserve assets when updating screen

            const existingAssets = currentScreen.assets || [];
            stepItem.screens[screenIndex] = {
              ...currentScreen,
              screenContents: {
                ...currentScreen.screenContents,
                content: {
                  ...currentScreen.screenContents.content,
                },
              },
              assets: existingAssets, // Preserve assets
            };

            return newOutline;
          }
        }
      }
      return prevOutline;
    });
  };

  const addListItem = (listName) => {
    const currentList = formData[listName] || [];
    updateField(listName, [...currentList, ""]);
  };

  const updateListItem = (listName, index, value) => {
    const currentList = formData[listName] || [];
    const newList = [...currentList];
    newList[index] = value;
    updateField(listName, newList);
  };

  const removeListItem = (listName, index) => {
    const currentList = formData[listName] || [];
    const newList = currentList.filter((_, i) => i !== index);
    updateField(listName, newList);
  };

  const reorderListItem = (listName, draggedIndex, dropIndex) => {
    const currentList = formData[listName] || [];
    if (draggedIndex === dropIndex || draggedIndex < 0 || dropIndex < 0) return;

    const newList = [...currentList];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    updateField(listName, newList);
  };

  const clearBlurTimeout = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      setBlurTimeout(null);
    }
  };

  const clearAskContext = () => {
    clearBlurTimeout();
    setFocusedField(null);
    setFieldPosition(null);
    setAskContext(null);
  };

  const handleFieldBlur = () => {
    clearBlurTimeout();
    const timeout = setTimeout(() => {
      clearAskContext();
    }, 1500);
    setBlurTimeout(timeout);
  };

  const handlePopupInteract = () => {
    clearBlurTimeout();
  };

  const handleTextFieldSelect = (fieldName, event, fieldValue) => {
    if (!event?.target) return;

    clearBlurTimeout();

    const input = event.target;
    const { selectionStart, selectionEnd, value } = input;
    if (
      selectionStart === null ||
      selectionEnd === null ||
      selectionStart === selectionEnd
    ) {
      clearAskContext();
      return;
    }

    const selectedText = value.substring(selectionStart, selectionEnd).trim();
    if (!selectedText) {
      clearAskContext();
      return;
    }

    const rect = input.getBoundingClientRect();
    setFocusedField(fieldName);
    setFieldPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
    setAskContext({
      fieldName,
      selectedText,
      fieldValue,
      screenId: screen?.id,
      screenName: screen?.name || screen?.title || "",
      screenType:
        screen?.screenContents?.contentType ||
        screen?.screenType ||
        screen?.type ||
        "",
    });
  };

  const handleRichTextSelection = (fieldName, selectionInfo, fieldValue) => {
    if (!selectionInfo) {
      handleFieldBlur();
      return;
    }

    clearBlurTimeout();

    const text = (selectionInfo.text || "").trim();
    if (!text) {
      handleFieldBlur();
      return;
    }

    const position = selectionInfo.absolutePosition || {
      top: (selectionInfo.editorRect?.bottom || 0) + window.scrollY,
      left: (selectionInfo.editorRect?.left || 0) + window.scrollX,
    };

    setFocusedField(fieldName);
    setFieldPosition({
      top: position.top + 8,
      left: position.left,
    });
    setAskContext({
      fieldName,
      selectedText: text,
      fieldValue,
      screenId: screen?.id,
      screenName: screen?.name || screen?.title || "",
      screenType:
        screen?.screenContents?.contentType ||
        screen?.screenType ||
        screen?.type ||
        "",
    });
  };

  // console.log(">>> sessionData", sessionData);

  const handleAskKyper = async (query) => {
    if (!askContext || !query?.trim()) return;

    try {
      setIsAskingKyper(true);

      const userMessage = query.trim();
      setAllMessages?.((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        { from: "user", content: userMessage },
      ]);

      const sessionId =
        sessionData?.session_id ||
        (typeof window !== "undefined"
          ? localStorage.getItem("sessionId")
          : null);

      const fieldNameMap = {
        contentHeading: "heading",
        contentBody: "body",
        contentMediaUrl: "media.url",
        mcqTitle: "title",
        mcqQuestion: "question",
        mcqTopLabel: "top_label",
        mcqBottomLabel: "bottom_label",
        mcqKeyLearning: "key_learning",
        mcqOptions: "options",
        forceRankTitle: "title",
        forceRankHighLabel: "highLabel",
        forceRankLowLabel: "lowLabel",
        forceRankQuestion: "question",
        forceRankKeyLearning: "key_learning",
        forceRankOptions: "options",
        linearTitle: "title",
        linearHighLabel: "highLabel",
        linearLowLabel: "lowLabel",
        linearQuestion: "question",
        linearKeyLearning: "key_learning",
        linearLowerScale: "lowerScale",
        linearHigherScale: "higherScale",
        reflectionTitle: "title",
        reflectionPrompt: "prompt",
        actionTitle: "title",
        actionText: "text",
        actionToolLink: "toolLink",
        actionReflectionPrompt: "reflectionPrompt",
        socialTitle: "title",
        socialQuestion: "question",
        assessmentTitle: "title",
        assessmentQuestions: "questions",
        habitsTitle: "title",
        habitsText: "habits[].text",
        notificationsTitle: "title",
        notificationsMessage: "message",
      };

      const mappedField =
        fieldNameMap[askContext.fieldName] || askContext.fieldName;

      const screenNumber =
        typeof screen?.position === "number"
          ? screen.position
          : typeof screen?.order === "number"
            ? screen.order + 1
            : 1;

      const conversationMessage = `{ 'path': 'chapter-${chapterNumber}-step-${stepNumber}-screen-${screenNumber}', 'field': '${mappedField}', 'value': '${askContext.selectedText}', 'instruction': '${query}' }`;
      console.log("conversationMessage>>", conversationMessage);

      // Merge with existing conversation history (same pattern as ChatWindow.jsx)
      const existingConversation = sessionData?.chatbot_conversation || [];
      const newEntries = [{ user: conversationMessage }];
      const chatbotConversation = [...existingConversation, ...newEntries];
      console.log("chatbotConversation>>", chatbotConversation);

      const payloadObject = JSON.stringify({
        session_id: sessionId,
        input_type: "path_updation",
        comet_creation_data: sessionData?.comet_creation_data || {},
        response_outline: sessionData?.response_outline || {},
        response_path: sessionData?.response_path || {},
        // additional_data: {
        //   personalization_enabled:
        //     sessionData?.additional_data?.personalization_enabled || false,
        //   habit_enabled: sessionData?.additional_data?.habit_enabled || false,
        //   habit_description:
        //     sessionData?.additional_data?.habit_description || "",
        // },
        chatbot_conversation: chatbotConversation,
        to_modify: {},
      });

      const messageResponse = await graphqlClient.sendMessage(payloadObject);
      console.log("messageResponse>>", messageResponse);

      if (messageResponse?.sendMessage) {
        setAllMessages?.((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          // { from: "bot", content: messageResponse.sendMessage },
        ]);
      }
    } catch (error) {
      console.error("Error asking Kyper:", error);
    } finally {
      setIsAskingKyper(false);
      clearAskContext();
    }
  };

  const renderFormContent = () => {
    const screenType = (screen?.screenType || "").toLowerCase();
    const contentType = (
      screen?.screenContents?.contentType || ""
    ).toLowerCase();
    // Extract IDs for asset upload
    const sessionId =
      sessionData?.session_id ||
      (typeof window !== "undefined"
        ? localStorage.getItem("sessionId")
        : null);
    const screenId = screen?.id || "";
    const chapterId = screen?.chapterId || "";
    const stepId = screen?.stepId || "";

    // Extract UUIDs for asset upload
    const screenUuid = screen?.uuid || "";
    const stepUuid = screen?.stepUid || "";
    // Find chapter UUID from outline using stepUuid (more reliable than chapterId)
    let chapterUuid = "";
    const outline = sessionData?.response_path;
    if (outline?.chapters && stepUuid) {
      // Search through chapters to find the one containing this step
      for (const chapter of outline.chapters) {
        if (chapter.steps) {
          for (const stepItem of chapter.steps) {
            const step = stepItem?.step;
            if (step && step.uuid === stepUuid) {
              chapterUuid = chapter.uuid || "";
              break;
            }
          }
          if (chapterUuid) break;
        }
      }
    }

    // Function to update screen assets
    const updateScreenAssets = (assets) => {
      const screenId = screen?.id;
      if (!screenId) return;

      setOutline((prevOutline) => {
        if (!prevOutline || !prevOutline.chapters) return prevOutline;

        const newOutline = JSON.parse(JSON.stringify(prevOutline));
        const pathChapters = newOutline.chapters || [];

        // Find the screen in the outline and update assets
        for (const chapter of pathChapters) {
          for (const stepItem of chapter.steps || []) {
            const screenIndex = stepItem.screens?.findIndex(
              (s) => s.id === screenId
            );
            if (screenIndex !== undefined && screenIndex >= 0) {
              const currentScreen = stepItem.screens[screenIndex];
              // Update assets array - merge with existing assets
              const existingAssets = currentScreen.assets || [];
              const newAssets = Array.isArray(assets)
                ? [...existingAssets, ...assets]
                : [...existingAssets, assets];

              console.log("updateScreenAssets - saving assets:", {
                screenId,
                existingCount: existingAssets.length,
                newCount: newAssets.length,
                assets: newAssets,
              });

              stepItem.screens[screenIndex] = {
                ...currentScreen,
                assets: newAssets,
              };
              return newOutline;
            }
          }
        }
        return prevOutline;
      });
    };

    // Function to remove asset from screen
    const removeScreenAsset = (assetIndex) => {
      const screenId = screen?.id;
      if (!screenId) return;

      setOutline((prevOutline) => {
        if (!prevOutline || !prevOutline.chapters) return prevOutline;

        const newOutline = JSON.parse(JSON.stringify(prevOutline));
        const pathChapters = newOutline.chapters || [];

        // Find the screen in the outline and remove asset
        for (const chapter of pathChapters) {
          for (const stepItem of chapter.steps || []) {
            const screenIndex = stepItem.screens?.findIndex(
              (s) => s.id === screenId
            );
            if (screenIndex !== undefined && screenIndex >= 0) {
              const currentScreen = stepItem.screens[screenIndex];
              const existingAssets = currentScreen.assets || [];
              existingAssets.splice(assetIndex, 1);
              stepItem.screens[screenIndex] = {
                ...currentScreen,
                assets: existingAssets,
              };
              return newOutline;
            }
          }
        }
        return prevOutline;
      });
    };

    const formProps = {
      formData,
      updateField,
      addListItem,
      updateListItem,
      removeListItem,
      reorderListItem,
      updateScreenAssets,
      removeScreenAsset,
      screen,
      sessionId,
      chapterId,
      stepId,
      screenId,
      chapterUuid,
      stepUuid,
      screenUuid,
    };

    //1-Content
    if (screenType === "content" || contentType === "content") {
      return (
        <ContentForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }

    //2-Poll
    if (
      screenType === "poll" ||
      ["mcq", "linear", "force_rank"].includes(contentType)
    ) {
      if (contentType === "mcq")
        return (
          <PollMcqForm
            {...formProps}
            askKyperHandlers={{
              onTextFieldSelect: handleTextFieldSelect,
              onFieldBlur: handleFieldBlur,
              onRichTextSelection: handleRichTextSelection,
              onRichTextBlur: handleFieldBlur,
            }}
          />
        );
      if (contentType === "linear")
        return (
          <PollLinearForm
            {...formProps}
            askKyperHandlers={{
              onTextFieldSelect: handleTextFieldSelect,
              onFieldBlur: handleFieldBlur,
              onRichTextSelection: handleRichTextSelection,
              onRichTextBlur: handleFieldBlur,
            }}
          />
        );
      if (contentType === "force_rank")
        return (
          <ForceRankForm
            {...formProps}
            askKyperHandlers={{
              onTextFieldSelect: handleTextFieldSelect,
              onFieldBlur: handleFieldBlur,
              onRichTextSelection: handleRichTextSelection,
              onRichTextBlur: handleFieldBlur,
            }}
          />
        );
    }

    //3-Habits
    if (screenType === "habits" || contentType === "habits") {
      return (
        <HabitOptInForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }

    //4-Reflection
    if (screenType === "reflection" || contentType === "reflection") {
      return (
        <ReflectionForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }

    console.log("ACTIONSSSS", screenType, contentType);
    //5-Actions
    if (
      screenType === "action" ||
      screenType === "actions" ||
      contentType === "action" ||
      contentType === "actions"
    ) {
      return (
        <ActionsForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }
    console.log("AFTERRRRRR");
    //6-Social Discussion
    if (screenType === "social" || contentType === "social_discussion") {
      return (
        <SocialDiscussionForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }

    if (screenType === "assessment" || contentType === "assessment") {
      return (
        <AssessmentForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }

    //7-Notifications
    if (screenType === "notifications" || contentType === "notifications") {
      return (
        <NotificationsForm
          {...formProps}
          askKyperHandlers={{
            onTextFieldSelect: handleTextFieldSelect,
            onFieldBlur: handleFieldBlur,
            onRichTextSelection: handleRichTextSelection,
            onRichTextBlur: handleFieldBlur,
          }}
        />
      );
    }

    //8-MiniApp (HTML content in iframe)
    if (
      screenType === "miniapp" ||
      contentType === "miniapp" ||
      screen?.screenType === "miniApp" ||
      screen?.screenContents?.contentType === "miniApp"
    ) {
      return <MiniAppForm {...formProps} />;
    }

    return (
      <div className="p-2">
        <p className="text-sm text-gray-600">
          No form available for this screen type:{" "}
          {screen?.screenType || "unknown"} /{" "}
          {screen?.screenContents?.contentType || "unknown"}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white h-fit rounded-t-md no-scrollbar overflow-auto">
      {/* <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-primary text-xl">{screen.name}</h3>
        </div>
        {renderEaseCategories()}
      </div> */}
      <div className="p-2">{renderFormContent()}</div>
      <AskKyperPopup
        focusedField={focusedField}
        fieldPosition={fieldPosition}
        isLoading={isAskingKyper}
        onClose={clearAskContext}
        onAskKyper={handleAskKyper}
        onPopupInteract={handlePopupInteract}
      />
    </div>
  );
}
