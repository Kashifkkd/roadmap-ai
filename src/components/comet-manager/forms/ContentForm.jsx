import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

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
      {/* <TextArea
        label="Description"
        value={formData.contentSimpleDescription}
        onChange={(value) => updateField("contentSimpleDescription", value)}
      /> */}
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
}
