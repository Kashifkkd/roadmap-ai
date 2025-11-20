import Image from "next/image";
import React from "react";

export default function StatusButton({ status }) {
  const statusStyles = {
    published: {
      bg: "bg-[#D1FADF]",
      text: "text-[#027A48]",
      icon: "/check-circle.svg",
    },
    draft: {
      bg: "bg-[#FECDCA]",
      text: "text-[#B42318]",
      icon: "/draftIcon.png",
    },
    changes_pending: {
      bg: "bg-[#FFF8D5]",
      text: "text-[#C2A724]",
      icon: "/clock.png",
    },
  };

  // Fallback for unknown statuses
  const current =
    statusStyles[status?.toLowerCase()] || statusStyles.changes_pending;

  return (
    <div
      className={`w-fit flex items-center gap-2 py-1 px-3 rounded-3xl ${current.bg}`}
    >
      <div className="flex justify-center items-center bg-white rounded-xl p-1">
        <Image
          src={current.icon}
          alt={`${status} icon`}
          width={12}
          height={12}
        />
      </div>
      <span
        className={`font-inter font-medium text-md leading-4 ${current.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}
