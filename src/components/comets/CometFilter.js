"use client";
import Stars from "@/components/icons/Stars";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

export default function CometFilter() {
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
                className="font-inter w-full border-none font-normal text-gray-500  text-sm leading-5 tracking-normal focus:outline-none"
              />
            </div>
            {/* dropdown */}
            <div className="flex px-3 h-[40px] items-center md:w-[220px] gap-3 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex justify-between w-full gap-2 ">
                <span className="text-gray-900 font-inter font-normal text-sm leading-5 tracking-normal">
                  All
                </span>
                <ChevronDown height={20} width={20} />
              </div>
            </div>
          </div>

          {/* filter and create comet button  */}
          <div className="flex flex-col lg:flex-row sm:justify-between gap-4 md:gap-5">
            {/* Filter Button */}
            <div className="flex items-center gap-2 h-[40px] px-3 md:px-2 border border-[#C7C2F9] rounded-lg bg-white">
              <Image src="/filter.svg" alt="filter" width={18} height={18} />
              <span className="font-inter font-medium text-sm md:text-xs text-[#7367F0]">
                Filter
              </span>
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
