import React from "react";
import { Label } from "@/components/ui/Label";

/**
 * Dynamic multiple choice field component
 * Renders as button group that can adapt to AI-generated data
 */
export default function MultipleChoiceField({
  label,
  options = [],
  value,
  onChange,
  name,
  required = false,
  orientation = "horizontal",
}) {
  // Normalize options to always have {value, label} structure
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const handleValueChange = (newValue) => {
    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </Label>
      )}
      <div
        className={`flex ${
          orientation === "vertical"
            ? "flex-col gap-2"
            : "flex-col sm:flex-row gap-2 flex-wrap"
        }`}
      >
        {normalizedOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleValueChange(option.value)}
            className={`px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm sm:text-base ${
              value === option.value
                ? "bg-primary text-white border-primary"
                : "bg-background text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
