export const sampleSessionData = {
  session_id: "test-session-001",
  input_type: "path_creation",
  response_path: {
    chapters: [
      {
        id: 101,
        name: "Getting Started",
        position: 1,
        steps: [
          {
            position: 1,
            step: {
              id: 201,
              title: "Welcome and Overview",
              description:
                "An introduction to the learning path and what to expect.",
            },
            screens: [
              {
                id: 301,
                screenType: "content",
                position: 1,
                screenContents: {
                  id: 401,
                  contentType: "content",
                  content: {
                    heading: "Welcome to the Comet Manager",
                    body: "This short path will guide you through the basics with a few sample screens.",
                    media: {
                      type: "image",
                      url: "/screen-preview.png",
                    },
                    actionPoints: 5,
                  },
                },
                assets: [
                  {
                    url: "/screen-preview.png",
                  },
                ],
              },
              {
                id: 302,
                screenType: "poll",
                position: 2,
                screenContents: {
                  id: 402,
                  contentType: "mcq",
                  content: {
                    ptype: "mcq",
                    title: "Your Experience Level",
                    question: "How familiar are you with this tool?",
                    keyLearning: "We tailor content to your experience level.",
                    options: [
                      { optionId: 1, text: "New", isCorrect: false },
                      {
                        optionId: 2,
                        text: "Somewhat familiar",
                        isCorrect: false,
                      },
                      { optionId: 3, text: "Very familiar", isCorrect: false },
                    ],
                    actionPoints: 5,
                  },
                },
                assets: [],
              },
            ],
          },
          {
            position: 2,
            step: {
              id: 202,
              title: "First Actions",
              description: "A quick activity to try things out.",
            },
            screens: [
              {
                id: 303,
                screenType: "reflection",
                position: 1,
                screenContents: {
                  id: 403,
                  contentType: "reflection",
                  content: {
                    title: "What do you want to achieve?",
                    prompt:
                      "Write one thing you want to accomplish while testing this sample.",
                    actionPoints: 10,
                  },
                },
                assets: [],
              },
              {
                id: 304,
                screenType: "action",
                position: 2,
                screenContents: {
                  id: 404,
                  contentType: "action",
                  content: {
                    title: "Try Adding a Screen",
                    prompt:
                      "Use the UI to add a new screen to this step and see it appear in the list.",
                    text: "You can remove it later — this is just sample data.",
                    action_points: 15,
                    is_scheduled: false,
                    is_complete_now: true,
                    replyCount: 0,
                    votesCount: 0,
                    ImageUrl: "/screen-preview.png",
                    toolLink: null,
                    casual_document_id: null,
                  },
                },
                assets: [],
              },
            ],
          },
        ],
      },
      {
        id: 102,
        name: "Next Steps",
        position: 2,
        steps: [
          {
            position: 1,
            step: {
              id: 203,
              title: "Assessment Preview",
              description: "A short sample assessment screen.",
            },
            screens: [
              {
                id: 305,
                screenType: "assessment",
                position: 1,
                screenContents: {
                  id: 405,
                  contentType: "assessment",
                  content: {
                    title: "Quick Survey",
                    description: "Answer briefly to continue.",
                    questions: [
                      {
                        questionId: 501,
                        text: "This sample data is helpful for testing.",
                        options: [
                          { optionId: 1, text: "Strongly Disagree" },
                          { optionId: 2, text: "Disagree" },
                          { optionId: 3, text: "Neutral" },
                          { optionId: 4, text: "Agree" },
                          { optionId: 5, text: "Strongly Agree" },
                        ],
                        scale: {
                          lowLabel: "Strongly Disagree",
                          highLabel: "Strongly Agree",
                        },
                        actionPoints: 10,
                      },
                    ],
                  },
                },
                assets: [],
              },
            ],
          },
        ],
      },
    ],
  },
};
