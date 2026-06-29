/**
 * Renders spell-check underlines on a Quill backdrop by cloning the editor DOM
 * (preserves bold/strike/headings/margins) and wrapping misspelled text nodes.
 */

function markMisspelledInTextNodes(textNodes, blockStart, misspelled) {
  for (let i = textNodes.length - 1; i >= 0; i -= 1) {
    const { node, start } = textNodes[i];
    const text = node.textContent ?? "";
    if (!text || !node.parentNode) continue;

    const localRanges = misspelled
      .filter(({ start: s, end: e }) => e > start && s < start + text.length)
      .map(({ start: s, end: e }) => ({
        start: Math.max(0, s - start),
        end: Math.min(text.length, e - start),
      }))
      .filter(({ start: ls, end: le }) => le > ls)
      .sort((a, b) => b.start - a.start);

    for (const { start: ls, end: le } of localRanges) {
      const current = node.textContent ?? "";
      if (ls >= current.length) continue;

      const range = document.createRange();
      range.setStart(node, ls);
      range.setEnd(node, Math.min(le, current.length));

      const span = document.createElement("span");
      span.className = "kyper-spell-error";

      try {
        range.surroundContents(span);
      } catch {
        // Range crosses element boundaries — skip this segment.
      }
    }
  }
}

function markMisspelledInBlock(clone, blockStart, misspelled) {
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let offset = blockStart;
  let current = walker.nextNode();

  while (current) {
    const length = current.textContent?.length ?? 0;
    textNodes.push({ node: current, start: offset, end: offset + length });
    offset += length;
    current = walker.nextNode();
  }

  markMisspelledInTextNodes(textNodes, blockStart, misspelled);
}

/**
 * Clone Quill block structure from editorRoot and apply misspelled spans.
 * Indices in `misspelled` must match editor.getText() (newline between blocks).
 */
export function renderQuillSpellcheckBackdrop(editorRoot, backdrop, misspelled) {
  if (!editorRoot || !backdrop) return;

  backdrop.replaceChildren();
  let blockOffset = 0;

  for (const child of editorRoot.children) {
    if (!(child instanceof HTMLElement)) continue;

    const blockText = child.textContent ?? "";
    const clone = child.cloneNode(true);

    if (misspelled.length > 0 && blockText.length > 0) {
      markMisspelledInBlock(clone, blockOffset, misspelled);
    }

    backdrop.appendChild(clone);
    blockOffset += blockText.length + 1;
  }

  if (!backdrop.childNodes.length) {
    backdrop.innerHTML = "<p><br></p>";
  }
}
