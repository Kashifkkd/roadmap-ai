import React, { useState } from "react";
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
  Check,
  X,
  Loader2,
} from "lucide-react";
import { uploadAssetFile } from "@/api/uploadAssets";

export default function ReflectionForm({
  formData,
  updateField,
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
}) {
  const fileInputId = "reflection-image-upload";
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (file) {
      setIsUploading(true);
      setUploadError(null);
      // Update form field
      updateField("reflectionImage", file);
      
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
        console.log("Reflection image uploaded successfully");
      } catch (error) {
        setUploadError("Upload failed. Please try again.");
        console.error("Error uploading reflection image:", error);
      } finally {
        setIsUploading(false);
      }
    }
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
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Reflection" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </Label>
          <Input
            type="text"
            value={formData.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <RichTextArea
          label="Prompt"
          value={formData.prompt || ""}
          onChange={(value) => updateField("prompt", value)}
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
      </div>
    </div>
  );
}
