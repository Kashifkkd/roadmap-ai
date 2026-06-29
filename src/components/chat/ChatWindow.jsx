"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Chat from "./Chat";
import Loader from "@/components/loader2";
import { graphqlClient } from "@/lib/graphql-client";
import { useRouter } from "next/navigation";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

// Build the chat message list from a chatbot_conversation array.
// User entries can carry attached source_material / webpage_url; append a
// readable label so they're visible in the chat bubble.
const messagesFromConversation = (conversation) => {
  if (!Array.isArray(conversation)) return [];
  const out = [];
  conversation.forEach((entry) => {
    if (entry.user) {
      const names = Array.isArray(entry.source_material)
        ? entry.source_material.map((i) => i?.source_name).filter(Boolean)
        : [];
      const attachParts = Array.isArray(entry.source_material)
        ? entry.source_material
            .map((i) => {
              const n = i?.source_name;
              if (!n) return null;
              const c = (i?.comment ?? "").trim();
              return c ? `${n} — ${c}` : n;
            })
            .filter(Boolean)
        : [];
      const titles = Array.isArray(entry.webpage_url)
        ? entry.webpage_url
            .map((i) => i?.title || i?.webpage_url || i?.url)
            .filter(Boolean)
        : [];
      const attachSummary =
        attachParts.length > 0
          ? attachParts
          : names;
      const attach = attachSummary.length
        ? `\n\nAttached: ${attachSummary.join(", ")}`
        : "";
      const links = titles.length ? `\n\nLinks: ${titles.join(", ")}` : "";
      out.push({
        from: "user",
        content: `${entry.user}${attach}${links}`,
        status: entry.status,
        identifier: entry.identifier,
      });
    }
    if (entry.agent) {
      out.push({
        from: "bot",
        content: entry.agent,
        status: entry.status,
        identifier: entry.identifier,
      });
    }
  });
  return out;
};

const materialKey = (m) =>
  `${m?.id ?? ""}|${m?.source_name ?? ""}|${m?.s3_path ?? ""}`;

function mergeUniqueMaterials(existing, additions) {
  const base = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set(base.map(materialKey));
  for (const a of additions) {
    const k = materialKey(a);
    if (k === "||") continue;
    if (!seen.has(k)) {
      seen.add(k);
      base.push(a);
    }
  }
  return base;
}

function mergeUniqueWebLinks(existing, additions) {
  const base = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set(
    base
      .map((l) =>
        (l?.webpage_url ?? l?.url ?? "").trim().toLowerCase().replace(/\/+$/, ""),
      )
      .filter(Boolean),
  );
  for (const raw of additions) {
    const w = {
      webpage_url: raw?.webpage_url ?? raw?.url ?? "",
      title: raw?.title ?? "",
      comment: raw?.comment ?? "",
      ...(raw?.id ? { id: raw.id } : {}),
    };
    const k = (w.webpage_url || "").trim().toLowerCase().replace(/\/+$/, "");
    if (!k || seen.has(k)) continue;
    seen.add(k);
    base.push(w);
  }
  return base;
}

/** Avoid losing pending rows: stale React session or lagging autosave can be shorter than localStorage. */
function pickChatbotConversation(storedSession, incomingSession) {
  const a = Array.isArray(storedSession?.chatbot_conversation)
    ? storedSession.chatbot_conversation
    : [];
  const b = Array.isArray(incomingSession?.chatbot_conversation)
    ? incomingSession.chatbot_conversation
    : [];
  if (a.length > b.length) return [...a];
  if (b.length > a.length) return [...b];
  return [...a];
}

function mergedSessionAttachments(storedSession, incomingSession) {
  return {
    source_material: mergeUniqueMaterials(
      Array.isArray(incomingSession?.source_material)
        ? incomingSession.source_material
        : [],
      Array.isArray(storedSession?.source_material)
        ? storedSession.source_material
        : [],
    ),
    webpage_url: mergeUniqueWebLinks(
      Array.isArray(incomingSession?.webpage_url)
        ? incomingSession.webpage_url
        : [],
      Array.isArray(storedSession?.webpage_url) ? storedSession.webpage_url : [],
    ),
  };
}

