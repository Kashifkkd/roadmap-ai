"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import StatusButton from "./StatusButton";
import { useCometSettings } from "@/contexts/CometSettingsContext";

const Comet = ({
  title,
  activeUsers,
  imageURL,
  date,
  status,
  session_id,
  onCometClick,
}) => {
  const [disabled, setDisabled] = useState(false);
  const [imgSrc, setImgSrc] = useState(imageURL || "/fallbackImage.png");
  const { setIsCometSettingsOpen } = useCometSettings();

  useEffect(() => {
    setImgSrc(imageURL || "/fallbackImage.png");
  }, [imageURL]);

  const handleClick = async () => {
    if (disabled) return;
    try {
      setDisabled(true);

      if (!session_id) {
        console.error("No sessionId found for comet");
        return;
      }

      await onCometClick(session_id, status);
    } catch (error) {
      console.error("Comet click error", err.message);
    } finally {
      setDisabled(false);
    }
  };

  const handleSettingsClick = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up to parent div

    if (!session_id) {
      console.error("No sessionId found for comet");
      return;
    }

    try {
      // Fetch session details from
      const response = await fetch(
        `https://kyper-stage.1st90.com/api/comet/session_details/${session_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session details");
      }

      const result = await response.json();

      if (imageURL && imageURL !== "/fallbackImage.png") {
        result.response_path = result.response_path || {};
        result.response_path.path_image = imageURL;
      }

      // Store sessionData in localStorage
      localStorage.setItem("sessionData", JSON.stringify(result));
      localStorage.setItem("sessionId", session_id);

      setIsCometSettingsOpen(true);
    } catch (error) {
      console.error("Error fetching comet session details:", error.message);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex flex-col w-[310px] h-[280px] shrink-0 rounded-2xl overflow-hidden group cursor-default transition-transform duration-300 ease-in-out"
    >
      {/* Background image with zoom effect */}
      <Image
        src={imgSrc}
        alt="card image"
        fill
        sizes="100%"
        className="absolute inset-0 z-0 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        priority
        unoptimized
        onError={() => setImgSrc("/fallbackImage.png")}
      />
      {/* White overlay on hover */}
      {/* new white overlay on hover  */}
      <div className="absolute top-2 bottom-2 left-2 right-2 rounded-lg p-3 bg-white/0 group-hover:bg-white transition-all duration-150 z-10 opacity-0 group-hover:opacity-100">
        <div className="flex flex-col w-full h-full justify-between">
          <div className="flex flex-col gap-2">
            <StatusButton status={status} />
            <span className="text-gray-800 font-noto font-semibold text-[18px] leading-[24px] tracking-normal line-clamp-2 min-h-[48px]">
              {title?.length > 50 ? `${title.slice(0, 50)}...` : title}
            </span>
            <div className="flex items-center w-fit rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
              <span className="font-inter font-medium text-sm leading-5 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                Total Active Users
                <span className="bg-white py-0.5 px-2 rounded-4xl">
                  {activeUsers || 10}
                </span>
              </span>
            </div>
            <div className="flex w-full gap-2">
              <div className="flex items-center rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-sm leading-5 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  WAU
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {activeUsers || 10}
                  </span>
                </span>
              </div>
              <div className="flex items-center rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-sm leading-5 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  MAU
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {activeUsers || 10}
                  </span>
                </span>
              </div>
            </div>
          </div>
          {/* Bottom section */}
          <div className="flex flex-col w-full gap-2">
            <div className="border-t border-gray-200"></div>
            <span className="font-inter font-normal text-xs text-gray-500">
              Last Updated{" "}
              {new Date(date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-1.5 flex-nowrap">
              <button className="flex justify-center items-center rounded-md py-1.5 px-2 bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6] shrink-0 cursor-pointer">
                <div className="flex items-center gap-1">
                  <Image
                    src="/edit.png"
                    alt="edit icon"
                    height={14}
                    width={14}
                  />
                  <span className="font-inter font-medium text-xs text-white whitespace-nowrap">
                    Edit
                  </span>
                </div>
              </button>
              <button className="flex justify-center items-center rounded-md py-1.5 px-2 bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6] shrink-0 cursor-pointer">
                <div className="flex items-center gap-1">
                  <Image
                    src="/preview.png"
                    alt="preview icon"
                    height={14}
                    width={14}
                  />
                  <span className="font-inter font-medium text-xs text-white whitespace-nowrap">
                    Preview
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="flex justify-center items-center rounded-md py-1.5 px-2 bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6] shrink-0 cursor-pointer"
                onClick={handleSettingsClick}
              >
                <div className="flex items-center gap-1">
                  <Image
                    src="/settings.png"
                    alt="settings icon"
                    height={14}
                    width={14}
                  />
                  <span className="font-inter font-medium text-xs text-white whitespace-nowrap">
                    Settings
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay content */}

      <div className="absolute bottom-2 left-2 right-2 z-20 flex flex-col gap-2.5 rounded-lg p-4 bg-white transition-all duration-700 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-6">
        <div className="flex flex-col gap-2">
          <StatusButton status={status} />
          <span className="text-gray-800 font-noto font-semibold text-[20px] leading-[30px] tracking-normal line-clamp-2">
            {title?.length > 20 ? `${title.slice(0, 20)}...` : title}
          </span>
          <div className="flex items-center w-fit rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
            <span className="font-inter font-medium text-xs leading-5 text-gray-900 flex items-center gap-2 whitespace-nowrap">
              Total Active Users
              <span className="bg-white py-0.5 px-2 rounded-4xl">
                {activeUsers || 10}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comet;
