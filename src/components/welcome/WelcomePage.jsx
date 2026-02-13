"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowUp, Paperclip, Search, X, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Stars from "@/components/icons/Stars";
import ChatMessage from "@/components/chat/ChatMessage";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import Vector from "@/components/images/vector.svg";
import { graphqlClient } from "@/lib/graphql-client";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { toast } from "sonner";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

const SUGGESTIONS = [
  "Create a go-to microlearning experience for new managers",
  "Get store managers ready for the holiday season",
  "Boost collaboration and trust within teams",
  "Help sales leaders reinforce the SKO",
  "Onboard new employees with essential training",
  "Add reinforcement & application to a training",
];

export default function WelcomePage() {
  const [inputText, setInputText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isAttachActive, setIsAttachActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);

  // GraphQL session state
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sourceMaterialUid, setSourceMaterialUid] = useState(null);

  // Link input state: each entry is { url, comment }
  const [webpageUrls, setWebpageUrls] = useState([]);
  const [isLinkInputVisible, setIsLinkInputVisible] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [linkCommentValue, setLinkCommentValue] = useState("");
  const linkInputRef = useRef(null);

  const handleSuggestionSelect = (suggestion) => {
    setInputText(suggestion);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [messages]);

  // Auto-expand when messages are present
  useEffect(() => {
    if (messages.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [messages.length, isExpanded]);

  // Note: WebSocket cleanup is now handled by SubscriptionManager

  const [cometCreated, setCometCreated] = useState(false);

  useEffect(() => {
    if (sessionData?.flag?.comet_created && !cometCreated) {
      setCometCreated(true);
    }
  }, [sessionData, cometCreated]);

  // Subscribe to session updates - temporary subscription for welcome page
  useSessionSubscription(
    sessionId,
    (receivedSessionData) => {
      localStorage.setItem("sessionData", JSON.stringify(receivedSessionData));
      setSessionData(receivedSessionData);

      // Update chatbot_conversation
      if (receivedSessionData.chatbot_conversation) {
        const conversation = receivedSessionData.chatbot_conversation;
        const allMessages = [];
        let shouldNavigate = false;

        // Only show messages without identifier
        conversation.forEach((entry) => {
          // Skip messages with identifier
          if (entry.identifier) return;

          if (entry.user && entry.user.trim()) {
            allMessages.push({
              from: "user",
              content: entry.user,
            });
          }
          if (entry.agent) {
            allMessages.push({
              from: "bot",
              content: entry.agent,
            });

            // Check if this is the "Comet data created" message
            if (entry.agent.includes("Comet data created successfully")) {
              shouldNavigate = true;
            }
          }
        });

        // Update with filtered messages
        if (allMessages.length > 0) {
          setMessages(allMessages);
          setIsAnimating(true);
        }
        setIsLoading(false);

        // Navigate to dashboard after showing "Comet data created" message
        if (shouldNavigate) {
          setCometCreated(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      }
    },
    (error) => {
      console.error("Subscription error:", error);
      setError(error.message);
    },
    { forceTemporary: true },
  );

  const handleMessageTypingComplete = () => {
    setIsAnimating(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };
  useEffect(() => {
    if (!isLoading && !isAnimating && !cometCreated) {
      textareaRef.current?.focus();
    }
  }, [isLoading, isAnimating, cometCreated]);

  // Handle form submission
  const handleSubmit = async (text) => {
    try {
      setIsLoading(true);
      setError(null);
      let currentSessionId = sessionId;
      let isFirstMessage = !currentSessionId;
      let uploadedFileUid = null;

      // Only create session if this is the first message
      if (!currentSessionId) {
        const sessionResponse = await graphqlClient.createSession();
        currentSessionId = sessionResponse.createSession.sessionId;
        localStorage.setItem("sessionId", currentSessionId);
        console.log("✅ Session created:", currentSessionId);

        // Upload the attached file only once
        if (attachedFile && !sourceMaterialUid) {
          uploadedFileUid = await uploadAttachedFile(currentSessionId);
          console.log("uploadedFileUid>>>>>>>>>>", uploadedFileUid);
        }

        // Note: Subscription is now handled by useSessionSubscription hook below
      } else {
        console.log("Using existing session:", currentSessionId);

        if (attachedFile && !sourceMaterialUid) {
          uploadedFileUid = await uploadAttachedFile(currentSessionId);
        }
      }

      // Step 3: Build payload with all required fields using helper
      const existingConversation = sessionData?.chatbot_conversation || [];
      const chatbotConversation = [...existingConversation, { user: text }];

      const executionId = Math.floor(Math.random() * 10000).toString();
      const traceId = crypto.randomUUID().replace(/-/g, "");
      const receivedAt = new Date().toISOString();

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "comet_data_creation",
        comet_creation_data: sessionData?.comet_creation_data ?? {},
        response_outline: sessionData?.response_outline ?? {},
        response_path: sessionData?.response_path ?? {},
        // additional_data: sessionData?.additional_data ?? {
        //   personalization_enabled: false,
        //   habit_enabled: false,
        //   habit_description: "",
        // },
        chatbot_conversation: chatbotConversation,
        to_modify: sessionData?.to_modify ?? {},
        source_material_uid: uploadedFileUid || sourceMaterialUid || null,
        webpage_url: webpageUrls.length > 0 ? webpageUrls.map((e) => ({ webpage_url: e.url, comment: e.comment || "" })) : [],
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

      await graphqlClient.sendMessage(cometJsonForMessage);

      // Add user message to UI
      setMessages((prev) => [...prev, { from: "user", content: text }]);
      setIsExpanded(true);
      setInputText("");

      // Set sessionId for tracking
      if (isFirstMessage) {
        setSessionId(currentSessionId);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isDisabled || isAnimating) return;

    setIsDisabled(true);
    await handleSubmit(inputText.trim());
    setIsDisabled(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleCreateNewCometFromDashboard = () => {
    // Clear existing session data to start fresh
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionData");
    router.push("/dashboard");
  };

  const handleCreateNewComet = () => {
    router.push("/dashboard");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isExpanded && !inputText.trim()) {
        setIsExpanded(true);
        setTimeout(() => textareaRef.current?.focus(), 0);
      } else {
        handleSubmitWrapper(e);
      }
    }
  };
  const uploadFile = useCallback(async (file, currentSessionId) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("session_id", currentSessionId);

      const result = await apiService({
        endpoint: endpoints.uploadSourceMaterial,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (result.error) {
        console.error("Error uploading file:", result.error);
        toast.error(`Failed to upload ${file.name}`);
        return null;
      } else {
        console.log("File uploaded successfully:", result.response);
        // Return the UID from the response
        return result.response?.uuid || null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  }, []);

  // Upload attached file and store UID
  const uploadAttachedFile = useCallback(
    async (currentSessionId) => {
      if (!attachedFile) return null;

      setIsUploading(true);
      try {
        const uuid = await uploadFile(attachedFile, currentSessionId);

        if (uuid) {
          toast.success("File uploaded successfully");
          setSourceMaterialUid(uuid);
        } else {
          setSourceMaterialUid("uploaded");
        }

        return uuid;
      } catch (error) {
        console.error("Error uploading file:", error);
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [attachedFile, uploadFile],
  );

  // Handle file selection (single file only)
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setAttachedFile(selectedFile);
      // New file selected
      setSourceMaterialUid(null);
    }

    event.target.value = "";
  };

  // Remove attached file
  const handleRemoveFile = () => {
    setAttachedFile(null);
    setSourceMaterialUid(null);
  };

  const handleAttach = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  // Link handlers
  const handleToggleLinkInput = () => {
    setIsLinkInputVisible((prev) => !prev);
    setLinkInputValue("");
    setLinkCommentValue("");
    setTimeout(() => linkInputRef.current?.focus(), 100);
  };

  const handleAddLink = () => {
    const url = linkInputValue.trim();
    if (!url) return;
    // URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    const comment = linkCommentValue.trim();
    const alreadyAdded = webpageUrls.some((entry) => entry.url === url);
    if (alreadyAdded) {
      toast.error("This link has already been added");
      return;
    }
    setWebpageUrls((prev) => [...prev, { url, comment }]);
    setLinkInputValue("");
    setLinkCommentValue("");
    setIsLinkInputVisible(false);
  };

  const handleRemoveLink = (indexToRemove) => {
    setWebpageUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleLinkInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === "Escape") {
      setIsLinkInputVisible(false);
      setLinkInputValue("");
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  }, [inputText]);

  return (
    <div className="pt-4 pb-0 min-h-full bg-[radial-gradient(100%_120%_at_50%_100%,rgba(115,103,240,0.70)_0%,rgba(255,255,255,1)_60%)]">
      <main className="px-6 pt-20 max-w-4xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="text-primary-900">
            <div className="space-y-2 relative">
              <h2 className="text-3xl font-semibold text-primary-900 font-serif relative">
                Let's build your next{" "}
                <span className="relative inline-block">
                  Comet
                  <Image
                    src={Vector}
                    alt="underline"
                    className="absolute left-0 -bottom-2 w-full"
                  />
                </span>{" "}
                together....
              </h2>

              <p className="text-md max-w-2xl mx-auto text-primary-900">
                You can type your idea below, or pick one of the suggestions to
                get started....
              </p>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="max-w-3xl mx-auto p-3 bg-red-100 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-4">
            <div className="relative w-full max-w-3xl mx-auto rounded-xl border-primary-200 p-1.5 bg-[#E3E1FC] bg-[linear-gradient(147deg,rgba(227, 225, 252, 1) 0%, rgba(248, 247, 254, 1) 100%)]">
              <div
                className={`w-full flex flex-col relative transition-all duration-200 rounded-xl bg-white ${
                  isExpanded || messages.length > 0
                    ? "min-h-[500px] max-h-[600px]"
                    : ""
                }`}
              >
                {/* Chat Messages */}
                {messages.length > 0 && (
                  <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-3 min-h-0">
                    {messages.map((msg, idx) => (
                      <ChatMessage
                        key={`${idx}-${msg.from}-${msg.content.substring(
                          0,
                          20,
                        )}`}
                        role={msg.from === "user" ? "user" : "bot"}
                        text={msg.content}
                        animate={msg.from === "bot"}
                        onTypingComplete={handleMessageTypingComplete}
                      />
                    ))}
                    {isLoading && <ThinkingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Input Area */}
                <div
                  className={`relative w-full bg-white rounded-xl border border-primary-300 shadow-sm ${
                    messages.length > 0 ? "mt-auto" : ""
                  }`}
                >
                  <div className="relative w-full">
                    {messages.length === 0 && (
                      <Search className="w-5 h-5 text-placeholder-gray-500 absolute left-4 top-4 z-10 pointer-events-none" />
                    )}
                    <textarea
                      ref={textareaRef}
                      placeholder={
                        cometCreated
                          ? "Comet created! Click 'Continue to Dashboard' below."
                          : isLoading
                            ? "Waiting for response..."
                            : messages.length > 0
                              ? "Type your answer here..."
                              : "I'll guide you step by step - just tell me what you want to create."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={
                        isDisabled || isLoading || isAnimating || cometCreated
                      }
                      className={`w-full ${
                        messages.length === 0 ? "pl-10" : "pl-3"
                      } pr-3 ${
                        messages.length > 0 ? "pt-2.5 pb-2.5" : "pt-3 pb-3"
                      } text-md shadow-none bg-transparent border-0 placeholder:text-placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none focus:outline-none transition-all duration-200 cursor-text overflow-y-auto`}
                      rows={1}
                      style={{
                        minHeight:
                          messages.length > 0
                            ? "2.5rem"
                            : isExpanded
                              ? "6rem"
                              : "3rem",
                        maxHeight: "200px",
                      }}
                    />
                  </div>

                  {/* Attached File Preview */}
                  {attachedFile && (
                    <div className="px-3 pt-2 flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="max-w-[150px] truncate">
                          {attachedFile.name}
                        </span>
                        <button
                          onClick={handleRemoveFile}
                          className="hover:text-red-500 transition-colors"
                          disabled={isLoading || isUploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hidden File Input  */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Action Bar */}
                  <div className="w-full flex flex-col gap-2 px-3 py-3">
                    {/* Buttons + chips row */}
                    <div className="flex flex-row justify-between items-center gap-2">
                      <div className="flex items-center flex-wrap">
                        <Button
                          variant="ghost"
                          className={`cursor-pointer flex items-center gap-2 ${
                            attachedFile
                              ? "text-white bg-primary-600"
                              : "text-gray-500 hover:text-placeholder-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          }`}
                          onClick={handleAttach}
                          disabled={isLoading || cometCreated || isUploading}
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>Attach</span>
                        </Button>

                        {/* Link button */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            className={`cursor-pointer flex items-center gap-2 ${
                              webpageUrls.length > 0 || isLinkInputVisible
                                ? "text-gray-500"
                                : "text-gray-500 hover:text-placeholder-gray-700 hover:bg-primary-50 hover:text-primary-600"
                            }`}
                            onClick={handleToggleLinkInput}
                            disabled={isLoading || cometCreated}
                          >
                            <Link2 className="w-4 h-4" />
                            <span>Link</span>
                          </Button>

                          {/* Link input dialog: URL + optional comment */}
                          {isLinkInputVisible && (
                            <div className="absolute left-0 top-full mt-2 z-50 w-full min-w-[320px] max-w-[380px] bg-primary-50 border border-primary-400 rounded-lg p-2 shadow-lg">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-primary-200">
                                  <input
                                    ref={linkInputRef}
                                    type="url"
                                    placeholder="Paste link here"
                                    value={linkInputValue}
                                    onChange={(e) =>
                                      setLinkInputValue(e.target.value)
                                    }
                                    onKeyDown={handleLinkInputKeyDown}
                                    className="flex-1 bg-transparent text-sm border-0 outline-none placeholder:text-gray-400 min-w-0"
                                  />
                                  <button
                                    onClick={() => {
                                      setIsLinkInputVisible(false);
                                      setLinkInputValue("");
                                      setLinkCommentValue("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add a comment (optional)"
                                    value={linkCommentValue}
                                    onChange={(e) =>
                                      setLinkCommentValue(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddLink();
                                      }
                                    }}
                                    className="flex-1 bg-white text-sm border border-primary-200 rounded-lg px-3 py-2 outline-none placeholder:text-gray-400 focus:border-primary-400"
                                  />
                                  <Button
                                    variant="outline"
                                    className="px-3 text-sm bg-primary text-white hover:bg-primary/90 flex-shrink-0"
                                    onClick={handleAddLink}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Link chips: url + comment */}
                        {webpageUrls.map((entry, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 bg-primary-50 text-primary-700 pl-2 pr-1 py-1.5 rounded-lg text-xs max-w-[240px] border border-primary-200/60"
                            title={entry.url + (entry.comment ? ` — ${entry.comment}` : "")}
                          >
                            <Link2 className="w-3 h-3 flex-shrink-0 mt-0.5 self-start" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate font-medium">
                                {entry.url.replace(/^https?:\/\//, "").slice(0, 28)}
                                {entry.url.replace(/^https?:\/\//, "").length > 28 ? "…" : ""}
                              </span>
                              {entry.comment ? (
                                <span className="truncate text-gray-600 mt-0.5" title={entry.comment}>
                                  {entry.comment.slice(0, 25)}
                                  {entry.comment.length > 25 ? "…" : ""}
                                </span>
                              ) : null}
                            </div>
                            <button
                              onClick={() => handleRemoveLink(index)}
                              className="hover:text-red-500 transition-colors flex-shrink-0 p-0.5 rounded-full hover:bg-primary-100"
                              disabled={isLoading}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={(e) => handleSubmitWrapper(e)}
                        disabled={
                          isDisabled ||
                          !inputText.trim() ||
                          isLoading ||
                          isAnimating ||
                          cometCreated ||
                          isUploading
                        }
                        className="p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center w-8 h-8 flex-shrink-0"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {messages.length === 0 && (
              <div className="w-full max-w-3xl mx-auto">
                <h3 className="text-primary-900 text-lg font-medium mb-4 text-start">
                  Here are some suggested prompts to get you started
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      disabled={isDisabled}
                      className="px-2 py-2 text-sm rounded-md bg-white text-primary-600 font-medium hover:bg-primary-600 hover:text-white cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Create New Comet / Continue to Dashboard */}
          {!cometCreated ? (
            <div className="flex flex-row items-center text-center justify-between bg-white rounded-xl border border-primary-200 max-w-3xl p-3 mx-auto">
              <h4 className="text-md font-medium text-[#352F6E]">
                Or, begin with a blank canvas and shape your Comet step by step.
              </h4>
              <Button
                variant="default"
                className="flex items-center justify-center gap-2 px-4 py-3 disabled:opacity-50"
                onClick={handleCreateNewCometFromDashboard}
                disabled={isDisabled}
              >
                <Stars />
                <span>Create New Comet</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center bg-white rounded-xl border border-primary-200 max-w-3xl p-6 mx-auto space-y-4">
              <h4 className="text-lg font-semibold text-[#352F6E]">
                🎉 Your Comet outline is ready!
              </h4>
              <p className="text-sm text-gray-600">
                Continue to the dashboard to review and customize your Comet.
              </p>
              <Button
                variant="default"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90"
                onClick={handleCreateNewComet}
              >
                <Stars />
                <span>Continue to Dashboard</span>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
