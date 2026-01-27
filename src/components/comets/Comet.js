"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

      await onCometClick(session_id ,status);
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
        }
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

      localStorage.setItem("openCometSettingsFromAllComets", "true");

      // Navigate to comet manager
      router.push("/comet-manager");
    } catch (error) {
      console.error("Error fetching comet session details:", error.message);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex flex-col  w-[310px] min-h-[270px] rounded-2xl overflow-hidden group cursor-pointer transition-transform duration-300 ease-in-out "
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
      <div className="absolute top-2 bottom-2 left-2 right-2 inset-0 rounded-lg p-2 bg-white/0 group-hover:bg-white transition-all duration-150 z-10 opacity-0 group-hover:opacity-100">
        <div className="flex flex-col w-full h-full justify-between">
          <div className="flex flex-col gap-2">
            <StatusButton status={status} />
            <span className="text-gray-800 font-noto font-semibold text-[20px] leading-[30px] tracking-normal line-clamp-2">
              {title}
            </span>
            <div className="flex w-[70%] rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
              <span className="font-inter font-medium text-sm gap-2 leading-5 align-middle text-gray-900">
                Total Active Users{" "}
                <span className="bg-white py-0.5 px-2 rounded-4xl">
                  {activeUsers || 10}
                </span>
              </span>
            </div>
            <div className="flex w-full gap-2">
              <div className="flex rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-sm gap-2 leading-5 align-middle text-gray-900">
                  WAU{" "}
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {activeUsers}
                  </span>
                </span>
              </div>
              <div className="flex  rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-sm gap-2 leading-5 align-middle text-gray-900">
                  MAU{" "}
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {activeUsers}
                  </span>
                </span>
              </div>
            </div>
          </div>
          {/* another bottom part */}
          <div className="flex flex-col w-full p-2 gap-2 justify-between">
            <div className="border border-gray-300"></div>
            <span className="font-inter font-medium text-xs align-middle">
              Last updated at{" "}
              {new Date(date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-2 justify-between">
              <button className="flex justify-center items-center rounded-sm py-2 px-3 gap-3 bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6]">
                <div className="flex gap-1">
                  <Image
                    src="/edit.png"
                    alt="edit icon"
                    height={16}
                    width={16}
                  />
                  <span className="font-inter font-medium text-xs text-white">
                    Edit
                  </span>
                </div>
              </button>
              <button className="rounded-sm py-2 px-3 gap-3 bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6]">
                <div className="flex gap-1">
                  <Image
                    src="/preview.png"
                    alt="preview icon"
                    height={16}
                    width={16}
                  />
                  <span className="font-inter font-medium text-xs text-white">
                    Preview
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="rounded-sm py-2 px-3 gap-3 bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6]"
                onClick={handleSettingsClick}
              >
                <div className="flex gap-1">
                  <Image
                    src="/settings.png"
                    alt="settings icon"
                    height={16}
                    width={16}
                  />
                  <span className="font-inter font-medium text-xs text-white">
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
            {title?.length > 50 ? `${title.slice(0, 50)}...` : title}
          </span>
          <div className="flex w-[70%] rounded-4xl py-1 pr-1 pl-2 bg-[#E3E1FC]">
            <span className="font-inter font-medium text-xs gap-2 leading-5 align-middle text-gray-900">
              Total Active Users{" "}
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
