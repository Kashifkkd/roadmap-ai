import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollElementIntoViewSmooth } from "./smoothScroll";

describe("scrollElementIntoViewSmooth", () => {
  let rafQueue;

  beforeEach(() => {
    rafQueue = [];

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      rafQueue.push(callback);
      return rafQueue.length;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const flushAnimationFrames = (count = 2) => {
    for (let i = 0; i < count; i += 1) {
      const callbacks = [...rafQueue];
      rafQueue = [];
      callbacks.forEach((callback) => callback(0));
    }
  };

  it("schedules two animation frames before scrolling", () => {
    const element = document.createElement("div");
    element.scrollIntoView = vi.fn();
    const elementRef = { current: element };

    scrollElementIntoViewSmooth(elementRef);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(element.scrollIntoView).not.toHaveBeenCalled();

    flushAnimationFrames(1);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(element.scrollIntoView).not.toHaveBeenCalled();

    flushAnimationFrames(1);
    expect(element.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("uses custom scroll options when provided", () => {
    const element = document.createElement("div");
    element.scrollIntoView = vi.fn();
    const elementRef = { current: element };

    scrollElementIntoViewSmooth(elementRef, {
      behavior: "smooth",
      block: "center",
    });
    flushAnimationFrames(2);

    expect(element.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("does nothing when the ref has no current element", () => {
    scrollElementIntoViewSmooth({ current: null });
    flushAnimationFrames(2);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });
});
