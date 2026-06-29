import React from "react";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/section-header";
import CycleCreationBreadcrumb from "./CycleCreationBreadcrumb";

export default function CycleCreationHeader({
  activeStep,
  sessionData,
  title,
  showTitle = true,
  className,
}) {
  return (
    <div
      className={cn(
        "w-full shrink-0 pt-4",
        showTitle
          ? "space-y-4 pb-2 px-2 sm:px-2 md:px-2"
          : "pb-4 px-2 sm:px-4 md:px-6",
        className,
      )}
    >
      <div className="px-4">
        <CycleCreationBreadcrumb
          activeStep={activeStep}
          sessionData={sessionData}
        />
      </div>
      {showTitle && title ? <SectionHeader title={title} /> : null}
    </div>
  );
}
