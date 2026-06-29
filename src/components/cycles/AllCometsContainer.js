"use client";
import React, { useEffect } from "react";
import Comet from "./Comet";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import {
  ensureCycleAuth,
  fetchCycleSessionDetails,
} from "@/lib/cycle-access";

export default function AllCometsContainer({ cometSessions, onDeleteSuccess }) {

  useEffect(() => {
    console.log(
      "The comet Sessions inside the AllCometContainer is ",
      cometSessions
    );
  }, [cometSessions]);

  const router = useRouter();
  const handleCometClick = async (session_id, status) => {
    try {
      if (!session_id) {
        console.error("Invalid session id");
        return;
      }

      if (!ensureCycleAuth()) return;

      const { ok, result, unauthorized, message } =
        await fetchCycleSessionDetails(session_id);

      if (unauthorized) return;

      if (!ok || !result) {
        if (message) toast.error(message);
        return;
      }

      console.log("Fetched session details:", result);

      const sessionState = result?.meta?.state;
      if (sessionState === "processing_variant") {
        toast.error("Remix is happening. Please wait until it is ready.");
        return;
      }

      localStorage.setItem("sessionData", JSON.stringify(result));
      localStorage.setItem("sessionId", session_id);

      const sessionData = JSON.parse(localStorage.getItem("sessionData") || "{}");
      const pathChapters = sessionData?.response_path?.chapters ?? [];
      const outlineChapters = sessionData?.response_outline?.chapters ?? [];
      if (Array.isArray(pathChapters) && pathChapters.length > 0) {
        router.push("/cycle-manager");
      } else if (
        Array.isArray(outlineChapters)
          ? outlineChapters.length > 0
          : outlineChapters?.length > 0
      ) {
        router.push("/outline-manager");
      } else {
        router.push("/configure-cycle");
      }
      console.log("Session details:", result);
    } catch (err) {
      console.error("Error fetching comet session:", err.message);
      const msg = err.message?.includes("fetch") || err.message?.includes("network")
        ? "Network error. Please check your connection."
        : err.message || "Something went wrong. Please try again.";
      toast.error(msg);
    }
  };
  // setBgImageUrl(sess)

  // console.log("Rendering AllCometsContainer with sessions:", cometSessions);
  return (
    <div className="flex flex-1 w-[90%] mx-auto rounded-2xl p-4 bg-white overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(375px,auto))] w-full gap-4 justify-items-center content-start items-start">
        {cometSessions.map((c, idx) => (
          <Comet
            key={idx} // unique key for each item
            title={c.session_name || "Untitled Cycle "} // pass title from array
            activeUsers={c.total_active_users ?? c.activeUsers}
            wau={c.weekly_active_users ?? c.wau}
            mau={c.monthly_active_users ?? c.mau}
            imageURL={c.path_image || "/fallbackImage.png"} // use actual image URL from API
            date={c.updated_at || "-"}
            status={c.status}
            session_id={c.session_id}
            path_id={c.path_id ?? c.pathId ?? c.id}
            onCometClick={handleCometClick}
            onDeleteSuccess={onDeleteSuccess}
            updatedBy={c.updated_by || c.created_by}
          />
        ))}
      </div>
    </div>
  );
}
