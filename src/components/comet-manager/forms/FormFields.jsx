import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2 } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// Form field components for comet manager forms

export const SectionHeader = ({ title }) => (
  <div className="w-full mb-4">
    <div className="h-2 bg-primary rounded mb-4" />
    <h3 className="text-sm font-semibold text-primary">{title}</h3>
  </div>
);

export const TextField = ({ label, value, onChange, placeholder = "" }) => (
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
}) => (
  <div className="mb-4">
    <Label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </Label>
    <div className="space-y-2">
      {(items || []).map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            type="text"
            value={item}
            onChange={(e) => onUpdate(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            onClick={() => onRemove(index)}
            className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      <Button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 text-background rounded-lg"
      >
        <Plus size={16} />
        {buttonText}
      </Button>
    </div>
  </div>
);

export const RichTextArea = ({ label, value, onChange }) => {
  const quillEditorRef = useRef(null);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (quillEditorRef.current || !editorRef.current || !toolbarRef.current)
      return;

    //custom toolbar
    const editor = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarRef.current,
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

    quillEditorRef.current = editor;

    // Cleanup
    return () => {
      quillEditorRef.current = null;
      if (editorRef.current) editorRef.current.innerHTML = "";
      if (toolbarRef.current) toolbarRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      {/* Custom toolbar container */}
      <div ref={toolbarRef} className="mb-2 border rounded p-1 flex gap-1">
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
      {/*Editor Area */}
      <div ref={editorRef} className="h-96 border rounded p-2" />
    </div>
  );
};
