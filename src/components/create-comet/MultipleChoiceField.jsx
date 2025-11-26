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
    <div className="">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </Label>
      )}
      <div
        className={`flex p-1 rounded-2xl bg-[#F8F7FE] w-fit ${
          orientation === "vertical"
            ? "flex-col gap-1"
            : "flex-col sm:flex-row gap-2 flex-wrap"
        }`}
      >
        {normalizedOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleValueChange(option.value)}
            className={` sm:px-2  rounded-xl p-1  transition-all text-sm sm:text-base cursor-pointer w-fit ${
              value === option.value
                ? "bg-primary text-white border-primary"
                : "bg-[#F8F7FE] text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
