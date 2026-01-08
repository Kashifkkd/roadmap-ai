"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUp, Paperclip, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Stars from "@/components/icons/Stars";
import ChatMessage from "@/components/chat/ChatMessage";
import Vector from "@/components/images/vector.svg";
import { graphqlClient } from "@/lib/graphql-client";

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
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);

  // GraphQL session state (same as ChatWindow)
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

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

  // Cleanup WebSocket connections on unmount (same as ChatWindow line 39-43)
  useEffect(() => {
    return () => {
      graphqlClient.cleanup();
    };
  }, []);

  const handleMessageTypingComplete = () => {
    setIsAnimating(false);
  };

  // Handle form submission - FIXED: Setup subscription BEFORE sending message
  const handleSubmit = async (text) => {
    try {
      setIsLoading(true);
      setError(null);
      let currentSessionId = sessionId;

      // Step 1: Create session
      console.log("📝 Creating session...");
      const sessionResponse = await graphqlClient.createSession();
      currentSessionId = sessionResponse.createSession.sessionId;
      localStorage.setItem("sessionId", currentSessionId);
      console.log("✅ Session created:", currentSessionId);

      // Step 2: Setup subscription FIRST (before sending message)
      console.log("🔌 Setting up subscription BEFORE sending message...");
      await graphqlClient.subscribeToSessionUpdates(
        currentSessionId,
        (receivedSessionData) => {
          console.log("📨 Session update received:", receivedSessionData);

          // Store in localStorage
          localStorage.setItem("sessionData", JSON.stringify(receivedSessionData));
          setSessionData(receivedSessionData);

          // Update messages from chatbot_conversation
          if (receivedSessionData.chatbot_conversation) {
            const conversation = receivedSessionData.chatbot_conversation;
            const allMessages = [];

            conversation.forEach((entry) => {
              if (entry.user) {
                allMessages.push({
                  from: "user",
                  content: entry.user,
                  status: entry.status,
                  identifier: entry.identifier,
                });
              }
              if (entry.agent) {
                allMessages.push({
                  from: "bot",
                  content: entry.agent,
                  status: entry.status,
                  identifier: entry.identifier,
                });
              }
            });

            console.log("💬 All messages:", allMessages);
            console.log("📋 Conversation:", conversation);

            // Update with all messages
            if (allMessages.length > 0) {
              setMessages(allMessages);
              setIsAnimating(true);
            }
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("❌ Subscription error:", error);
          setError(error.message);
        }
      );
      console.log("✅ Subscription ready!");

      // Step 3: Build payload
      const existingConversation = sessionData?.chatbot_conversation || [];
      const chatbotConversation = [...existingConversation, { user: text }];

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "comet_data_creation",
        comet_creation_data: sessionData?.comet_creation_data || {},
        response_outline: sessionData?.response_outline || {},
        response_path: sessionData?.response_path || {},
        additional_data: {
          personalization_enabled:
            sessionData?.additional_data?.personalization_enabled || false,
          habit_enabled: sessionData?.additional_data?.habit_enabled || false,
          habit_description:
            sessionData?.additional_data?.habit_description || "",
        },
        chatbot_conversation: chatbotConversation,
        to_modify: {},
      });

      // Step 4: NOW send message (subscription is ready)
      console.log("📤 Sending message NOW (subscription is ready)...");
      await graphqlClient.sendMessage(cometJsonForMessage);
      console.log("✅ Message sent!");

      // Add user message to UI
      setMessages((prev) => [...prev, { from: "user", content: text }]);
      setIsExpanded(true);
      setInputText("");

      // Set sessionId for tracking (subscription is already set up)
      setSessionId(currentSessionId);
    } catch (error) {
      console.error("Error creating session:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Subscription useEffect - DISABLED (now handled directly in handleSubmit)
  // This was causing a timing issue where the message would be sent before subscription was ready
  /*
  useEffect(() => {
    if (!sessionId) {
      console.log("No sessionId yet, skipping subscription");
      return;
    }

    console.log("Setting up subscription for sessionId:", sessionId);
    let cleanup;
    const subscribeToUpdates = async () => {
      cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (receivedSessionData) => {
          console.log("📨 Session update received:", receivedSessionData);

          // Store in localStorage 
          localStorage.setItem("sessionData", JSON.stringify(receivedSessionData));
          setSessionData(receivedSessionData);

          // Update messages from chatbot_conversation 
          if (receivedSessionData.chatbot_conversation) {
            const conversation = receivedSessionData.chatbot_conversation;
            const allMessages = [];

            conversation.forEach((entry) => {
              if (entry.user) {
                allMessages.push({
                  from: "user",
                  content: entry.user,
                  status: entry.status,
                  identifier: entry.identifier,
                });
              }
              if (entry.agent) {
                allMessages.push({
                  from: "bot",
                  content: entry.agent,
                  status: entry.status,
                  identifier: entry.identifier,
                });
              }
            });

            console.log("All messages:", allMessages);
            console.log("Conversation:", conversation);

            // Update with all messages
            if (allMessages.length > 0) {
              setMessages(allMessages);
              setIsAnimating(true);
            }
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Subscription error:", error);
          setError(error.message);
        }
      );
    };

    subscribeToUpdates();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [sessionId]); // Triggers when sessionId changes
  */

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isDisabled || isAnimating) return;
    
    setIsDisabled(true);
    await handleSubmit(inputText.trim());
    setIsDisabled(false);
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

  const handleAttach = () => {
    setIsAttachActive(!isAttachActive);
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
                together.
              </h2>

              <p className="text-md max-w-2xl mx-auto text-primary-900">
                You can type your idea below, or pick one of the suggestions to
                get started.
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
                          20
                        )}`}
                        role={msg.from === "user" ? "user" : "bot"}
                        text={msg.content}
                        animate={msg.from === "bot"}
                        onTypingComplete={handleMessageTypingComplete}
                      />
                    ))}
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
                        isLoading
                          ? "Waiting for response..."
                          : messages.length > 0
                          ? "Type your answer here..."
                          : "I'll guide you step by step - just tell me what you want to create."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isDisabled || isLoading || isAnimating}
                      className={`w-full ${
                        messages.length === 0 ? "pl-10" : "pl-3"
                      } pr-3 ${
                        messages.length > 0 ? "pt-2.5 pb-2.5" : "pt-3 pb-3"
                      } text-lg shadow-none bg-transparent border-0 placeholder:text-placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none focus:outline-none transition-all duration-200 cursor-text overflow-y-auto`}
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

                  {/* Action Bar */}
                  <div className="w-full flex flex-row justify-between items-center gap-2 px-3 py-3">
                    <Button
                      variant="default"
                      className={`cursor-pointer flex items-center gap-2 ${
                        isAttachActive
                          ? "text-white bg-primary-600"
                          : "text-white bg-primary hover:text-placeholder-gray-700 hover:bg-primary-50 hover:text-primary-600"
                      }`}
                      onClick={handleAttach}
                      disabled={isLoading}
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>Attach</span>
                    </Button>

                    <button
                      onClick={(e) => handleSubmitWrapper(e)}
                      disabled={
                        isDisabled ||
                        !inputText.trim() ||
                        isLoading ||
                        isAnimating
                      }
                      className="p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center w-8 h-8"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
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

          {/* Create New Comet */}
          <div className="flex flex-row items-center text-center justify-between bg-white rounded-xl border border-primary-200 max-w-3xl p-3 mx-auto">
            <h4 className="text-md font-medium text-[#352F6E]">
              Or, begin with a blank canvas and shape your Comet step by step.
            </h4>
            <Button
              variant="default"
              className="flex items-center justify-center gap-2 px-4 py-3 disabled:opacity-50"
              onClick={handleCreateNewComet}
              disabled={isDisabled}
            >
              <Stars />
              <span>Create New Comet</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