function formatUploadedDocumentUserLine(m) {
  return [
    "[Uploaded document]",
    m?.source_name ?? "Document",
    // m?.id != null && m?.id !== "" && `id: ${m.id}`,
    // m?.s3_path && `s3_path: ${m.s3_path}`,
    m?.comment && `comment: ${m.comment}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatUploadedLinkUserLine(w) {
  const url = w?.webpage_url ?? w?.url ?? "";
  const title = w?.title || url || "Link";
  return ["[Added link]", url, w?.comment && `comment: ${w.comment}`]
    .filter(Boolean)
    .join("\n");
}

export default function ChatWindow({
  initialInput = null,
  userQuestions = null,
  inputType = "cycle_data_update",
  onResponseReceived = null,
  allMessages = [],
  welcomeMessage = [],
  setAllMessages = () => {},
  sessionData,
  cometManager = false,
  externalLoading = false,
  pageIdentifier = 1,
}) {
  const router = useRouter();
  const processedInitialInputRef = useRef(false);
  const initialMessageCountRef = useRef(null);
  const previousSessionIdRef = useRef(null);
  const welcomeAnimationCheckedRef = useRef(false);
  const welcomeAnimationStateRef = useRef(false);
  const awaitingConversationRef = useRef(false);

  const minAgentMessageCountRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [shouldAnimateWelcome, setShouldAnimateWelcome] = useState(false);

  // Note: WebSocket cleanup is now handled by SubscriptionManager

  // Initialize sessionId from localStorage so subscription can start even if other components send messages
  // useEffect(() => {
  //   if (sessionId) return;
  //   try {
  //     const existing = localStorage.getItem("sessionId");
  //     if (existing) {
  //       setSessionId(existing);
  //       previousSessionIdRef.current = existing;
  //       // Reset welcome animation check when sessionId is first loaded
  //       welcomeAnimationCheckedRef.current = false;
  //       welcomeAnimationStateRef.current = false;
  //     }
  //   } catch {}
  // }, [sessionId]);

  // // Clear welcome message flags when sessionId changes (new session)
  // useEffect(() => {
  //   const currentSessionId = sessionId || localStorage.getItem("sessionId");

  //   if (currentSessionId) {
  //     // If we have a previous sessionId and it's different, clear old flags
  //     if (
  //       previousSessionIdRef.current &&
  //       currentSessionId !== previousSessionIdRef.current
  //     ) {
  //       // Session changed - clear all welcome message flags for the old session
  //       const pages = ["dashboard", "outline-manager", "comet-manager"];
  //       pages.forEach((page) => {
  //         localStorage.removeItem(
  //           `welcomeMessageShown_${previousSessionIdRef.current}_${page}`
  //         );
  //       });
  //       // Reset the animation check ref when session changes
  //       welcomeAnimationCheckedRef.current = false;
  //       welcomeAnimationStateRef.current = false;
  //     }

  //     // Update the ref to track current session
  //     if (
  //       !previousSessionIdRef.current ||
  //       previousSessionIdRef.current !== currentSessionId
  //     ) {
  //       previousSessionIdRef.current = currentSessionId;
  //     }
  //   }
  // }, [sessionId]);

  // useEffect(() => {
  //   const flag = sessionData?.flag;
  //   const hasFlag =
  //     flag?.comet_created || flag?.outline_created || flag?.path_created;

  //   if (!hasFlag) {
  //     initialMessageCountRef.current = null;
  //     welcomeAnimationCheckedRef.current = false;
  //     welcomeAnimationStateRef.current = false;
  //     setShowWelcomeMessage(false);
  //     setShouldAnimateWelcome(false);
  //     return;
  //   }

  //   // Track initial message count
  //   if (initialMessageCountRef.current === null) {
  //     initialMessageCountRef.current = allMessages.length;
  //   } else if (initialMessageCountRef.current === 0 && allMessages.length > 0) {
  //     initialMessageCountRef.current = allMessages.length;
  //   }

  //   const isUpdateMode =
  //     inputType === "outline_updation" ||
  //     inputType === "path_updation" ||
  //     inputType === "cycle_data_update";
  //   const hasNewMessages = allMessages.length > initialMessageCountRef.current;

  //   const shouldShow = !(isUpdateMode && hasNewMessages);
  //   setShowWelcomeMessage(shouldShow);

  //   // Determine if we should animate the welcome message
  //   if (shouldShow) {
  //     const currentSessionId = sessionId || localStorage.getItem("sessionId");
  //     if (!currentSessionId) {
  //       setShouldAnimateWelcome(false);
  //       return;
  //     }

  //     let pageName = "dashboard";
  //     if (inputType === "outline_updation") {
  //       pageName = "outline-manager";
  //     } else if (inputType === "path_updation") {
  //       pageName = "comet-manager";
  //     } else if (
  //       inputType === "cycle_data_update" ||
  //       inputType === "comet_data_creation"
  //     ) {
  //       pageName = "dashboard";
  //     }

  //     // Create a unique key
  //     const checkKey = `${currentSessionId}_${pageName}`;

  //     // Check if welcome message was already shown for this session and page
  //     const welcomeKey = `welcomeMessageShown_${currentSessionId}_${pageName}`;
  //     const wasShown = localStorage.getItem(welcomeKey) === "true";

  //     if (welcomeAnimationCheckedRef.current !== checkKey) {
  //       welcomeAnimationCheckedRef.current = checkKey;

  //       if (!wasShown) {
  //         // First time showing - animate it
  //         welcomeAnimationStateRef.current = true;
  //         setShouldAnimateWelcome(true);
  //         // Mark as shown
  //         localStorage.setItem(welcomeKey, "true");
  //       } else {
  //         // if Already shown before donot animate
  //         welcomeAnimationStateRef.current = false;
  //         setShouldAnimateWelcome(false);
  //       }
  //     } else {
  //       setShouldAnimateWelcome(welcomeAnimationStateRef.current);
  //     }
  //   } else {
  //     setShouldAnimateWelcome(false);
  //     welcomeAnimationCheckedRef.current = false;
  //     welcomeAnimationStateRef.current = false;
  //   }
  // }, [sessionData, allMessages, inputType, sessionId]);

  // Function to parse response and extract form data
  const parseResponseForFormData = (responseText) => {
    const data = {
      cometTitle: "",
      description: responseText,
      targetAudience: "",
      learningObjectives: "",
      cometFocus: "",
      sourceMaterialFidelity: "",
      engagementFrequency: "",
      lengthFrequency: "",
    };

    // Try to extract structured data from the response
    // Extract title
    const titlePatterns = [
      /Title:\s*([^\n]+)/i,
      /Comet Title:\s*([^\n]+)/i,
      /"cometTitle":\s*"([^"]+)"/i,
    ];
    for (const pattern of titlePatterns) {
      const match = responseText.match(pattern);
      if (match) {
        data.cometTitle = match[1].trim();
        break;
      }
    }

    // Extract target audience
    const audiencePatterns = [
      /Target Audience:\s*([^\n]+)/i,
      /Audience:\s*([^\n]+)/i,
      /"targetAudience":\s*"([^"]+)"/i,
    ];
    for (const pattern of audiencePatterns) {
      const match = responseText.match(pattern);
      if (match) {
        data.targetAudience = match[1].trim();
        break;
      }
    }

    // Extract learning objectives
    const objectivesMatch = responseText.match(
      /Learning Objectives?:\s*([^\n]+)/i,
    );
    if (objectivesMatch) {
      data.learningObjectives = objectivesMatch[1].trim();
    }

    // Extract description/special instructions if the whole response is descriptive
    if (!data.cometTitle && responseText.length > 0) {
      data.description = responseText;
      data.specialInstructions = responseText;
    }

    return data;
  };

  // Re-render the chat when ChatInput appends an upload entry locally.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("sessionData") || "{}");
        const rebuilt = messagesFromConversation(stored?.chatbot_conversation);
        if (rebuilt.length > 0) setAllMessages(rebuilt);
      } catch (e) {
        console.error("chatConversationUpdated handler failed:", e);
      }
    };
    window.addEventListener("chatConversationUpdated", refresh);
    return () => window.removeEventListener("chatConversationUpdated", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle initial input on load
  useEffect(() => {
    if (initialInput && !processedInitialInputRef.current) {
      processedInitialInputRef.current = true;
      setInputValue(initialInput);

      handleSubmit(initialInput);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("initialInput");
        url.searchParams.delete("userQuestions");
        window.history.replaceState({}, "", url.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

  const handleSuggestionClick = (suggestionText) => {
    setInputValue(suggestionText);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const recordUploadInConversation = useCallback(
    async ({ sourceMaterial, webLink }) => {
      if (!sourceMaterial && !webLink) return;
      try {
        let sid = sessionId || localStorage.getItem("sessionId");
        if (!sid) {
          const sessionResponse = await graphqlClient.createSession();
          sid = sessionResponse.createSession.sessionId;
          localStorage.setItem("sessionId", sid);
          window.dispatchEvent(new Event("sessionIdChanged"));
          setSessionId(sid);
        }
        let stored = {};
        try {
          stored = JSON.parse(localStorage.getItem("sessionData") || "{}");
        } catch {
          stored = {};
        }
        const fromProps =
          sessionData && typeof sessionData === "object" ? sessionData : {};
        const mergedAttach = mergedSessionAttachments(stored, fromProps);
        const baseSession = {
          ...stored,
          ...fromProps,
          session_id: sid,
          chatbot_conversation: pickChatbotConversation(stored, fromProps),
          source_material: mergedAttach.source_material,
          webpage_url: mergedAttach.webpage_url,
        };
        const prevConv = Array.isArray(baseSession.chatbot_conversation)
          ? [...baseSession.chatbot_conversation]
          : [];
        let userLine = "";
        let nextMaterials = mergeUniqueMaterials(
          baseSession.source_material,
          [],
        );
        let nextLinks = mergeUniqueWebLinks(baseSession.webpage_url, []);

        if (sourceMaterial) {
          userLine = formatUploadedDocumentUserLine(sourceMaterial);
          nextMaterials = mergeUniqueMaterials(baseSession.source_material, [
            sourceMaterial,
          ]);
        } else if (webLink) {
          const w = {
            webpage_url: webLink.webpage_url ?? webLink.url ?? "",
            title: webLink.title ?? "",
            comment: webLink.comment ?? "",
            ...(webLink.id ? { id: webLink.id } : {}),
          };
          userLine = formatUploadedLinkUserLine(w);
          nextLinks = mergeUniqueWebLinks(baseSession.webpage_url, [w]);
        }

        const chatbot_conversation = [...prevConv, { user: userLine }];
        const updated = {
          ...baseSession,
          chatbot_conversation,
          source_material: nextMaterials,
          webpage_url: nextLinks,
        };

        localStorage.setItem("sessionData", JSON.stringify(updated));
        onResponseReceived?.(updated);
        window.dispatchEvent(new Event("chatConversationUpdated"));

        graphqlClient
          .autoSaveComet(
            JSON.stringify({
              session_id: sid,
              input_type: updated.input_type || inputType,
              cycle_creation_data: updated.cycle_creation_data ?? {},
              comet_creation_data: updated.comet_creation_data ?? {},
              response_outline: updated.response_outline ?? {},
              response_path: updated.response_path ?? {},
              chatbot_conversation,
              to_modify: updated.to_modify ?? {},
              webpage_url: nextLinks,
              source_material: nextMaterials,
            }),
          )
          .catch(() => {});
      } catch (e) {
        console.error("recordUploadInConversation failed:", e);
      }
    },
    [sessionId, sessionData, inputType, onResponseReceived],
  );

  const handleSubmit = async (input) => {
    try {
      setIsLoading(true);
      setError(null);
      let currentSessionId = sessionId;
      const text = typeof input === "string" ? input : input?.text || "";
      const sourceMaterials = Array.isArray(input?.sourceMaterials)
        ? input.sourceMaterials
        : [];
      const webLinks = Array.isArray(input?.webLinks) ? input.webLinks : [];
      const mergedWebpageUrls = mergeUniqueWebLinks(
        sessionData?.webpage_url,
        webLinks,
      );

      if (!currentSessionId) {
        currentSessionId = localStorage.getItem("sessionId");
      }

      // Only create new session if one doesn't exist
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem("sessionId", currentSessionId);
        // Notify source material card
        window.dispatchEvent(new Event("sessionIdChanged"));
        console.log("New session created:", currentSessionId);
      } else {
        console.log("Using existing session:", currentSessionId);
      }

      setSessionId(currentSessionId);

      let parsedUserQuestions = [];
      if (userQuestions) {
        try {
          parsedUserQuestions = JSON.parse(decodeURIComponent(userQuestions));
        } catch (e) {
          console.error("Error parsing userQuestions:", e);
        }
      }

      const initialUserInput = initialInput || text;
      const sourceContextBlock =
        sourceMaterials.length > 0
          ? `\n\n[Attached source materials]\n${sourceMaterials
              .map((item, index) => {
                const name = item?.source_name || `file_${index + 1}`;
                const id = item?.id ?? "n/a";
                const s3Path = item?.s3_path || "n/a";
                const comment = (item?.comment ?? "").trim();
                return `- source_name: ${name}, id: ${id}, s3_path: ${s3Path}${comment ? `, comment: ${comment}` : ""}`;
              })
              .join("\n")}`
          : "";
      const linkContextBlock =
        webLinks.length > 0
          ? `\n\n[Attached links]\n${webLinks
              .map((item, index) => {
                const title = item?.title || `link_${index + 1}`;
                const url = item?.webpage_url ?? item?.url ?? "";
                const comment = item?.comment || "";
                return `- title: ${title}, url: ${url}${comment ? `, comment: ${comment}` : ""}`;
              })
              .join("\n")}`
          : "";
      const userMessageForConversation = `${initialUserInput}${sourceContextBlock}${linkContextBlock}`;
      // setAllMessages((prev) => [...prev, { from: "user", content: initialUserInput }]);

      // if (parsedUserQuestions.length > 0 && initialInput) {
      //   const welcomeConversation = [];
      //   welcomeConversation.push({ from: "user", content: initialInput });
      //   parsedUserQuestions.forEach((item) => {
      //     if (item.question) {
      //       welcomeConversation.push({ from: "bot", content: item.question });
      //     }
      //     if (item.answer) {
      //       welcomeConversation.push({ from: "user", content: item.answer });
      //     }
      //   });
      //   setAllMessages((prev) => [...prev, ...welcomeConversation]);
      // }

      // OLD CODE
      // const chatbotConversation = [{ user: initialUserInput }];
      // parsedUserQuestions.forEach((item) => {
      //   if (item.question) {
      //     chatbotConversation.push({ agent: item.question });
      //   }
      //   if (item.answer) {
      //     chatbotConversation.push({ user: item.answer });
      //   }
      // });

      // NEW CODE
      const existingConversation = sessionData?.chatbot_conversation || [];
      const existingAgentMessageCount = existingConversation.filter(
        (entry) => entry?.agent,
      ).length;

      // Build new conversation entries
      const userEntry = {
        user: userMessageForConversation,
        ...(sourceMaterials.length > 0
          ? { source_material: sourceMaterials }
          : {}),
        ...(webLinks.length > 0 ? { webpage_url: webLinks } : {}),
      };
      const newEntries = [userEntry];
      parsedUserQuestions.forEach((item) => {
        if (item.question) {
          newEntries.push({ agent: item.question });
        }
        if (item.answer) {
          newEntries.push({ user: item.answer });
        }
      });

      const chatbotConversation = [...existingConversation, ...newEntries];
      console.log("chatbotConversation>>>>>>>>>>", chatbotConversation);
      awaitingConversationRef.current = true;
      minAgentMessageCountRef.current = existingAgentMessageCount + 1;

      const currentResponsePath =
        inputType === "outline_updation"
          ? {
              ...(sessionData?.response_path ?? {}),
              chapters: [],
              remaining_chapters: [],
            }
          : (sessionData?.response_path ?? {});

      // build complete payload
      const executionId = Math.floor(Math.random() * 10000).toString();
      // Generate UUID using crypto.getRandomValues for browser compatibility
      const traceId = globalThis.crypto
        .getRandomValues(new Uint8Array(16))
        .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
      const receivedAt = new Date().toISOString();

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: inputType,
        cycle_creation_data: sessionData?.cycle_creation_data ?? {},
        response_outline: sessionData?.response_outline ?? {},
        response_path: currentResponsePath,
        additional_data: sessionData?.additional_data ?? {
          personalization_enabled: false,
          habit_enabled: false,
          habit_description: "",
        },
        chatbot_conversation: chatbotConversation,
        to_modify: sessionData?.to_modify ?? {},
        source_material: mergeUniqueMaterials(
          sessionData?.source_material,
          sourceMaterials,
        ),
        webpage_url: mergedWebpageUrls,
        execution_id: executionId,
        retry_count: 0,
        error_history: [],
        is_retry: false,
        metadata: JSON.stringify({
          trace_id: traceId,
          received_at: receivedAt,
          execution_id: executionId,
        }),
      });

      if (inputType === "outline_updation") {
        try {
          const clearedSessionSnapshot = {
            ...(sessionData || {}),
            response_path: currentResponsePath,
          };
          localStorage.setItem(
            "sessionData",
            JSON.stringify(clearedSessionSnapshot),
          );
          await graphqlClient.autoSaveComet(
            JSON.stringify({
              session_id: currentSessionId,
              input_type: "outline_updation",
              cycle_creation_data: sessionData?.cycle_creation_data ?? {},
              response_outline: sessionData?.response_outline ?? {},
              response_path: currentResponsePath,
              chatbot_conversation: sessionData?.chatbot_conversation ?? [],
              to_modify: sessionData?.to_modify ?? {},
              webpage_url: sessionData?.webpage_url ?? [],
            }),
          );
        } catch (e) {
          console.error("Outline pre-clear autosave failed:", e);
        }
      }

      await graphqlClient.sendMessage(cometJsonForMessage);

      const attachmentLabel =
        sourceMaterials.length > 0
          ? `\n\nAttached: ${sourceMaterials
              .map((item) => {
                const n = item?.source_name;
                if (!n) return null;
                const c = (item?.comment ?? "").trim();
                return c ? `${n} — ${c}` : n;
              })
              .filter(Boolean)
              .join(", ")}`
          : "";
      const linksLabel =
        webLinks.length > 0
          ? `\n\nLinks: ${webLinks
              .map((item) => item?.title || item?.webpage_url || item?.url)
              .filter(Boolean)
              .join(", ")}`
          : "";
      setAllMessages((prev) => [
        ...prev,
        { from: "user", content: `${text}${attachmentLabel}${linksLabel}` },
      ]);

      setInputValue("");
    } catch (error) {
      console.error("Error creating session or sending message:", error);
      setError(error.message);
      setIsLoading(false);
      awaitingConversationRef.current = false;
    }
  };

  // Subscribe to session updates - ChatWindow uses the shared subscription
  // It will be persistent if on a persistent screen, temporary otherwise
  useSessionSubscription(
    sessionId,
    (sessionData) => {
      console.log("Session update received:", sessionData);

      // Preserve longer chat + merged attachments so lagging autosave/subscription
      // does not wipe pending "[Uploaded document]" rows from localStorage.
      let dataToStore = sessionData;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("sessionData");
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed) {
            const attach = mergedSessionAttachments(parsed, sessionData);
            dataToStore = {
              ...sessionData,
              chatbot_conversation: pickChatbotConversation(parsed, sessionData),
              source_material: attach.source_material,
              webpage_url: attach.webpage_url,
            };
          }
          if (
            !dataToStore?.response_path?.enabled_attributes &&
            parsed?.response_path?.enabled_attributes
          ) {
            dataToStore = {
              ...dataToStore,
              response_path: {
                ...dataToStore?.response_path,
                enabled_attributes: parsed.response_path.enabled_attributes,
              },
            };
          }
        } catch (e) {}
      }
      if (onResponseReceived) {
        onResponseReceived(dataToStore);
      }
      localStorage.setItem("sessionData", JSON.stringify(dataToStore));

      const conversation = dataToStore?.chatbot_conversation;
      if (conversation) {
        const agentMessageCount = Array.isArray(conversation)
          ? conversation.filter((entry) => entry?.agent).length
          : 0;
        const rebuilt = messagesFromConversation(conversation);

        const shouldStopLoading =
          !awaitingConversationRef.current ||
          agentMessageCount >= minAgentMessageCountRef.current;

        if (rebuilt.length > 0) setAllMessages(rebuilt);
        if (shouldStopLoading) {
          setIsLoading(false);
          awaitingConversationRef.current = false;
        }
      }
    },
    (error) => {
      console.error("Subscription error:", error);
      setError(error.message);
    },
  );

  if (isGeneratingOutline) {
    return <Loader />;
  }

  return (
    <div className="bg-white h-full w-full p-2 rounded-2xl">
      <Chat
        cometManager={cometManager}
        messages={allMessages}
        // showWelcomeMessage={showWelcomeMessage}
        // welcomeMessage={welcomeMessage}
        // shouldAnimateWelcome={shouldAnimateWelcome}
        isLoading={isLoading || isInitialLoading || externalLoading}
        onSuggestionClick={handleSuggestionClick}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onUploadRecorded={recordUploadInConversation}
        error={error}
        pageIdentifier={pageIdentifier}
      />
    </div>
  );
}
