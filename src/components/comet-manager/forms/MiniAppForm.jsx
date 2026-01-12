import React, { useMemo, useState } from "react";
import { AppWindow, Code2, FileCode } from "lucide-react";

export default function MiniAppForm({ formData, screen }) {
  const [isLoading, setIsLoading] = useState(true);

  // Get HTML content from screen
  const htmlContent = useMemo(() => {
    const content = screen?.screenContents?.content;
    if (typeof content === "string") return content;
    if (typeof formData === "string") return formData;
    if (typeof screen?.formData === "string") return screen.formData;
    return null;
  }, [screen, formData]);

  // Create a blob URL for the iframe
  const iframeSrc = useMemo(() => {
    if (!htmlContent) return null;
    const blob = new Blob([htmlContent], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [htmlContent]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (iframeSrc) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  React.useEffect(() => {
    if (iframeSrc) {
      setIsLoading(true);
    }
  }, [iframeSrc]);

  if (!htmlContent) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-slate-100 p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
            <FileCode className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              No Mini App Content
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Add HTML content to see your mini app preview here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer shadow-inner" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer shadow-inner" />
              <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer shadow-inner" />
            </div>
            <div className="h-4 w-px bg-slate-600" />
            <div className="flex items-center gap-2">
              <AppWindow className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-200">
                {screen?.title || "Mini App Preview"}
              </span>
            </div>
          </div>
        </div>

        {/* URL Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-slate-900/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400 font-mono truncate">
              mini-app://local/{screen?.screenType || "preview"}
            </span>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <AppWindow className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
              <span className="text-sm text-slate-500 font-medium">
                Loading mini app...
              </span>
            </div>
          </div>
        )}

        <iframe
          id="mini-app-iframe"
          src={iframeSrc}
          title={screen?.title || "Mini App"}
          className="w-full border-0 transition-opacity duration-300"
          style={{
            minHeight: "500px",
            opacity: isLoading ? 0 : 1,
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Footer Status Bar */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500">Ready</span>
        </div>
        <span className="text-xs text-slate-400">
          {screen?.screenType
            ? `Type: ${screen.screenType}`
            : "Interactive Preview"}
        </span>
      </div>
    </div>
  );
}
