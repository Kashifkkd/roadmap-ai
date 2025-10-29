"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

  const renderNumberField = (label, field, placeholder = "") => (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <Input
        type="number"
        value={formData[field] ?? ""}
        onChange={(e) =>
          updateField(
            field,
            e.target.value === "" ? "" : Number(e.target.value)
          )
        }
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="w-full mb-4">
      <div className="h-2 bg-primary rounded mb-4" />
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
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
              <Trash2 size={16} />
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

  // Force Rank
  const renderForceRankSection = () => (
    <>
      <SectionHeader title="Poll Question/Force Rank" />
      {renderTextField("Title", "pollTitle")}
      {renderTextField("Top Label", "topLabel")}
      {renderTextField("Bottom Label", "bottomLabel")}
      {renderTextArea("Key Learning", "keyLearning")}
    </>
  );

  // Rank Options (separate)
  const renderRankOptionsSection = () => (
    <>{renderList("Rank Option", "options", "Add Option")}</>
  );

  // Poll Question / MCQ
  const renderPollMcqSection = () => (
    <>
      <SectionHeader title="Poll Question/MCQ" />
      {renderTextField("Title (Question)", "mcqTitle")}
      {renderTextField("Top Label", "mcqTopLabel")}
      {renderTextField("Bottom Label", "mcqBottomLabel")}
      {renderTextArea("Key Learning", "mcqKeyLearning")}
      {renderList("Poll Options", "mcqOptions", "Add Option")}
    </>
  );

  // Poll Question / Linear
  const renderPollLinearSection = () => (
    <>
      <SectionHeader title="Poll Question/Linear" />
      {renderTextField("Title", "linearTitle")}
      {renderTextField("Top Label", "linearTopLabel")}
      {renderTextField("Bottom Label", "linearBottomLabel")}
      {renderTextArea("Key Learning", "linearKeyLearning")}
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Select Scale
        </Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={formData.linearScaleMin ?? ""}
            onChange={(e) =>
              updateField(
                "linearScaleMin",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="Enter Number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">To</span>
          <Input
            type="number"
            value={formData.linearScaleMax ?? ""}
            onChange={(e) =>
              updateField(
                "linearScaleMax",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="Enter Number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mb-4 w-full">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Benchmark Type
        </Label>
        <Select
          value={formData.linearBenchmarkType || ""}
          onValueChange={(value) => updateField("linearBenchmarkType", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Value" />
          </SelectTrigger>
          <SelectContent className="w-full overflow-auto">
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="industry">Industry</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  // Content + Image
  const renderContentImageSection = () => (
    <>
      <SectionHeader title="Content + Image" />
      {renderTextField("Title", "contentTitle")}
      {renderTextArea("Body content", "contentBody")}
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            updateField(
              "contentImage",
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );

  // Reflection
  const renderReflectionSection = () => (
    <>
      <SectionHeader title="Reflection" />
      {renderTextField("Title", "reflectionTitle")}
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            updateField(
              "reflectionImage",
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {renderTextArea("Prompt", "reflectionPrompt")}
    </>
  );

  const renderFormContent = () => {
    return (
      <>
        {renderForceRankSection()}
        {renderRankOptionsSection()}
        {renderPollMcqSection()}
        {renderPollLinearSection()}
        {renderContentImageSection()}
        {renderReflectionSection()}
      </>
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
