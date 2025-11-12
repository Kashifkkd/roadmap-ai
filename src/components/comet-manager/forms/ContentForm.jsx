import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Link as LinkIcon } from "lucide-react";

export default function ContentForm({
  formData,
  updateField,
  askKyperHandlers = {},
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  return (
    <>
      <SectionHeader title="Content" />
      <TextField
        label="Title"
        value={formData.contentSimpleTitle}
        onChange={(value) => updateField("contentSimpleTitle", value)}
        inputProps={{
          onSelect: (event) =>
            onTextFieldSelect?.(
              "contentSimpleTitle",
              event,
              formData.contentSimpleTitle
            ),
          onBlur: onFieldBlur,
        }}
      />
      <RichTextArea
        label="Description"
        value={formData.contentSimpleDescription}
        onChange={(value) => updateField("contentSimpleDescription", value)}
        onSelectionChange={(selectionInfo) =>
          onRichTextSelection?.(
            "contentSimpleDescription",
            selectionInfo,
            formData.contentSimpleDescription
          )
        }
        onBlur={onRichTextBlur}
      />

      {/* Upload Image/Icon Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="block text-sm font-medium text-gray-700">
            Upload Image/Icon
          </Label>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">
              Full Bleed Image
            </Label>
            <label className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer">
              <Input
                type="checkbox"
                checked={Boolean(formData.contentFullBleed)}
                onChange={(e) =>
                  updateField("contentFullBleed", e.target.checked)
                }
                className="sr-only peer"
              />
              <span
                className={`absolute h-6 w-11 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-primary bg-gray-300`}
              />
              <span
                className={`absolute inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-6 translate-x-1`}
              />
            </label>
          </div>
        </div>

        <div className="relative  rounded-lg p-2 bg-gray-100 hover:border-primary transition-colors">
          <div className="border-2 border-dashed p-8 rounded-lg border-gray-300 bg-white">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateField(
                  "contentImageIcon",
                  e.target.files && e.target.files[0] ? e.target.files[0] : null
                )
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center pointer-events-none">
              <p className="text-sm text-gray-600 mb-4">Upload Image/Icon</p>
              <span className="bg-primary text-white hover:bg-primary-700 px-4 py-2 text-sm rounded-lg inline-flex items-center gap-2 pointer-events-auto">
                + Browse
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Media Section */}
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Media
        </Label>
        <div className="relative p-2 bg-gray-100 rounded-lg hover:border-primary transition-colors mb-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-2 bg-white">
            <Input
              type="file"
              accept="video/*,audio/*"
              onChange={(e) =>
                updateField(
                  "contentMediaFile",
                  e.target.files && e.target.files[0] ? e.target.files[0] : null
                )
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center pointer-events-none">
              <p className="text-sm text-gray-600 mb-4">Upload Video/Audio</p>
              <span className="bg-primary text-white hover:bg-primary-700 px-4 py-2 text-sm rounded-lg inline-flex items-center gap-2 pointer-events-auto">
                + Browse
              </span>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <p className="text-sm text-gray-900 font-medium">
              Or paste your link here
            </p>
          </div>
          <div className="relative">
            <LinkIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              type="url"
              value={formData.contentMediaLink || ""}
              onChange={(e) => updateField("contentMediaLink", e.target.value)}
              placeholder="Or paste your link here"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </>
  );
}
