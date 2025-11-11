"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image as ImageIcon,
  Code,
} from "lucide-react";
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

  // Content
  const renderContentSection = () => (
    <>
      <SectionHeader title="Content" />
      {renderTextField("Title", "contentSimpleTitle")}
      {renderTextArea("Description", "contentSimpleDescription")}

      <div className="mb-6 flex items-center justify-between">
        <Label className="block text-sm font-medium text-gray-700">
          Upload Image/Icon
        </Label>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-gray-700">Full Bleed Image</Label>
          <Input
            type="checkbox"
            checked={Boolean(formData.contentFullBleed)}
            onChange={(e) => updateField("contentFullBleed", e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            updateField(
              "contentImageIcon",
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Media
        </Label>
        <Input
          type="file"
          accept="video/*,audio/*"
          onChange={(e) =>
            updateField(
              "contentMediaFile",
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Or paste your link here
        </Label>
        <Input
          type="url"
          value={formData.contentMediaLink || ""}
          onChange={(e) => updateField("contentMediaLink", e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );

  // Habit Opt-in
  const renderHabitOptInSection = () => {
    const habits = formData.habits || [];

    const addHabit = () => {
      const next = [...habits, { title: "", description: "", repsPerWeek: "" }];
      updateField("habits", next);
    };

    const updateHabitField = (index, key, value) => {
      const next = [...habits];
      next[index] = { ...next[index], [key]: value };
      updateField("habits", next);
    };

    const removeHabit = (index) => {
      updateField(
        "habits",
        habits.filter((_, i) => i !== index)
      );
    };

    return (
      <>
        <SectionHeader title="Habit Opt-in" />

        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </Label>
          <div className="flex gap-3">
            <Input
              type="text"
              value="The Habits of"
              disabled
              className="w-48 bg-gray-50 text-gray-500"
            />
            <Input
              type="text"
              value={formData.habitsTitleOf || ""}
              onChange={(e) => updateField("habitsTitleOf", e.target.value)}
              placeholder="Enter name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {renderTextArea("Description", "habitsDescription")}

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Habit Image
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              updateField(
                "habitsImage",
                e.target.files && e.target.files[0] ? e.target.files[0] : null
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Habits</h4>

          <div className="space-y-4">
            {habits.map((habit, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 p-3 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-700 w-24">
                    Habit Title
                  </Label>
                  <div className="flex-1 flex gap-2">
                    <Input
                      type="text"
                      value={habit.title}
                      onChange={(e) =>
                        updateHabitField(index, "title", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={() => removeHabit(index)}
                      className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </Label>
                  <Textarea
                    value={habit.description}
                    onChange={(e) =>
                      updateHabitField(index, "description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    No. of Reps per week
                  </Label>
                  <Input
                    type="number"
                    value={habit.repsPerWeek ?? ""}
                    onChange={(e) =>
                      updateHabitField(
                        index,
                        "repsPerWeek",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              onClick={addHabit}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-background rounded-lg"
            >
              <Plus size={16} />
              Add Habit
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Reflection
  const renderReflectionSection = () => {
    const fileInputId = "reflection-image-upload";

    const handleFileUpload = (e) => {
      updateField(
        "reflectionImage",
        e.target.files && e.target.files[0] ? e.target.files[0] : null
      );
    };

    const handleBrowseClick = () => {
      document.getElementById(fileInputId)?.click();
    };

    const handleSelectAssets = () => {
      // TODO: Implement asset selection modal
      console.log("Select from assets");
    };

    const handleAIGenerate = () => {
      // TODO: Implement AI image generation
      console.log("AI generate image");
    };

    const handleFormatClick = (format) => {
      // TODO: Implement formatting
      console.log(`Format: ${format}`);
    };

    return (
      <>
        <SectionHeader title="Reflection" />

        {/* Title Field */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </Label>
          <Input
            type="text"
            value={formData.reflectionTitle || ""}
            onChange={(e) => updateField("reflectionTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description Field with Formatting Toolbar */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </Label>

          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-1.5 border-b border-gray-300 bg-white">
              <button
                type="button"
                onClick={() => handleFormatClick("bold")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Bold"
              >
                <Bold size={16} className="text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick("italic")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Italic"
              >
                <Italic size={16} className="text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick("underline")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Underline"
              >
                <Underline size={16} className="text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick("strikethrough")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Strikethrough"
              >
                <Strikethrough size={16} className="text-gray-700" />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => handleFormatClick("link")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Link"
              >
                <Link size={16} className="text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick("image")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Image"
              >
                <ImageIcon size={16} className="text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick("code")}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Code block"
              >
                <Code size={16} className="text-gray-700" />
              </button>
            </div>

            {/* Textarea */}
            <Textarea
              value={formData.reflectionDescription || ""}
              onChange={(e) =>
                updateField("reflectionDescription", e.target.value)
              }
              rows={6}
              className="w-full px-3 py-2 border-0 bg-white focus:outline-none focus:ring-0 resize-y"
            />
          </div>
        </div>

        {/* Upload Image Section */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Image
          </Label>

          <div className="space-y-3">
            {/* Upload from Computer */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Upload from Computer
                </span>
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={handleBrowseClick}
                  className="bg-primary text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
                >
                  <Plus size={14} className="mr-1" />
                  Browse
                </Button>
              </div>
            </div>

            {/* Select from Assets */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Select from Assets
                </span>
                <Button
                  type="button"
                  onClick={handleSelectAssets}
                  className="bg-primary text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
                >
                  <Plus size={14} className="mr-1" />
                  Select
                </Button>
              </div>
            </div>

            {/* AI-Generate Image */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">AI-Generate Image</span>
                <Button
                  type="button"
                  onClick={handleAIGenerate}
                  className="bg-primary text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
                >
                  <Plus size={14} className="mr-1" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderActionsSection = () => (
    <>
      <SectionHeader title="Actions" />
    </>
  );

  const renderSocialDiscussionSection = () => (
    <>
      <SectionHeader title="Social Discussion" />
    </>
  );

  const renderSelfAssessmentSection = () => (
    <>
      <SectionHeader title="Assessment" />
    </>
  );

  const renderFormContent = () => {
    const screenType = (screen?.screenType || "").toLowerCase();
    const contentType = (
      screen?.screenContents?.contentType || ""
    ).toLowerCase();


    //1-Content
    if (screenType === "content" || contentType === "content") {
      return renderContentSection();
    }

    //2-Poll
    if (
      screenType === "poll" ||
      ["mcq", "linear", "force_rank"].includes(contentType)
    ) {
      if (contentType === "mcq") return renderPollMcqSection();
      if (contentType === "linear") return renderPollLinearSection();
      if (contentType === "force_rank") return renderForceRankSection();
    }

    //3-Habits
    if (screenType === "habits" || contentType === "habits") {
      return renderHabitOptInSection();
    }

    //4-Reflection
    if (screenType === "reflection" || contentType === "reflection") {
      return renderReflectionSection();
    }
    //5-Actions
    if (screenType === "action" || contentType === "actions") {
      return renderActionsSection();
    }
    //6-Social Discussion
    if (screenType === "social" || contentType === "social_discussion") {
      return renderSocialDiscussionSection();
    }

    if (screenType === "assessment" || contentType === "assessment") {
      return renderSelfAssessmentSection();
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
  //1-Content
  // 2-MCQ (Screen type-Poll Type)
  // 3-Linear (Screen type-Poll Type)
  // 4-Force Rank ((Screen type-Poll Type))
  // 5-Habits
  // 6-Actions
  // 7-Social Discussion
  // 8-Reflection
  // 9-Self Assesmen

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
