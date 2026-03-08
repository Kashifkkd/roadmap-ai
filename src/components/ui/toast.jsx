"use client";

import { Toaster as Sonner } from "sonner";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import Image from "next/image";

const SuccessIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
    <Image src="/Verified Check.svg" alt="Success" width={24} height={20} />
  </div>
);

const ErrorIcon = () => (
  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
    <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
  </div>
);

const WarningIcon = () => (
  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
    <AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
  </div>
);

const InfoIcon = () => (
  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
    <Info className="w-3.5 h-3.5 text-white" strokeWidth={3} />
  </div>
);

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "universal-toast flex items-center gap-3 px-5 py-3 rounded-xl shadow-md border-4 font-medium text-[15px] text-emerald-500",
          success: "bg-white border-[#12B76A] text-[#027A48]",
          error: "bg-white border-red-500 text-red-500",
          warning: "bg-white border-amber-500 text-amber-500",
          info: "bg-white border-blue-500 text-blue-500",
        },
      }}
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        warning: <WarningIcon />,
        info: <InfoIcon />,
      }}
    />
  );
}
