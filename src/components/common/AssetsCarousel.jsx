"use client";

import React, { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AssetsCarousel({ assets = [] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      requestAnimationFrame(() => {
        onSelect(emblaApi);
      });
    };
    
    // Initial state - defer to avoid synchronous setState
    requestAnimationFrame(() => {
      onSelect(emblaApi);
    });
    
    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleSelect);
    };
  }, [emblaApi, onSelect]);

  if (!assets || assets.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {assets.map((asset, index) => {
            const imageUrl =
              asset.s3_url ||
              asset.image_url ||
              asset.imageUrl ||
              asset.url;
            const assetName =
              asset.name ||
              asset.prompt_used ||
              asset.file ||
              `Image ${index + 1}`;

            return (
              <div
                key={asset.id || asset.asset_id || index}
                className="flex-[0_0_100%] min-w-0 h-full"
              >
                {typeof imageUrl === "string" &&
                imageUrl.startsWith("http") ? (
                  <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={assetName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                    <p className="text-sm text-gray-500">{assetName}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      {assets.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {assets.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-gray-300"
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

