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

export default function CreateCycleVariantModal({
  open,
  onOpenChange,
  cycleName = "New Manager Essentials Training Program",
}) {
  const [copyClientValue, setCopyClientValue] = useState("Current Client");

  const handleClose = () => {
    onOpenChange(false);
    setCopyClientValue("Current Client");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl [&>button]:hidden">
        <div className="relative px-6 pt-6">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#181D27]">
            Create Cycle Variant
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
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#535862]">Cycle Name</p>
                <p className="text-[15px] font-semibold text-[#181D27]">
                  {cycleName}
                </p>
              </div>

              <div className="mt-4 bg-[#F3F4F6] rounded-xl overflow-hidden">
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[13px] font-semibold text-[#181D27]">
                    Copy to
                  </p>
                </div>
                <div className="border-t-2 border-gray-200 mx-2" />
                <div className="px-4 py-3 space-y-1.5">
                  <p className="text-xs font-semibold text-[#344054]">Client</p>
                  <Select
                    value={copyClientValue}
                    onValueChange={setCopyClientValue}
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 text-sm text-[#181D27]">
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
              </div>
            </div>

            <div className="bg-white flex rounded-b-2xl justify-end p-2">
              <Button
                size="sm"
                className="h-9 px-5 rounded-lg text-sm font-medium"
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
