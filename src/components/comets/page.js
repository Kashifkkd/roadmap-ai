"use client";

import React, { useEffect, useState, useMemo } from "react";
import CometFilter from "./CometFilter";
import AllCometsContainer from "./AllCometsContainer";
// import SequentialLoader from "../chat/SequentialLoader";
import Loader from "../loader2/index";
import CometSettingsDialog from "../comet-manager/CometSettingsDialog";
import { useCometSettings } from "@/contexts/CometSettingsContext";
import debounce from "lodash.debounce";
import { comitFetchList } from "@/api/comit";
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
    getCometData()
    window.addEventListener("storage", getCometData);
  }, [debouncedSearch, selected, sortBy, sortOrder])


  const getCometData = async () => {
    const token = localStorage.getItem("access_token");
    let clientId = localStorage.getItem("Client id");
    try {
      const sessions = await fetchCometSessions({ clientId, token });
      setCometSessions(sessions);
      setNoComet(sessions.length === 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
    console.log('checkkkkkkkkk', clientId)
    let data = {
      client_id: clientId,
    }
    if (selected && selected != 'select') data.status = selected
    if (sessionName) data.session_name = sessionName
    if (sortBy) data.sort_order = sortBy
    if (sortOrder) data.sort_by = sortOrder

    const res = await axios.get("https://kyper-stage.1st90.com/api/comet/sessions",
      {
        params: data,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.data;
  };

  const fetchData = async () => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("access_token");
    let clientId = localStorage.getItem("Client id");

    if (!token || !clientId) {
      setError(
        "Please login / create a session (chat) to access this page as this page has dependecies on session"
      );
      setLoading(false);
      return;
    }
    try {
      const sessions = await comitFetchList({ clientId, token });
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
        {/* Loading comet sessions... */}
        <Loader />
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
    <div className="h-screen w-[100vw] flex flex-col pt-2 pr-2 pl-2 bg-[#F1F0FE]">
      <div className="flex-1 flex w-[98%] flex-col m-auto pt-8 pb-8 gap-2.5 overflow-y-auto">
        <CometFilter handleChange={handleChange} selected={selected} handleStatus={handleStatus} sessionName={sessionName} handleSortBy={handleSortBy} handleSortOrder={handleSortOrder} sortBy={sortBy} sortOrder={sortOrder} />
        {noComet ? <div className="w-screen h-screen flex justify-center items-center">
          No comet sessions found.
        </div> : <AllCometsContainer cometSessions={cometSessions} />}
      </div>
      {/* Comet Settings Dialog */}
      <CometSettingsDialog
        open={isCometSettingsOpen}
        onOpenChange={setIsCometSettingsOpen}
      />
    </div>
  );
}
