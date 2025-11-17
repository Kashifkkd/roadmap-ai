import React, { useState } from "react";
import { SectionHeader, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { uploadAssetFile } from "@/api/uploadAssets";

export default function HabitOptInForm({
  formData,
  updateField,
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
  askKyperHandlers = {},
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;
  const habits = formData.habits || [];
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Habit Opt-in" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
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
              value={formData.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onSelect={(event) =>
                onTextFieldSelect?.("habitsTitle", event, formData.title)
              }
              onBlur={onFieldBlur}
            />
          </div>
        </div>
        <RichTextArea
          label="Description"
          value={formData.habit_image?.description || ""}
          onChange={(value) => {
            const habit_image = {
              ...formData.habit_image,
              description: value,
            };
            updateField("habit_image", habit_image);
          }}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "habitsDescription",
              selectionInfo,
              formData.habit_image?.description
            )
          }
          onBlur={onRichTextBlur}
        />

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Habit Image
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
              if (file) {
                setIsUploading(true);
                setUploadError(null);
                // Update form field
                updateField("habitsImage", file);
                
                // Upload asset with all necessary fields
                try {
                  await uploadAssetFile(
                    file,
                    "image",
                    sessionId || "",
                    chapterId || "",
                    stepId || "",
                    screenId || ""
                  );
                  setUploadedImage(file.name);
                  console.log("Habit image uploaded successfully");
                } catch (error) {
                  setUploadError("Upload failed. Please try again.");
                  console.error("Error uploading habit image:", error);
                } finally {
                  setIsUploading(false);
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* File name display */}
          {(uploadedImage || isUploading || uploadError) && (
            <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
              {isUploading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : uploadError ? (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <X className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              ) : uploadedImage ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Uploaded:</span>
                  <span className="text-gray-700">{uploadedImage}</span>
                </div>
              ) : null}
            </div>
          )}
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
                  {/* <Textarea
                  value={habit.description}
                  onChange={(e) =>
                    updateHabitField(index, "description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                /> */}
                  <RichTextArea
                    label="Description"
                    value={habit.description}
                    onChange={(value) =>
                      updateHabitField(index, "description", value)
                    }
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
      </div>
    </div>
  );
}
