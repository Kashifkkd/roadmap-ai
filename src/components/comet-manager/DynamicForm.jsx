"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { EASE_CATEGORIES } from "@/types/comet-manager";

export default function DynamicForm({ screen, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    easeCategories: screen.easeCategories || [],
    title: screen.title || "",
    ...(screen.formData || {}),
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onUpdate({ ...screen, formData: { ...formData, [field]: value } });
  };

  const toggleEaseCategory = (category) => {
    const newCategories = formData.easeCategories.includes(category)
      ? formData.easeCategories.filter((c) => c !== category)
      : [...formData.easeCategories, category];

    setFormData((prev) => ({ ...prev, easeCategories: newCategories }));
    onUpdate({ ...screen, easeCategories: newCategories });
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

  // const renderEaseCategories = () => (
  //   <div className="">
  //     <div className="flex gap-2 flex-wrap">
  //       {SCREEN_TYPE_CONSTANTS.map((category) => (
  //         <Button
  //           key={category}
  //           onClick={() => toggleEaseCategory(category)}
  //           className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-muted text-muted-foreground transition-colors ${
  //             formData.easeCategories.includes(category)
  //               ? "bg-primary text-white"
  //               : "bg-gray-100 text-gray-700"
  //           }`}
  //         >
  //           {category}
  //         </Button>
  //       ))}
  //     </div>
  //   </div>
  // );

  const renderTextField = (label, field, placeholder = "") => (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <Input
        type="text"
        value={formData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderTextArea = (label, field, placeholder = "") => (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <Textarea
        value={formData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderList = (label, field, buttonText) => (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <div className="space-y-2">
        {(formData[field] || []).map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="text"
              value={item}
              onChange={(e) => updateListItem(field, index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => removeListItem(field, index)}
              className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
        <Button
          onClick={() => addListItem(field)}
          className="flex items-center gap-2 px-3 py-2 text-background rounded-lg"
        >
          <Plus size={16} />
          {buttonText}
        </Button>
      </div>
    </div>
  );

  const renderContentForm = () => (
    <>
      {renderTextField("Screen Title", "title")}
      {renderTextField("Heading", "heading")}
      {renderTextArea("Body Content", "bodyContent")}
      {renderTextField("Image URL", "imageUrl", "Enter image URL")}
    </>
  );

  const renderPollForm = () => (
    <>
      {renderTextField("Screen Title", "title")}
      {renderTextField("Question", "question")}
      {renderList("Options", "options", "Add Option")}
    </>
  );

  const renderColumnForm = () => (
    <>
      {renderTextField("Screen Title", "title")}
      {renderTextArea("Instructions", "instructions")}
      {renderList("Left Column", "leftColumn", "Add Item")}
      {renderList("Right Column", "rightColumn", "Add Match")}
    </>
  );

  const renderReflectionForm = () => (
    <>
      {renderTextField("Screen Title", "title")}
      {renderTextArea("Reflection Prompt", "reflectionPrompt")}
      {renderTextField("Placeholder Text", "placeholderText")}
    </>
  );

  const renderAssessmentForm = () => (
    <>
      {renderTextField("Screen Title", "title")}
      {renderTextArea("Instructions", "instructions")}
      <div className="mb-4 w-full">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Tool Selection
        </Label>
        <Select
          value={formData.toolSelection || ""}
          onValueChange={(value) => updateField("toolSelection", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select or create an assessment tool" />
          </SelectTrigger>
          <SelectContent className="w-full overflow-auto">
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="survey">Survey</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
            <SelectItem value="rubric">Rubric</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderFormContent = () => {
    switch (screen.type) {
      case "content":
        return renderContentForm();
      case "poll":
        return renderPollForm();
      case "column":
        return renderColumnForm();
      case "reflection":
        return renderReflectionForm();
      case "assessment":
        return renderAssessmentForm();
      default:
        return renderContentForm();
    }
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
