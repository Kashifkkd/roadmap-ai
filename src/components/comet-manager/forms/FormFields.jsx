"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2, GripVertical, CircleCheck, CircleX } from "lucide-react";
import "quill/dist/quill.snow.css";

// Form field components for comet manager forms

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
  buttonText,
  showCorrectAnswer = false,
}) => (
  <div className="mb-4">
    <Label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </Label>
    <div className="space-y-2">
      {(items || []).map((item, index) => (
        <div key={index} className="flex gap-2">
          <div className="cursor-move text-gray-400 h-10 w-10 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center">
            <GripVertical size={18} />
          </div>
          <span className="text-xs font-medium w-14 h-10 bg-gray-100 border  rounded-lg flex items-center justify-center text-gray-700">
            {index + 1}
          </span>
          {showCorrectAnswer && (
            <div className="flex items-center justify-center gap-x-1">
              <div className="cursor-pointer h-10 w-10 flex items-center justify-center bg-green-100 rounded-lg">
                <CircleCheck size={18} className="text-green-500" />
              </div>
              <div className="cursor-pointer h-10 w-10 rounded-lg flex items-center justify-center bg-red-100">
                <CircleX size={18} className="text-red-500" />
              </div>
            </div>
          )}
          <Input
            type="text"
            value={
              typeof item === "object" && item !== null
                ? item.text || item.label || ""
                : item || ""
            }
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
      ))}
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

export const RichTextArea = ({
  label,
  value,
  onChange,
  onSelectionChange,
  onBlur,
}) => {
  const quillEditorRef = useRef(null);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const selectionCallbackRef = useRef(onSelectionChange);
  const blurCallbackRef = useRef(onBlur);
  const blurHandlerRef = useRef(null);

  useEffect(() => {
    selectionCallbackRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    blurCallbackRef.current = onBlur;
  }, [onBlur]);

  useEffect(() => {
    if (quillEditorRef.current || !editorRef.current || !toolbarRef.current)
      return;

    // Dynamically import Quill only on client side
    const initEditor = async () => {
      if (typeof window === "undefined") return;

      const QuillModule = await import("quill");
      const Quill = QuillModule.default;

      //custom toolbar
      const editorElement = editorRef.current;
      const toolbarElement = toolbarRef.current;

      if (!editorElement || !toolbarElement || quillEditorRef.current) return;

      const editor = new Quill(editorElement, {
        theme: "snow",
        modules: {
          toolbar: toolbarElement,
        },
      });

      // Set initial content
      if (value) {
        try {
          editor.setContents(JSON.parse(value));
        } catch {
          editor.setText(value);
        }
      }

      // Handle content change
      editor.on("text-change", () => {
        onChange(JSON.stringify(editor.getContents()));
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

  return (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      {/*Editor Area */}
      <div className="bg-gray-100 rounded-lg p-0.5">
        <div ref={editorRef} className="h-96 border rounded-lg bg-white p-2" />

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
