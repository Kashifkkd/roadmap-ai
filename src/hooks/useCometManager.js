"use client";

import { useState, useEffect } from "react";

export function useCometManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [screens, setScreens] = useState([]);
  const [chapters, setChapters] = useState([
    {
      id: "chapter-0",
      name: "Introduction to Web Development",
      order: 0,
      steps: [
        { id: "step-1", name: "What is Web Development?" },
        { id: "step-2", name: "Course Overview" },
        { id: "step-3", name: "Getting Started" },
      ],
    },
    {
      id: "chapter-1",
      name: "HTML Fundamentals",
      order: 1,
      steps: [
        { id: "step-4", name: "HTML Basics" },
        { id: "step-5", name: "HTML Structure" },
        { id: "step-6", name: "Forms and Input" },
      ],
    },
    {
      id: "chapter-2",
      name: "CSS Styling",
      order: 2,
      steps: [
        { id: "step-7", name: "CSS Introduction" },
        { id: "step-8", name: "Layout and Flexbox" },
        { id: "step-9", name: "Responsive Design" },
      ],
    },
    {
      id: "chapter-3",
      name: "JavaScript Essentials",
      order: 3,
      steps: [
        { id: "step-10", name: "JavaScript Basics" },
        { id: "step-11", name: "DOM Manipulation" },
        { id: "step-12", name: "Event Handling" },
      ],
    },
    {
      id: "chapter-4",
      name: "Advanced Topics",
      order: 4,
      steps: [
        { id: "step-13", name: "APIs and Fetch" },
        { id: "step-14", name: "Async/Await" },
        { id: "step-15", name: "Project Building" },
      ],
    },
  ]);


  useEffect(() => {
    const sampleScreens = [
      {
        id: "screen-1",
        name: "Screen 1",
        title: "Welcome to the Course",
        type: "content",
        chapterId: "chapter-0",
        stepId: 1,
        easeCategories: ["Engagement"],
        formData: {
          heading: "Welcome!",
          bodyContent: "This is the introduction to our course.",
          imageUrl: "",
        },
        order: 0,
      },
      {
        id: "screen-2",
        name: "Screen 2",
        title: "Learning Objectives",
        type: "content",
        chapterId: "chapter-0",
        stepId: 2,
        easeCategories: ["Support"],
        formData: {
          heading: "What You'll Learn",
          bodyContent: "By the end of this course, you will be able to...",
          imageUrl: "",
        },
        order: 1,
      },
    ];
    setScreens(sampleScreens);
  }, []);

  const updateScreen = (screenId, updatedScreen) => {
    setScreens((prevScreens) =>
      prevScreens.map((screen) =>
        screen.id === screenId ? updatedScreen : screen
      )
    );
  };

  const addScreen = (newScreen) => {
    setScreens((prevScreens) => [...prevScreens, newScreen]);
  };

  const deleteScreen = (screenId) => {
    setScreens((prevScreens) =>
      prevScreens.filter((screen) => screen.id !== screenId)
    );
  };

  const reorderScreensList = (newOrder) => {
    setScreens(newOrder);
  };

  const insertScreenAt = (newScreen, index) => {
    setScreens((prevScreens) => {
      const newScreens = [...prevScreens];
      newScreens.splice(index, 0, newScreen);
      return newScreens;
    });
  };

  return {
    isLoading,
    screens,
    chapters,
    updateScreen,
    addScreen,
    deleteScreen,
    reorderScreensList,
    insertScreenAt,
  };
}
