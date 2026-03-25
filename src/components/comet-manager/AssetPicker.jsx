"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ImageIcon, Check, X } from "lucide-react";
import { getSessionAssets, linkAssetToScreen } from "@/api/generateStepImages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AssetPicker({
  sessionId,
  screenUid,
  isOpen,
  onClose,
  onAssetLinked,
}) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchAssets();
    }
  }, [isOpen, sessionId]);

  const fetchAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSessionAssets({ sessionId });
      const data = res?.response ?? res;
      if (data?.assets) {
        setAssets(data.assets);
      } else {
        setAssets([]);
      }
    } catch (e) {
      setError(e?.message || "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (asset) => {
    if (!screenUid) return;
    setIsLinking(asset.id);
    try {
      const res = await linkAssetToScreen({
        sessionId,
        assetId: asset.id,
        screenUid,
      });
      const data = res?.response ?? res;
      if (data?.success || data?.asset_url) {
        onAssetLinked?.({
          type: "image",
          url: data.asset_url || asset.url,
          key: "",
        });
        onClose();
      } else {
        setError("Failed to link asset");
      }
    } catch (e) {
      setError(e?.message || "Failed to link asset");
    } finally {
      setIsLinking(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Browse Existing Images</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Loading assets...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <X className="h-6 w-6 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <ImageIcon className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              No images generated yet for this session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[50vh] p-1">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleSelect(asset)}
                disabled={isLinking !== null}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <img
                  src={asset.url}
                  alt={asset.name || "Asset"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isLinking === asset.id ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Check className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                )}
                {asset.screens_used > 0 && (
                  <span className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {asset.screens_used} screen{asset.screens_used > 1 ? "s" : ""}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
