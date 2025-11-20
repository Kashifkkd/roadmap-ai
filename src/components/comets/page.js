"use client";
import React, { useEffect, useState } from "react";
import CometFilter from "./CometFilter";
import AllCometsContainer from "./AllCometsContainer";

export default function AllComet() {
  const [cometSessions, setCometSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noComet, setNoComet] = useState(false);
  const [error, setError] = useState(null);

  const fetchCometSessions = async ({ clientId, token }) => {
    if (!clientId || !token)
      throw new Error("Missing client ID or access token");
    const res = await fetch(
      `https://kyper-stage.1st90.com/api/comet/sessions?clientId=${encodeURIComponent(
        clientId
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return await res.json();
  };

  const fetchData = async () => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("access_token");
    let clientId = localStorage.getItem("Client id");

    if (!token || !clientId) {
      setError("Missing session/token/client ID");
      setLoading(false);
      return;
    }
    try {
      const sessions = await fetchCometSessions({ clientId, token });
      setCometSessions(sessions);
      setNoComet(sessions.length === 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    fetchData();

    const handleStorageChange = (e) => {
      if (e.key === "Client id") {
        console.log("Client id changed , refetching ....");
        fetchData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Added the loading state
  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        Loading comet sessions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        Error: {error}
      </div>
    );
  }

  if (noComet) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        No comet sessions found.
      </div>
    );
  }

  return (
    <div className="h-screen w-[100vw] flex flex-col pt-2 pr-2 pl-2 bg-[#F1F0FE]">
      <div className="flex-1 flex w-[98%] flex-col m-auto pt-8 pb-8 gap-2.5 overflow-y-auto">
        <CometFilter />
        <AllCometsContainer cometSessions={cometSessions} />
      </div>
    </div>
  );
}
