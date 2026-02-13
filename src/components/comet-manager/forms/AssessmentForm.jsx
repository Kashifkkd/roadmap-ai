import React, { useEffect, useState } from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, GripVertical } from "lucide-react";

// Helper to generate unique IDs
export const generateId = (prefix) => {
  return `${prefix}_${new Date().getTime()}`;
};

// OptionList component with drag and drop functionality
const OptionList = ({
  questionIndex,
  options,
  updateOption,
  removeOption,
  reorderOptions,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

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

    reorderOptions(questionIndex, draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {options.map((option, optionIndex) => (
        <div
          key={option?.option_id || option?.optionId || optionIndex}
          draggable
          onDragStart={(e) => handleDragStart(e, optionIndex)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, optionIndex)}
          className={`flex items-center gap-2 ${
            draggedIndex === optionIndex ? "opacity-50" : ""
          }`}
        >
          {/* Drag Handle */}
          <div className="cursor-move text-gray-400 hover:text-gray-600 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">
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
              updateOption(questionIndex, optionIndex, e.target.value)
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
  );
};
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
  // Get questions from formData - it's stored as 'questions' in content
  const questions = formData.questions || [];
  const assessmentTitle = formData.title || "";

  // If questions array is empty, initialize with one default question with one default option
  useEffect(() => {
    if (!questions || questions.length === 0) {
      const defaultQuestion = {
        question_id: generateId("q"),
        text: "",
        options: [
          {
            option_id: generateId("o"),
            text: "",
          },
        ],
      };
      updateField("questions", [defaultQuestion]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update assessment title
  const updateTitle = (value) => {
    updateField("title", value);
  };

  // Update question text
  const updateQuestionField = (questionIndex, field, value) => {
    if (!addListItem || !updateListItem) return;

    const currentQuestions = [...questions];
    if (!currentQuestions[questionIndex]) {
      // Create new question if it doesn't exist
      currentQuestions[questionIndex] = {
        question_id: generateId("q"),
        text: "",
        options: [],
      };
    }

    const updatedQuestion = {
      ...currentQuestions[questionIndex],
      [field]: value,
    };

    currentQuestions[questionIndex] = updatedQuestion;
    updateField("questions", currentQuestions);
  };

  // Add a new question with one default option
  const addQuestion = () => {
    if (!addListItem) return;
    const newQuestion = {
      question_id: generateId("q"),
      text: "",
      options: [
        {
          option_id: generateId("o"),
          text: "",
        },
      ],
    };
    const updatedQuestions = [...questions, newQuestion];
    updateField("questions", updatedQuestions);
  };

  // Remove a question
  const removeQuestion = (questionIndex) => {
    if (!removeListItem) return;
    const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
    updateField("questions", updatedQuestions);
  };

  // Add an option to a question
  const addOption = (questionIndex) => {
    if (!addListItem) return;
    const currentQuestions = [...questions];
    if (!currentQuestions[questionIndex]) {
      currentQuestions[questionIndex] = {
        question_id: generateId("q"),
        text: "",
        options: [],
      };
    }

    const currentOptions = currentQuestions[questionIndex].options || [];
    const newOption = {
      option_id: generateId("o"),
      text: "",
    };

    currentQuestions[questionIndex] = {
      ...currentQuestions[questionIndex],
      options: [...currentOptions, newOption],
    };

    updateField("questions", currentQuestions);
  };

  // Update an option text
  const updateOption = (questionIndex, optionIndex, value) => {
    if (!updateListItem) return;
    const currentQuestions = [...questions];
    if (!currentQuestions[questionIndex]) return;

    const currentOptions = [...(currentQuestions[questionIndex].options || [])];
    if (!currentOptions[optionIndex]) {
      currentOptions[optionIndex] = {
        option_id: generateId("o"),
        text: "",
      };
    }

    currentOptions[optionIndex] = {
      ...currentOptions[optionIndex],
      text: value,
    };

    currentQuestions[questionIndex] = {
      ...currentQuestions[questionIndex],
      options: currentOptions,
    };

    updateField("questions", currentQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex, optionIndex) => {
    if (!removeListItem) return;
    const currentQuestions = [...questions];
    if (!currentQuestions[questionIndex]) return;

    const currentOptions = currentQuestions[questionIndex].options || [];
    const updatedOptions = currentOptions.filter((_, index) => index !== optionIndex);

    currentQuestions[questionIndex] = {
      ...currentQuestions[questionIndex],
      options: updatedOptions,
    };

    updateField("questions", currentQuestions);
  };

  // Reorder options within a question
  const reorderOptions = (questionIndex, draggedIndex, dropIndex) => {
    const currentQuestions = [...questions];
    if (!currentQuestions[questionIndex]) return;

    const currentOptions = [...(currentQuestions[questionIndex].options || [])];
    if (draggedIndex === dropIndex || draggedIndex < 0 || dropIndex < 0) return;

    const draggedOption = currentOptions[draggedIndex];
    currentOptions.splice(draggedIndex, 1);
    currentOptions.splice(dropIndex, 0, draggedOption);

    currentQuestions[questionIndex] = {
      ...currentQuestions[questionIndex],
      options: currentOptions,
    };

    updateField("questions", currentQuestions);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Self Assessment" />
      </div>
      {/* Assessment Title */}
      <div className="bg-white rounded-lg p-3 align-center mb-2">
        <Label className="block text-sm font-medium text-primary mb-2">
          Title
        </Label>

        <Input
          type="text"
          value={assessmentTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          onSelect={(event) =>
            onTextFieldSelect?.("assessmentTitle", event, assessmentTitle)
          }
          onBlur={onFieldBlur}
        />
      </div>

      <div className="space-y-6 bg-white rounded-lg mb-2">
        {questions.map((questionData, questionIndex) => (
          <div
            key={questionData.question_id || questionData.questionId || questionIndex}
            className=" border-primary rounded-lg p-4 bg-white"
          >
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
              value={questionData.text || questionData.question || ""}
              onChange={(value) =>
                updateQuestionField(questionIndex, "text", value)
              }
              onSelectionChange={(selectionInfo) =>
                onRichTextSelection?.(
                  "assessmentQuestions",
                  selectionInfo,
                  questionData.text || questionData.question
                )
              }
              onBlur={onRichTextBlur}
              valueFormat="html"
            />

            {/* Options Section */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-primary mb-2">
                Options
              </Label>
              <OptionList
                questionIndex={questionIndex}
                options={questionData.options || []}
                updateOption={updateOption}
                removeOption={removeOption}
                reorderOptions={reorderOptions}
              />

              {/* Add Option Button */}
              <Button
                type="button"
                onClick={() => addOption(questionIndex)}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-primary text-primary hover:bg-primary-50 rounded-lg font-medium"
              >
                <Plus size={16} />
                Add Option
              </Button>
            </div>

            {/* Remove Question Button */}
            {questions.length > 1 && (
              <Button
                type="button"
                onClick={() => removeQuestion(questionIndex)}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-red-50/60 text-red-600 hover:bg-red-100 rounded-lg font-medium"
              >
                <Trash2 size={16} />
                Remove Question
              </Button>
            )}
          </div>
        ))}

        {/* Add Question Button - always visible at the bottom */}
      </div>

      <div className="p-3 bg-white rounded-lg">

        <Button
          type="button"
          onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-primary text-primary hover:bg-primary-50 rounded-lg font-medium"
        >
          <Plus size={16} />
          Add Question
        </Button>
      </div>
    </div>
  );
}
