import React, { useRef } from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Plus, Info } from "lucide-react";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label, showInfo = false }) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      {showInfo && (
        <Info
          size={16}
          className="text-gray-400 cursor-help"
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
    <>
      <SectionHeader title="Action" />

      {/* Action Details Section */}
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

      {/* Tool Configuration Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Tool</h4>

        {/* Select Tool */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tool (Select from Existing Tool Library)
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Select Tool</span>
              <Button
                type="button"
                onClick={handleSelectToolBrowse}
                className="bg-primary text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
              >
                <Plus size={14} className="mr-1" />
                Browse
              </Button>
            </div>
          </div>
        </div>

        {/* Or separator */}
        <div className="flex items-center mb-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Upload Tool */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Tool (Upload from your Computer)
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Upload Document</span>
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
                className="bg-primary text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
              >
                <Plus size={14} className="mr-1" />
                Browse
              </Button>
            </div>
          </div>
        </div>

        {/* Or separator */}
        <div className="flex items-center mb-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Create Tool */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Create Tool (Create New Tool Using Prompt)
          </Label>
          <div className="relative">
            <Textarea
              value={formData.actionToolPrompt || ""}
              onChange={(e) => updateField("actionToolPrompt", e.target.value)}
              rows={6}
              placeholder="Enter your prompt to create a new tool..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-20"
            />
            <Button
              type="button"
              onClick={handleCreateTool}
              className="absolute bottom-2 right-2 bg-primary text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
            >
              Create
            </Button>
          </div>
        </div>
      </div>

      {/* User Options Section */}
      <div className="mb-6">
        <ToggleSwitch
          checked={formData.actionCanCompleteImmediately ?? true}
          onChange={(value) =>
            updateField("actionCanCompleteImmediately", value)
          }
          label="Users can complete this action immediately"
        />

        <ToggleSwitch
          checked={formData.actionCanSchedule ?? true}
          onChange={(value) => updateField("actionCanSchedule", value)}
          label="Users can schedule this action for later"
        />

        <ToggleSwitch
          checked={formData.actionHasReflectionQuestion ?? true}
          onChange={(value) =>
            updateField("actionHasReflectionQuestion", value)
          }
          label="Users are prompted with a reflection question when completing this action"
          showInfo={true}
        />

        {formData.actionHasReflectionQuestion && (
          <div className="mb-4 mt-2">
            <Input
              type="text"
              value={formData.actionReflectionQuestion || ""}
              onChange={(e) =>
                updateField("actionReflectionQuestion", e.target.value)
              }
              placeholder="Enter reflection question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </>
  );
}
