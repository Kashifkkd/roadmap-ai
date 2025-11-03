export const temp = [
  {
    session_id: "12xyz",
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
        chapter: "Foundations of Effective Leadership",
        steps: [
          {
            step: 1,
            title: "Discovering Your Leadership Self-Awareness",
            aha: "Self-awareness is the cornerstone of effective leadership, influencing how you respond, make decisions, and connect with others.",
            action:
              "Engage in regular self-reflection and seek diverse feedback to understand your leadership traits and their impact.",
            tool: "360-Degree Feedback Assessment",
          },
          {
            step: 2,
            title: "The Power of Integrity and Courage",
            aha: "Integrity and courage set the ethical foundation that earns trust and enables bold, accountable leadership.",
            action:
              "Identify one area where you can demonstrate greater transparency or speak up with integrity this week.",
            tool: "Ethical Decision-Making Framework",
          },
        ],
      },
      {
        chapter: "Core Interpersonal Competencies",
        steps: [
          {
            step: 3,
            title: "Mastering Emotional Intelligence for Influence",
            aha: "Emotional intelligence equips leaders to navigate relationships, resolve conflict, and motivate teams authentically.",
            action:
              "Practice active listening and empathy in your next team interaction to better understand emotional cues.",
            tool: "Emotional Intelligence Skill Builder",
          },
          {
            step: 4,
            title: "Communication and Collaboration as Leadership Pillars",
            aha: "Clear, inclusive communication paired with collaboration fosters innovation and team engagement.",
            action:
              "Facilitate a cross-functional meeting encouraging diverse input to enhance shared understanding.",
            tool: "Collaborative Meeting Checklist",
          },
        ],
      },
      {
        chapter: "Adaptive Leadership Styles and Situational Awareness",
        steps: [
          {
            step: 5,
            title: "Choosing the Right Leadership Style for the Situation",
            aha: "No single leadership style fits all; agility in style choice maximizes leadership impact.",
            action:
              "Analyze a recent leadership challenge and identify which style—directive, participative, or delegative—you used and the results.",
            tool: "Leadership Style Diagnostic Guide",
          },
          {
            step: 6,
            title: "Balancing Task and Relationship Focus",
            aha: "Effective leaders know when to prioritize goal attainment vs. team well-being to sustain performance.",
            action:
              "Assess your current projects and adjust your approach to balance focus on tasks and relationships.",
            tool: "Task-Relationship Prioritization Matrix",
          },
        ],
      },
      {
        chapter: "Leading Through Change and Ethical Imperatives",
        steps: [
          {
            step: 7,
            title: "Developing Agile Leadership for Rapid Change",
            aha: "Adaptive leadership thrives by embracing uncertainty and continuous learning amid disruption.",
            action:
              "Identify an area in your role to experiment with new approaches and learn from the outcomes.",
            tool: "Agile Leadership Mindset Checklist",
          },
          {
            step: 8,
            title: "Ethical Leadership: Beyond Compliance to Culture",
            aha: "Ethical leadership builds trust and a culture valuing transparency, inclusion, and accountability.",
            action:
              "Initiate a dialogue with your team about your organization's values and ethical expectations.",
            tool: "Organizational Ethics Conversation Guide",
          },
        ],
      },
      {
        chapter: "Inclusive, Crisis, and Transformational Leadership",
        steps: [
          {
            step: 9,
            title: "Fostering Inclusive Leadership for Diverse Teams",
            aha: "Inclusive leaders unlock innovation by creating environments where all diverse voices thrive.",
            action:
              "Practice cultural agility by incorporating diverse perspectives in your next decision-making process.",
            tool: "Inclusion and Cultural Agility Toolkit",
          },
          {
            step: 10,
            title: "Leading Through Crisis with Resilience and Vision",
            aha: "Effective crisis leadership combines early recognition, decisiveness, communication, and learning to sustain resilience.",
            action:
              "Develop a simple crisis response plan for your team focusing on communication and coordination.",
            tool: "Crisis Leadership Action Plan Template",
          },
        ],
      },
    ],
    response_path: {
      chapters: [
        {
          id: 1,
          name: "Foundation of Leadership",
          position: 1,
          steps: [
            {
              position: 1,
              step: {
                id: 1,
                title: "Developing Self-Awareness as a Leader",
                description:
                  "Learn how self-awareness enhances decision-making and emotional intelligence.",
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
                      heading: "Understanding Leadership Self-Awareness",
                      body: "Self-awareness forms the foundation for authentic leadership. Leaders who understand their strengths, values, and blind spots can lead with confidence and empathy.",
                      media: {
                        type: "image",
                        url: "https://cdn.example.com/self-awareness-intro.jpg",
                      },
                      actionPoints: 10,
                    },
                  },
                  assets: [
                    {
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                    },
                  ],
                },
                {
                  id: 2,
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: 2,
                    contentType: "mcq",
                    content: {
                      ptype: "mcq",
                      title: "Leadership Style Check",
                      question:
                        "Which leadership style best reflects collaborative decision-making?",
                      keyLearning:
                        "Democratic leaders value input and collaboration.",
                      options: [
                        { optionId: 1, text: "Autocratic", isCorrect: false },
                        { optionId: 2, text: "Democratic", isCorrect: true },
                        {
                          optionId: 3,
                          text: "Laissez-faire",
                          isCorrect: false,
                        },
                      ],
                      actionPoints: 15,
                    },
                  },
                  assets: [],
                },
                {
                  id: 3,
                  screenType: "reflection",
                  position: 3,
                  screenContents: {
                    id: 3,
                    contentType: "reflection",
                    content: {
                      title: "Leadership Reflection Exercise",
                      prompt:
                        "Think about a time you led a team decision. How self-aware were you during the process, and what did you learn?",
                      actionPoints: 20,
                      media: {
                        type: "image",
                        url: "https://cdn.example.com/reflective-leadership.jpg",
                      },
                    },
                  },
                  assets: [
                    {
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                    },
                  ],
                },
                {
                  id: 4,
                  screenType: "assessment",
                  position: 4,
                  screenContents: {
                    id: 4,
                    contentType: "assessment",
                    content: {
                      title: "Self-Awareness Quick Survey",
                      description:
                        "Rate your agreement with each statement honestly.",
                      questions: [
                        {
                          questionId: 101,
                          text: "I actively seek feedback from others about my leadership.",
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
                {
                  id: 5,
                  screenType: "action",
                  position: 5,
                  screenContents: {
                    id: 5,
                    contentType: "action",
                    content: {
                      title: "Schedule a 360° Feedback Session",
                      prompt:
                        "Arrange a feedback session with your team to identify leadership blind spots.",
                      text: "You can use the linked template or Google Forms to collect responses.",
                      action_points: 30,
                      feedback_action_points: 10,
                      is_scheduled: true,
                      is_complete_now: false,
                      reply_count: 0,
                      votescount: 0,
                      image_url: "https://cdn.example.com/feedback-session.jpg",
                      tool_link:
                        "https://www.surveymonkey.com/mp/360-degree-feedback/",
                      casual_document_id: null,
                    },
                  },
                  assets: [
                    {
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                    },
                  ],
                },
              ],
            },
            {
              position: 2,
              step: {
                id: 2,
                title: "Developing Self-Awareness as a Leader",
                description:
                  "Learn how self-awareness enhances decision-making and emotional intelligence.",
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
                      heading: "Understanding Leadership Self-Awareness",
                      body: "Self-awareness forms the foundation for authentic leadership. Leaders who understand their strengths, values, and blind spots can lead with confidence and empathy.",
                      media: {
                        type: "image",
                        url: "https://cdn.example.com/self-awareness-intro.jpg",
                      },
                      actionPoints: 10,
                    },
                  },
                  assets: [
                    {
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                    },
                  ],
                },
                {
                  id: 2,
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: 2,
                    contentType: "mcq",
                    content: {
                      ptype: "mcq",
                      title: "Leadership Style Check",
                      question:
                        "Which leadership style best reflects collaborative decision-making?",
                      keyLearning:
                        "Democratic leaders value input and collaboration.",
                      options: [
                        { optionId: 1, text: "Autocratic", isCorrect: false },
                        { optionId: 2, text: "Democratic", isCorrect: true },
                        {
                          optionId: 3,
                          text: "Laissez-faire",
                          isCorrect: false,
                        },
                      ],
                      actionPoints: 15,
                    },
                  },
                  assets: [],
                },
                {
                  id: 3,
                  screenType: "reflection",
                  position: 3,
                  screenContents: {
                    id: 3,
                    contentType: "reflection",
                    content: {
                      title: "Leadership Reflection Exercise",
                      prompt:
                        "Think about a time you led a team decision. How self-aware were you during the process, and what did you learn?",
                      actionPoints: 20,
                      media: {
                        type: "image",
                        url: "https://cdn.example.com/reflective-leadership.jpg",
                      },
                    },
                  },
                  assets: [
                    {
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                    },
                  ],
                },
                {
                  id: 4,
                  screenType: "assessment",
                  position: 4,
                  screenContents: {
                    id: 4,
                    contentType: "assessment",
                    content: {
                      title: "Self-Awareness Quick Survey",
                      description:
                        "Rate your agreement with each statement honestly.",
                      questions: [
                        {
                          questionId: 101,
                          text: "I actively seek feedback from others about my leadership.",
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
                {
                  id: 5,
                  screenType: "action",
                  position: 5,
                  screenContents: {
                    id: 5,
                    contentType: "action",
                    content: {
                      title: "Schedule a 360° Feedback Session",
                      prompt:
                        "Arrange a feedback session with your team to identify leadership blind spots.",
                      text: "You can use the linked template or Google Forms to collect responses.",
                      action_points: 30,
                      feedback_action_points: 10,
                      is_scheduled: true,
                      is_complete_now: false,
                      reply_count: 0,
                      votescount: 0,
                      image_url: "https://cdn.example.com/feedback-session.jpg",
                      tool_link:
                        "https://www.surveymonkey.com/mp/360-degree-feedback/",
                      casual_document_id: null,
                    },
                  },
                  assets: [
                    {
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "Advanced Leadership Skills",
          position: 2,
          steps: [
            {
              position: 1,
              step: {
                id: 2,
                title: "Leading Through Change and Uncertainty",
                description:
                  "Learn to adapt and lead teams effectively during periods of transition or disruption.",
              },
              screens: [
                {
                  id: 6,
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: 6,
                    contentType: "content",
                    content: {
                      heading: "The Power of Adaptive Leadership",
                      body: "Adaptive leaders thrive in uncertainty by being open to learning, empowering others, and adjusting strategies as conditions evolve.",
                      media: {
                        type: "video",
                        url: "https://cdn.example.com/adaptive-leadership.mp4",
                      },
                      actionPoints: 10,
                    },
                  },
                  assets: [],
                },
                {
                  id: 7,
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: 7,
                    contentType: "linear",
                    content: {
                      ptype: "linear",
                      title: "Adaptability Check",
                      question:
                        "Rate your comfort level with making decisions under uncertainty.",
                      low_label: "Very Uncomfortable",
                      high_label: "Very Comfortable",
                      lowerscale: 1,
                      higherscale: 5,
                      action_points: 10,
                    },
                  },
                  assets: [],
                },
                {
                  id: 8,
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: 8,
                    contentType: "force_rank",
                    content: {
                      ptype: "force_rank",
                      title: "Crisis Response Priorities",
                      question:
                        "Rank these elements by their importance during a crisis:",
                      options: [
                        { optionId: 1, text: "Transparent communication" },
                        { optionId: 2, text: "Quick decision-making" },
                        { optionId: 3, text: "Team reassurance" },
                        { optionId: 4, text: "Post-crisis evaluation" },
                      ],
                      lowLabel: "Least Important",
                      highLabel: "Most Important",
                      actionPoints: 20,
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
        user: "I want to create a comet for executive leadership.",
        ai_response:
          "Sure! I have created a comet titled 'Executive Leadership Mastery' for TechCorp Industries.",
      },
      {
        user: "Can you also add learning objectives?",
        ai_response:
          "Yes, added learning objectives: 'Develop executive decision-making skills' and 'Enhance strategic thinking'.",
      },
      {
        user: "Great, make it 4 weeks long.",
        ai_response:
          "Done! The comet is now set to 4 weeks, 10 minutes per day.",
      },
    ],
  },
];
