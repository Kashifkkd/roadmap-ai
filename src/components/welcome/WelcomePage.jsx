"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUp, Paperclip, Search, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
// import Stars from "@/components/icons/stars";

const SUGGESTIONS = [
  "Create a go-to microlearning experience for new managers",
  "Get store managers ready for the holiday season",
  "Help sales leaders reinforce the SKO",
  "Add reinforcement & application to a training",
];

export default function WelcomePage() {
  const [inputText, setInputText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const handleSuggestionSelect = (suggestion) => {
    setInputText(suggestion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim() || isDisabled) return;
    router.push(`/dashboard?initialInput=${encodeURIComponent(inputText)}`);
  };

  const handleCreateNewComet = () => {
    router.push("/dashboard");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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

          {/* Input Section */}
          <div className="space-y-8">
            <div className="relative w-full max-w-3xl mx-auto">
              <div
                className="w-full p-2 flex flex-col items-center gap-2 rounded-xl min-h-28 h-40 relative"
                style={{
                  background:
                    "linear-gradient(278.54deg, #F8F7FE 6.44%, #E3E1FC 94.6%)",
                }}
              >
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-placeholder-gray-500 absolute left-4 top-4 z-10 pointer-events-none" />
                  <textarea
                    placeholder="I'll guide you step by step - just tell me what you want to create."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isDisabled}
                    className="w-full h-full pl-10 pr-3 pt-3 pb-3 text-lg shadow-none rounded-xl bg-background hover:bg-gray-50 border border-primary-300 hover:border-gray-50 placeholder:text-placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
                    rows={4}
                  />
                </div>
                <div className="w-[95%] flex flex-row justify-between items-center gap-2 absolute bottom-4 border-t-2 border-gray-200 pt-2">
                  <div className="bg-white p-1 rounded-md flex items-center gap-2 text-sm text-placeholder-gray-500 cursor-pointer hover:text-placeholder-gray-600 transition-colors">
                    <Paperclip className="w-4 h-4" />
                    <span>Attach</span>
                  </div>

                  <button
                    onClick={(e) => handleSubmit(e)}
                    disabled={isDisabled || !inputText.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestion Buttons */}
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
                    className="px-4 py-2 text-sm border border-primary-300 rounded-md bg-white text-primary-700 transition-all duration-200 hover:bg-primary-50 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recent Comets Section */}
      <section className="max-w-3xl w-full p-4 mx-auto bg-background rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-primary-600">
              My recent Comets
            </h3>
            <ArrowDown className="text-primary-600" size={20} />
          </div>
          <Button
            variant="default"
            className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
            onClick={handleCreateNewComet}
            disabled={isDisabled}
          >
            {/* <Stars /> */}
            <span>Create New Comet</span>
          </Button>
        </div>

        {/* Empty State Section */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Stars className="w-12 h-12 text-primary-300" />
          </div> */}
          <h4 className="text-xl font-semibold text-primary-900 mb-2">
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
            {/* <Stars /> */}
            <span>Create Your First Comet</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
