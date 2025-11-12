import React from "react";
import { SectionHeader, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image as ImageIcon,
  Code,
} from "lucide-react";

export default function ReflectionForm({ formData, updateField }) {
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

      {/* <Textarea
            value={formData.reflectionDescription || ""}
            onChange={(e) =>
              updateField("reflectionDescription", e.target.value)
            }
            rows={6}
            className="w-full px-3 py-2 border-0 bg-white focus:outline-none focus:ring-0 resize-y"
          /> */}
      <RichTextArea
        label="Description"
        value={formData.reflectionDescription}
        onChange={(value) => updateField("reflectionDescription", value)}
      />

      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-3">
          Upload Image
        </Label>

        <div className="space-y-3 bg-gray-100 rounded-lg p-4 flex flex-1 gap-2 justify-between">
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-2 justify-center items-center">
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs text-gray-700 mb-2">
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

          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-2 justify-center items-center">
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs text-gray-700 mb-2">
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

          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-2 justify-center items-center">
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs text-gray-700 mb-2">
                AI-Generate Image
              </span>
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
}
