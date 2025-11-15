import React, { useRef } from "react";
import { TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Plus, Info } from "lucide-react";
import { SectionHeader } from "./FormFields";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label, showInfo = false }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-gray-800">{label}</Label>
      {showInfo && (
        <Info
          size={16}
          className="text-gray-500 cursor-help"
          title="Users will be asked a reflection question when they complete this action"
        />
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default function ActionsForm({ formData, updateField }) {
  const uploadToolInputRef = useRef(null);

  // console.log(">>> FORM DATA", formData);

  const handleSelectToolBrowse = () => {
    // TODO: Implement tool library selection modal
    console.log("Browse tool library");
  };

  const handleUploadToolBrowse = () => {
    uploadToolInputRef.current?.click();
  };

  const handleUploadTool = (e) => {
    updateField(
      "actionToolFile",
      e.target.files && e.target.files[0] ? e.target.files[0] : null
    );
  };

  const handleCreateTool = () => {
    // TODO: Implement tool creation from prompt
    console.log("Create tool from prompt:", formData.actionToolPrompt);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Action" />
      </div>

      <div className="bg-white rounded-lg p-2 align-center">
        <div className="mb-6 space-y-4">
          <TextField
            label="Title"
            value={formData.actionTitle}
            onChange={(value) => updateField("actionTitle", value)}
          />

          <RichTextArea
            label="Description"
            value={formData.actionDescription}
            onChange={(value) => updateField("actionDescription", value)}
          />
        </div>

        {/* Tool Configuration Section */}
        <div className="mb-6 bg-gray-100 rounded-lg p-2">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Tool</h4>
          <div className="p-2 bg-white rounded-lg">
            {/* Select Tool */}
            <span className="text-sm text-gray-900">
              Select Tool (Select from Existing Tool Library)
            </span>
            <div className="mb-4 p-2 bg-gray-100 rounded-lg">
              <div className="border-2 border-dashed border-gray-400 rounded-lg bg-white p-5 hover:border-primary/60 transition-colors cursor-pointer">
                <div className="flex flex-col gap-2 items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    Select Tool
                  </span>
                  <Button
                    type="button"
                    onClick={handleSelectToolBrowse}
                    className="bg-primary text-white hover:bg-primary-600 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    <Plus size={16} className="mr-1.5" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>

            {/* Or separator */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm font-medium text-gray-500">Or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Upload Tool */}
            <span className="text-sm text-gray-900">
              Upload Tool (Upload from your Computer)
            </span>
            <div className="mb-4 p-2 bg-gray-100 rounded-lg">
              <div className="border-2 border-dashed border-gray-400 rounded-lg bg-white p-5 hover:border-primary/60 transition-colors cursor-pointer">
                <div className="flex flex-col gap-2 items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    Upload Document
                  </span>
                  <input
                    ref={uploadToolInputRef}
                    type="file"
                    onChange={handleUploadTool}
                    className="hidden"
                    accept="*/*"
                  />
                  <Button
                    type="button"
                    onClick={handleUploadToolBrowse}
                    className="bg-primary text-white hover:bg-primary-600 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    <Plus size={16} className="mr-1.5" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>

            {/* Or separator */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm font-medium text-gray-500">Or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Create Tool */}
            <div className="mb-4">
              <span className="text-sm text-gray-900">
                Create Tool (Create New Tool Using Prompt)
              </span>
              <div className="relative">
                <Textarea
                  value={formData.actionToolPrompt || ""}
                  onChange={(e) =>
                    updateField("actionToolPrompt", e.target.value)
                  }
                  rows={6}
                  placeholder="Enter your prompt to create a new tool..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white pr-24 resize-none"
                />
                <Button
                  type="button"
                  onClick={handleCreateTool}
                  className="absolute bottom-3 right-3 bg-primary text-white hover:bg-primary-600 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* toggle switches */}
        <div className="mb-4 pt-6 border-t border-gray-300">
          <div className="space-y-4">
            <ToggleSwitch
              checked={formData.actionCanCompleteImmediately ?? false}
              onChange={(value) =>
                updateField("actionCanCompleteImmediately", value)
              }
              label="Users can complete this action immediately"
            />

            <ToggleSwitch
              checked={formData.actionCanSchedule ?? false}
              onChange={(value) => updateField("actionCanSchedule", value)}
              label="Users can schedule this action for later"
            />

            <ToggleSwitch
              checked={formData.actionHasReflectionQuestion ?? false}
              onChange={(value) =>
                updateField("actionHasReflectionQuestion", value)
              }
              label="Users are prompted with a reflection question when completing this action"
              showInfo={true}
            />
          </div>

          {formData.actionHasReflectionQuestion && (
            <div className="mb-4 mt-4 ml-6">
              <Input
                type="text"
                value={formData.actionReflectionQuestion || ""}
                onChange={(e) =>
                  updateField("actionReflectionQuestion", e.target.value)
                }
                placeholder="Enter reflection question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
