"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  GripVertical,
  Expand,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import GradientLoader from "@/components/ui/GradientLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Strip all HTML to plain text only (no bold, italic, or line breaks)
function stripHtmlToPlainText(html) {
  if (!html || typeof html !== "string") return html || "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldShowScreenCardImage(screen) {
  const contentType = screen?.screenContents?.contentType;
  const content = screen?.screenContents?.content || {};

  if (
    contentType === "content" ||
    contentType === "reflection" ||
    contentType === "habits" ||
    contentType === "manager_email" ||
    contentType === "managerEmail" ||
    contentType === "accountability_partner_email" ||
    contentType === "accountabilityPartnerEmail"
  ) {
    return true;
  }

  if (contentType === "notifications") {
    return content.media?.type !== "none";
  }

  return false;
}

export default function ScreenCard({
  screen,
  chapter,
  selectedScreen,
  index,
  isGeneratingImages,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
  onAddScreen,
  onDeleteScreen,
}) {
  console.log(screen, "screen >>>>>>>>>>>>");
  const [showAddButton, setShowAddButton] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleEditScreen = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onClick(screen);
  };

  const handleDeleteScreen = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDeleteScreen(screen.id);
  };

  const showImagePreview = shouldShowScreenCardImage(screen);
  const hasExistingThumbnail = !!(
    screen?.thumbnail &&
    screen.thumbnail !== "/noImage.png" &&
    screen.thumbnail !== "/error-img.png"
  );

  const AddButton = ({ position, insertIndex }) => (
    <div
      className={`absolute ${
        position === "left" ? "-left-4" : "-right-4"
      } top-1/4 transform -translate-y-1/2 z-10`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddScreen(insertIndex);
        }}
        className=" bg-primary-700 text-white rounded-full p-2 shadow-lg transition-all"
      >
        <Plus style={{ width: "1.25em", height: "1.25em" }} />
      </button>
    </div>
  );
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
        onClick={() => onClick(screen)}
        className={`rounded-lg p-1.5 sm:p-2 flex flex-col justify-between items-center gap-1 sm:gap-1 text-xs
          shrink-0 shadow-sm hover:shadow-md cursor-pointer 
          border border-transparent hover:border-primary-600
          transition-all duration-300 ease-in-out
          ${
            selectedScreen?.id === screen.id
              ? "bg-primary-700 hover:bg-primary-600 min-w-35 sm:min-w-37.5 max-w-37.5 sm:max-w-45"
              : "bg-gray-100 hover:bg-primary-100 min-w-27.5 sm:min-w-37.5 max-w-37.5 sm:max-w-37.5"
          }
        `}
      >
        <div className="w-full flex justify-between items-center gap-2 text-xs">
          <div className="flex justify-between items-center gap-1 w-full">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-between font-medium w-full transition-colors duration-300 ${
                  selectedScreen?.id === screen.id
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                <span>Screen {index + 1}</span>
                {onDeleteScreen && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={handleToggleMenu}
                      className={`p-0.5 rounded-md transition-colors duration-200 ${
                        selectedScreen?.id === screen.id
                          ? "text-white/70 hover:text-white hover:bg-white/10"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                      }`}
                      title="More options"
                    >
                      <MoreVertical style={{ width: "1em", height: "1em" }} />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={handleEditScreen}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={handleDeleteScreen}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div
                className={`flex text-sm items-start gap-2 font-medium w-full transition-colors duration-300 text-wrap truncate ${
                  selectedScreen?.id === screen.id
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {((str) => {
                  const words = str
                    .replace(/_/g, " ")
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .split(" ");
                  return words
                    .map((word, i) =>
                      i === 0
                        ? word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                        : word.toLowerCase(),
                    )
                    .join(" ");
                })(screen.screenContents?.contentType || "Content")}{" "}
              </div>
              <div
                className={`flex flex-col items-start bg-white p-2 mt-0.5 shrink-0 transition-all duration-300  shadow-sm overflow-hidden${
                  selectedScreen?.id === screen.id
                    ? " h-52.5 w-36.25"
                    : " h-42.5 w-33.75" // normal screen size
                }`}
              >
                {/* Title */}
                <div
                  className={`flex items-start gap-2 text-sm font-medium w-full transition-colors duration-300 mb-1 text-wrap ${
                    selectedScreen?.id === screen.id
                      ? "text-black"
                      : "text-black"
                  }`}
                  title={screen.screenContents?.name || screen.title}
                >
                  {screen.screenContents?.name || screen.title}
                </div>

                {/* Thumbnail */}
                {showImagePreview && (
                  <div
                    className={`relative w-full mb-2 ${
                      selectedScreen?.id === screen.id ? "h-25" : "h-22.5"
                    }`}
                  >
                    <img
                      src={screen.thumbnail || "/noImage.png"}
                      alt={screen.title || "Screen preview"}
                      className="w-full h-full object-cover transition-all duration-300"
                      onError={(e) => (e.target.src = "/error-img.png")}
                    />
                    {isGeneratingImages && !hasExistingThumbnail && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded">
                        <GradientLoader size={32} />
                      </div>
                    )}
                  </div>
                )}

                {/* Key Learning Heading */}
                {/* <div
                  className={`text-sm font-medium w-full mb-1 transition-colors duration-300 ${selectedScreen?.id === screen.id
                    ? "text-black"
                    : "text-gray-700"
                    }`}
                >
                  Key Learning
                </div> */}

                <div
                  className={`w-full text-xs font-medium overflow-hidden text-ellipsis line-clamp-3 transition-colors duration-300 ${
                    !showImagePreview ? "mt-auto" : ""
                  } ${
                    selectedScreen?.id === screen.id
                      ? "text-black"
                      : "text-gray-700"
                  }`}
                >
                  {stripHtmlToPlainText(
                    screen.screenContents?.content?.body ||
                      screen.screenContents?.content?.keyLearning ||
                      "No content available",
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full flex justify-between items-center">
          <Expand
            style={{ width: "1em", height: "1em" }}
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
            }}
            className={`cursor-pointer hover:scale-110 transition-all duration-300 ${
              selectedScreen?.id === screen.id ? "text-white" : "text-gray-500"
            }`}
          />
          <div
            className={`p-1 rounded transition-colors duration-300 ${
              selectedScreen?.id === screen.id
                ? "bg-primary-800"
                : "bg-background"
            }`}
          >
            <GripVertical
              style={{ width: "1em", height: "1em" }}
              className={`cursor-grab active:cursor-grabbing transition-colors duration-300 ${
                selectedScreen?.id === screen.id
                  ? "text-white"
                  : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Add button that appears between cards */}

      {showAddButton && <AddButton position="left" insertIndex={index} />}
      {showAddButton && <AddButton position="right" insertIndex={index + 1} />}

      {/* Full Screen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Screen {index + 1}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Heading */}
            {(screen.screenContents?.content?.heading ||
              screen.formData?.heading) && (
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                  {screen.screenContents?.content?.heading ||
                    screen.formData?.heading}
                </h3>
              </div>
            )}

            {/* Body (rich text: bold, italic, etc.) */}
            {(screen.screenContents?.content?.body ||
              screen.formData?.body) && (
              <div className="text-base text-gray-700 leading-relaxed">
                {stripHtmlToPlainText(
                  screen.screenContents?.content?.body || screen.formData?.body,
                )}
              </div>
            )}

            {/* Assets */}
            {screen.assets && screen.assets.length > 0 && (
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screen.assets.map((asset, assetIndex) => (
                    <div
                      key={assetIndex}
                      className="rounded-lg overflow-hidden border shadow-sm"
                    >
                      {asset.type === "image" && asset.url ? (
                        <img
                          src={asset.url}
                          alt={`Media ${assetIndex + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = "/error-img.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <p className="text-sm text-gray-500 capitalize">
                            {asset.type || "Asset"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ease Categories */}
            {screen.easeCategories && screen.easeCategories.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {screen.easeCategories.map((category, catIndex) => (
                    <span
                      key={catIndex}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
