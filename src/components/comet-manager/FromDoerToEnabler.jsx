"use client";

import React, { useState } from "react";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import Image from "next/image";

const DEVICE_VIEWS = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
};

export default function FromDoerToEnabler() {
  const [deviceView, setDeviceView] = useState(DEVICE_VIEWS.desktop);

  const contentText =
    "Becoming a manager is more than a new job title. It's a shift from measuring your success by what you deliver personally, to how effectively you enable your team to succeed. This is the first and most important mindset change for new managers.";

  const handshakeImageUrl = "/handshake.jpg";

  const DeviceIcon = ({ view, isActive, onClick }) => {
    const icons = {
      mobile: <Smartphone size={16} className={isActive ? "stroke-[2.5]" : "stroke-[2.5]"} />,
      tablet: <Tablet size={16} className={isActive ? "stroke-[2.5]" : "stroke-[2.5]"} />,
      desktop: <Monitor size={16} className={isActive ? "stroke-[2.5]" : "stroke-[2.5]"} />,
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center w-8 h-8 rounded transition-all ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : "bg-white text-primary border-2 border-primary"
        }`}
        aria-label={`Switch to ${view} view`}
      >
        {icons[view]}
      </button>
    );
  };

  const ContentBlock = ({ reverse = false }) => (
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
          deviceView === DEVICE_VIEWS.desktop ? "w-1/2" : "w-full"
        }`}
      >
        <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-gray-500 text-sm">Image</span>
          </div>
          {/* 
          <Image
            src={handshakeImageUrl}
            alt="Professional handshake"
            fill
            className="object-cover"
            unoptimized
          /> 
          */}
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
            deviceView === DEVICE_VIEWS.mobile ? "text-lg" : "text-xl"
          }`}
        >
          Why This Matters
        </h3>
        <p
          className={`text-gray-900 leading-relaxed font-sans ${
            deviceView === DEVICE_VIEWS.mobile ? "text-sm" : "text-base"
          }`}
        >
          {contentText}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full border-lg w-full bg-white">
      <div className="border border-gray-200 w-full py-3 px-4 flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 bg-primary-100 rounded-md px-2 py-1">
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
        className={`flex-1 overflow-y-auto bg-white ${
          deviceView === DEVICE_VIEWS.mobile
            ? "px-4"
            : deviceView === DEVICE_VIEWS.tablet
            ? "px-6 md:px-12 max-w-3xl mx-auto"
            : "px-12"
        } py-8`}
      >
        <h1
          className={`font-bold text-primary mb-4 ${
            deviceView === DEVICE_VIEWS.mobile
              ? "text-2xl"
              : deviceView === DEVICE_VIEWS.tablet
              ? "text-3xl"
              : "text-4xl"
          } ${deviceView === DEVICE_VIEWS.desktop ? "font-serif" : "font-sans"}`}
        >
          From Individual Contributor to Manager
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
        >
          Making the Shift: From Doer to Enabler
        </h2>

        <div className="space-y-8">
          <ContentBlock reverse={false} />

          {deviceView === DEVICE_VIEWS.desktop && <ContentBlock reverse={true} />}
          {deviceView === DEVICE_VIEWS.desktop && <ContentBlock reverse={false} />}

          {(deviceView === DEVICE_VIEWS.mobile ||
            deviceView === DEVICE_VIEWS.tablet) && (
            <>
              <ContentBlock reverse={false} />
              <ContentBlock reverse={false} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

