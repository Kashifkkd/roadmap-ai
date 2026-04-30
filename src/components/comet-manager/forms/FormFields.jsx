"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Plus,
  Trash2,
  GripVertical,
  CircleCheck,
  CircleX,
} from "lucide-react";
import "quill/dist/quill.snow.css";



export const SectionHeader = ({ title }) => (
  <div className="w-full mb-4">
    <h3 className="text-md font-semibold text-primary">{title}</h3>
  </div>
);


export const TextField = ({
  label,
  value,
  onChange,
  placeholder = "",
  inputProps = {},
}) => {
  const [localValue, setLocalValue] = useState(value || "");
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value || "");
    }
  }, [value]);

  return (
    <div className="mb-4">
      <div className="mb-2">
        <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      </div>
      <Input
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => { isFocusedRef.current = true; }}
        onBlur={(e) => {
          isFocusedRef.current = false;
          inputProps?.onBlur?.(e);
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...inputProps}
      />
    </div>
  );
};

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  inputProps = {},
}) => {
  const [localValue, setLocalValue] = useState(value || "");
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value || "");
    }
  }, [value]);

  return (
    <div className="mb-4">
      <div className="mb-2">
        <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      </div>
      <Textarea
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => { isFocusedRef.current = true; }}
        onBlur={(e) => {
          isFocusedRef.current = false;
          inputProps?.onBlur?.(e);
        }}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...inputProps}
      />
    </div>
  );
};

