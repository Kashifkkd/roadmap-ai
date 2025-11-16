import React, { useRef, useEffect } from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, GripVertical } from "lucide-react";
// import Quill from "quill";
// import "quill/dist/quill.snow.css";

// Custom RichTextArea for Assessment Form with specific toolbar
// const AssessmentRichTextArea = ({ label, value, onChange }) => {
//   const quillEditorRef = useRef(null);
//   const editorRef = useRef(null);
//   const toolbarRef = useRef(null);

//   useEffect(() => {
//     if (quillEditorRef.current || !editorRef.current || !toolbarRef.current)
//       return;

//     const editor = new Quill(editorRef.current, {
//       theme: "snow",
//       modules: {
//         toolbar: toolbarRef.current,
//       },
//     });

//     if (value) {
//       try {
//         editor.setContents(JSON.parse(value));
//       } catch {
//         editor.setText(value);
//       }
//     }

//     editor.on("text-change", () => {
//       onChange(JSON.stringify(editor.getContents()));
//     });

//     quillEditorRef.current = editor;

//     return () => {
//       quillEditorRef.current = null;
//       if (editorRef.current) editorRef.current.innerHTML = "";
//       if (toolbarRef.current) toolbarRef.current.innerHTML = "";
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="mb-4">
//       <Label className="block text-sm font-medium text-primary mb-2">
//         {label}
//       </Label>
//       {/* Custom toolbar container */}
//       <div ref={toolbarRef} className="mb-2 border rounded p-1 flex gap-1">
//         <button className="ql-bold" title="Bold" />
//         <button className="ql-italic" title="Italic" />
//         <button className="ql-underline" title="Underline" />
//         <button className="ql-strike" title="Strikethrough" />
//         <button className="ql-list" value="bullet" title="Bullet List" />
//         <button className="ql-list" value="ordered" title="Numbered List" />
//         <button className="ql-link" title="Link" />
//         <button className="ql-image" title="Image" />
//         <button className="ql-code-block" title="Code Block" />
//       </div>
//       {/* Editor Area */}
//       <div
//         ref={editorRef}
//         className="min-h-[120px] border rounded p-2 bg-gray-50"
//       />
//     </div>
//   );
// };

export default function AssessmentForm({
  formData,
  updateField,
  addListItem,
  updateListItem,
  removeListItem,
  askKyperHandlers = {},
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;
  const questions = formData.assessmentQuestions || [
    {
      title: "",
      questions: [],
      options: [],
    },
  ];

  const updateQuestionField = () => {
    console.log("updateQuestionField");
  };

  const addQuestion = () => {
    console.log("addQuestion");
  };

  const removeQuestion = () => {
    console.log("removeQuestion");
  };

  const addOption = (questionIndex) => {
    console.log("addOption");
  };

  const updateOption = () => {
    console.log("updateOption");
  };

  const removeOption = () => {
    console.log("removeOption");
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Self Assessment" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <div className="space-y-6">
          {questions.map((questionData, questionIndex) => (
            <div
              key={questionIndex}
              className=" border-primary rounded-lg p-4 bg-white"
            >
              {/* Title Field */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-primary mb-2">
                  Title
                </Label>
                <Input
                  type="text"
                  value={questionData.title || ""}
                  onChange={(e) =>
                    updateQuestionField(questionIndex, "title", e.target.value)
                  }
                  placeholder="Enter title"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onSelect={(event) =>
                    onTextFieldSelect?.(
                      "assessmentTitle",
                      event,
                      questionData.title
                    )
                  }
                  onBlur={onFieldBlur}
                />
              </div>

              {/* Question Field with Rich Text Editor */}
              {/* <AssessmentRichTextArea
              label="Question"
              value={questionData.text || ""}
              onChange={(value) =>
                updateQuestionField(questionIndex, "question", value)
              }
            /> */}
              <RichTextArea
                label="Question"
                value={questionData.question || ""}
                onChange={(value) =>
                  updateQuestionField(questionIndex, "question", value)
                }
                onSelectionChange={(selectionInfo) =>
                  onRichTextSelection?.(
                    "assessmentQuestions",
                    selectionInfo,
                    questionData.question
                  )
                }
                onBlur={onRichTextBlur}
              />

              {/* Options Section */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-primary mb-2">
                  Options
                </Label>
                <div className="space-y-2">
                  {(questionData.options || []).map((option, optionIndex) => (
                    <div
                      key={option?.option_id}
                      className="flex items-center gap-2"
                    >
                      {/* Drag Handle */}
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                      </div>

                      {/* Numbered Box */}
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-300 rounded text-sm font-medium text-gray-700">
                        {optionIndex + 1}
                      </div>

                      {/* Option Input */}
                      <Input
                        type="text"
                        value={option?.text || ""}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />

                      {/* Delete Button */}
                      <Button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Option Button */}
                <Button
                  type="button"
                  onClick={() => addOption(questionIndex)}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary hover:bg-primary-100 rounded-lg font-medium"
                >
                  <Plus size={16} />
                  Add Option
                </Button>
              </div>

              {/* Add Question Button - only show on last question */}
              {questionIndex === questions.length - 1 && (
                <Button
                  type="button"
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary hover:bg-primary-100 rounded-lg font-medium"
                >
                  <Plus size={16} />
                  Add Question
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
