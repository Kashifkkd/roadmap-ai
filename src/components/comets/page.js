"use client";

import React, { useEffect, useState, useMemo } from "react";
import CometFilter from "./CometFilter";
import AllCometsContainer from "./AllCometsContainer";
// import SequentialLoader from "../chat/SequentialLoader";
import { Loader2 } from "lucide-react";
import CometSettingsDialog from "../comet-manager/CometSettingsDialog";
import { useCometSettings } from "@/contexts/CometSettingsContext";
import debounce from "lodash.debounce";
import axios from "axios";

export default function AllComet() {
  const [cometSessions, setCometSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noComet, setNoComet] = useState(false);
  const [error, setError] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { isCometSettingsOpen, setIsCometSettingsOpen } = useCometSettings();
  const [selected, setSelected] = useState("select");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedSetValue = useMemo(
    () =>
      debounce((val) => {
        setDebouncedSearch(val);
      }, 1000),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    getCometData();
    const handleStorageChange = (e) => {
      if (e.key === "Client id") {
        setLoading(true);
        getCometData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [debouncedSearch, selected, sortBy, sortOrder]);


  const getCometData = async () => {
    const token = localStorage.getItem("access_token");
    const clientId = localStorage.getItem("Client id");
    if (!token || !clientId) {
      setError("Please login / create a session (chat) to access this page");
      setLoading(false);
      return;
    }
    try {
      const sessions = await fetchCometSessions({ clientId, token });
      const list = Array.isArray(sessions) ? sessions : [];
      setCometSessions(list);
      setNoComet(list.length === 0);
    } catch (err) {
      setError(err.message);
      setCometSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = (val) => {
    setSelected(val)
  }

  const handleChange = (val) => {
    setSessionName(val)
    debouncedSetValue(val)
  }
  const handleSortBy = (val) => {
    setSortBy(val)
    setSortOrder(null)
  }
  const handleSortOrder = (val) => {
    setSortOrder(val)
    setSortBy(null)
  }



  // const fetchCometSessionsDetails = async ({ clientId, token }) => {
  //   const data = {
  //     client_id: clientId,
  //     session_name: sessionName
  //   }
  //   if (selected) data.status = selected;
  //   const res = await comitFetchList()
  //   setCometSessions(res.data);
  //   setNoComet(res.data.length === 0);
  //   // return  res.json();
  // }

  const fetchCometSessions = async ({ clientId, token }) => {
    let data = {
      client_id: clientId,
    }
    if (selected && selected != 'select') data.status = selected
    if (debouncedSearch) data.session_name = debouncedSearch
    if (sortBy) data.sort_order = sortBy
    if (sortOrder) data.sort_by = sortOrder

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";
    const res = await axios.get(`${apiUrl}/api/comet/sessions`,
      {
        params: data,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const raw = res.data;
    return Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
  };

  // Loading state - show loader until data is ready
  if (loading) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center bg-[#F1F0FE] flex-1">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-base font-medium text-gray-700">Loading comets...</p>
          <p className="text-sm text-gray-500">Fetching your comet sessions</p>
        </div>
      </div>
    );
  }



  // if (noComet) {
  //   return (
  //     <div className="w-screen h-screen flex justify-center items-center">
  //       No comet sessions found.
  //     </div>
  //   );
  // }

  return (
    <div className="h-screen w-[100vw] flex flex-col bg-[#F1F0FE]">
      <div className="flex-1 flex flex-col min-h-0 pt-2 pr-2 pl-2">
        <div className="shrink-0 w-[98%] mx-auto pt-6 pb-2.5">
          <CometFilter handleChange={handleChange} selected={selected} handleStatus={handleStatus} sessionName={sessionName} handleSortBy={handleSortBy} handleSortOrder={handleSortOrder} sortBy={sortBy} sortOrder={sortOrder} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pb-8">
          <div className="w-[98%] mx-auto">
            {noComet ? (
              <div className="w-full h-64 flex justify-center items-center">
                No comet sessions found.
              </div>
            ) : (
              <AllCometsContainer cometSessions={Array.isArray(cometSessions) ? cometSessions : []} />
            )}
          </div>
        </div>
      </div>
      {/* Comet Settings Dialog */}
      <CometSettingsDialog
        open={isCometSettingsOpen}
        onOpenChange={(open) => {
          setIsCometSettingsOpen(open);
          if (!open) {
            getCometData();
          }
        }}
      />
    </div>
  );
}