export const NumberField = ({ label, value, onChange, placeholder = "" }) => (
  <div className="mb-4">
    <Label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </Label>
    <Input
      type="number"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export const ListField = ({
  label,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  onToggleCorrect,
  buttonText,
  showCorrectAnswer = false,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    if (onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const getItemValue = (item) => {
    if (typeof item === "object" && item !== null) {
      return item.text || item.label || "";
    }
    return item || "";
  };

  const getItemIsCorrect = (item) => {
    if (typeof item === "object" && item !== null) {
      // Support both is_correct (snake_case) and isCorrect (camelCase)
      return item.is_correct === true || item.isCorrect === true;
    }
    return false;
  };

  const handleToggleCorrect = (index, isCorrect) => {
    if (onToggleCorrect) {
      onToggleCorrect(index, isCorrect);
    }
  };

  return (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <div className="space-y-2">
        {(items || []).map((item, index) => {
          const isCorrect = getItemIsCorrect(item);
          return (
            <div
              key={index}
              // draggable={!!onReorder}
              // onDragStart={(e) => handleDragStart(e, index)}
              // onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex gap-2 ${draggedIndex === index ? "opacity-50" : ""
                }`}
            >
              <div
                draggable={!!onReorder}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                className={`${onReorder ? "cursor-move" : "cursor-default"
                  } text-gray-400 h-10 w-10 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center`}
              >
                <GripVertical size={18} />
              </div>
              <span className="text-xs font-medium w-14 h-10 bg-gray-100 border  rounded-lg flex items-center justify-center text-gray-700">
                {index + 1}
              </span>
              {showCorrectAnswer && (
                <div className="flex items-center justify-center gap-x-1">
                  <div
                    onClick={() => handleToggleCorrect(index, true)}
                    className={`cursor-pointer h-10 w-10 flex items-center justify-center rounded-lg transition-all ${isCorrect
                      ? "bg-green-500"
                      : "bg-green-100 hover:bg-green-200"
                      }`}
                  >
                    <CircleCheck
                      size={18}
                      className={isCorrect ? "text-white" : "text-green-500"}
                    />
                  </div>
                  <div
                    onClick={() => handleToggleCorrect(index, false)}
                    className={`cursor-pointer h-10 w-10 rounded-lg flex items-center justify-center transition-all ${!isCorrect && isCorrect !== undefined
                      ? "bg-red-500"
                      : "bg-red-100 hover:bg-red-200"
                      }`}
                  >
                    <CircleX
                      size={18}
                      className={
                        !isCorrect && isCorrect !== undefined
                          ? "text-white"
                          : "text-red-500"
                      }
                    />
                  </div>
                </div>
              )}
              <Input
                type="text"
                value={getItemValue(item)}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="default"
                type="button"
                onClick={() => onRemove(index)}
                className="px-2 py-2 text-white  rounded-lg  bg-[#F04438]"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        })}
        {/* <Button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 text-background rounded-lg"
      >
        <Plus size={16} />
        {buttonText}
      </Button> */}
      </div>
    </div>
  );
};

/**
 * Preserve Quill's paragraph structure so Enter/Space/Tab interactions keep working
 * after value syncs back from parent state.
 */
const normalizeQuillHtmlOutput = (html) => {
  if (typeof html !== "string") return html;
  return html;
};

/** When "html", value is always simple HTML for backend; delta is normalized to HTML on load. */
export const RichTextArea = ({
  label,
  value,
  onChange,
  onSelectionChange,
  onBlur,
  valueFormat = "delta",
}) => {
  const isFocusedRef = useRef(false);
  const quillEditorRef = useRef(null);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const selectionCallbackRef = useRef(onSelectionChange);
  const blurCallbackRef = useRef(onBlur);
  const changeCallbackRef = useRef(onChange);
  const blurHandlerRef = useRef(null);
  const valueFormatRef = useRef(valueFormat);

  useEffect(() => {
    valueFormatRef.current = valueFormat;
  }, [valueFormat]);

  useEffect(() => {
    selectionCallbackRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    blurCallbackRef.current = onBlur;
  }, [onBlur]);

  useEffect(() => {
    changeCallbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (quillEditorRef.current || !editorRef.current)
      return;

    const isHtmlFormat = valueFormat === "html";
    const isHtmlString = (v) =>
      typeof v === "string" && v.trim().length > 0 && v.trim().startsWith("<");
    const isDeltaString = (v) =>
      typeof v === "string" && v.trim().length > 0 && v.trim().startsWith("{");

    // Dynamically import Quill only on client side
    const initEditor = async () => {
      if (typeof window === "undefined") return;

      const QuillModule = await import("quill");
      const Quill = QuillModule.default;

      // Custom inline formats: output semantic h1/h2/h3 tags (display:inline for flow within paragraph)
      const Inline = Quill.import("blots/inline");
      const makeHeadingBlot = (blotName, tag) => {
        const C = class extends Inline {
          static create() {
            const node = super.create();
            node.style.display = "inline";
            return node;
          }
        };
        C.blotName = blotName;
        C.tagName = tag;
        return C;
      };
      const Heading1 = makeHeadingBlot("heading1", "h1");
      const Heading2 = makeHeadingBlot("heading2", "h2");
      const Heading3 = makeHeadingBlot("heading3", "h3");
      try {
        Quill.register(Heading1);
        Quill.register(Heading2);
        Quill.register(Heading3);
      } catch {
        /* already registered */
      }

      const editorElement = editorRef.current;
      const toolbarElement = toolbarRef.current;

      if (!editorElement || !toolbarElement || quillEditorRef.current) return;

      const editor = new Quill(editorElement, {
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarElement,
            handlers: {
              heading1: function () {
                const range = editor.getSelection(true);
                if (!range || range.length === 0) return;
                const active = editor.getFormat(range).heading1;
                editor.format("heading1", !active, "user");
              },
              heading2: function () {
                const range = editor.getSelection(true);
                if (!range || range.length === 0) return;
                const active = editor.getFormat(range).heading2;
                editor.format("heading2", !active, "user");
              },
              heading3: function () {
                const range = editor.getSelection(true);
                if (!range || range.length === 0) return;
                const active = editor.getFormat(range).heading3;
                editor.format("heading3", !active, "user");
              },
            },
          },
        },
      });

      // Normalize old span-based heading styles to h1/h2/h3 for backward compatibility
      const normalizeHeadingHtml = (html) => {
        if (typeof html !== "string") return html;
        const styleMatch = (size) =>
          new RegExp(
            `<span style="[^"]*font-size:\\s*${size}[^"]*"[^>]*>([\\s\\S]*?)</span>`,
            "gi"
          );
        return html
          .replace(styleMatch("1\\.75em"), '<h1 style="display:inline">$1</h1>')
          .replace(styleMatch("1\\.35em"), '<h2 style="display:inline">$1</h2>')
          .replace(styleMatch("1\\.1em"), '<h3 style="display:inline">$1</h3>');
      };

      // Helper: load HTML via clipboard.convert to avoid innerHTML proliferation of br tags
      const setHtmlContent = (html) => {
        const normalized = normalizeHeadingHtml(normalizeQuillHtmlOutput(html));
        try {
          const delta = editor.clipboard?.convert?.({ html: normalized });
          if (delta && editor.setContents) {
            editor.setContents(delta);
            return;
          }
        } catch {
          /* fallback to innerHTML */
        }
        try {
          editor.root.innerHTML = normalized;
        } catch (htmlError) {
          console.error("Failed to set HTML in Quill editor:", htmlError);
        }
      };

      // Set initial content — when valueFormat is "html", we only use HTML; delta is normalized to HTML
      if (value) {
        if (isHtmlFormat && isHtmlString(value)) {
          setHtmlContent(value);
        } else if (isHtmlFormat && isDeltaString(value)) {
          // Backend sent delta; load it — text-change will fire and we'll emit HTML (normalize to simple HTML)
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
              editor.setContents(parsed);
              // Normalize: push HTML to parent so stored value is always simple HTML
              changeCallbackRef.current(editor.root.innerHTML);
            }
          } catch {
            // ignore
          }
        } else if (!isHtmlFormat) {
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
              editor.setContents(parsed);
            } else {
              const textValue =
                typeof value === "string" ? value : String(value || "");
              if (textValue.trim() !== "") editor.setText(textValue);
            }
          } catch {
            const textValue =
              typeof value === "string" ? value : String(value || "");
            if (textValue.trim() !== "") {
              try {
                editor.setText(textValue);
              } catch (error) {
                try {
                  editor.root.innerHTML = textValue;
                } catch (htmlError) {
                  console.error("Failed to set HTML in Quill editor:", htmlError);
                }
              }
            }
          }
        } else {
          const textValue =
            typeof value === "string" ? value : String(value || "");
          if (textValue.trim() !== "") {
            try {
              editor.setText(textValue);
            } catch (error) {
              try {
                editor.root.innerHTML = textValue;
              } catch (htmlError) {
                console.error("Failed to set HTML in Quill editor:", htmlError);
              }
            }
          }
        }
      }

      // Emit simple HTML when valueFormat is "html", else delta
      // Normalize output to prevent <p><br></p> proliferation on auto-save cycles
      editor.on("text-change", () => {
        if (valueFormatRef.current === "html") {
          changeCallbackRef.current(normalizeQuillHtmlOutput(editor.root.innerHTML));
        } else {
          changeCallbackRef.current(JSON.stringify(editor.getContents()));
        }
      });

      editor.on("selection-change", (range, _oldRange, source) => {
        const callback = selectionCallbackRef.current;
        if (!callback || source !== "user") return;

        if (range && range.length > 0) {
          const bounds = editor.getBounds(range.index, range.length);
          const editorElement = editorRef.current;
          const editorRect = editorElement
            ? editorElement.getBoundingClientRect()
            : null;
          const absolutePosition =
            editorRect && typeof window !== "undefined"
              ? {
                top: editorRect.top + bounds.bottom + window.scrollY,
                left: editorRect.left + bounds.left + window.scrollX,
              }
              : null;

          callback({
            text: editor.getText(range.index, range.length),
            bounds,
            range,
            editorRect,
            absolutePosition,
            editor,
          });
        } else {
          callback(null);
        }
      });

      const handleEditorFocus = () => {
        isFocusedRef.current = true;
      };

      const handleEditorBlur = () => {
        isFocusedRef.current = false;
        const callback = blurCallbackRef.current;
        if (callback) {
          callback();
        }
      };

      blurHandlerRef.current = handleEditorBlur;
      const editorRoot = editor.root;
      editorRoot.addEventListener("focus", handleEditorFocus);
      editorRoot.addEventListener("blur", handleEditorBlur);

      quillEditorRef.current = editor;
    };

    initEditor();

    // Cleanup
    return () => {
      const editor = quillEditorRef.current;

      if (editor && blurHandlerRef.current) {
        const editorRoot = editor.root;
        editorRoot.removeEventListener("blur", blurHandlerRef.current);
        blurHandlerRef.current = null;
        quillEditorRef.current = null;
      }

      const editorElement = editorRef.current;
      const toolbarElement = toolbarRef.current;
      if (editorElement) editorElement.innerHTML = "";
      if (toolbarElement) toolbarElement.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync editor when value prop changes (e.g. navigating to a different screen).
  // Skip while the editor is focused — the user is actively typing and their local state is the source of truth.
  useEffect(() => {
    if (valueFormat !== "html" || !quillEditorRef.current) return;
    if (isFocusedRef.current) return;
    const editor = quillEditorRef.current;
    const raw = typeof value === "string" ? value : "";
    if (!raw.trim()) return;

    const isHtmlString =
      raw.trim().length > 0 && raw.trim().startsWith("<");
    const isDeltaString =
      raw.trim().length > 0 && raw.trim().startsWith("{");

    if (isDeltaString) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.ops && Array.isArray(parsed.ops)) {
          const next = JSON.stringify(parsed.ops);
          const cur = JSON.stringify(editor.getContents().ops || []);
          if (next !== cur) {
            editor.setContents(parsed);
          }
        }
      } catch {
        /* ignore */
      }
      return;
    }

    if (isHtmlString) {
      let html = raw
        .replace(/<span style="[^"]*font-size:\s*1\.75em[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<h1 style="display:inline">$1</h1>')
        .replace(/<span style="[^"]*font-size:\s*1\.35em[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<h2 style="display:inline">$1</h2>')
        .replace(/<span style="[^"]*font-size:\s*1\.1em[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '<h3 style="display:inline">$1</h3>');
      const normalized = normalizeQuillHtmlOutput(html);
      const currentHtml = editor.root.innerHTML;
      if (currentHtml !== normalized) {
        try {
          const delta = editor.clipboard?.convert?.({ html: normalized });
          if (delta && editor.setContents) {
            editor.setContents(delta);
          } else {
            editor.root.innerHTML = normalized;
          }
        } catch {
          editor.root.innerHTML = normalized;
        }
      }
      return;
    }

    // Plain text (common for Kyper `body` updates)
    const plain = raw.replace(/\r\n/g, "\n");
    const currentText = editor.getText().replace(/\n$/, "");
    if (currentText !== plain) {
      editor.setText(plain);
    }
  }, [valueFormat, value]);

  return (
    <div className="mb-4">
      <div className="mb-2">
        <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      </div>
      {/*Editor Area */}
      <div className="bg-gray-100 rounded-lg p-0.5">
        <div
          ref={editorRef}
          className="h-[76px] border rounded-lg bg-white [&_.ql-editor]:font-sans [&_.ql-editor]:text-sm [&_.ql-editor]:text-black [&_.ql-editor]:min-h-[76px]"
          style={{ fontFamily: "inherit" }}
        />

        {/* Custom toolbar container - mousedown preventDefault keeps editor focus so format applies to selection only */}
        <style>{`
          /* Reset h1/h2/h3 spacing in editor so inline headings don't add extra space */
          .ql-editor h1, .ql-editor h2, .ql-editor h3 {
            margin: 0;
            padding: 0;
            display: inline;
          }
          .rich-text-toolbar .ql-heading1,
          .rich-text-toolbar .ql-heading2,
          .rich-text-toolbar .ql-heading3 {
            color: #444;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 500;
            float: none;
            width: 28px;
            height: 24px;
            padding: 3px 5px;
          }
          .rich-text-toolbar .ql-heading1:hover,
          .rich-text-toolbar .ql-heading2:hover,
          .rich-text-toolbar .ql-heading3:hover,
          .rich-text-toolbar .ql-heading1.ql-active,
          .rich-text-toolbar .ql-heading2.ql-active,
          .rich-text-toolbar .ql-heading3.ql-active {
            color: #06c;
          }
          .ql-editor p{ margin-bottom: 10px;}
        `}</style>
        <div
          ref={toolbarRef}
          className="rich-text-toolbar ql-toolbar ql-snow p-1 flex gap-1 items-center flex-wrap border-0"
          style={{ border: "none" }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button type="button" className="ql-bold" title="Bold" />
          <button type="button" className="ql-italic" title="Italic" />
          <button type="button" className="ql-underline" title="Underline" />
          <button type="button" className="ql-heading1" title="Heading 1 (selected text)">H1</button>
          <button type="button" className="ql-heading2" title="Heading 2 (selected text)">H2</button>
          <button type="button" className="ql-heading3" title="Heading 3 (selected text)">H3</button>
          <button type="button" className="ql-list" value="bullet" title="Bulleted List" />
          <button type="button" className="ql-list" value="ordered" title="Numbered List" />
          <button type="button" className="ql-strike" title="Strikethrough" />
          <button type="button" className="ql-link" title="Link" />
          <button type="button" className="ql-image" title="Image" />
          <button type="button" className="ql-undo" title="Undo" />
          <button type="button" className="ql-redo" title="Redo" />
        </div>
      </div>
    </div>
  );
};
