"use client";

import React, { useState } from "react";
import { Plus, GripVertical, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ScreenCard({
  screen,
  selectedScreen,
  index,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
  onAddScreen,
}) {
  const [showAddButton, setShowAddButton] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        <Plus size={20} />
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
              ? "bg-primary-700 hover:bg-primary-600 min-w-[140px] sm:min-w-[150px] max-w-[150px] sm:max-w-[180px]"
              : "bg-gray-100 hover:bg-primary-100 min-w-[110px] sm:min-w-[150px] max-w-[150px] sm:max-w-[150px]"
          }
        `}
      >
        <div className="w-full flex justify-between items-center gap-2 text-xs">
          <div className="flex justify-between items-center gap-1 w-full">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-start gap-2 font-medium w-full transition-colors duration-300 ${
                  selectedScreen?.id === screen.id
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Screen {index + 1}
              </div>
              <div
                className={`flex text-sm items-start gap-2 font-medium w-full transition-colors duration-300 ${
                  selectedScreen?.id === screen.id
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {screen.screenContents?.contentType || "Content"} Screen
              </div>
              <div
                className={`flex flex-col items-start bg-white p-2 mt-0.5 shrink-0 
  transition-all duration-300  shadow-sm overflow-hidden
  ${
    selectedScreen?.id === screen.id
      ? "h-[210px] w-[145px]" // active screen size
      : "h-[170px] w-[135px]" // normal screen size
  }`}
              >
                {/* Title */}
                <div
                  className={`flex items-start gap-2 text-sm font-medium w-full transition-colors duration-300 mb-1 text-wrap ${
                    selectedScreen?.id === screen.id
                      ? "text-black"
                      : "text-black"
                  }`}
                  title={screen.title}
                >
                  {screen.title}
                </div>

                {/* Thumbnail */}
                <div
                  className={`w-full mb-2 ${
                    selectedScreen?.id === screen.id ? "h-[100px]" : "h-[90px]"
                  }`}
                >
                  <img
                    src={
                      screen.thumbnail ||
                      "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                    }
                    alt={screen.title || "Screen preview"}
                    className=" w-full h-full object-cover transition-all duration-300"
                    onError={(e) => (e.target.src = "/error-img.png")}
                  />
                </div>

                {/* Key Learning Heading */}
                <div
                  className={`text-sm font-medium w-full mb-1 transition-colors duration-300 ${
                    selectedScreen?.id === screen.id
                      ? "text-black"
                      : "text-gray-700"
                  }`}
                >
                  Key Learning
                </div>

                <div
                  className={`w-full text-xs font-medium overflow-hidden text-ellipsis line-clamp-3 transition-colors duration-300 ${
                    selectedScreen?.id === screen.id
                      ? "text-black"
                      : "text-gray-700"
                  }`}
                >
                  {screen.screenContents?.content?.body ||
                    "No content available"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full flex justify-between items-center">
          <Expand
            size={16}
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
              size={16}
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

            {/* Body */}
            {(screen.screenContents?.content?.body ||
              screen.formData?.body) && (
              <div>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {screen.screenContents?.content?.body ||
                    screen.formData?.body}
                </p>
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
