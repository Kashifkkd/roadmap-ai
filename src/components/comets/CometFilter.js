"use client";

import Stars from "@/components/icons/Stars";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Search, ChevronUp } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, ref } from "react";
import { ArrowUpDown } from "lucide-react";


export default function CometFilter({ handleChange, sessionName, selected, handleStatus, sortBy, sortOrder, handleSortOrder, handleSortBy }) {
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    // set the initial client name
    setClientName(localStorage.getItem("ClientName") || " ");

    const handleStorageChange = (e) => {
      if (e.key === "ClientName") {
        console.log("Client id changed , refetching ....");
        setClientName(localStorage.getItem("ClientName"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [open, setOpen] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const options = ["select", "draft", "active", "published"];



  return (
    <div className="flex flex-col w-[90%] lg:max-h-[52px] gap-4 py-2 px-6 md:px-2 rounded-2xl mx-auto bg-white">
      <div className="flex flex-col lg:not-last-of-type:max-h-9  lg:flex-row lg:items-center lg:justify-between gap-4 ">
        <span className="font-inter font-bold text-base  leading-6 tracking-normal align-middle text-[#645AD1]">
          {/* My comets */}
          All Comets for {clientName}
        </span>
        <div className="flex flex-col md:flex-row gap-8 md:gap-4">
          <div className=" flex flex-col sm:flex-row sm:justify-between gap-4">
            {/* search bar */}
            <div className="flex px-3 gap-3 h-[40px] items-center bg-white border border-gray-300 rounded-lg shadow-sm">
              <Search height={20} width={20} className="text-gray-600" />
              <input
                type="text"
                placeholder="Search"
                value={sessionName}
                onChange={(e) => handleChange(e.target.value)}
                className="font-inter w-full border-none font-normal text-gray-500  text-sm leading-5 tracking-normal focus:outline-none"
              />
            </div>
            {/* dropdown */}
            <div className="relative md:w-[220px] ">
              {/* Dropdown Button */}
              <div
                onClick={() => setOpen(!open)}
                className="flex px-3 h-[40px] items-center gap-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer"
              >
                <div className="flex justify-between w-full gap-2">
                  <span className="capitalize text-gray-900 text-[13px]">{selected}</span>
                  <ChevronDown
                    height={20}
                    width={20}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute  top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">
                    Status Fillter
                  </div>

                  {options.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        handleStatus(option);
                        setOpen(false);
                      }}
                      className={`capitalize px-3 py-2 z-[999] text-sm cursor-pointer hover:bg-gray-100 ${selected === option ? "bg-gray-100 font-medium" : ""
                        }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* filter and create comet button  */}
          <div className="flex flex-col lg:flex-row sm:justify-between gap-4 md:gap-5">
            {/* Filter Button */}
            <div ref={ref} className="relative">
              {/* Sort Icon Button */}
              <button
                onClick={() => { setOpenSort((prev) => !prev) }}
                className="h-[40px] w-full px-2 flex items-center text-[13px] justify-center border rounded-lg bg-white hover:bg-gray-100"
                title="Sort"
              >
                <span className="mr-1">Sort By</span> <ArrowUpDown size={18} />
              </button>

              {/* Dropdown */}
              {openSort && (
                <div className="absolute right-0 mt-2 w-[200px] bg-white border rounded-lg shadow-lg z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">
                    Sort by
                  </div>

                  <button
                    onClick={() => { handleSortBy("asc"), setOpenSort(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100
                        ${sortBy === 'asc' ? "bg-gray-100 font-medium" : ""}
                      `}
                  >
                    Newest first
                  </button>

                  <button
                    onClick={() => { handleSortBy("desc"), setOpenSort(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100
                        ${sortBy === 'desc' ? "bg-gray-100 font-medium" : ""}
                      `}
                  >
                    Oldest first
                  </button>

                  <button
                    onClick={() => { handleSortOrder("updated_at"), setOpenSort(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100
                        ${sortOrder === 'updated_at' ? "bg-gray-100 font-medium" : ""}
                      `}
                  >
                    Recently updated
                  </button>

                  <button
                    onClick={() => { handleSortOrder("created_at"), setOpenSort(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100
                        ${sortOrder === 'created_at' ? "bg-gray-100 font-medium" : ""}
                      `}
                  >
                    Recently Created
                  </button>
                </div>
              )}
            </div>

            {/* Create Comet Button */}
            <div>
              <Button
                variant="default"
                className="w-fit flex items-center justify-center gap-2 px-4 py-3 disabled:opacity-50"
              >
                <Stars />
                <span>Create New Comet</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

