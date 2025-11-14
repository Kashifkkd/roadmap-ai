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
  "Help sales leaders reinforce the SKO",
  "Add reinforcement & application to a training",
];

// Static questions that appear on the right side (bot questions)
const QUESTIONS = [
  "That sounds great! Let’s start shaping this into a learning experience .Can you tell me a bit more about your audience,what’s their role, experience level, and which department or function they belong to?",
  "Perfect — that helps me understand the context.Now, why are you creating this Comet?You can include the organizational context, for example, is this part of a new sales transformation,or a follow-up to a recent training or workshop? Also, what outcomes do you want to achieve — both in learning and behavior change? ",
  "Perfect. That’s everything I need for now.Let me generate your initial Comet setup — this will take just a moment.",
];

export default function WelcomePage() {
  const [inputText, setInputText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isAttachActive, setIsAttachActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const router = useRouter();

  // Simple state for question flow
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 = no question shown, 0-2 = question index
  const [answers, setAnswers] = useState([]); // Store all question-answer pairs
  const [initialInput, setInitialInput] = useState(""); // Store first user input separately
  const [messages, setMessages] = useState([]); // Store chat messages for display
  const [isLoading, setIsLoading] = useState(false); // Show loading message
  const messagesEndRef = useRef(null); // Scroll to bottom of messages

  const handleSuggestionSelect = (suggestion) => {
    setInputText(suggestion);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-expand when messages are present
  useEffect(() => {
    if (messages.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [messages.length, isExpanded]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim() || isDisabled) return;

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


    if (questionIndex === QUESTIONS.length - 1) {
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
      }, 300);

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
      }, 800);

      const userQuestionsParam = encodeURIComponent(JSON.stringify(allAnswers));
      const initialInputParam = encodeURIComponent(initialInput);

      // Create session if needed
      try {
        const { graphqlClient } = await import("@/lib/graphql-client");
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          const sessionResponse = await graphqlClient.createSession();
          sessionId = sessionResponse.createSession.sessionId;
          localStorage.setItem("sessionId", sessionId);
        }
      } catch (error) {
        console.error("Error creating session:", error);
      }

      // Small delay before redirect to show loading message
      setTimeout(() => {
        router.push(
          `/dashboard?initialInput=${initialInputParam}&userQuestions=${userQuestionsParam}`
        );
      }, 1500);
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

  return (
    <div className="bg-primary-50 p-4 min-h-full">
      <main className="px-6 py-12 max-w-3xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6 text-primary-900">
            <div className="flex items-center justify-center">
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
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary-900">Welcome!</h1>
              <h2 className="text-3xl font-semibold text-primary-900">
                Let's build your next Comet together.
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-primary-900">
                You can type your idea below, or pick one of the suggestions to
                get started.
              </p>
            </div>
          </div>

          {/* Input Section with Chat Messages Inside */}
          <div className="space-y-8 ">
            <div className="relative w-full max-w-3xl mx-auto rounded-xl border border-primary-300 shadow-sm  ">
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
                        key={idx}
                        role={msg.from === "user" ? "user" : "bot"}
                        text={msg.content}
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
                      disabled={isDisabled || isLoading}
                      className={`w-full ${
                        messages.length === 0 ? "pl-10" : "pl-3"
                      } pr-3 ${
                        messages.length > 0 ? "pt-2.5 pb-2.5" : "pt-3 pb-3"
                      } text-lg shadow-none bg-transparent border-0 placeholder:text-placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none focus:outline-none transition-all duration-200 cursor-text ${
                        messages.length > 0 ? "overflow-hidden" : ""
                      }`}
                      rows={messages.length > 0 ? 1 : isExpanded ? 4 : 2}
                      style={{
                        maxHeight: messages.length > 0 ? "2.5rem" : "none",
                      }}
                    />
                  </div>

                  {/* Separator Line */}
                  <div className="w-full border-t border-gray-200"></div>

                  {/* Action Bar */}
                  <div className="w-full flex flex-row justify-between items-center gap-2 px-3 py-2">
                    <Button
                      variant="default"
                      className={`cursor-pointer flex items-center gap-2 ${
                        isAttachActive
                          ? "text-white bg-primary-600"
                          : "text-placeholder-gray-500 bg-transparent hover:text-placeholder-gray-700 hover:bg-transparent"
                      }`}
                      onClick={handleAttach}
                      disabled={isLoading}
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>Attach</span>
                    </Button>

                    <button
                      onClick={(e) => handleSubmit(e)}
                      disabled={isDisabled || !inputText.trim() || isLoading}
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
              <div className="w-full max-w-4xl mx-auto">
                <h3 className="text-primary-900 text-lg font-medium mb-4 text-start">
                  Pick an idea to to get started
                </h3>
                <div className="flex flex-wrap gap-3">
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      disabled={isDisabled}
                      className="px-4 py-2 text-sm border rounded-md bg-white text-primary-600 font-medium transition-all duration-200 hover:bg-primary-50 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Recent Comets Section */}
      <section className="max-w-3xl w-full p-4 mx-auto bg-background rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold">My recent Comets</h3>
            <ArrowDown size={20} />
          </div>
          <Button
            variant="default"
            className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
            onClick={handleCreateNewComet}
            disabled={isDisabled}
          >
            <Stars />
            <span>Create New Comet</span>
          </Button>
        </div>

        {/* Empty State Section */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Stars className="w-12 h-12 text-primary-300" />
          </div> */}
          <h4 className="text-xl font-bold text-primary-800 mb-2">
            No Comets yet? Your first one will appear here once you create it.
          </h4>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start building your first Comet by clicking the button above or
            describing what you'd like to create.
          </p>
          <Button
            variant="default"
            className="flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-50"
            onClick={handleCreateNewComet}
            disabled={isDisabled}
          >
            <Stars />
            <span>Create Your First Comet</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
