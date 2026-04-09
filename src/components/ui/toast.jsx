"use client";

import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { X, Info } from "lucide-react";
import Image from "next/image";

export const toast = Object.assign(
  (...args) => sonnerToast(...args),
  sonnerToast,
  {
    success: (message, options = {}) =>
      sonnerToast.success("Success!", {
        ...options,
        description: options.description ?? message,
      }),
    error: (message, options = {}) =>
      sonnerToast.error(options.title ?? "Error!", {
        ...options,
        description: options.description ?? message,
      }),
    warning: (message, options = {}) =>
      sonnerToast.warning(options.title ?? "Warning!", {
        ...options,
        description: options.description ?? message,
      }),
  }
);

const SuccessIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
    <Image src="/Subtract.svg" alt="Success" width={24} height={20} />
  </div>
);

const ErrorIcon = () => (
  <div className="w-12 h-12 rounded-full bg-[#FDECEC] flex items-center justify-center shrink-0">
    <div className="w-6 h-6 rounded-full bg-[#F04438] flex items-center justify-center">
      <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
    </div>
  </div>
);

const WarningIcon = () => (
  <div className="w-12 h-12 rounded-full bg-[#FCF8E8] flex items-center justify-center shrink-0">
    <Image src="/warning.svg" alt="Warning" width={24} height={24} />
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
      offset={{ top: 80 }}
      gap={8}
      expand
      visibleToasts={5}
      toastOptions={{
        duration: 3000,
        unstyled: true,
        classNames: {
          toast:
            "universal-toast flex items-center gap-3 px-5 py-3 rounded-xl shadow-md border-4 font-medium text-[15px]",
          title: "font-semibold",
          description: "text-[#717680]",
          success: "bg-white border-[#12B76A] text-[#027A48]",
          error: "bg-white border-[#F04438] text-[#D92D20]",
          warning: "bg-white border-[#DEC029] text-[#C2A724]",
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
