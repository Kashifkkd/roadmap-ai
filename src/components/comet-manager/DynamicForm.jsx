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
    values.contentFullBleed = content.blend_mode ?? false;
    values.media = content.media || {};
  }

  if (contentType === "mcq") {
    values.title = content.title || "";
    values.question = content.question || "";
    values.top_label = content.top_label || "";
    values.bottom_label = content.bottom_label || "";
    values.key_learning = content.key_learning || "";
    values.options = content.options || [];
  }

  if (contentType === "force_rank") {
    values.title = content.title || "";
    values.question = content.question || "";
    values.high_label = content.high_label || "";
    values.low_label = content.low_label || "";
    values.key_learning = content.key_learning || "";
    values.options = content.options || [];
  }

  if (contentType === "linear") {
    values.title = content.title || "";
    values.question = content.question || "";
    values.high_label = content.high_label || "";
    values.low_label = content.low_label || "";
    values.key_learning = content.key_learning || "";
    values.lowerscale = content.lowerscale;
    values.higherscale = content.higherscale;
    values.linearBenchmarkType =
      content.benchmark_type || content.benchmarkType || "";
  }

  if (contentType === "reflection") {
    values.title = content.title || "";
    values.prompt = content.prompt || "";
  }

  if (contentType === "action" || contentType === "actions") {
    values.title = content.title || "";
    values.text = content.text || "";
    values.can_scheduled = content.can_scheduled ?? false;
    values.can_complete_now = content.can_complete_now ?? false;
    values.has_reflection_question = content.has_reflection_question ?? false;
    values.tool_link = content.tool_link || "";
    values.reflection_prompt = content.reflection_prompt || "";
    values.reflection_question = content.reflection_question || "";
  }

  if (contentType === "habits") {
    values.title = content.title || "";
    // habit_image is a string URL, not an object
    values.habit_image =
      typeof content.habit_image === "string"
        ? content.habit_image
        : content.habit_image?.url || content.habit_image?.image_url || "";
    values.enabled = content.enabled ?? false;
    values.habits = content.habits || [];
  }

  if (contentType === "social_discussion") {
    values.title = content.title || "";
    values.question = content.question || "";
  }

  if (contentType === "assessment") {
    values.title = content.title || "";
    values.questions = content.questions || [];
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
  setIsAskingKyper: setParentIsAskingKyper,
}) {
  // No local state - derive form values directly from screen
  const formData = useMemo(() => {
    const values = getFormValuesFromScreen(screen);
    console.log("🟢 FormData derived from screen:", {
      heading: values.heading,
      body: values.body?.substring(0, 50) + "...",
      screenContent: screen?.screenContents?.content,
    });
    return values;
  }, [screen]);

  console.log("screen>>", screen);

  const [focusedField, setFocusedField] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);
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
            const contentType =
              currentScreen?.screenContents?.contentType || "";

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
              } else if (field === "contentFullBleed") {
                currentScreen.screenContents.content.blend_mode = value;
              }
            } else if (contentType === "action" || contentType === "actions") {
              if (field === "title") {
                currentScreen.screenContents.content.title = value;
              } else if (field === "text") {
                // RichTextArea - extract plain text from Quill delta
                const textValue = extractPlainTextFromDelta(value);
                currentScreen.screenContents.content.text = textValue;
              } else if (field === "can_scheduled") {
                currentScreen.screenContents.content.can_scheduled = value;
              } else if (field === "can_complete_now") {
                currentScreen.screenContents.content.can_complete_now = value;
              } else if (field === "has_reflection_question") {
                currentScreen.screenContents.content.has_reflection_question =
                  value;
              } else if (field === "tool_link") {
                currentScreen.screenContents.content.tool_link = value;
              } else if (field === "reflection_prompt") {
                currentScreen.screenContents.content.reflection_prompt = value;
              } else if (field === "reflection_question") {
                currentScreen.screenContents.content.reflection_question =
                  value;
              }

              // Update the screen in the array
              stepItem.screens[screenIndex] = currentScreen;
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
              } else if (field === "high_label")
                currentScreen.screenContents.content.high_label = value;
              else if (field === "low_label")
                currentScreen.screenContents.content.low_label = value;
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
              } else if (field === "high_label")
                currentScreen.screenContents.content.high_label = value;
              else if (field === "low_label")
                currentScreen.screenContents.content.low_label = value;
              else if (field === "key_learning")
                currentScreen.screenContents.content.key_learning = value;
              else if (field === "lowerscale")
                currentScreen.screenContents.content.lowerscale = value;
              else if (field === "higherscale")
                currentScreen.screenContents.content.higherscale = value;
              else if (field === "linearBenchmarkType")
                currentScreen.screenContents.content.benchmark_type = value;
            } else if (contentType === "reflection") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "prompt") {
                currentScreen.screenContents.content.prompt =
                  extractPlainTextFromDelta(value);
              }
            } else if (contentType === "social_discussion") {
              if (field === "title")
                currentScreen.screenContents.content.title = value;
              else if (field === "question") {
                currentScreen.screenContents.content.question =
                  extractPlainTextFromDelta(value);
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
              else if (field === "habit_image") {
                // habit_image is stored as a string URL
                currentScreen.screenContents.content.habit_image = value;
              } else if (field === "enabled") {
                currentScreen.screenContents.content.enabled = value;
              } else if (field === "habits") {
                // Extract plain text from delta for nested habit.text fields
                if (Array.isArray(value)) {
                  currentScreen.screenContents.content.habits = value.map(
                    (habit) => {
                      if (habit && typeof habit === "object" && habit.text) {
                        return {
                          ...habit,
                          text: extractPlainTextFromDelta(habit.text),
                        };
                      }
                      return habit;
                    }
                  );
                } else {
                  currentScreen.screenContents.content.habits = value;
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
      setParentIsAskingKyper?.(true);

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
        forceRankHighLabel: "high_label",
        forceRankLowLabel: "low_label",
        forceRankQuestion: "question",
        forceRankKeyLearning: "key_learning",
        forceRankOptions: "options",
        linearTitle: "title",
        linearHighLabel: "high_label",
        linearLowLabel: "low_label",
        linearQuestion: "question",
        linearKeyLearning: "key_learning",
        linearLowerScale: "lowerscale",
        linearHigherScale: "higherscale",
        reflectionTitle: "title",
        reflectionPrompt: "prompt",
        actionTitle: "title",
        actionText: "text",
        actionToolLink: "tool_link",
        actionReflectionPrompt: "reflection_prompt",
        socialTitle: "title",
        socialQuestion: "question",
        assessmentTitle: "title",
        assessmentQuestions: "questions",
        habitsTitle: "title",
        habitsText: "habits[].text",
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

      const payloadObject = JSON.stringify({
        session_id: sessionId,
        input_type: "path_updation",
        comet_creation_data: sessionData?.comet_creation_data || {},
        response_outline: sessionData?.response_outline || {},
        response_path: sessionData?.response_path || {},
        chatbot_conversation: [{ user: conversationMessage }],
        to_modify: {},
      });

      const messageResponse = await graphqlClient.sendMessage(payloadObject);

      if (messageResponse?.sendMessage) {
        const botMessage = messageResponse.sendMessage;
        const processingMessages = [
          "copilot is still processing",
          "copilot is processing",
          "processing your request",
          "still processing",
        ];
        const isProcessingMessage = processingMessages.some((msg) =>
          botMessage.toLowerCase().includes(msg.toLowerCase())
        );

        if (!isProcessingMessage) {
          setAllMessages?.((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { from: "bot", content: botMessage },
          ]);
        }
      }
    } catch (error) {
      console.error("Error asking Kyper:", error);
    } finally {
      setIsAskingKyper(false);
      setParentIsAskingKyper?.(false);
      clearAskContext();
    }
  };

  const renderFormContent = () => {
    const screenType = (screen?.screenType || "").toLowerCase();
    const contentType = (
      screen?.screenContents?.contentType || ""
    ).toLowerCase();
    console.log("contentType>>", contentType);
    // Extract IDs for asset upload
    const sessionId =
      sessionData?.session_id ||
      (typeof window !== "undefined"
        ? localStorage.getItem("sessionId")
        : null);
    const screenId = screen?.id || "";
    const chapterId = screen?.chapterId || "";
    const stepId = screen?.stepId || "";

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
      console.log(
        "🔵 Rendering ActionsForm - screenType:",
        screenType,
        "contentType:",
        contentType,
        "formData:",
        formData
      );
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
    <div className="bg-white h-fit rounded-md no-scrollbar overflow-auto">
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
