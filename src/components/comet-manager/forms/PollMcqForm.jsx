import React, { useEffect, useState, useRef } from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  ListField,
} from "./FormFields";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

// Helper to generate unique IDs
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to extract plain text from Quill delta JSON
const extractPlainTextFromDelta = (value) => {
  if (value == null) return "";
  if (typeof value !== "string") return value;
  if (value.trim() === "") return value;
  
  if (value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
        return parsed.ops
          .map((op) => (op.insert && typeof op.insert === "string" ? op.insert : ""))
          .join("");
      }
    } catch {
      // Not valid JSON, return as-is
    }
  }
  return value;
};

export default function PollMcqForm({
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

  const isInitializedRef = useRef(false);
  const updateFieldRef = useRef(updateField);
  
  // Keep updateField ref updated
  useEffect(() => {
    updateFieldRef.current = updateField;
  }, [updateField]);

  // Initialize questions from formData - only once on mount
  // Use formData directly in the initializer, not a ref
  const getInitialQuestions = (data) => {
    // If formData has a single question, convert it to questions array
    if (data.question && (!data.questions || data.questions.length === 0)) {
      // Keep the original format (could be delta or plain text)
      return [{
        question_id: generateId("q"),
        text: data.question,
        options: data.options || [],
      }];
    } else if (data.questions && data.questions.length > 0) {
      return data.questions;
    } else {
      // Initialize with one empty question
      return [{
        question_id: generateId("q"),
        text: "",
        options: [],
      }];
    }
  };

  const [questions, setQuestions] = useState(() => getInitialQuestions(formData));

  // Mark as initialized after first render
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }
  }, []);

  // Sync questions back to formData - only when questions actually change
  // Use a ref to prevent infinite loops
  const prevQuestionsRef = useRef(JSON.stringify(questions));
  
  useEffect(() => {
    const currentQuestionsStr = JSON.stringify(questions);
    if (prevQuestionsRef.current === currentQuestionsStr) {
      return; // No change, skip update
    }
    
    prevQuestionsRef.current = currentQuestionsStr;
    
    if (questions.length > 0) {
      // If single question, update question and options fields
      if (questions.length === 1) {
        updateFieldRef.current("question", questions[0].text);
        updateFieldRef.current("options", questions[0].options || []);
      } else {
        // Multiple questions - store in questions field
        updateFieldRef.current("questions", questions);
      }
    }
  }, [questions]);

  // Normalize options to object format
  const normalizeOptions = (options) => {
    if (!Array.isArray(options)) return [];
    return options.map((opt, index) => {
      if (typeof opt === "string") {
        return {
          option_id: generateId("o"),
          text: opt,
          is_correct: false,
        };
      }
      return {
        option_id: opt.option_id || generateId("o"),
        text: opt.text || opt.label || "",
        is_correct: opt.is_correct !== undefined ? opt.is_correct : false,
        answer_counts: opt.answer_counts || 0,
      };
    });
  };


  // Add a new question
  const handleAddQuestion = () => {
    const newQuestion = {
      question_id: generateId("q"),
      text: "",
      options: [{
        option_id: generateId("o"),
        text: "",
        is_correct: false,
      }],
    };
    setQuestions([...questions, newQuestion]);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Multiple Choice/Survey" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("mcqTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />
        
        {questions.map((question, qIndex) => {
          const questionOptions = normalizeOptions(question.options || []);
          
          // Update option handlers for this specific question
          const handleUpdateOptionForQuestion = (index, value) => {
            const updatedOptions = [...questionOptions];
            if (typeof updatedOptions[index] === "string") {
              updatedOptions[index] = {
                option_id: generateId("o"),
                text: value,
                is_correct: false,
              };
            } else {
              updatedOptions[index] = {
                ...updatedOptions[index],
                text: value,
              };
            }
            
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex] = {
              ...updatedQuestions[qIndex],
              options: updatedOptions,
            };
            setQuestions(updatedQuestions);
            
            if (qIndex === 0 && questions.length === 1) {
              updateField("options", updatedOptions);
            }
          };

          const handleRemoveOptionForQuestion = (index) => {
            const updatedOptions = questionOptions.filter((_, i) => i !== index);
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex] = {
              ...updatedQuestions[qIndex],
              options: updatedOptions,
            };
            setQuestions(updatedQuestions);
            
            if (qIndex === 0 && questions.length === 1) {
              updateField("options", updatedOptions);
            }
          };

          const handleReorderOptionsForQuestion = (draggedIndex, dropIndex) => {
            const updatedOptions = [...questionOptions];
            const draggedOption = updatedOptions[draggedIndex];
            updatedOptions.splice(draggedIndex, 1);
            updatedOptions.splice(dropIndex, 0, draggedOption);
            
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex] = {
              ...updatedQuestions[qIndex],
              options: updatedOptions,
            };
            setQuestions(updatedQuestions);
            
            if (qIndex === 0 && questions.length === 1) {
              updateField("options", updatedOptions);
            }
          };

          const handleToggleCorrectForQuestion = (index, isCorrect) => {
            const updatedOptions = [...questionOptions];
            if (typeof updatedOptions[index] === "string") {
              updatedOptions[index] = {
                option_id: generateId("o"),
                text: updatedOptions[index],
                is_correct: isCorrect,
              };
            } else {
              updatedOptions[index] = {
                ...updatedOptions[index],
                is_correct: isCorrect,
              };
            }
            
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex] = {
              ...updatedQuestions[qIndex],
              options: updatedOptions,
            };
            setQuestions(updatedQuestions);
            
            if (qIndex === 0 && questions.length === 1) {
              updateField("options", updatedOptions);
            }
          };

          const handleAddOptionForQuestion = () => {
            const newOption = {
              option_id: generateId("o"),
              text: "",
              is_correct: false,
            };
            const updatedOptions = [...questionOptions, newOption];
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex] = {
              ...updatedQuestions[qIndex],
              options: updatedOptions,
            };
            setQuestions(updatedQuestions);
            
            if (qIndex === 0 && questions.length === 1) {
              updateField("options", updatedOptions);
            }
          };

          return (
            <div key={question.question_id || qIndex} className="mb-4">
              <RichTextArea
                label={qIndex === 0 ? "Question" : `Question ${qIndex + 1}`}
                value={question.text || ""}
                onChange={(value) => {
                  // RichTextArea provides delta format, but we need to extract plain text for the form field
                  const plainText = extractPlainTextFromDelta(value);
                  const updatedQuestions = [...questions];
                  updatedQuestions[qIndex] = {
                    ...updatedQuestions[qIndex],
                    text: value, // Store delta format in state for RichTextArea
                  };
                  setQuestions(updatedQuestions);
                  if (qIndex === 0) {
                    // Update form field with plain text (as expected by DynamicForm)
                    updateField("question", plainText);
                  }
                }}
                onSelectionChange={(selectionInfo) =>
                  onRichTextSelection?.(
                    "mcqQuestion",
                    selectionInfo,
                    question.text
                  )
                }
                onBlur={onRichTextBlur}
              />
              
              <ListField
                label="Poll Options"
                items={questionOptions}
                onUpdate={handleUpdateOptionForQuestion}
                onRemove={handleRemoveOptionForQuestion}
                onReorder={handleReorderOptionsForQuestion}
                onToggleCorrect={handleToggleCorrectForQuestion}
                showCorrectAnswer={true}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleAddOptionForQuestion}
                  className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
                >
                  <Plus size={16} />
                  Add Option
                </Button>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-2 mt-4">
          <Button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
          >
            <Plus size={16} />
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
}
