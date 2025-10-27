import React from "react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

/**
 * Dynamic slider field component with clickable ball indicators
 * Shows labels with clickable balls below them for selection
 */
export default function SliderField({
  label,
  options = [],
  value,
  onChange,
  name,
  required = false,
}) {
  // Normalize options to always have {value, label} structure
  const normalizedOptions = options.map((opt, index) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt, index };
    }
    return { ...opt, index };
  });

  // Find current selected index
  const selectedIndex = normalizedOptions.findIndex(
    (opt) => opt.value === value
  );
  const currentIndex = selectedIndex !== -1 ? selectedIndex : 0;

  const handleOptionClick = (option) => {
    if (onChange) {
      onChange({ target: { name, value: option.value } });
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </Label>
      )}

      <div className="py-3 sm:py-4 px-1">
        {/* Labels */}
        <div className="flex justify-between mb-2 sm:mb-3">
          {normalizedOptions.map((option, index) => {
            const isSelected = currentIndex === index;

            return (
              <span
                key={option.value}
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors text-center",
                  isSelected ? "text-primary font-semibold" : "text-gray-600"
                )}
              >
                {option.label}
              </span>
            );
          })}
        </div>

        {/* Balls with connecting line */}
        <div className="relative flex justify-between items-center px-2">
          {/* Gray line connecting all balls */}
          <div className="absolute left-2 right-2 h-1 sm:h-1.5 bg-gray-100" />

          {/* Clickable balls */}
          {normalizedOptions.map((option, index) => {
            const isSelected = currentIndex === index;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={cn(
                  "relative z-10 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all",
                  "hover:scale-110 focus:outline-none",
                  isSelected
                    ? "bg-primary border-none shadow-md"
                    : "bg-white border-primary"
                )}
                aria-label={`Select ${option.label}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
