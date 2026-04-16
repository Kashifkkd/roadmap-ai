"use client";
import React, { useEffect } from "react";
import Comet from "./Comet";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export default function AllCometsContainer({ cometSessions }) {

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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
      const response = await fetch(
        `${apiUrl}/api/comet/session_details/${session_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const status = response.status;
        let message = "Failed to fetch session details";
        if (status >= 500) message = "Server error. Please try again later.";
        else if (status === 404) message = "Session not found.";
        else if (status === 403) message = "Access denied.";
        else if (status === 401) message = "Session expired. Please login again.";
        else if (status === 400) message = "Invalid request.";
        toast.error(message);
        return;
      }

      const result = await response.json();
      console.log("Fetched session details:", result);

      localStorage.setItem("sessionData", JSON.stringify(result));
      localStorage.setItem("sessionId", session_id);

      // Safely read nested properties in case parts of the response are missing
      const sessionData = JSON.parse(localStorage.getItem("sessionData") || "{}");
      const pathChapters =
        sessionData?.response_path?.chapters ??
        [];
      const outlineChapters =
        sessionData?.response_outline?.chapters ??
        [];
      if (Array.isArray(pathChapters) && pathChapters.length > 0) {
        router.push("/cycle-manager");
      } else if (sessionData.response_outline.length > 0) {
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(375px,1fr))] w-full gap-4 justify-items-center content-start items-start">
        {cometSessions.map((c, idx) => (
          <Comet
            key={idx} // unique key for each item
            title={c.session_name || "Untitled Cycle "} // pass title from array
            activeUsers={c.activeUsers || "-"} // use actual data or default
            imageURL={c.path_image || "/fallbackImage.png"} // use actual image URL from API
            date={c.updated_at || "-"}
            status={c.status}
            session_id={c.session_id}
            onCometClick={handleCometClick}
            updatedBy={c.updated_by || c.created_by}
          />
        ))}
      </div>
    </div>
  );
}
