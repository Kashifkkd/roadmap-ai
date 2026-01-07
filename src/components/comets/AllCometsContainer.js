"use client";
import React, { useEffect } from "react";
import Comet from "./Comet";
import { useRouter } from "next/navigation";
import { set } from "react-hook-form";

export default function AllCometsContainer({ cometSessions }) {
  const [bgImageUrl, setBgImageUrl] = React.useState("");

  useEffect(() => {
    console.log(
      "The comet Sessions inside the AllCometContainer is ",
      cometSessions
    );
  }, [cometSessions]);

  const router = useRouter();
  const handleCometClick = async (session_id) => {
    try {
      if (!session_id) {
        console.error("Invalid session id");
        return;
      }

      const response = await fetch(
        `https://kyper-stage.1st90.com/api/comet/session_details/${session_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session details");
      }

      const result = await response.json();
      console.log("Fetched session details:", result);
      
      localStorage.setItem("sessionData", JSON.stringify(result));
      localStorage.setItem("sessionId", session_id);
      router.push("/comet-manager");
      console.log("Session details:", result);
    } catch (err) {
      console.error("Error fetching comet session:", err.message);
    }
  };
  // setBgImageUrl(sess)

  // console.log("Rendering AllCometsContainer with sessions:", cometSessions);
  return (
    <div className="flex flex-wrap flex-1 w-[90%] mx-auto rounded-2xl p-4 gap-2.5 bg-white overflow-y-auto no-scrollbar">
      <div className="flex flex-wrap w-full h-[280px] gap-4 ">
        {cometSessions.map((c, idx) => (
          <Comet
            key={idx} // unique key for each item
            title={c.session_name || "New manager Essentials "} // pass title from array
            activeUsers={c.activeUsers || 10} // use actual data or default
            imageURL={ bgImageUrl || "/fallbackImage.png"} // use actual image URL or empty string
            date={c.updated_at || "23 Aug, 2025"}
            status={c.status}
            session_id={c.session_id}
            onCometClick={handleCometClick}
          />
        ))}
      </div>
    </div>
  );
}
