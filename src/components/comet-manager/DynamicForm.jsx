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

export default function DynamicForm({ screen, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    easeCategories: screen.easeCategories || [],
    title: screen.title || "",
    ...(screen.formData || {}),
  });

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
      return <ContentForm {...formProps} />;
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
      <div className="p-4">
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
      <div className="p-4">{renderFormContent()}</div>
    </div>
  );
}
