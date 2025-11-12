"use client";

import React, { useState } from "react";
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

const getFormDataFromScreen = (screen) => {
  if (!screen) return {};

  const contentType = screen.screenContents?.contentType;
  const content = screen.screenContents?.content || {};
  const initialData = {
    easeCategories: screen.easeCategories || [],
    title: screen.title || "",
    ...(screen.formData || {}),
  };

  if (contentType === "content") {
    initialData.contentSimpleTitle = content.heading;
    initialData.contentSimpleDescription = content.body;
    initialData.contentMediaLink = content.media?.url;
    initialData.contentFullBleed = Boolean(initialData.contentFullBleed);
  }

  if (contentType === "mcq") {
    initialData.mcqTitle = content.question;
    initialData.mcqTopLabel = content.top_label || content.title;
    initialData.mcqBottomLabel = content.bottom_label;
    initialData.mcqKeyLearning = content.key_learning;
    initialData.mcqOptions = content.options || [];
  }

  if (contentType === "force_rank") {
    initialData.pollTitle = content.title;
    initialData.topLabel = content.high_label;
    initialData.bottomLabel = content.low_label;
    initialData.keyLearning = content.key_learning;
    initialData.mcqOptions = content.options || [];
  }

  if (contentType === "linear") {
    initialData.linearTitle = content.title;
    initialData.linearTopLabel = content.high_label;
    initialData.linearBottomLabel = content.low_label;
    initialData.linearKeyLearning = content.key_learning;
    initialData.linearScaleMin = content.lowerscale;
    initialData.linearScaleMax = content.higherscale;
  }

  if (contentType === "reflection") {
    initialData.reflectionTitle = content.title;
    initialData.reflectionPrompt = content.prompt;
    initialData.reflectionDescription = content.prompt;
  }

  if (contentType === "actions") {
    initialData.actionTitle = content.title;
    initialData.actionDescription = content.text;
    initialData.actionCanSchedule = content.can_scheduled;
    initialData.actionCanCompleteImmediately = content.can_complete_now;
    initialData.actionHasReflectionQuestion = content.has_reflection_question;
    initialData.actionToolLink = content.tool_link;
    initialData.actionToolPrompt = content.reflection_prompt;
  }

  if (contentType === "habits") {
    initialData.title = content.title;
    initialData.description = content.habit_image?.description;
    initialData.url = content.habit_image?.url;
    initialData.habitsIsMandatory = content.enabled;
    initialData.habits = content.habits;
  }

  if (contentType === "social_discussion") {
    initialData.socialTitle = content.title;
    initialData.discussionQuestion = content.question;
  }

  if (contentType === "assessment") {
    initialData.assessmentTitle = content.title;
    initialData.assessmentQuestions = content.questions || [];
  }

  return initialData;
};

export default function DynamicForm({
  screen,
  sessionData,
  setAllMessages,
  onUpdate,
  onClose,
  chapterNumber,
  stepNumber,
}) {
  const [formData, setFormData] = useState(getFormDataFromScreen(screen));
  const [focusedField, setFocusedField] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);
  const [askContext, setAskContext] = useState(null);
  const [blurTimeout, setBlurTimeout] = useState(null);

  console.log(">>> CHAPTER NUMBER", chapterNumber);
  console.log(">>> STEP NUMBER", stepNumber);
  console.log(">>> SCREEN", screen);

  const updateField = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onUpdate({ ...screen, formData: newFormData });
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

  console.log(">>> sessionData", sessionData);

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
        contentSimpleTitle: "heading",
        contentSimpleDescription: "body",
        contentMediaLink: "media_link",
        contentFullBleed: "full_bleed",
        mcqTitle: "question",
        mcqTopLabel: "top_label",
        mcqBottomLabel: "bottom_label",
        mcqKeyLearning: "key_learning",
        mcqOptions: "options",
        pollTitle: "title",
        topLabel: "high_label",
        bottomLabel: "low_label",
        keyLearning: "key_learning",
        linearTitle: "title",
        linearTopLabel: "high_label",
        linearBottomLabel: "low_label",
        linearKeyLearning: "key_learning",
        linearScaleMin: "lowerscale",
        linearScaleMax: "higherscale",
        reflectionTitle: "title",
        reflectionPrompt: "prompt",
        actionTitle: "title",
        actionDescription: "text",
        actionToolPrompt: "reflection_prompt",
        socialTitle: "title",
        discussionQuestion: "question",
        assessmentTitle: "title",
        assessmentQuestions: "questions",
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
        setAllMessages?.((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { from: "bot", content: messageResponse.sendMessage },
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

    const formProps = {
      formData,
      updateField,
      addListItem,
      updateListItem,
      removeListItem,
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
      if (contentType === "mcq") return <PollMcqForm {...formProps} />;
      if (contentType === "linear") return <PollLinearForm {...formProps} />;
      if (contentType === "force_rank") return <ForceRankForm {...formProps} />;
    }

    //3-Habits
    if (screenType === "habits" || contentType === "habits") {
      return <HabitOptInForm {...formProps} />;
    }

    //4-Reflection
    if (screenType === "reflection" || contentType === "reflection") {
      return <ReflectionForm {...formProps} />;
    }
    //5-Actions
    if (screenType === "action" || contentType === "actions") {
      return <ActionsForm {...formProps} />;
    }
    //6-Social Discussion
    if (screenType === "social" || contentType === "social_discussion") {
      return <SocialDiscussionForm {...formProps} />;
    }

    if (screenType === "assessment" || contentType === "assessment") {
      return <AssessmentForm {...formProps} />;
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
