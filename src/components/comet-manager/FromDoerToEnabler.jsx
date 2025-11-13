"use client";

import React, { useMemo, useState } from "react";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import Image from "next/image";

const DEVICE_VIEWS = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
};

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
                {item}
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

export default function FromDoerToEnabler({ selectedScreen }) {
  const [deviceView, setDeviceView] = useState(DEVICE_VIEWS.desktop);

  const contentSections = useMemo(() => {
    if (!selectedScreen) {
      return [];
    }

    const sections = [];
    const screenContents = selectedScreen.screenContents;
    const content = screenContents.content;
    const contentType = screenContents.contentType;

    const title = content.title || content.heading;

    const imageUrl = content.media?.url || "";

    const imageAlt = content.media?.description || "Preview";

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
      case "actions":
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
  }, [selectedScreen]);

  if (!selectedScreen) {
    return (
      <div className="flex flex-col h-full rounded-lg w-full bg-white items-center justify-center text-gray-500 text-sm">
        Select a screen to preview.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg w-full bg-white">
      <div className="w-full py-3 px-4 flex items-center justify-center">
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
      <div className="bg-gray-white flex-1 overflow-y-auto px-2 ">
        <div className="bg-gray-200 flex-1 overflow-y-auto px-2 py-4 rounded-sm">
          <div
            className={`flex-1 overflow-y-auto rounded-sm bg-white ${
              deviceView === DEVICE_VIEWS.mobile
                ? "px-4 max-w-[50%] mx-auto"
                : deviceView === DEVICE_VIEWS.tablet
                ? "px-8 max-w-[90%] mx-auto"
                : "px-12 max-w-full"
            } py-8`}
          >
            <h1
              className={`font-bold text-primary mb-4 ${
                deviceView === DEVICE_VIEWS.mobile
                  ? "text-2xl"
                  : deviceView === DEVICE_VIEWS.tablet
                  ? "text-3xl"
                  : "text-4xl"
              } ${
                deviceView === DEVICE_VIEWS.desktop ? "font-serif" : "font-sans"
              }`}
            >
              {selectedScreen.title || "Untitled"}
            </h1>

            <div className="w-full h-px bg-gray-300 mb-6"></div>

            <h2
              className={`font-bold text-gray-900 mb-6 font-sans ${
                deviceView === DEVICE_VIEWS.mobile
                  ? "text-xl"
                  : deviceView === DEVICE_VIEWS.tablet
                  ? "text-2xl"
                  : "text-3xl"
              }`}
            ></h2>

            <div className="space-y-8">
              {contentSections.map((section, index) => (
                <ContentBlock
                  key={section.id || index}
                  reverse={
                    deviceView === DEVICE_VIEWS.desktop && index % 2 === 1
                  }
                  deviceView={deviceView}
                  section={section}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
