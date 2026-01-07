"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUp, Paperclip, Search, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Stars from "@/components/icons/Stars";
import ChatMessage from "@/components/chat/ChatMessage";

const SUGGESTIONS = [
  "Create a go-to microlearning experience for new managers",
  "Get store managers ready for the holiday season",
  "Boost collaboration and trust within teams",
  "Help sales leaders reinforce the SKO",
  "Onboard new employees with essential training",
  "Add reinforcement & application to a training",
];

// Static questions that appear on the right side (bot questions)
const QUESTIONS = [
  "That sounds great! Let’s start shaping this into a learning experience. Can you tell me a bit more about your audience-what’s their role, experience level, and which department or function they belong to?",
  "Thanks that helps me understand the audience. Now, why are you creating this Comet? You can include the organizational context, for example, is this part of a new sales transformation, or a follow-up to a recent training or workshop? Also, what outcomes do you want to achieve both in learning and behavior change?",
  "Perfect. That’s everything I need for now. Let me generate your initial Comet setup this will take just a moment.",
];

export default function WelcomePage() {
  const [inputText, setInputText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isAttachActive, setIsAttachActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const router = useRouter();

  const [questionIndex, setQuestionIndex] = useState(-1); // -1 = no question shown, 0-2 = question index
  const [answers, setAnswers] = useState([]);
  const [initialInput, setInitialInput] = useState("");
  const [messages, setMessages] = useState([]); // Store chat messages for display
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);

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

  const handleMessageTypingComplete = () => {
    setIsAnimating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim() || isDisabled || isAnimating) return;

    setIsDisabled(true);
    const userInput = inputText.trim();
    setInputText("");

    // First time - user types anything
    if (questionIndex === -1) {
      setInitialInput(userInput);

      setMessages([
        { from: "user", content: userInput },
        { from: "bot", content: QUESTIONS[0] },
      ]);
      setIsAnimating(true);

      setQuestionIndex(0);
      setIsExpanded(true);
      setIsDisabled(false);
      return;
    }

    const currentQuestionText = QUESTIONS[questionIndex];
    const questionAnswer = { question: currentQuestionText, answer: userInput };
    const allAnswers = [...answers, questionAnswer];
    setAnswers(allAnswers);

    setMessages((prev) => [...prev, { from: "user", content: userInput }]);

    if (questionIndex === QUESTIONS.length - 2) {
      // Add confirmation message first
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            content:
              "Perfect. That's everything I need for now. Let me generate your initial Comet setup — this will take just a moment.",
          },
        ]);
        setIsAnimating(true);
      }, 200);

      // Show loading message after a short delay
      setIsLoading(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            content:
              "Analyzing source materials and preparing your Input Screen…",
          },
        ]);
        setIsAnimating(true);
      }, 3000);

      const userQuestionsParam = encodeURIComponent(JSON.stringify(allAnswers));
      const initialInputParam = encodeURIComponent(initialInput);

      // Create session if needed
      // try {
      //   const { graphqlClient } = await import("@/lib/graphql-client");
      //   let sessionId = localStorage.getItem("sessionId");
      //   if (!sessionId) {
      //     const sessionResponse = await graphqlClient.createSession();
      //     sessionId = sessionResponse.createSession.sessionId;
      //     localStorage.setItem("sessionId", sessionId);
      //   }
      // } catch (error) {
      //   console.error("Error creating session:", error);
      // }

      setTimeout(() => {
        router.push(
          `/dashboard?initialInput=${initialInputParam}&userQuestions=${userQuestionsParam}`
        );
      }, 4000);
      return;
    }

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          content: QUESTIONS[nextIndex],
        },
      ]);
      setIsAnimating(true);
    }, 300);

    setIsDisabled(false);
  };

  const handleCreateNewComet = () => {
    router.push("/dashboard");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Expand on Enter if not already expanded
      if (!isExpanded && !inputText.trim()) {
        setIsExpanded(true);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 0);
      } else {
        handleSubmit(e);
      }
    }
  };

  const handleAttach = () => {
    setIsAttachActive(!isAttachActive);
  };

  const handleExpandTextarea = () => {
    setIsExpanded(true);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Auto-resize textarea based on content
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
            {/* <div className="flex items-center justify-center">
              <Image
                src="/logo2.svg"
                alt="Kyper Logo"
                width={80}
                height={80}
                className="rounded-full animate-spin"
                style={{
                  animation: "spin 8s linear infinite",
                }}
              />
            </div> */}
            <div className="space-y-2">
              {/* <h1 className="text-4xl font-bold text-primary-900">Welcome!</h1> */}
              <h2 className="text-3xl font-semibold text-primary-900 font-serif">
                Let's build your next Comet together...
              </h2>
              <p className="text-md max-w-2xl mx-auto text-primary-900">
                You can type your idea below, or pick one of the suggestions to
                get started.
              </p>
            </div>
          </div>

          {/* Input Section with Chat Messages Inside */}
          <div className="space-y-4">
            <div className="relative w-full max-w-3xl mx-auto rounded-xl border-primary-200 p-1.5 bg-[#E3E1FC] bg-[linear-gradient(147deg,rgba(227, 225, 252, 1) 0%, rgba(248, 247, 254, 1) 100%)]">
              <div
                className={`w-full flex flex-col relative transition-all duration-200 rounded-xl bg-white ${
                  isExpanded || messages.length > 0
                    ? "min-h-[500px] max-h-[600px]"
                    : ""
                }`}
              >
                {/* Chat Messages Area - Show when messages exist */}
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

                {/* Input Area - Always at bottom */}
                <div
                  className={`relative w-full bg-white rounded-xl border border-primary-300 shadow-sm ${
                    messages.length > 0 ? "mt-auto" : ""
                  }`}
                >
                  {/* Input Field Section */}
                  <div className="relative w-full">
                    {messages.length === 0 && (
                      <Search className="w-5 h-5 text-placeholder-gray-500 absolute left-4 top-4 z-10 pointer-events-none" />
                    )}
                    <textarea
                      ref={textareaRef}
                      placeholder={
                        isLoading
                          ? "Analyzing and preparing your Input Screen..."
                          : questionIndex >= 0 || messages.length > 0
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

                  {/* Separator Line
                  <div className="w-full border-t border-gray-200"></div> */}

                  {/* Action Bar */}
                  <div className="w-full flex flex-row justify-between items-center gap-2 px-3 py-2">
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
                      onClick={(e) => handleSubmit(e)}
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

            {/* Suggestion Buttons - Only show if no question is shown */}
            {questionIndex === -1 && (
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
                      className="px-2 py-2 text-sm rounded-md bg-white text-primary-600 font-medium  hover:bg-primary-600 hover:text-white  cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Empty State Section */}
          <div className="flex flex-row items-center  text-center justify-between bg-white rounded-xl border border-primary-200 max-w-3xl  p-3  mx-auto">
            <h4 className="text-md font-medium text-[#352F6E] mb-2">
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
      {/* </section> */}
    </div>
  );
}
