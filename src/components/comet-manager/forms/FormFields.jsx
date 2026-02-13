"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2, GripVertical, CircleCheck, CircleX } from "lucide-react";
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
}) => (
  <div className="mb-4">
    <Label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </Label>
    <Input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...inputProps}
    />
  </div>
);

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  inputProps = {},
}) => (
  <div className="mb-4">
    <Label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </Label>
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...inputProps}
    />
  </div>
);

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
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex gap-2 ${draggedIndex === index ? "opacity-50" : ""
                }`}
            >
              <div
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

/** When "html", value is always simple HTML for backend; delta is normalized to HTML on load. */
export const RichTextArea = ({
  label,
  value,
  onChange,
  onSelectionChange,
  onBlur,
  valueFormat = "delta",
}) => {
  const quillEditorRef = useRef(null);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const selectionCallbackRef = useRef(onSelectionChange);
  const blurCallbackRef = useRef(onBlur);
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

      const editorElement = editorRef.current;
      const toolbarElement = toolbarRef.current;

      if (!editorElement || !toolbarElement || quillEditorRef.current) return;

      const editor = new Quill(editorElement, {
        theme: "snow",
        modules: {
          toolbar: toolbarElement,
        },
      });

      // Set initial content — when valueFormat is "html", we only use HTML; delta is normalized to HTML
      if (value) {
        if (isHtmlFormat && isHtmlString(value)) {
          try {
            editor.root.innerHTML = value;
          } catch (htmlError) {
            console.error("Failed to set HTML in Quill editor:", htmlError);
          }
        } else if (isHtmlFormat && isDeltaString(value)) {
          // Backend sent delta; load it — text-change will fire and we'll emit HTML (normalize to simple HTML)
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
              editor.setContents(parsed);
              // Normalize: push HTML to parent so stored value is always simple HTML
              onChange(editor.root.innerHTML);
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
      editor.on("text-change", () => {
        if (valueFormatRef.current === "html") {
          onChange(editor.root.innerHTML);
        } else {
          onChange(JSON.stringify(editor.getContents()));
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

      const handleEditorBlur = () => {
        const callback = blurCallbackRef.current;
        if (callback) {
          callback();
        }
      };

      blurHandlerRef.current = handleEditorBlur;
      const editorRoot = editor.root;
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

  // When valueFormat is "html", sync editor when value prop changes (e.g. after delta→HTML normalization)
  useEffect(() => {
    if (valueFormat !== "html" || !value || !quillEditorRef.current) return;
    const editor = quillEditorRef.current;
    const html = typeof value === "string" ? value : "";
    if (html.trim().startsWith("<") && editor.root.innerHTML !== html) {
      editor.root.innerHTML = html;
    }
  }, [valueFormat, value]);

  return (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      {/*Editor Area */}
      <div className="bg-gray-100 rounded-lg p-0.5">
        <div
          ref={editorRef}
          className="h-[76px] border rounded-lg bg-white [&_.ql-editor]:font-sans [&_.ql-editor]:text-sm [&_.ql-editor]:text-black [&_.ql-editor]:min-h-[76px]"
          style={{ fontFamily: "inherit" }}
        />

        {/* Custom toolbar container */}
        <div
          ref={toolbarRef}
          className="p-1 flex gap-1"
          style={{ border: "none" }}
        >
          <button className="ql-bold" title="Bold" />
          <button className="ql-italic" title="Italic" />
          <button className="ql-underline" title="Underline" />
          <button className="ql-strike" title="Strikethrough" />
          <button className="ql-header" value="1" title="Paragraph" />
          <button className="ql-link" title="Link" />
          <button className="ql-image" title="Image" />
          <button className="ql-undo" title="Undo" />
          <button className="ql-redo" title="Redo" />
        </div>
      </div>
    </div>
  );
};
