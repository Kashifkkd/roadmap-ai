import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/common/ImageUpload";

export default function AccountabilityPartnerEmailForm({
  formData,
  updateField,
  updateScreenAssets,
  removeScreenAsset,
  screen,
  addListItem,
  updateListItem,
  removeListItem,
  askKyperHandlers = {},
  sessionId = "",
  chapterUuid = "",
  stepUuid = "",
  screenUuid = "",
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  const existingAssets = screen?.assets || [];
  const emails = formData.emails || [""];

  const handleRemoveAsset = (index) => {
    if (removeScreenAsset) removeScreenAsset(index);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Accountability Partner Email" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.heading || ""}
          onChange={(value) => updateField("heading", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.(
                "accountabilityPartnerHeading",
                event,
                formData.heading
              ),
            onBlur: onFieldBlur,
          }}
        />
        <RichTextArea
          label="Description"
          value={formData.body || ""}
          onChange={(value) => updateField("body", value)}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "accountabilityPartnerBody",
              selectionInfo,
              formData.body
            )
          }
          onBlur={onRichTextBlur}
        />
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Emails
          </Label>
          <div className="space-y-2">
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  type="email"
                  value={email || ""}
                  onChange={(e) =>
                    updateListItem("emails", index, e.target.value)
                  }
                  placeholder="partner@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="default"
                  onClick={() => removeListItem("emails", index)}
                  disabled={emails.length <= 1}
                  className="shrink-0 px-2 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addListItem("emails")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300"
            >
              <Plus size={16} />
              Add email
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <ImageUpload
            label="Image"
            sessionId={sessionId}
            chapterUid={chapterUuid}
            stepUid={stepUuid}
            screenUid={screenUuid}
            onUploadSuccess={(assetData) => {
              if (updateScreenAssets) updateScreenAssets([assetData]);
            }}
            onAIGenerateSuccess={(assetData) => {
              if (updateScreenAssets) updateScreenAssets([assetData]);
            }}
            existingAssets={existingAssets}
            onRemoveAsset={handleRemoveAsset}
            showSavedImages={true}
          />
        </div>
      </div>
    </div>
  );
}
