"use client";

import React, { useMemo, useState } from "react";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import Image from "next/image";
import AssetsCarousel from "@/components/common/AssetsCarousel";

const DEVICE_VIEWS = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
};

const FALLBACK_IMAGE_URL =
  "https://fastly.picsum.photos/id/866/200/300.jpg?hmac=rcadCENKh4rD6MAp6V_ma-AyWv641M4iiOpe1RyFHeI";

const DeviceIcon = ({ view, isActive, onClick }) => {
  const iconClassName = isActive ? "text-white" : "text-primary-600";
  const icons = {
    mobile: <Smartphone size={16} className={iconClassName} />,
    tablet: <Tablet size={16} className={iconClassName} />,
    desktop: <Monitor size={16} className={iconClassName} />,
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
        isActive ? "bg-primary" : "bg-primary-200"
      }`}
      aria-label={`Switch to ${view} view`}
    >
      {icons[view]}
    </button>
  );
};

const ScreenContentTypePreview = ({
  deviceView,
  content,
  sections = [],
  assets = [],
}) => {
  // Debug: Log assets to see what we're receiving
  console.log("ScreenContentTypePreview assets:", assets);
  
  const imageUrl =
    content?.media?.url ||
    content?.media?.imageUrl ||
    content?.image ||
    FALLBACK_IMAGE_URL;

  // Check if blend mode is enabled from content settings
  const isBlendMode = content?.blend_mode ?? false;

  const title =
    content?.heading || content?.title || content?.name || "Untitled Story";
  const subtitle = content?.subheading || content?.summary || null;
  const description =
    content?.body ||
    content?.description ||
    content?.text ||
    content?.copy ||
    "";
  const prompt =
    content?.prompt || content?.call_to_action || content?.cta || null;

  const keyPointsSource =
    Array.isArray(content?.key_points) && content.key_points.length > 0
      ? content.key_points
      : sections.find((section) => section.id === "content-key-points")?.list ||
        [];

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const imageAspectClass =
    deviceView === DEVICE_VIEWS.mobile ? "aspect-[2/3]" : "aspect-[16/8]";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-lg"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const descriptionSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-sm"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-base"
      : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-2"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div
      className={`w-full ${containerWidth} mx-auto h-[72vh] flex flex-col overflow-y-auto`}
    >
      {/* Main Content Card */}
      <div
        className={`bg-gray-100 overflow-hidden shadow-sm ${
          keyPointsSource.length > 0 ? "shrink-0" : "flex-1"
        }`}
        style={{ minHeight: "70vh" }}
      >
        {isBlendMode ? (
          // Blend Mode: Full height image with overlaid content boxes
          <div className="relative h-full w-full">
            {/* Show carousel if assets exist, otherwise show single image */}
            {assets && assets.length > 0 ? (
              <div className="absolute inset-0">
                <AssetsCarousel assets={assets} />
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={content?.media?.description || title}
                fill
                priority={deviceView === DEVICE_VIEWS.mobile}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

            {/* Content overlay at bottom half */}
            <div
              className={`absolute inset-x-0 bottom-0 h-1/2 ${paddingClass} flex flex-col justify-end space-y-3`}
            >
              {/* Title box with backdrop blur */}
              <div className="backdrop-blur-md bg-gray-200/80 px-4 py-3 rounded-sm shadow-lg">
                <h2
                  className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
                >
                  {title}
                </h2>
              </div>

              {/* Description box with backdrop blur */}
              {description && (
                <div className="backdrop-blur-md bg-gray-200/80 px-4 py-3 rounded-sm shadow-lg">
                  <p
                    className={`text-gray-800 ${descriptionSizeClass} leading-relaxed line-clamp-4`}
                  >
                    {description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Non-Blend Mode: Image on top, content below
          <div className="h-full flex flex-col overflow-y-auto">
            <div className="px-8 pt-2 flex-shrink-0">
              {/* Show carousel if assets exist, otherwise show single image */}
              {assets && assets.length > 0 ? (
                <div className="w-3/4 max-w-md mx-auto">
                  <AssetsCarousel assets={assets} />
                </div>
              ) : (
                <div
                  className={`relative w-3/4 max-w-md mx-auto ${imageAspectClass} overflow-hidden  rounded-lg`}
                >
                  <Image
                    src={imageUrl}
                    alt={content?.media?.description || title}
                    fill
                    priority={deviceView === DEVICE_VIEWS.mobile}
                    className="object-cover "
                    sizes="(max-width: 768px) 60vw, 40vw"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Content section below image */}
            <div className={`${paddingClass} space-y-1 flex-1`}>
              {/* Title box */}
              <div className="bg-gray-200/30 backdrop-blur-lg border-2 border-white/50 px-4 py-3 rounded-sm shadow-sm">
                <h2
                  className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
                >
                  {title}
                </h2>
              </div>

              {subtitle && (
                <div className="px-4">
                  <p className="text-sm font-medium text-gray-600">
                    {subtitle}
                  </p>
                </div>
              )}

              {/* Description box */}
              {description && (
                <div className="bg-gray-200/40 backdrop-blur-lg border-2 border-white/50 px-4 py-3 rounded-sm shadow-sm">
                  <p
                    className={`text-gray-800 ${descriptionSizeClass} leading-relaxed`}
                  >
                    {description}
                  </p>
                </div>
              )}

              {prompt && (
                <div className="px-4">
                  <div className="mt-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-900 px-4 py-3 text-sm">
                    {prompt}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Key Points - Always below the card */}
      {keyPointsSource.length > 0 && (
        <div className="space-y-2">
          {keyPointsSource.map((point, index) => (
            <div
              key={`content-key-point-${index}`}
              className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-700 leading-relaxed shadow-sm"
            >
              {typeof point === "object" ? point.text : point}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MCQScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const question = content?.question || "";
  const options = content?.options || [];
  const keyLearning = content?.key_learning || null;

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-lg"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const questionSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-base"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-lg"
      : "text-xl";

  const optionSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-gray-100 overflow-y-auto shadow-sm h-full">
        <div className={`${paddingClass} space-y-2 overflow-y-auto`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Question */}
          {question && (
            <div className="space-y-4">
              <p
                className={`text-gray-800 text-sm ${questionSizeClass} leading-relaxed font-medium text-center`}
              >
                {question}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div
                    key={`mcq-option-${index}`}
                    className="bg-gray-200/30 backdrop-blur-lg text-sm border border-gray-300 px-4 py-2 rounded-sm shadow-sm hover:bg-gray-300/90 transition-colors cursor-pointer"
                  >
                    <p
                      className={`text-gray-800 ${optionSizeClass} leading-relaxed`}
                    >
                      {typeof option === "object" ? option.text : option}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Learning */}
          {keyLearning && (
            <div className="mt-6">
              <p className={`text-gray-700 ${optionSizeClass} leading-relaxed`}>
                <span className="font-semibold">Key Learning:</span>{" "}
                {keyLearning}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AssessmentScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const questions = content?.questions || [];

  console.log(">>>", content);

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-lg"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const questionSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-gray-100 overflow-hidden shadow-sm h-full">
        <div className={`${paddingClass} space-y-6`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div
                key={`assessment-question-${question.question_id || qIndex}`}
                className="space-y-3"
              >
                {/* Question Text */}
                <p
                  className={`text-gray-800 ${questionSizeClass} leading-relaxed font-medium`}
                >
                  {qIndex + 1}. {question.text || question.question}
                </p>

                {/* Options */}
                <div className="space-y-2 pl-4">
                  {question.options?.map((option, oIndex) => {
                    // Handle both object format {option_id, text} and string format
                    const optionText =
                      typeof option === "string"
                        ? option
                        : option?.text || `Option ${oIndex + 1}`;

                    return (
                      <div
                        key={`assessment-option-${
                          option?.option_id || option?.optionId || oIndex
                        }`}
                        className="bg-gray-200/90 text-sm border border-gray-300 px-4 py-2 rounded-sm shadow-sm hover:bg-gray-300/90 transition-colors cursor-pointer"
                      >
                        <p
                          className={`text-gray-800 ${questionSizeClass} leading-relaxed`}
                        >
                          {optionText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ForceRankScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const question = content?.question || "";
  const options = content?.options || [];
  const lowLabel = content?.low_label || "";
  const highLabel = content?.high_label || "";

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-lg"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const questionSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-gray-100 overflow-hidden shadow-sm h-full">
        <div className={`${paddingClass} space-y-6`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Question/Instructions */}
          {question && (
            <p className={`text-gray-800 ${questionSizeClass} leading-relaxed`}>
              {question}
            </p>
          )}

          {/* Ranking Labels */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-orange-600">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-semibold">{highLabel}</span>
            </div>
          </div>

          {/* Draggable Options */}
          <div className="space-y-3">
            {options.map((option, index) => (
              <div
                key={`force-rank-option-${index}`}
                className="flex items-center gap-3 cursor-move"
              >
                {/* Option Text */}
                <p
                  className={`text-gray-800 ${questionSizeClass} leading-relaxed flex-1`}
                >
                  {typeof option === "object" ? option.text : option}
                </p>
                {/* 6 Dots Drag Handle Icon */}
                <div className="text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="8" cy="6" r="1.5" />
                    <circle cx="8" cy="12" r="1.5" />
                    <circle cx="8" cy="18" r="1.5" />
                    <circle cx="14" cy="6" r="1.5" />
                    <circle cx="14" cy="12" r="1.5" />
                    <circle cx="14" cy="18" r="1.5" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Label */}
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-semibold">{lowLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HabitsScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const subtitle = content?.subtitle || content?.description || "";
  const habits = content?.habits || [];
  console.log(">>>content>>>>>>>>", content);

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-2xl"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-3xl"
      : "text-4xl";

  const subtitleSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const textSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-6 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-8 py-8"
      : "px-10 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-white overflow-hidden shadow-sm h-full flex flex-col">
        <div className={`${paddingClass} space-y-2`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Subtitle/Description */}
          {subtitle && (
            <p className={`text-gray-800 ${subtitleSizeClass} leading-relaxed`}>
              {subtitle}
            </p>
          )}

          {/* Habit Queue Section with border lines */}
          <div className="">
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white font-bold text-gray-900">
                  Habit queue
                </span>
              </div>
            </div>
          </div>

          {/* Habits List */}
          <div className="space-y-4">
            {/* Active Habits (first 2) with orange badges and drag handles */}
            {habits.slice(0, 2).map((habit, index) => (
              <div
                key={`habit-active-${index}`}
                className="flex items-center gap-4"
              >
                {/* Number Badge - Toggle style (rounded rectangle) */}
                <div className="flex-shrink-0">
                  <div className="relative inline-flex items-center">
                    <div className="w-12 h-7 bg-orange-400 rounded-full flex items-center justify-start pl-1">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-gray-900 font-bold text-xs">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Habit Text */}
                <p
                  className={`text-gray-900 ${textSizeClass} leading-relaxed flex-1`}
                >
                  {typeof habit === "object" ? habit.title : habit}
                </p>
                {/* Drag Handle */}
                <div className="text-gray-400 flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="8" cy="6" r="1.5" />
                    <circle cx="8" cy="12" r="1.5" />
                    <circle cx="8" cy="18" r="1.5" />
                    <circle cx="16" cy="6" r="1.5" />
                    <circle cx="16" cy="12" r="1.5" />
                    <circle cx="16" cy="18" r="1.5" />
                  </svg>
                </div>
              </div>
            ))}

            {/* Divider line between active and inactive */}
            {habits.length > 2 && (
              <div className="border-t border-gray-200 my-2"></div>
            )}

            {/* Inactive/Future Habits with gray toggle */}
            {habits.slice(2).map((habit, index) => (
              <div
                key={`habit-inactive-${index}`}
                className="flex items-center gap-4"
              >
                {/* Gray Toggle with Plus */}
                <div className="flex-shrink-0">
                  <div className="relative inline-flex items-center">
                    <div className="w-12 h-7 bg-gray-300 rounded-full flex items-center justify-start pl-1">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg
                          className="w-3 h-3 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Habit Text */}
                <p
                  className={`text-gray-900 ${textSizeClass} leading-relaxed flex-1`}
                >
                  {typeof habit === "object" ? habit.text : habit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReflectionScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const prompt = content?.prompt || content?.question || content?.text || "";

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-lg"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const textSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-gray-100 overflow-hidden shadow-sm h-full">
        <div className={`${paddingClass} space-y-6 h-full flex flex-col`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Prompt/Question */}
          {prompt && (
            <p className={`text-gray-800 ${textSizeClass} leading-relaxed`}>
              {prompt}
            </p>
          )}

          {/* Textarea for reflection */}
          <div className="flex-1 flex flex-col">
            <textarea
              className="flex-1 w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Leave reflection here...."
              disabled
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button className="flex-1 px-10 py-2   bg-[#fe5f23] text-white font-semibold rounded-sm hover:bg-orange-500 transition-colors">
              Save
            </button>
            <button className="flex-1 px-3 py-2 bg-white border-2 border-[#fe5f23] text-gray-600 font-semibold rounded-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LinearPollScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const question = content?.question || "";
  const lowLabel = content?.low_label || "";
  const highLabel = content?.high_label || "";
  const lowerScale = content?.lowerscale || 1;
  const higherScale = content?.higherscale || 10;

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-lg"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const textSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-gray-100 overflow-hidden shadow-sm h-full">
        <div
          className={`${paddingClass} space-y-8 flex flex-col justify-center h-full`}
        >
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight text-center`}
          >
            {title}
          </h2>

          {/* Question */}
          {question && (
            <p
              className={`text-gray-800 ${textSizeClass} leading-relaxed text-center`}
            >
              {question}
            </p>
          )}

          {/* Slider Section */}
          <div className="space-y-6">
            {/* Current Value Display */}
            <div className="flex justify-center">
              <div className="w-15 h-15 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">4</span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={lowerScale}
                max={higherScale}
                defaultValue="4"
                className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                disabled
                style={{
                  background:
                    "linear-gradient(to right, #1f2937 0%, #1f2937 30%, #d1d5db 30%, #d1d5db 100%)",
                }}
              />

              {/* Scale Labels */}
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>{lowerScale}</span>
                <span>{higherScale}</span>
              </div>
            </div>

            {/* Description Labels */}
            <div className="flex justify-between text-sm text-gray-600">
              <span className="text-left">{lowLabel}</span>
              <span className="text-right">{highLabel}</span>
            </div>
          </div>

          {/* Finalize Button */}
          <div className="pt-4">
            <button className="w-full py-2 bg-orange-500 text-white font-bold text-lg rounded-lg hover:bg-orange-600 transition-colors">
              Finalize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const text = content?.text || content?.question || "";
  const toolLink = content?.tool_link || content?.tool || "";
  const reflectionPrompt = content?.reflection_prompt || "";
  const imageUrl = content?.media?.url || FALLBACK_IMAGE_URL;

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px] "
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-2xl"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-3xl"
      : "text-4xl";

  const textSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-6 py-8"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-8 py-10"
      : "px-12 py-12";

  return (
    <div
      className={`w-full ${containerWidth} mx-auto h-[72vh] overflow-y-auto`}
    >
      <div className="bg-gray-50 overflow-hidden shadow-sm h-full flex flex-col overflow-y-auto">
        {/* Image Section
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div> */}

        {/* Content Section */}
        <div className={`${paddingClass} flex-1 flex flex-col space-y-6`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Description */}
          {text && (
            <div className="px-6 py-4 rounded-sm ">
              <p className={`text-gray-800 ${textSizeClass} leading-relaxed`}>
                {text}
              </p>
            </div>
          )}

          {/* Reflection Prompt */}
          {reflectionPrompt && (
            <div className="bg-gray-200/90 border border-gray-300 px-6 py-4 rounded-sm shadow-sm text-left">
              <p className={`text-gray-800 ${textSizeClass} leading-relaxed `}>
                {reflectionPrompt}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button className="flex-1 px-10 py-2   bg-[#fe5f23] text-white font-medium rounded-sm hover:bg-orange-500 transition-colors">
              Commit
            </button>
            {toolLink && (
              <button className="flex-1 py-2 bg-white border-2 border-[#fe5f23] text-gray-600 font-medium rounded-sm hover:bg-gray-50 transition-colors">
                Open Tool
              </button>
            )}
          </div>

          {/* Completed Link */}
          <div className="text-center">
            <button className="text-gray-700 font-semibold text-base hover:text-gray-900">
              I completed this
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialDiscussionScreenPreview = ({ deviceView, content }) => {
  const title = content?.title || "";
  const question = content?.question || "";
  const posts = content?.posts || [];

  const containerWidth =
    deviceView === DEVICE_VIEWS.mobile
      ? "w-full max-w-[300px]"
      : deviceView === DEVICE_VIEWS.tablet
      ? "w-full max-w-2xl"
      : "w-full max-w-5xl";

  const titleSizeClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "text-xl"
      : deviceView === DEVICE_VIEWS.tablet
      ? "text-2xl"
      : "text-3xl";

  const textSizeClass =
    deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base";

  const paddingClass =
    deviceView === DEVICE_VIEWS.mobile
      ? "px-4 py-6"
      : deviceView === DEVICE_VIEWS.tablet
      ? "px-6 py-8"
      : "px-8 py-10";

  return (
    <div className={`w-full ${containerWidth} mx-auto h-[72vh]`}>
      <div className="bg-gray-100 overflow-hidden shadow-sm h-full">
        <div className={`${paddingClass} space-y-6 h-full flex flex-col`}>
          {/* Title */}
          <h2
            className={`font-bold text-gray-900 ${titleSizeClass} leading-tight`}
          >
            {title}
          </h2>

          {/* Question/Prompt */}
          {question && (
            <div className="bg-gray-50 px-4 py-4 rounded-lg border border-gray-200">
              <p className={`text-gray-800 ${textSizeClass} leading-relaxed`}>
                {question}
              </p>
            </div>
          )}

          {/* Comment Input Area */}
          <div className="flex-1 bg-white border-2 border-gray-300 rounded-2xl p-4 relative">
            {/* User Avatar */}
            <div className="absolute top-4 left-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-white font-bold text-lg">JB</span>
              </div>
            </div>

            {/* Textarea placeholder */}
            <div className="pl-16 pt-1">
              <p className={`text-gray-400 ${textSizeClass}`}>
                Leave your thoughts here....
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 py-2 px-10 bg-orange-500 text-white font-bold text-base rounded-sm hover:bg-orange-600 transition-colors">
              Save
            </button>
            <button className="flex-1 py-2 bg-white border-2 border-orange-500 text-gray-700 font-bold text-base rounded-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>

          {/* Posts Section (if any exist) */}
          {posts.length > 0 && (
            <div className="space-y-4 max-h-40 overflow-y-auto">
              {posts.map((post, index) => (
                <div
                  key={`post-${index}`}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className={`text-gray-800 ${textSizeClass}`}>
                        {post.text || post.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {post.author || "Anonymous"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentBlock = ({ reverse = false, deviceView, section }) => {
  const hasImage = Boolean(section.imageUrl);

  return (
    <div
      className={`flex gap-6 items-start ${
        deviceView === DEVICE_VIEWS.desktop
          ? reverse
            ? "flex-row-reverse"
            : "flex-row"
          : "flex-col"
      }`}
    >
      <div
        className={`shrink-0 ${
          deviceView === DEVICE_VIEWS.desktop
            ? "w-1/2"
            : deviceView === DEVICE_VIEWS.tablet
            ? "w-full"
            : "w-full"
        }`}
      >
        <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-gray-500 text-sm">Image</span>
          </div>
          {hasImage && (
            <Image
              src={section.imageUrl}
              alt={section.imageAlt || section.title || "Preview image"}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
      </div>

      {/* Text Content */}
      <div
        className={`flex-1 ${
          deviceView === DEVICE_VIEWS.desktop ? "w-1/2" : "w-full"
        }`}
      >
        <h3
          className={`font-bold text-gray-900 mb-3 font-sans ${
            deviceView === DEVICE_VIEWS.mobile
              ? "text-lg"
              : deviceView === DEVICE_VIEWS.tablet
              ? "text-xl"
              : "text-xl"
          }`}
        >
          {section.title || "Details"}
        </h3>
        {section.description && (
          <p
            className={`text-gray-900 leading-relaxed font-sans ${
              deviceView === DEVICE_VIEWS.mobile
                ? "text-sm"
                : deviceView === DEVICE_VIEWS.tablet
                ? "text-base"
                : "text-base"
            }`}
          >
            {section.description}
          </p>
        )}

        {section.secondaryText && (
          <p className="text-gray-700 mt-3 text-sm sm:text-base leading-relaxed">
            {section.secondaryText}
          </p>
        )}

        {Array.isArray(section.list) && section.list.length > 0 && (
          <div className="mt-4 space-y-2">
            {section.list.map((item, idx) => (
              <div
                key={`${section.id || "section"}-item-${idx}`}
                className="text-sm sm:text-base text-gray-900 bg-gray-100 rounded-lg px-3 py-2"
              >
                {typeof item === "object" ? item.text : item}
              </div>
            ))}
          </div>
        )}

        {Array.isArray(section.meta) && section.meta.length > 0 && (
          <div className="mt-4 space-y-1">
            {section.meta.map((entry, idx) => (
              <div
                key={`${section.id || "section"}-meta-${idx}`}
                className="text-sm text-gray-700"
              >
                <span className="font-semibold text-gray-900">
                  {entry.label}:
                </span>{" "}
                <span className="break-words">{entry.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function FromDoerToEnabler({
  selectedScreen,
  isMaximized = false,
}) {
  const [deviceView, setDeviceView] = useState(DEVICE_VIEWS.mobile);

  const screenContents = selectedScreen?.screenContents ?? null;
  const content = screenContents?.content ?? null;
  const contentType = screenContents?.contentType;
  console.log("contentType>>>>>>>>>>>>.", contentType);
  console.log("FromDoerToEnabler selectedScreen assets:", selectedScreen?.assets);

  const contentSections = useMemo(() => {
    if (!contentType || !content) {
      return [];
    }

    const sections = [];
    const title = content.title || content.heading || content.name || "Preview";
    const imageUrl =
      content.media?.url ||
      content.media?.imageUrl ||
      content.image ||
      FALLBACK_IMAGE_URL;
    const imageAlt = content.media?.description || title;

    const addSection = ({
      id,
      sectionTitle,
      description,
      secondaryText,
      list,
      meta,
    }) => {
      sections.push({
        id: id || `section-${sections.length}`,
        title: sectionTitle || title,
        description: description || "",
        secondaryText: secondaryText || null,
        list: Array.isArray(list) ? list : null,
        meta: Array.isArray(meta) ? meta.filter(Boolean) : null,
        imageUrl,
        imageAlt,
      });
    };

    switch (contentType) {
      case "content":
      case "content_image":
        addSection({
          id: "content-main",
          sectionTitle: content.heading || content.title || title,
          description:
            content.body ||
            content.description ||
            content.text ||
            content.summary ||
            "",
          secondaryText: content.prompt || null,
        });
        if (Array.isArray(content.key_points)) {
          addSection({
            id: "content-key-points",
            sectionTitle: "Key Points",
            list: content.key_points,
          });
        }
        break;
      case "mcq":
        addSection({
          id: "mcq",
          sectionTitle: content.title || title,
          description: content.question || "",
          list: content.options,
          secondaryText: content.key_learning || null,
        });
        break;
      case "force_rank":
        addSection({
          id: "force-rank",
          sectionTitle: content.title || title,
          description: content.question || "",
          list: content.options,
          meta: [
            content.low_label
              ? { label: "Lowest Rank", value: content.low_label }
              : null,
            content.high_label
              ? { label: "Highest Rank", value: content.high_label }
              : null,
          ].filter(Boolean),
        });
        break;
      case "linear":
        addSection({
          id: "linear",
          sectionTitle: content.title || title,
          description: content.question || "",
          meta: [
            content.low_label || content.lowerscale !== undefined
              ? {
                  label: "Scale Start",
                  value: [
                    content.low_label,
                    content.lowerscale !== undefined
                      ? `(${content.lowerscale})`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" "),
                }
              : null,
            content.high_label || content.higherscale !== undefined
              ? {
                  label: "Scale End",
                  value: [
                    content.high_label,
                    content.higherscale !== undefined
                      ? `(${content.higherscale})`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" "),
                }
              : null,
          ].filter(Boolean),
        });
        break;
      case "reflection":
        addSection({
          id: "reflection",
          sectionTitle: content.title || title,
          description: content.prompt || content.question || content.text || "",
        });
        break;
      case "action":
        addSection({
          id: "action",
          sectionTitle: content.title || title,
          description: content.text || content.question || "",
          secondaryText: content.reflection_prompt || null,
          meta: [
            content.tool ? { label: "Tool", value: content.tool } : null,
            content.tool_link
              ? { label: "Link", value: content.tool_link }
              : null,
            typeof content.can_complete_now === "boolean"
              ? {
                  label: "Complete Now",
                  value: content.can_complete_now ? "Yes" : "No",
                }
              : null,
            typeof content.can_scheduled === "boolean"
              ? {
                  label: "Schedule",
                  value: content.can_scheduled ? "Available" : "Not available",
                }
              : null,
          ].filter(Boolean),
        });
        break;
      case "habits":
        addSection({
          id: "habits",
          sectionTitle: content.title || title,
          description: content.description || "",
          list: content.habits,
          meta: [
            typeof content.is_mandatory === "boolean"
              ? {
                  label: "Mandatory",
                  value: content.is_mandatory ? "Yes" : "No",
                }
              : null,
            content.votes_count !== undefined
              ? { label: "Votes", value: String(content.votes_count) }
              : null,
          ].filter(Boolean),
        });
        break;
      case "social_discussion":
        addSection({
          id: "discussion",
          sectionTitle: content.title || title,
          description: content.question || "",
        });
        break;
      case "assessment":
        addSection({
          id: "assessment",
          sectionTitle: content.title || title,
          description: content.description || content.text || "",
          list: Array.isArray(content.questions)
            ? content.questions.map((question, index) => {
                if (typeof question === "string") {
                  return question;
                }
                if (question?.text) {
                  return question.text;
                }
                if (question?.question) {
                  return question.question;
                }
                return `Question ${index + 1}`;
              })
            : [],
        });
        break;
      default:
        break;
    }

    return sections;
  }, [contentType, content]);

  if (!selectedScreen) {
    return (
      <div className="flex flex-col h-full rounded-lg w-full bg-white items-center justify-center text-gray-500 text-sm">
        Select a screen to preview.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg w-full">
      <div className="w-full py-3 px-4 flex items-center justify-center  ">
        <div className="flex items-center justify-center bg-primary-100 rounded-xl p-1">
          <DeviceIcon
            view={DEVICE_VIEWS.mobile}
            isActive={deviceView === DEVICE_VIEWS.mobile}
            onClick={() => setDeviceView(DEVICE_VIEWS.mobile)}
          />
          <DeviceIcon
            view={DEVICE_VIEWS.tablet}
            isActive={deviceView === DEVICE_VIEWS.tablet}
            onClick={() => setDeviceView(DEVICE_VIEWS.tablet)}
          />
          <DeviceIcon
            view={DEVICE_VIEWS.desktop}
            isActive={deviceView === DEVICE_VIEWS.desktop}
            onClick={() => setDeviceView(DEVICE_VIEWS.desktop)}
          />
        </div>
      </div>
      <div
        className={`bg-gray-white flex-1 overflow-y-auto min-h-0 flex flex-col ${
          isMaximized ? "px-0 sm:px-2" : "px-2"
        }`}
      >
        <div
          className={`bg-gray-200 flex-1 overflow-y-auto rounded-sm min-h-0 flex flex-col ${
            isMaximized ? "px-0 py-0 sm:px-2 sm:py-2" : "px-2 py-2"
          }`}
        >
          <div
            className={`overflow-y-auto rounded-sm bg-white ${
              deviceView === DEVICE_VIEWS.mobile
                ? isMaximized
                  ? "px-4 w-full h-full sm:w-[375px] sm:h-[680px] sm:mx-auto"
                  : "px-4 w-[375px] h-[680px] mx-auto"
                : deviceView === DEVICE_VIEWS.tablet
                ? "px-8 max-w-[90%] mx-auto"
                : "px-12 max-w-full"
            } py-2`}
          >
            {/* <h1
              className={`font-bold text-primary mb-4 ${deviceView === DEVICE_VIEWS.mobile
                  ? "text-2xl"
                  : deviceView === DEVICE_VIEWS.tablet
                    ? "text-3xl"
                    : "text-4xl"
                } ${deviceView === DEVICE_VIEWS.desktop ? "font-serif" : "font-sans"
                }`}
            >
              {selectedScreen.title || "Untitled"}
            </h1> */}

            {/* <div className="w-full h-px bg-gray-300 mb-6"></div> */}

            {/* <h2
              className={`font-bold text-gray-900 mb-6 font-sans ${deviceView === DEVICE_VIEWS.mobile
                  ? "text-xl"
                  : deviceView === DEVICE_VIEWS.tablet
                    ? "text-2xl"
                    : "text-3xl"
                }`}
            ></h2> */}

            <div className="">
              {contentType === "content" || contentType === "content_image" ? (
                <ScreenContentTypePreview
                  deviceView={deviceView}
                  content={content}
                  sections={contentSections}
                  assets={selectedScreen?.assets || []}
                />
              ) : contentType === "mcq" ? (
                <MCQScreenPreview deviceView={deviceView} content={content} />
              ) : contentType === "assessment" ? (
                <AssessmentScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : contentType === "force_rank" ? (
                <ForceRankScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : contentType === "habits" ? (
                <HabitsScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : contentType === "reflection" ? (
                <ReflectionScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : contentType === "linear" ? (
                <LinearPollScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : contentType === "action" || contentType === "actions" ? (
                <ActionScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : contentType === "social_discussion" ? (
                <SocialDiscussionScreenPreview
                  deviceView={deviceView}
                  content={content}
                />
              ) : (
                contentSections.map((section, index) => (
                  <ContentBlock
                    key={section.id || index}
                    reverse={
                      deviceView === DEVICE_VIEWS.desktop && index % 2 === 1
                    }
                    deviceView={deviceView}
                    section={section}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
