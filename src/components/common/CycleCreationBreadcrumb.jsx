"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "configure", label: "Configure Cycle", href: "/configure-cycle" },
  { id: "outline", label: "Outline Manager", href: "/outline-manager" },
  { id: "cycle", label: "Cycle Manager", href: "/cycle-manager" },
];

const linkBaseClassName =
  "cursor-pointer rounded-sm transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2";

const disabledStepClassName = "font-normal text-gray-400 cursor-default";

function getStepAccessibility(sessionData) {
  const outline = sessionData?.response_outline;
  const hasOutline =
    outline?.chapters?.length > 0 ||
    (Array.isArray(outline) && outline.length > 0);
  const pathChapters = sessionData?.response_path?.chapters;
  const hasCycleManager =
    Array.isArray(pathChapters) && pathChapters.length > 0;

  return {
    configure: true,
    outline: hasOutline,
    cycle: hasCycleManager,
  };
}

export default function CycleCreationBreadcrumb({
  activeStep,
  sessionData,
  className,
}) {
  const activeIndex = STEPS.findIndex((step) => step.id === activeStep);
  const stepAccessibility = getStepAccessibility(sessionData);

  return (
    <nav
      aria-label="Cycle creation progress"
      className={cn(
        "flex flex-wrap items-center gap-y-1 text-sm leading-5",
        className
      )}
    >
      {STEPS.map((step, index) => {
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;
        const isNavigable = isPast || stepAccessibility[step.id];

        return (
          <Fragment key={step.id}>
            {index > 0 && (
              <ChevronRight
                className="mx-3 size-4 shrink-0 text-gray-300"
                aria-hidden="true"
              />
            )}
            {isActive ? (
              <span
                className="font-medium text-[#574EB6]"
                aria-current="step"
              >
                {step.label}
              </span>
            ) : isNavigable ? (
              <Link
                href={step.href}
                className={cn(
                  linkBaseClassName,
                  isPast
                    ? "font-normal text-gray-500 hover:text-[#574EB6]"
                    : "font-normal text-gray-400 hover:text-[#574EB6]"
                )}
              >
                {step.label}
              </Link>
            ) : (
              <span className={disabledStepClassName} aria-disabled="true">
                {step.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
