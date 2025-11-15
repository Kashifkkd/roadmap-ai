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

export default function PollLinearForm({ formData, updateField }) {
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
        />
        <TextField
          label="Top Label"
          value={formData.high_label || ""}
          onChange={(value) => updateField("high_label", value)}
        />
        <TextField
          label="Bottom Label"
          value={formData.low_label || ""}
          onChange={(value) => updateField("low_label", value)}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => updateField("question", value)}
        />
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Select Scale
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={formData.lowerscale ?? ""}
              onChange={(e) =>
                updateField(
                  "lowerscale",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="Enter Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">To</span>
            <Input
              type="number"
              value={formData.higherscale ?? ""}
              onChange={(e) =>
                updateField(
                  "higherscale",
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
      </div>
    </div>
  );
}
