export const temp = [
  {
    session_id: "6fce8c35-3d1d-4a7c-86b5-9aeb9e557067",
    input_type: "path_creation",
    comet_creation_data: {
      "Basic Information": {
        "Comet Title": "New Manager Essentials",
        Description:
          "A bite-sized learning path to help first-time managers ramp up quickly and lead their teams with confidence.",
      },
      "Audience & Objectives": {
        "Target Audience": "First-time or newly promoted managers",
        "Learning Objectives": [
          "Set clear goals and expectations with team members",
          "Run effective 1:1s and give constructive feedback",
          "Delegate tasks effectively and track progress",
          "Build trust and psychological safety",
        ],
      },
      "Experience Design": {
        Focus: "Learning new content",
        "Source Alignment": "Balanced",
        "Engagement Frequency": "Daily",
        Duration: "4 weeks - 2 microlearning steps per week",
        "Special Instructions":
          "Focus on practical scenarios for first-time managers. Include at least one interactive quiz and one downloadable tool template.",
      },
    },
    response_outline: [
      {
        chapter: "Foundations of Effective Management",
        steps: [
          {
            step: 1,
            title: "Discovering the Core Role of a Manager",
            aha: "Effective management is less about authority and more about enabling team success through clear responsibilities.",
            action:
              "Reflect on your current understanding of managerial duties and list three ways you can support your team better.",
            tool: "Managerial Role Checklist",
          },
          {
            step: 2,
            title: "Leadership Principles That Drive Teams",
            aha: "Leadership is about influence and inspiration, not just position or title.",
            action:
              "Identify a leader you admire and note the behaviors that make them effective; consider how to emulate these.",
            tool: "Leadership Behavior Self-Assessment",
          },
          {
            step: 3,
            title: "Balancing Authority and Empathy",
            aha: "Successful managers balance decisiveness with empathy to build trust and motivate their teams.",
            action:
              "Practice active listening in your next team interaction and observe the impact on engagement.",
            tool: "Active Listening Guide",
          },
        ],
      },
      {
        chapter: "Mastering Communication and Team Dynamics",
        steps: [
          {
            step: 4,
            title: "Communicating with Clarity and Purpose",
            aha: "Clear communication reduces misunderstandings and aligns team efforts toward shared goals.",
            action:
              "Draft a concise message for your team outlining a current priority, focusing on clarity and key points.",
            tool: "Effective Communication Template",
          },
          {
            step: 5,
            title: "Navigating Difficult Conversations",
            aha: "Approaching tough discussions with preparation and empathy leads to constructive outcomes.",
            action:
              "Plan a difficult conversation using a structured approach to maintain respect and focus on solutions.",
            tool: "Difficult Conversation Planner",
          },
          {
            step: 6,
            title: "Building Collaborative Team Culture",
            aha: "Fostering collaboration enhances creativity and collective problem-solving within teams.",
            action:
              "Initiate a team activity that encourages sharing ideas and mutual support.",
            tool: "Team Collaboration Checklist",
          },
        ],
      },
      {
        chapter: "Driving Performance and Motivation",
        steps: [
          {
            step: 7,
            title: "Setting Clear Expectations and Goals",
            aha: "Clear goals provide direction and measurable benchmarks for team performance.",
            action:
              "Work with your team to set SMART goals aligned with organizational priorities.",
            tool: "SMART Goals Worksheet",
          },
          {
            step: 8,
            title: "Providing Effective Feedback",
            aha: "Timely, specific feedback fosters growth and continuous improvement.",
            action:
              "Schedule regular feedback sessions and prepare constructive comments for each team member.",
            tool: "Feedback Framework Guide",
          },
          {
            step: 9,
            title: "Motivating Through Recognition and Support",
            aha: "Recognition and support boost morale and encourage sustained high performance.",
            action:
              "Implement a recognition practice that highlights team achievements regularly.",
            tool: "Recognition Ideas Toolkit",
          },
          {
            step: 10,
            title: "Managing Performance Challenges",
            aha: "Addressing performance issues promptly and fairly prevents escalation and supports improvement.",
            action:
              "Develop a performance improvement plan template to guide conversations and track progress.",
            tool: "Performance Improvement Plan Template",
          },
        ],
      },
    ],
    response_path: {
      chapters: [
        {
          id: 1,
          name: "Foundations of Effective Management",
          position: 1,
          steps: [
            {
              position: 1,
              step: {
                id: 1,
                title: "Discovering the Core Role of a Manager",
                description:
                  "Understand that effective management is about enabling team success through clarity of responsibilities rather than mere authority.",
              },
              stepVersion: {
                id: 101,
                versionNumber: 1,
                contentSummary:
                  "Explores the core responsibilities of managers emphasizing support over authority.",
              },
              screens: [
                {
                  id: 1,
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: 1,
                    contentType: "content",
                    content: {
                      content_type: "content",
                      heading: "What Makes a Manager Effective?",
                      body: "An effective manager is one who empowers their team by setting clear expectations, removing obstacles, and fostering growth. Rather than ruling with authority, they focus on enabling team members to succeed and flourish.",
                      media: {
                        description:
                          "Image showing a manager guiding their team through a project.",
                        url: "",
                      },
                    },
                  },
                  assets: [],
                },
                {
                  id: 2,
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: 2,
                    contentType: "mcq",
                    content: {
                      content_type: "mcq",
                      title: "Understanding Effective Management",
                      question:
                        "Which of these statements reflects the role of an effective manager?",
                      key_learning:
                        "Grasp the importance of enabling team success over asserting authority.",
                      options: [
                        "A manager should focus solely on achieving results.",
                        "A manager should empower their team to overcome challenges.",
                        "A manager must maintain control and authority at all times.",
                        "A manager's job is to ensure all rules are strictly followed.",
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: 3,
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: 3,
                    contentType: "force_rank",
                    content: {
                      content_type: "force_rank",
                      title: "Rank Managerial Priorities",
                      question:
                        "Arrange these managerial responsibilities by their importance in fostering an effective team environment.",
                      options: [
                        "Setting clear expectations",
                        "Providing ongoing feedback",
                        "Exercising strict authority",
                        "Supporting team development",
                      ],
                      low_label: "Less Important",
                      high_label: "Most Important",
                    },
                  },
                  assets: [],
                },
                {
                  id: 4,
                  screenType: "poll",
                  position: 4,
                  screenContents: {
                    id: 4,
                    contentType: "linear",
                    content: {
                      content_type: "linear",
                      title: "Self-Assessment: Managerial Focus",
                      question:
                        "On a scale from 1 to 10, how much do you prioritize team empowerment over authority?",
                      low_label: "Authority Focused",
                      high_label: "Empowerment Focused",
                      lowerscale: 1,
                      higherscale: 10,
                    },
                  },
                  assets: [],
                },
                {
                  id: 5,
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: 5,
                    contentType: "reflection",
                    content: {
                      content_type: "reflection",
                      title: "Reflect on Your Approach",
                      prompt:
                        "Reflect on your current understanding of managerial duties and list three ways you can support your team better.",
                    },
                  },
                  assets: [],
                },
                {
                  id: 6,
                  screenType: "action",
                  position: 6,
                  screenContents: {
                    id: 6,
                    contentType: "actions",
                    content: {
                      content_type: "actions",
                      title: "Take Action to Improve Team Support",
                      text: "Use the Managerial Role Checklist to evaluate and improve how you support your team.",
                      can_scheduled: true,
                      can_complete_now: false,
                      reflection_prompt:
                        "After using the tool, what improvements will you implement?",
                      tool_link: "Managerial Role Checklist",
                    },
                  },
                  assets: [],
                },
                {
                  id: 7,
                  screenType: "habits",
                  position: 7,
                  screenContents: {
                    id: 7,
                    contentType: "habits",
                    content: {
                      title: "Develop Managerial Habits",
                      is_mandatory: true,
                      votes_count: 0,
                      habit_image: {
                        description:
                          "Icons representing managerial skills like communication and planning.",
                        url: "",
                      },
                      enabled: true,
                      habits: [
                        "Conduct weekly one-on-ones with team members",
                        "Provide regular feedback",
                        "Encourage team autonomy",
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: 8,
                  screenType: "social",
                  position: 8,
                  screenContents: {
                    id: 8,
                    contentType: "social_discussion",
                    content: {
                      content_type: "social_discussion",
                      title: "Engage with Peers",
                      question:
                        "Share your strategies for effectively supporting your team. How do you empower team members daily?",
                      posts: [],
                    },
                  },
                  assets: [],
                },
                {
                  id: 9,
                  screenType: "assessment",
                  position: 9,
                  screenContents: {
                    id: 9,
                    contentType: "assessment",
                    content: {
                      content_type: "assessment",
                      title: "Managerial Skills Assessment",
                      questions: [
                        {
                          question_id: 1,
                          text: "What is a key focus for effective managers?",
                          options: [
                            {
                              option_id: 1,
                              text: "Exerting authority",
                            },
                            {
                              option_id: 2,
                              text: "Enabling team success through support",
                            },
                          ],
                        },
                        {
                          question_id: 2,
                          text: "How should managers handle team development?",
                          options: [
                            {
                              option_id: 1,
                              text: "By setting unobtainable goals",
                            },
                            {
                              option_id: 2,
                              text: "By providing resources and guidance",
                            },
                          ],
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
    chatbot_conversation: [
      {
        user: "",
        agent: "",
      },
    ],
  },
];
