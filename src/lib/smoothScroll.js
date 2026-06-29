const DEFAULT_SCROLL_OPTIONS = { behavior: "smooth", block: "start" };

/**
 * Scrolls a ref-mounted element into view after the next paint.
 * Uses a double requestAnimationFrame so layout is ready when the target mounts.
 */
export function scrollElementIntoViewSmooth(
  elementRef,
  options = DEFAULT_SCROLL_OPTIONS,
) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elementRef?.current?.scrollIntoView(options);
    });
  });
}
