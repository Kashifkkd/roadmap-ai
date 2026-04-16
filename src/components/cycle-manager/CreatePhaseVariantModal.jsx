"use client";

import React, { useState } from "react";
import { CircleX, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatePhaseVariantModal({
  open,
  onOpenChange,
  currentCycleName = "",
  sourcePhaseName = "",
  sourceStepName = null,
}) {
  const [copyClientValue, setCopyClientValue] = useState("Current Client");
  const [copyCycleValue, setCopyCycleValue] = useState("Current Cycle");

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("Current Client");
    setCopyCycleValue("Current Cycle");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent
        customPosition
        overlayClassName="top-[4.5rem] bg-black/50 backdrop-blur-[2px] lg:left-[calc(18em+1rem)] xl:left-[calc(20em+1rem)]"
        className="left-1/2 top-[calc(50%+2.25rem)] w-[calc(100vw-2rem)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl lg:left-[calc(50%+9.5rem)] xl:left-[calc(50%+10.5rem)] [&>button]:hidden"
      >
        <div className="relative px-6 pt-6 ">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#181D27]">
            Create Phase Variant
          </DialogTitle>
          <div className="absolute right-5 top-5">
            <DialogClose asChild>
              <button
                type="button"
                className=" flex items-center justify-center "
                aria-label="Close"
              >
                <CircleX className="h-4 w-4 text-gray-600" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className=" border-gray-200 px-5 py-3.5">
          <div className="p-2 bg-[#F5F6F8] rounded-2xl">
            <div className="bg-white rounded-t-2xl px-5 py-4 mb-1">
              <div className="">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Current Cycle Name
                    </p>
                    <p className="text-sm font-medium text-[#181D27]">
                      {currentCycleName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Phase Name
                    </p>
                    <p className="text-sm font-medium text-[#181D27]">
                      {sourcePhaseName}
                    </p>
                  </div>

                  {sourceStepName && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-600">
                        Step Name
                      </p>
                      <p className="text-sm font-medium text-[#181D27]">
                        {sourceStepName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 bg-[#F3F4F6] rounded-xl p-2 mt-4">
                  <p className="text-xs font-semibold text-gray-900">Copy to</p>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Client
                    </p>
                    <Select
                      value={copyClientValue}
                      onValueChange={setCopyClientValue}
                    >
                      <SelectTrigger className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current Client">
                          Current Client
                        </SelectItem>
                        <SelectItem value="Client A">Client A</SelectItem>
                        <SelectItem value="Client B">Client B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-gray-600">
                      Cycle
                    </p>
                    <Select
                      value={copyCycleValue}
                      onValueChange={setCopyCycleValue}
                    >
                      <SelectTrigger className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current Cycle">
                          Current Cycle
                        </SelectItem>
                        <SelectItem value="Cycle A">Cycle A</SelectItem>
                        <SelectItem value="Cycle B">Cycle B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end bg-white rounded-b-2xl p-2">
              <Button
                size="sm"
                className="h-9 rounded-lg"
                onClick={handleClose}
                type="button"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
