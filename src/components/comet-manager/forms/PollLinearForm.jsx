import React from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  NumberField,
} from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PollLinearForm({
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
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Linear" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("linearTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />
        <TextField
          label="Top Label"
          value={formData.highLabel || ""}
          onChange={(value) => updateField("highLabel", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("linearHighLabel", event, formData.highLabel),
            onBlur: onFieldBlur,
          }}
        />
        <TextField
          label="Bottom Label"
          value={formData.lowLabel || ""}
          onChange={(value) => updateField("lowLabel", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("linearLowLabel", event, formData.lowLabel),
            onBlur: onFieldBlur,
          }}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => updateField("question", value)}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "linearQuestion",
              selectionInfo,
              formData.question
            )
          }
          onBlur={onRichTextBlur}
        />
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Select Scale
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={formData.lowerScale ?? ""}
              onChange={(e) =>
                updateField(
                  "lowerScale",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="Enter Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">To</span>
            <Input
              type="number"
              value={formData.higherScale ?? ""}
              onChange={(e) =>
                updateField(
                  "higherScale",
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
            value={
              formData.linearBenchmarkType || formData.benchmark_type || ""
            }
            onValueChange={(value) => updateField("linearBenchmarkType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Benchmark Type" />
            </SelectTrigger>
            <SelectContent className="w-full overflow-auto">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="industry">Industry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
