"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import StatusButton from "./StatusButton";
import { useCometSettings } from "@/contexts/CometSettingsContext";
import { toast } from "@/components/ui/toast";
import CreateCycleVariantModal from "./CreateCycleVariantModal";
import CreateCycleRemixModal from "./CreateCycleRemixModal";
import { appendCacheBuster, refreshCloudfrontCookies } from "@/lib/cloudfront-cookies";

/** When the sessions list omits path_id, session details in localStorage may still have it. */
function pathIdFromSessionCache(sessionId) {
  if (typeof window === "undefined" || sessionId == null || sessionId === "") {
    return null;
  }
  try {
    const raw = localStorage.getItem("sessionData");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (String(data?.session_id ?? "") !== String(sessionId)) return null;
    const candidates = [
      data.path_id,
      data.pathId,
      data.response_path?.path_id,
      data.response_path?.id,
    ];
    for (const v of candidates) {
      if (v == null || v === "") continue;
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  } catch {
    return null;
  }
  return null;
}

/** Sessions list may expose total_active_users, wau, mau from the API. */
function formatMetric(value) {
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

const Comet = ({
  title,
  /** total_active_users from API (or legacy activeUsers) */
  activeUsers,
  wau,
  mau,
  imageURL,
  date,
  status,
  session_id,
  /** Backend path id for POST /paths/{id}/variant */
  path_id,
  onCometClick,
  updatedBy,
}) => {
  const [disabled, setDisabled] = useState(false);
  const [imgSrc, setImgSrc] = useState(imageURL || "/fallbackImage.png");
  const [didRetryImage, setDidRetryImage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const menuRef = useRef(null);
  const { setIsCometSettingsOpen } = useCometSettings();
  const isPublishedCycle =
    typeof status === "string" && status.trim().toLowerCase() === "published";

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleCreateVariantClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsVariantModalOpen(true);
  };

  const handleRemixClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsRemixModalOpen(true);
  };

  useEffect(() => {
    setImgSrc(imageURL || "/fallbackImage.png");
    setDidRetryImage(false);
  }, [imageURL]);

  const handleCardImageError = async () => {
    if (!didRetryImage && imageURL && imageURL !== "/fallbackImage.png") {
      setDidRetryImage(true);
      const result = await refreshCloudfrontCookies({
        force: true,
        showFailureToast: true,
      });
      if (result?.ok) {
        setImgSrc(appendCacheBuster(imageURL));
        return;
      }
    }
    setImgSrc("/fallbackImage.png");
  };

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
      console.error("Comet click error", error?.message);
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
      const response = await fetch(
        `${apiUrl}/api/comet/session_details/${session_id}`,
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
      const msg = error.message?.includes("fetch") || error.message?.includes("network")
        ? "Network error. Please check your connection."
        : error.message || "Something went wrong. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex flex-col w-full min-h-[250px] md:min-h-[260px] lg:min-h-[300px] 
      xl:min-h-[330px] 2xl:min-h-[360px] shrink-0 rounded-2xl overflow-hidden group cursor-pointer transition-transform duration-300 ease-in-out"
    >

      <Image
        src={imgSrc}
        alt="card image"
        fill
        sizes="100%"
        className="absolute inset-0 z-0 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        priority
        unoptimized
        onError={handleCardImageError}
      />
      {/* White overlay on hover */}
      {/* new white overlay on hover  */}
      <div className="absolute top-2 bottom-2 left-2 right-2 rounded-lg p-3 bg-white/0 group-hover:bg-white transition-all duration-150 z-30 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex flex-col w-full h-full justify-end">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <StatusButton status={status} />
              {isPublishedCycle && (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={handleMoreClick}
                    className="flex items-center justify-center rounded-md p-1 text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden py-1">
                      <button
                        type="button"
                        onClick={handleCreateVariantClick}
                        className="w-full px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                      >
                        Copy Cycle
                      </button>
                      {/* <button
                        type="button"
                        onClick={handleRemixClick}
                        className="w-full px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                      >
                        Remix
                      </button> */}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-gray-800 font-noto font-semibold text-[18px] leading-[24px] tracking-normal line-clamp-3 min-h-[48px]">
              {title}
            </span>
            <div className="flex items-center w-fit rounded-4xl py-1 pr-1 pl-4 bg-[#E3E1FC]">
              <span className="font-inter font-medium text-xs leading-4 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                Total Active Users
                <span className="bg-white py-0.5 px-2 rounded-4xl">
                  {formatMetric(activeUsers)}
                </span>
              </span>
            </div>
            <div className="flex w-full gap-2 flex-wrap mb-2">
              <div className="flex items-center rounded-4xl py-1 pr-1 pl-4 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-xs leading-4 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  WAU
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {formatMetric(wau)}
                  </span>
                </span>
              </div>
              <div className="flex items-center rounded-4xl py-1 pr-1 pl-4 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-xs leading-4 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  MAU
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {formatMetric(mau)}
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
            <div className="flex gap-1 flex-nowrap">
              <button className="flex justify-center items-center rounded-sm py-[8px] px-[12px] bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6] shrink-0 cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/edit.png"
                    alt="edit icon"
                    height={16}
                    width={16}
                  />
                  <span className="font-inter font-medium text-xs text-white whitespace-nowrap">
                    Edit
                  </span>
                </div>
              </button>
              <button className="flex justify-center items-center rounded-sm py-[8px] px-[12px] bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6] shrink-0 cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/preview.png"
                    alt="preview icon"
                    height={16}
                    width={16}
                  />
                  <span className="font-inter font-medium text-xs text-white whitespace-nowrap">
                    Preview
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="flex justify-center items-center rounded-sm py-[8px] px-[12px] bg-[#453E90] hover:bg-[#7367F0] active:bg-[#574EB6] shrink-0 cursor-pointer"
                onClick={handleSettingsClick}
              >
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/settings.png"
                    alt="settings icon"
                    height={16}
                    width={16}
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

      <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-col gap-2.5 rounded-lg p-4 bg-white transition-all duration-700 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-6">
        <div className="flex flex-col gap-2">
          <StatusButton status={status} />
          <span className="text-gray-800 font-noto font-semibold text-[20px] leading-[30px] tracking-normal line-clamp-2 min-h-[60px]">
            {title}
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center w-fit rounded-4xl py-1 pr-1 pl-4 bg-[#E3E1FC]">
              <span className="font-inter font-medium text-xs leading-4 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                Total Active Users
                <span className="bg-white py-0.5 px-2 rounded-4xl">
                  {formatMetric(activeUsers)}
                </span>
              </span>
            </div>
            <div className="flex w-full gap-2 flex-wrap">
              <div className="flex items-center rounded-4xl py-1 pr-1 pl-4 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-xs leading-4 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  WAU
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {formatMetric(wau)}
                  </span>
                </span>
              </div>
              <div className="flex items-center rounded-4xl py-1 pr-1 pl-4 bg-[#E3E1FC]">
                <span className="font-inter font-medium text-xs leading-4 text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  MAU
                  <span className="bg-white py-0.5 px-2 rounded-4xl">
                    {formatMetric(mau)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <CreateCycleVariantModal
          open={isVariantModalOpen}
          onOpenChange={setIsVariantModalOpen}
          cycleName={title}
          numericPathId={(() => {
            if (path_id != null && path_id !== "") {
              const n = Number(path_id);
              if (Number.isFinite(n) && n >= 0) return n;
            }
            return pathIdFromSessionCache(session_id);
          })()}
        />
        <CreateCycleRemixModal
          open={isRemixModalOpen}
          onOpenChange={setIsRemixModalOpen}
          cycleName={title}
          sessionId={session_id}
          numericPathId={(() => {
            if (path_id != null && path_id !== "") {
              const n = Number(path_id);
              if (Number.isFinite(n) && n >= 0) return n;
            }
            return pathIdFromSessionCache(session_id);
          })()}
        />
      </div>
    </div>
  );
};

export default Comet;
