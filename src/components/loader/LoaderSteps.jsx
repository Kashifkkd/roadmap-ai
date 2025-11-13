"use client";
import Image from "next/image";
import React from "react";
import ProgressBar from "./ProgressBar";
import { useEffect, useState, useRef } from "react";

export default function LoaderSteps() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef(null);
  const steps = [
    {
      src: "/file.gif",
      title: "Analyzing Source Materials",
      des: "Processing uploaded documents and extracting key insights",
    },
    {
      src: "/document.gif",
      title: "Generating Learning Content",
      des: "Creating microlessons using the EASE model",
    },
    {
      src: "/tool.gif",
      title: "Building Interactive Tools",
      des: "Designing assessments and interactive elements",
    },
    {
      src: "/film.gif",
      title: "Creating Visual Assets",
      des: "Generating branded images and icons",
    },
    {
      src: "/shooting.gif",
      title: "Finalizing Comet",
      des: "Assembling everything into your learning path",
    },
  ];

  useEffect(() => {
    // stop if all steps done
    if (currentStep >= steps.length) {
      setProgress(100);
      return;
    }

    // ensure we start from 0 for the new step
    setProgress(0);

    // clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // start interval for the active step
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // finish this step
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // move to next step
          setTimeout(() => {
            // small delay to let UI show 100% briefly
            setCurrentStep((s) => s + 1);
          }, 200);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    // cleanup if component unmounts or currentStep changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentStep]);

  return steps.map((step, idx) => (
    <div key={idx} className="flex w-full">
      <div className="flex w-full flex-col py-2">
        <div className="flex w-full items-center pb-2 gap-2 sm:gap-3">
          <div className="shrink-0">
            <Image
              src={step.src}
              alt="file"
              height={42}
              width={42}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-[42px] md:h-[42px]"
            />
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="font-inter font-bold text-sm sm:text-base md:text-lg leading-4 sm:leading-5 text-primary-900 truncate">
              {step.title}
            </span>
            <span className="font-medium leading-4 sm:leading-5 text-xs sm:text-sm text-primary-900 line-clamp-2">
              {step.des}
            </span>
          </div>
          {idx < currentStep ? (
            <div className="shrink-0">
              <Image
                src="/loading complete.svg"
                alt="loaded"
                height={32}
                width={32}
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
              />
            </div>
          ) : idx === currentStep ? (
            <div className="flex items-end h-full shrink-0 w-8 sm:w-10 md:w-12">
              <span className="text-[#7367F0] text-sm sm:text-base font-bold whitespace-nowrap">
                {progress}%
              </span>
            </div>
          ) : (
            <div className="flex items-end h-full shrink-0 w-8 sm:w-10 md:w-12">
              <span className="text-[#7367F0] text-sm sm:text-base font-bold whitespace-nowrap">
                0%
              </span>
            </div>
          )}
        </div>
        {/* loader progress bar - show for all sections */}
        <ProgressBar
          progress={
            idx === currentStep ? progress : idx < currentStep ? 100 : 0
          }
          isLastSection={idx === steps.length - 1}
        />
      </div>
    </div>
  ));
}
