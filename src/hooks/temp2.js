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
     "response_path": {
      "chapters": [
        {
          "id": 1,
          "name": "Facing Feedback Fears",
          "position": 1,
          "steps": [
            {
              "position": 1,
              "step": {
                "id": 1,
                "title": "Why Do We Avoid Feedback?",
                "description": "Avoidance often comes from uncertainty about how to start or fear of negative reactions."
              },
              "stepVersion": {
                "id": 101,
                "versionNumber": 1,
                "contentSummary": "Explore the reasons managers and team leaders avoid giving feedback, including fear of negative reactions and uncertainty about how to start."
              },
              "screens": [
                {
                  "id": 1,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 1,
                    "contentType": "content",
                    "content": {
                      "heading": "Why Do We Avoid Feedback?",
                      "body": "Many managers and team leaders avoid giving feedback because they worry about how it will be received or aren't sure how to start the conversation. This avoidance can limit team growth and performance. Understanding your own barriers is the first step to overcoming them.",
                      "media": {
                        "type": "image",
                        "description": "Illustration of a manager hesitating to give feedback.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 2,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 2,
                    "contentType": "mcq",
                    "content": {
                      "title": "Common Feedback Barriers",
                      "question": "Which of these is your biggest barrier to giving feedback?",
                      "key_learning": "Identify your personal feedback avoidance triggers.",
                      "options": [
                        "Fear of hurting someone's feelings",
                        "Not knowing how to start",
                        "Concern about damaging relationships",
                        "Doubting the feedback will be useful"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 3,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 3,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Rank Your Feedback Fears",
                      "question": "Rank these barriers from most to least challenging for you:",
                      "options": [
                        "Fear of negative reaction",
                        "Lack of confidence in delivery",
                        "Worry about being misunderstood",
                        "Uncertainty about timing"
                      ],
                      "low_label": "Least challenging",
                      "high_label": "Most challenging"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 4,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 4,
                    "contentType": "linear",
                    "content": {
                      "title": "How Comfortable Are You?",
                      "question": "On a scale of 1-5, how comfortable do you feel giving constructive feedback?",
                      "low_label": "Not at all comfortable",
                      "high_label": "Very comfortable",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 5,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 5,
                    "contentType": "reflection",
                    "content": {
                      "title": "Personal Feedback Barriers",
                      "prompt": "Reflect on your own barriers to giving feedback. What are your top two, and how have they shown up in your work?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 6,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 6,
                    "contentType": "actions",
                    "content": {
                      "title": "Overcoming Feedback Avoidance",
                      "text": "Download the Feedback Barriers Reflection Sheet. Write down your top two barriers and one action you can take to address each.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How might addressing these barriers help you become a more effective leader?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 7,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 7,
                    "contentType": "habits",
                    "content": {
                      "title": "Feedback Confidence Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Set a weekly reminder to give feedback",
                        "Prepare feedback notes before conversations",
                        "Practice giving feedback in low-stakes situations"
                      ]
                    }
                  },
                  "assets": []
                },
                // {
                //   "id": 8,
                //   "screenType": "social",
                //   "position": 8,
                //   "screenContents": {
                //     "id": 8,
                //     "contentType": "social_discussion",
                //     "content": {
                //       "title": "Share Your Feedback Fears",
                //       "question": "What is your biggest fear about giving feedback? How have you tried to overcome it?",
                //       "posts": []
                //     }
                //   },
                //   "assets": []
                // },
                // {
                //   "id": 9,
                //   "screenType": "assessment",
                //   "position": 9,
                //   "screenContents": {
                //     "id": 9,
                //     "contentType": "assessment",
                //     "content": {
                //       "title": "Feedback Fears Knowledge Check",
                //       "questions": [
                //         {
                //           "question_id": 1,
                //           "text": "Which of the following is NOT a common reason people avoid giving feedback?",
                //           "options": [
                //             { "option_id": "a", "text": "Fear of negative reaction", "answer_counts": 0 },
                //             { "option_id": "b", "text": "Desire to help others grow", "answer_counts": 0 },
                //             { "option_id": "c", "text": "Uncertainty about how to start", "answer_counts": 0 },
                //             { "option_id": "d", "text": "Concern about damaging relationships", "answer_counts": 0 }
                //           ]
                //         }
                //       ]
                //     }
                //   },
                //   "assets": []
                // }
              ]
            },
            {
              "position": 2,
              "step": {
                "id": 2,
                "title": "The Science of Feedback Reactions",
                "description": "Our brains are wired to perceive feedback as a threat, triggering defensive responses."
              },
              "stepVersion": {
                "id": 102,
                "versionNumber": 1,
                "contentSummary": "Learn about the neuroscience of feedback, why we react defensively, and strategies to manage these reactions."
              },
              "screens": [
                {
                  "id": 10,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 10,
                    "contentType": "content",
                    "content": {
                      "heading": "Why Feedback Feels Threatening",
                      "body": "When we receive feedback, our brain's threat response system can be triggered, leading to defensiveness or anxiety. Understanding this reaction helps us manage it and respond more constructively.",
                      "media": {
                        "type": "image",
                        "description": "Brain scan highlighting the amygdala during feedback.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 11,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 11,
                    "contentType": "mcq",
                    "content": {
                      "title": "Your Feedback Response",
                      "question": "What is your first reaction when you receive unexpected feedback?",
                      "key_learning": "Recognize your emotional and physical responses to feedback.",
                      "options": [
                        "Feel defensive or anxious",
                        "Want to explain yourself",
                        "Feel grateful for the input",
                        "Need time to process"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 12,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 12,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Feedback Triggers",
                      "question": "Rank these feedback situations from most to least stressful for you:",
                      "options": [
                        "Receiving feedback in public",
                        "Getting feedback from a peer",
                        "Receiving feedback from your manager",
                        "Getting anonymous feedback"
                      ],
                      "low_label": "Least stressful",
                      "high_label": "Most stressful"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 13,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 13,
                    "contentType": "linear",
                    "content": {
                      "title": "Feedback Stress Scale",
                      "question": "On a scale of 1-5, how stressful do you find receiving feedback?",
                      "low_label": "Not stressful",
                      "high_label": "Extremely stressful",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 14,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 14,
                    "contentType": "reflection",
                    "content": {
                      "title": "Notice Your Reaction",
                      "prompt": "Think about the last time you received feedback. What physical or emotional response did you notice? How did you handle it?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 15,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 15,
                    "contentType": "actions",
                    "content": {
                      "title": "Track Your Feedback Response",
                      "text": "Use the Feedback Response Tracker to note your reactions the next time you receive feedback. Identify one strategy to stay open and curious.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "What did you learn about your feedback response patterns?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 16,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 16,
                    "contentType": "habits",
                    "content": {
                      "title": "Building Feedback Resilience",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Pause before responding to feedback",
                        "Ask questions to clarify feedback",
                        "Thank the giver, even if it’s hard to hear"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 17,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 17,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share Your Feedback Stories",
                      "question": "Describe a time when your initial reaction to feedback was defensive. How did you move past it?",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 18,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 18,
                    "contentType": "assessment",
                    "content": {
                      "title": "Feedback Science Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Which part of the brain is most associated with the threat response to feedback?",
                          "options": [
                            { "option_id": "a", "text": "Amygdala", "answer_counts": 0 },
                            { "option_id": "b", "text": "Cerebellum", "answer_counts": 0 },
                            { "option_id": "c", "text": "Hippocampus", "answer_counts": 0 },
                            { "option_id": "d", "text": "Frontal cortex", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            }
          ]
        },
        {
          "id": 2,
          "name": "Mastering the Fundamentals",
          "position": 2,
          "steps": [
            {
              "position": 1,
              "step": {
                "id": 3,
                "title": "Feedback That Works: The Three Essentials",
                "description": "Effective feedback is solutions-focused, descriptive, and frequent."
              },
              "stepVersion": {
                "id": 201,
                "versionNumber": 1,
                "contentSummary": "Discover the three essentials of effective feedback and how to apply them in your team."
              },
              "screens": [
                {
                  "id": 19,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 19,
                    "contentType": "content",
                    "content": {
                      "heading": "The Three Essentials of Great Feedback",
                      "body": "Research shows that feedback is most effective when it is solutions-focused, descriptive, and frequent. These essentials help make feedback actionable, motivating, and a regular part of team culture.",
                      "media": {
                        "type": "image",
                        "description": "Diagram showing the three essentials of feedback.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 20,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 20,
                    "contentType": "mcq",
                    "content": {
                      "title": "Feedback Essentials Quiz",
                      "question": "Which of the following is NOT one of the three essentials of effective feedback?",
                      "key_learning": "Check your understanding of the fundamentals.",
                      "options": [
                        "Solutions-focused",
                        "Descriptive",
                        "Frequent",
                        "Critical"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 21,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 21,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Prioritizing Feedback Essentials",
                      "question": "Rank the three essentials in order of which you find most challenging to apply:",
                      "options": [
                        "Being solutions-focused",
                        "Being descriptive",
                        "Giving feedback frequently"
                      ],
                      "low_label": "Easiest",
                      "high_label": "Most challenging"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 22,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 22,
                    "contentType": "linear",
                    "content": {
                      "title": "Frequency of Feedback",
                      "question": "How often do you give feedback to your team?",
                      "low_label": "Rarely",
                      "high_label": "Very often",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 23,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 23,
                    "contentType": "reflection",
                    "content": {
                      "title": "Feedback Essentials Reflection",
                      "prompt": "Think of a recent feedback conversation. Which of the three essentials were present or missing? How did it affect the outcome?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 24,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 24,
                    "contentType": "actions",
                    "content": {
                      "title": "Checklist: Feedback Essentials",
                      "text": "Download the Feedback Essentials Checklist. Use it to review your next feedback conversation and note which essentials you applied.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did using the checklist change your approach?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 25,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 25,
                    "contentType": "habits",
                    "content": {
                      "title": "Feedback Essentials Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Give feedback after every team meeting",
                        "Make feedback descriptive and specific",
                        "Link feedback to solutions and next steps"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 26,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 26,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Discuss: Feedback Essentials",
                      "question": "Which of the three essentials do you find most challenging? Share your tips or struggles.",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 27,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 27,
                    "contentType": "assessment",
                    "content": {
                      "title": "Essentials Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Which essential of feedback focuses on describing specific behaviors and outcomes?",
                          "options": [
                            { "option_id": "a", "text": "Descriptive", "answer_counts": 0 },
                            { "option_id": "b", "text": "Frequent", "answer_counts": 0 },
                            { "option_id": "c", "text": "Solutions-focused", "answer_counts": 0 },
                            { "option_id": "d", "text": "Critical", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 2,
              "step": {
                "id": 4,
                "title": "Reframing Feedback: From Negative to Motivational",
                "description": "Framing feedback as a tool to motivate behavior change reduces anxiety for both giver and receiver."
              },
              "stepVersion": {
                "id": 202,
                "versionNumber": 1,
                "contentSummary": "Learn how to reframe feedback to motivate positive change and reduce anxiety."
              },
              "screens": [
                {
                  "id": 28,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 28,
                    "contentType": "content",
                    "content": {
                      "heading": "Reframing Feedback",
                      "body": "Feedback is most powerful when it motivates positive change. By focusing on growth and development, rather than criticism, you can help your team feel supported and open to improvement.",
                      "media": {
                        "type": "image",
                        "description": "Illustration of feedback being turned from negative to motivational.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 29,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 29,
                    "contentType": "mcq",
                    "content": {
                      "title": "Feedback Framing",
                      "question": "Which statement is more likely to motivate positive change?",
                      "key_learning": "Recognize the impact of language on motivation.",
                      "options": [
                        "\"You always miss deadlines.\"",
                        "\"I noticed the project was late. How can I support you to meet future deadlines?\"",
                        "\"You’re not good at managing time.\"",
                        "\"You need to improve.\""
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 30,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 30,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Motivational Feedback",
                      "question": "Rank these feedback statements from most to least motivational:",
                      "options": [
                        "\"I believe you can improve with practice.\"",
                        "\"You need to do better.\"",
                        "\"Let’s work together to find solutions.\"",
                        "\"You always make mistakes.\""
                      ],
                      "low_label": "Least motivational",
                      "high_label": "Most motivational"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 31,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 31,
                    "contentType": "linear",
                    "content": {
                      "title": "Motivational Feedback Scale",
                      "question": "How motivated do you feel after receiving feedback focused on your growth?",
                      "low_label": "Not at all motivated",
                      "high_label": "Very motivated",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 32,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 32,
                    "contentType": "reflection",
                    "content": {
                      "title": "Reframing Practice",
                      "prompt": "Rewrite a piece of 'negative' feedback you’ve given or received to make it motivational. What changes did you make?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 33,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 33,
                    "contentType": "actions",
                    "content": {
                      "title": "Feedback Reframing Guide",
                      "text": "Download the Feedback Reframing Guide. Use it to practice turning negative feedback into motivational feedback.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did reframing your feedback change the conversation?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 34,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 34,
                    "contentType": "habits",
                    "content": {
                      "title": "Motivational Feedback Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Pause before giving feedback to consider your intent",
                        "Frame feedback around growth and improvement",
                        "Acknowledge effort as well as results"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 35,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 35,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Reframing Feedback",
                      "question": "Share an example of how you turned negative feedback into a motivational message.",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 36,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 36,
                    "contentType": "assessment",
                    "content": {
                      "title": "Feedback Framing Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Which approach is best for motivating behavior change?",
                          "options": [
                            { "option_id": "a", "text": "Focusing on what went wrong", "answer_counts": 0 },
                            { "option_id": "b", "text": "Highlighting growth opportunities", "answer_counts": 0 },
                            { "option_id": "c", "text": "Pointing out mistakes repeatedly", "answer_counts": 0 },
                            { "option_id": "d", "text": "Avoiding feedback altogether", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 3,
              "step": {
                "id": 5,
                "title": "Solutions-Focused Language in Action",
                "description": "Shifting from problem statements to solution-oriented feedback increases engagement and improvement."
              },
              "stepVersion": {
                "id": 203,
                "versionNumber": 1,
                "contentSummary": "Practice using solutions-focused language to make feedback more actionable and positive."
              },
              "screens": [
                {
                  "id": 37,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 37,
                    "contentType": "content",
                    "content": {
                      "heading": "Solutions-Focused Feedback",
                      "body": "Instead of focusing on what went wrong, effective feedback points toward what can be done better next time. This approach increases engagement and helps team members see a path forward.",
                      "media": {
                        "type": "image",
                        "description": "Visual showing a shift from problem to solution.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 38,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 38,
                    "contentType": "mcq",
                    "content": {
                      "title": "Spot the Solutions Focus",
                      "question": "Which feedback statement is solutions-focused?",
                      "key_learning": "Identify solutions-oriented feedback.",
                      "options": [
                        "\"You made a mistake on the report.\"",
                        "\"Let’s discuss how you can improve the report next time.\"",
                        "\"You always do this wrong.\"",
                        "\"This isn’t acceptable.\""
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 39,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 39,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Feedback Statements",
                      "question": "Rank these statements from most to least solutions-focused:",
                      "options": [
                        "\"Here’s what you can try next time.\"",
                        "\"You didn’t do this right.\"",
                        "\"Let’s brainstorm solutions together.\"",
                        "\"You need to be more careful.\""
                      ],
                      "low_label": "Least solutions-focused",
                      "high_label": "Most solutions-focused"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 40,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 40,
                    "contentType": "linear",
                    "content": {
                      "title": "Solutions-Focused Scale",
                      "question": "How often do you use solutions-focused language in your feedback?",
                      "low_label": "Rarely",
                      "high_label": "Always",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 41,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 41,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Solutions-Focused Feedback",
                      "prompt": "Take a real scenario. Turn a problem-focused statement into a solutions-focused one. What changes did you make?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 42,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 42,
                    "contentType": "actions",
                    "content": {
                      "title": "Solutions-Focused Feedback Examples",
                      "text": "Download the Solutions-Focused Feedback Examples. Practice rewording feedback to focus on solutions.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did your team member respond to solutions-focused feedback?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 43,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 43,
                    "contentType": "habits",
                    "content": {
                      "title": "Solutions-Focused Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Phrase feedback around what can be done next",
                        "Ask for ideas from the recipient",
                        "Reinforce progress toward solutions"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 44,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 44,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Solutions-Focused Feedback",
                      "question": "Share an example of a time you used solutions-focused feedback. What was the impact?",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 45,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 45,
                    "contentType": "assessment",
                    "content": {
                      "title": "Solutions-Focused Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Which statement best describes a solutions-focused approach?",
                          "options": [
                            { "option_id": "a", "text": "Describing only what went wrong", "answer_counts": 0 },
                            { "option_id": "b", "text": "Suggesting next steps for improvement", "answer_counts": 0 },
                            { "option_id": "c", "text": "Criticizing the person", "answer_counts": 0 },
                            { "option_id": "d", "text": "Ignoring the issue", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 4,
              "step": {
                "id": 6,
                "title": "The Power of Descriptive Feedback",
                "description": "Descriptive, evidence-based feedback is more actionable and less likely to be perceived as personal criticism."
              },
              "stepVersion": {
                "id": 204,
                "versionNumber": 1,
                "contentSummary": "Learn how to give descriptive, evidence-based feedback that is actionable and objective."
              },
              "screens": [
                {
                  "id": 46,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 46,
                    "contentType": "content",
                    "content": {
                      "heading": "Descriptive Feedback in Action",
                      "body": "Descriptive feedback focuses on specific behaviors and outcomes, not personal traits. This makes feedback more actionable and less likely to be taken as criticism.",
                      "media": {
                        "type": "image",
                        "description": "Example of descriptive vs. vague feedback.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 47,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 47,
                    "contentType": "mcq",
                    "content": {
                      "title": "Spot the Descriptive Feedback",
                      "question": "Which feedback statement is most descriptive?",
                      "key_learning": "Distinguish between vague and descriptive feedback.",
                      "options": [
                        "\"Good job.\"",
                        "\"You did well in leading the meeting and keeping the agenda on track.\"",
                        "\"You need to improve.\"",
                        "\"Try harder next time.\""
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 48,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 48,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Feedback Specificity",
                      "question": "Rank these feedback statements from least to most descriptive:",
                      "options": [
                        "\"Great work.\"",
                        "\"You completed the report on time and with no errors.\"",
                        "\"Needs improvement.\"",
                        "\"You contributed three helpful ideas in the meeting.\""
                      ],
                      "low_label": "Least descriptive",
                      "high_label": "Most descriptive"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 49,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 49,
                    "contentType": "linear",
                    "content": {
                      "title": "Descriptive Feedback Scale",
                      "question": "How often do you give descriptive feedback (specific behaviors and outcomes)?",
                      "low_label": "Rarely",
                      "high_label": "Always",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 50,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 50,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Descriptive Feedback",
                      "prompt": "Give descriptive feedback to a team member, focusing on specific behaviors and outcomes. How did they respond?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 51,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 51,
                    "contentType": "actions",
                    "content": {
                      "title": "Descriptive Feedback Template",
                      "text": "Download the Descriptive Feedback Template. Use it to structure your next feedback conversation.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did using the template change your feedback delivery?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 52,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 52,
                    "contentType": "habits",
                    "content": {
                      "title": "Descriptive Feedback Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Describe behaviors, not traits",
                        "Use evidence and examples",
                        "Avoid vague praise or criticism"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 53,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 53,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Descriptive Feedback",
                      "question": "Share an example of descriptive feedback you’ve given or received. What was the impact?",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 54,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 54,
                    "contentType": "assessment",
                    "content": {
                      "title": "Descriptive Feedback Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is descriptive feedback more effective?",
                          "options": [
                            { "option_id": "a", "text": "It focuses on specific behaviors", "answer_counts": 0 },
                            { "option_id": "b", "text": "It is more personal", "answer_counts": 0 },
                            { "option_id": "c", "text": "It is always positive", "answer_counts": 0 },
                            { "option_id": "d", "text": "It is less frequent", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 5,
              "step": {
                "id": 7,
                "title": "Make It a Habit: Frequency Matters",
                "description": "Frequent feedback—both reinforcing and developmental—builds trust and drives performance."
              },
              "stepVersion": {
                "id": 205,
                "versionNumber": 1,
                "contentSummary": "Build the habit of frequent feedback to foster trust and drive team performance."
              },
              "screens": [
                {
                  "id": 55,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 55,
                    "contentType": "content",
                    "content": {
                      "heading": "Frequency: The Feedback Habit",
                      "body": "Giving feedback frequently—both positive and developmental—helps build trust, keeps performance on track, and makes feedback feel normal rather than stressful.",
                      "media": {
                        "type": "image",
                        "description": "Calendar with regular feedback reminders.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 56,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 56,
                    "contentType": "mcq",
                    "content": {
                      "title": "Feedback Frequency Quiz",
                      "question": "How often should you give feedback to maximize performance?",
                      "key_learning": "Understand the impact of feedback frequency.",
                      "options": [
                        "Once a year during performance reviews",
                        "Only when something goes wrong",
                        "Regularly, both positive and developmental",
                        "Whenever you remember"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 57,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 57,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Feedback Opportunities",
                      "question": "Rank these opportunities for giving feedback from most to least frequent in your workplace:",
                      "options": [
                        "After meetings",
                        "During 1:1s",
                        "Annual reviews",
                        "On-the-spot after an event"
                      ],
                      "low_label": "Least frequent",
                      "high_label": "Most frequent"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 58,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 58,
                    "contentType": "linear",
                    "content": {
                      "title": "Feedback Habit Scale",
                      "question": "How often do you give feedback to your team?",
                      "low_label": "Rarely",
                      "high_label": "Very often",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 59,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 59,
                    "contentType": "reflection",
                    "content": {
                      "title": "Feedback Frequency Reflection",
                      "prompt": "How would making feedback a regular habit change your team’s performance and trust?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 60,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 60,
                    "contentType": "actions",
                    "content": {
                      "title": "Feedback Frequency Planner",
                      "text": "Download the Feedback Frequency Planner. Set a recurring reminder to give feedback at least once a week.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did setting a reminder affect your feedback habits?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 61,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 61,
                    "contentType": "habits",
                    "content": {
                      "title": "Feedback Frequency Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Set a weekly feedback reminder",
                        "Give feedback after every project",
                        "Acknowledge positive behaviors regularly"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 62,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 62,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Feedback Frequency",
                      "question": "How do you make feedback a regular habit? Share your tips.",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 63,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 63,
                    "contentType": "assessment",
                    "content": {
                      "title": "Frequency Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is frequent feedback important?",
                          "options": [
                            { "option_id": "a", "text": "It builds trust and improves performance", "answer_counts": 0 },
                            { "option_id": "b", "text": "It makes feedback less stressful", "answer_counts": 0 },
                            { "option_id": "c", "text": "Both a and b", "answer_counts": 0 },
                            { "option_id": "d", "text": "It is not important", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            }
          ]
        },
        {
          "id": 3,
          "name": "Delivering Feedback Like a Pro",
          "position": 3,
          "steps": [
            {
              "position": 1,
              "step": {
                "id": 8,
                "title": "Starting the Conversation: Beyond 'Can I Give You Feedback?'",
                "description": "How you open a feedback conversation can reduce anxiety and set a positive tone."
              },
              "stepVersion": {
                "id": 301,
                "versionNumber": 1,
                "contentSummary": "Explore effective ways to start feedback conversations and set a positive, open tone."
              },
              "screens": [
                {
                  "id": 64,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 64,
                    "contentType": "content",
                    "content": {
                      "heading": "Starting the Feedback Conversation",
                      "body": "The way you open a feedback conversation can set the tone for the entire discussion. Avoiding anxiety-inducing phrases like 'Can I give you feedback?' and using supportive openers can make feedback more productive.",
                      "media": {
                        "type": "image",
                        "description": "Conversation starters for feedback.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 65,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 65,
                    "contentType": "mcq",
                    "content": {
                      "title": "Best Feedback Opener",
                      "question": "Which opener is most likely to reduce anxiety?",
                      "key_learning": "Choose openers that set a positive tone.",
                      "options": [
                        "\"Can I give you some feedback?\"",
                        "\"I want to support your growth—can we talk about your last project?\"",
                        "\"You need to hear this.\"",
                        "\"We need to talk.\""
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 66,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 66,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Conversation Starters",
                      "question": "Rank these conversation starters from most to least supportive:",
                      "options": [
                        "\"I noticed something I'd like to discuss.\"",
                        "\"Can I give you feedback?\"",
                        "\"Let's talk about your performance.\"",
                        "\"I'd like to check in about your progress.\""
                      ],
                      "low_label": "Least supportive",
                      "high_label": "Most supportive"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 67,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 67,
                    "contentType": "linear",
                    "content": {
                      "title": "Feedback Opener Comfort",
                      "question": "How comfortable are you with using new feedback conversation starters?",
                      "low_label": "Not comfortable",
                      "high_label": "Very comfortable",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 68,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 68,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Conversation Starters",
                      "prompt": "Choose and practice a new feedback conversation starter from the provided list. How did it change the tone of your conversation?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 69,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 69,
                    "contentType": "actions",
                    "content": {
                      "title": "Feedback Conversation Starters Sheet",
                      "text": "Download the Feedback Conversation Starters Sheet. Choose one starter and use it in your next feedback conversation.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did your team member respond to the new conversation starter?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 70,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 70,
                    "contentType": "habits",
                    "content": {
                      "title": "Feedback Conversation Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Start feedback with supportive language",
                        "Invite input before sharing your perspective",
                        "Practice new openers regularly"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 71,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 71,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Conversation Starters",
                      "question": "What’s your favorite way to start a feedback conversation? Why does it work?",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 72,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 72,
                    "contentType": "assessment",
                    "content": {
                      "title": "Conversation Starter Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is it important to avoid anxiety-inducing openers?",
                          "options": [
                            { "option_id": "a", "text": "They make feedback less effective", "answer_counts": 0 },
                            { "option_id": "b", "text": "They build trust and openness", "answer_counts": 0 },
                            { "option_id": "c", "text": "Both a and b", "answer_counts": 0 },
                            { "option_id": "d", "text": "They are more formal", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 2,
              "step": {
                "id": 9,
                "title": "Notice and Describe: Observing Without Judging",
                "description": "Noticing and describing behaviors, rather than judging, leads to more productive feedback discussions."
              },
              "stepVersion": {
                "id": 302,
                "versionNumber": 1,
                "contentSummary": "Practice observing and describing behaviors without judgment to improve feedback quality."
              },
              "screens": [
                {
                  "id": 73,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 73,
                    "contentType": "content",
                    "content": {
                      "heading": "Notice and Describe",
                      "body": "Observing and describing what you see—without adding judgment—makes feedback more objective and easier to act on. Focus on behaviors, not interpretations.",
                      "media": {
                        "type": "image",
                        "description": "Two managers observing a team interaction.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 74,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 74,
                    "contentType": "mcq",
                    "content": {
                      "title": "Judgment or Description?",
                      "question": "Which statement is a description, not a judgment?",
                      "key_learning": "Distinguish between describing and judging.",
                      "options": [
                        "\"You were late to the meeting.\"",
                        "\"You’re not committed to the team.\"",
                        "\"You don’t care about deadlines.\"",
                        "\"You’re always distracted.\""
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 75,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 75,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Feedback Statements",
                      "question": "Rank these statements from most to least descriptive:",
                      "options": [
                        "\"You spoke for 10 minutes in the meeting.\"",
                        "\"You were unprepared.\"",
                        "\"You contributed to the discussion.\"",
                        "\"You didn’t do enough.\""
                      ],
                      "low_label": "Least descriptive",
                      "high_label": "Most descriptive"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 76,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 76,
                    "contentType": "linear",
                    "content": {
                      "title": "Description vs. Judgment Scale",
                      "question": "How often do you focus on describing behaviors rather than judging?",
                      "low_label": "Rarely",
                      "high_label": "Always",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 77,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 77,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Noticing Behaviors",
                      "prompt": "Observe a team interaction and note only what you see and hear, not your interpretations. What did you notice?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 78,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 78,
                    "contentType": "actions",
                    "content": {
                      "title": "Observation Notes Template",
                      "text": "Download the Observation Notes Template. Use it to record observations in your next team meeting.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did focusing on observation change your feedback?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 79,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 79,
                    "contentType": "habits",
                    "content": {
                      "title": "Noticing Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Record observations before sharing feedback",
                        "Avoid assumptions in feedback",
                        "Ask clarifying questions before judging"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 80,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 80,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Noticing and Describing",
                      "question": "Share a time when describing rather than judging made your feedback more effective.",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 81,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 81,
                    "contentType": "assessment",
                    "content": {
                      "title": "Noticing Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is it important to describe behaviors rather than judge?",
                          "options": [
                            { "option_id": "a", "text": "It makes feedback more actionable", "answer_counts": 0 },
                            { "option_id": "b", "text": "It reduces defensiveness", "answer_counts": 0 },
                            { "option_id": "c", "text": "Both a and b", "answer_counts": 0 },
                            { "option_id": "d", "text": "It takes less time", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 3,
              "step": {
                "id": 10,
                "title": "Closing Strong: Agreeing on Next Steps",
                "description": "Ending feedback conversations with clear next steps ensures accountability and ongoing growth."
              },
              "stepVersion": {
                "id": 303,
                "versionNumber": 1,
                "contentSummary": "Learn how to close feedback conversations with clear next steps for accountability and growth."
              },
              "screens": [
                {
                  "id": 82,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 82,
                    "contentType": "content",
                    "content": {
                      "heading": "Closing Feedback Conversations",
                      "body": "A strong close to a feedback conversation ensures everyone is clear on next steps and accountable for progress. This builds momentum for ongoing growth.",
                      "media": {
                        "type": "image",
                        "description": "Checklist for closing feedback conversations.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 83,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 83,
                    "contentType": "mcq",
                    "content": {
                      "title": "Best Closing Question",
                      "question": "Which question best ensures clarity on next steps?",
                      "key_learning": "Check for understanding and accountability.",
                      "options": [
                        "\"Do you have any questions?\"",
                        "\"What are your next steps?\"",
                        "\"Let me know if you need help.\"",
                        "\"Okay, thanks.\""
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 84,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 84,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Closing Questions",
                      "question": "Rank these closing questions from most to least effective:",
                      "options": [
                        "\"Could you summarize what we discussed?\"",
                        "\"What are your next steps?\"",
                        "\"How can I support you?\"",
                        "\"Do you understand?\""
                      ],
                      "low_label": "Least effective",
                      "high_label": "Most effective"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 85,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 85,
                    "contentType": "linear",
                    "content": {
                      "title": "Clarity on Next Steps",
                      "question": "How confident are you in closing feedback conversations with clear next steps?",
                      "low_label": "Not confident",
                      "high_label": "Very confident",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 86,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 88,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Closing Strong",
                      "prompt": "End your next feedback conversation by asking the recipient to summarize next steps. How did it affect the outcome?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 87,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 87,
                    "contentType": "actions",
                    "content": {
                      "title": "Next Steps Question Prompts",
                      "text": "Download the Next Steps Question Prompts. Use them to close your next feedback conversation.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did your team member respond to being asked to summarize next steps?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 88,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 88,
                    "contentType": "habits",
                    "content": {
                      "title": "Closing Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Always end feedback with a summary of next steps",
                        "Ask for the recipient’s input on next steps",
                        "Set a follow-up reminder"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 89,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 89,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Closing Feedback",
                      "question": "What’s your go-to question for closing a feedback conversation? Why does it work?",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 90,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 90,
                    "contentType": "assessment",
                    "content": {
                      "title": "Closing Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is it important to agree on next steps at the end of a feedback conversation?",
                          "options": [
                            { "option_id": "a", "text": "It ensures accountability and ongoing growth", "answer_counts": 0 },
                            { "option_id": "b", "text": "It makes the conversation longer", "answer_counts": 0 },
                            { "option_id": "c", "text": "It is more formal", "answer_counts": 0 },
                            { "option_id": "d", "text": "It is not important", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            }
          ]
        },
        {
          "id": 4,
          "name": "Building a Feedback-Friendly Climate",
          "position": 4,
          "steps": [
            {
              "position": 1,
              "step": {
                "id": 11,
                "title": "Role Modeling and Humility: Setting the Tone",
                "description": "When leaders openly seek feedback and admit mistakes, they encourage a culture of learning."
              },
              "stepVersion": {
                "id": 401,
                "versionNumber": 1,
                "contentSummary": "Learn how role modeling and humility foster a feedback-friendly team climate."
              },
              "screens": [
                {
                  "id": 91,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 91,
                    "contentType": "content",
                    "content": {
                      "heading": "Role Modeling Feedback",
                      "body": "When leaders ask for feedback and admit mistakes, it sets the tone for a learning culture. Your openness encourages your team to do the same.",
                      "media": {
                        "type": "image",
                        "description": "Leader asking for feedback from team.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 92,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 92,
                    "contentType": "mcq",
                    "content": {
                      "title": "Role Modeling Quiz",
                      "question": "Which action best demonstrates role modeling feedback?",
                      "key_learning": "Understand the power of role modeling.",
                      "options": [
                        "Giving feedback only in private",
                        "Asking your team for feedback on your performance",
                        "Never admitting mistakes",
                        "Avoiding feedback discussions"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 93,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 93,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Role Modeling Behaviors",
                      "question": "Rank these behaviors from most to least likely to build a feedback-friendly climate:",
                      "options": [
                        "Admitting mistakes openly",
                        "Seeking feedback from your team",
                        "Avoiding feedback",
                        "Only giving positive feedback"
                      ],
                      "low_label": "Least likely",
                      "high_label": "Most likely"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 94,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 94,
                    "contentType": "linear",
                    "content": {
                      "title": "Role Modeling Scale",
                      "question": "How often do you ask your team for feedback on your performance?",
                      "low_label": "Never",
                      "high_label": "Very often",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 95,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 95,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Role Modeling",
                      "prompt": "Ask your team for feedback on your own performance this week. What did you learn?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 96,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 96,
                    "contentType": "actions",
                    "content": {
                      "title": "Role Modeling Feedback Guide",
                      "text": "Download the Role Modeling Feedback Guide. Use it to plan how you’ll seek feedback from your team.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did your team respond to your request for feedback?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 97,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 97,
                    "contentType": "habits",
                    "content": {
                      "title": "Role Modeling Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Ask for feedback regularly",
                        "Share your own learning moments",
                        "Admit mistakes openly"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 98,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 98,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Role Modeling",
                      "question": "Share a time when you modeled feedback-seeking or humility for your team.",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 99,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 99,
                    "contentType": "assessment",
                    "content": {
                      "title": "Role Modeling Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is role modeling feedback important for leaders?",
                          "options": [
                            { "option_id": "a", "text": "It encourages a feedback-friendly climate", "answer_counts": 0 },
                            { "option_id": "b", "text": "It shows vulnerability and builds trust", "answer_counts": 0 },
                            { "option_id": "c", "text": "Both a and b", "answer_counts": 0 },
                            { "option_id": "d", "text": "It is not important", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            },
            {
              "position": 2,
              "step": {
                "id": 12,
                "title": "Normalizing Feedback: Making It Part of the Everyday",
                "description": "Regular debriefs and celebrating learning from mistakes make feedback a natural part of team life."
              },
              "stepVersion": {
                "id": 402,
                "versionNumber": 1,
                "contentSummary": "Make feedback a regular, celebrated part of team routines through debriefs and learning from mistakes."
              },
              "screens": [
                {
                  "id": 100,
                  "screenType": "content",
                  "position": 1,
                  "screenContents": {
                    "id": 100,
                    "contentType": "content",
                    "content": {
                      "heading": "Normalizing Feedback",
                      "body": "Feedback should be a natural part of team life, not just reserved for formal reviews. Regular debriefs and celebrating learning from mistakes help make feedback routine and positive.",
                      "media": {
                        "type": "image",
                        "description": "Team celebrating after a project debrief.",
                        "url": ""
                      }
                    }
                  },
                  "assets": []
                },
                {
                  "id": 101,
                  "screenType": "poll",
                  "position": 2,
                  "screenContents": {
                    "id": 101,
                    "contentType": "mcq",
                    "content": {
                      "title": "Feedback Routine Quiz",
                      "question": "Which activity best helps normalize feedback?",
                      "key_learning": "Identify ways to make feedback routine.",
                      "options": [
                        "Annual performance reviews only",
                        "Regular team debriefs after projects",
                        "Avoiding mention of mistakes",
                        "Only giving feedback when asked"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 102,
                  "screenType": "poll",
                  "position": 3,
                  "screenContents": {
                    "id": 102,
                    "contentType": "force_rank",
                    "content": {
                      "title": "Ranking Feedback Normalization",
                      "question": "Rank these activities from most to least effective at normalizing feedback:",
                      "options": [
                        "Celebrating learning from mistakes",
                        "Debriefing after every project",
                        "Only providing feedback annually",
                        "Ignoring feedback opportunities"
                      ],
                      "low_label": "Least effective",
                      "high_label": "Most effective"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 103,
                  "screenType": "poll",
                  "position": 4,
                  "screenContents": {
                    "id": 103,
                    "contentType": "linear",
                    "content": {
                      "title": "Feedback Normalization Scale",
                      "question": "How often does your team debrief after projects?",
                      "low_label": "Never",
                      "high_label": "Always",
                      "lowerscale": 1,
                      "higherscale": 5
                    }
                  },
                  "assets": []
                },
                {
                  "id": 104,
                  "screenType": "reflection",
                  "position": 5,
                  "screenContents": {
                    "id": 104,
                    "contentType": "reflection",
                    "content": {
                      "title": "Practice: Team Debrief",
                      "prompt": "Facilitate a team debrief after a project, focusing on what went well and what could improve. What did your team learn?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 105,
                  "screenType": "action",
                  "position": 6,
                  "screenContents": {
                    "id": 105,
                    "contentType": "actions",
                    "content": {
                      "title": "Team Debrief Template",
                      "text": "Download the Team Debrief Template. Use it to guide your next team debrief.",
                      "can_scheduled": true,
                      "can_complete_now": true,
                      "tool_link": "",
                      "image_url": "",
                      "reflection_prompt": "How did your team respond to regular debriefs?"
                    }
                  },
                  "assets": []
                },
                {
                  "id": 106,
                  "screenType": "habits",
                  "position": 7,
                  "screenContents": {
                    "id": 106,
                    "contentType": "habits",
                    "content": {
                      "title": "Feedback Normalization Habits",
                      "is_mandatory": false,
                      "votes_count": 0,
                      "habit_image": "",
                      "enabled": true,
                      "habits": [
                        "Schedule regular debriefs",
                        "Celebrate learning from mistakes",
                        "Encourage feedback sharing in every meeting"
                      ]
                    }
                  },
                  "assets": []
                },
                {
                  "id": 107,
                  "screenType": "social",
                  "position": 8,
                  "screenContents": {
                    "id": 107,
                    "contentType": "social_discussion",
                    "content": {
                      "title": "Share: Feedback Routines",
                      "question": "How do you make feedback a natural part of your team’s routine?",
                      "posts": []
                    }
                  },
                  "assets": []
                },
                {
                  "id": 108,
                  "screenType": "assessment",
                  "position": 9,
                  "screenContents": {
                    "id": 108,
                    "contentType": "assessment",
                    "content": {
                      "title": "Normalization Knowledge Check",
                      "questions": [
                        {
                          "question_id": 1,
                          "text": "Why is it important to celebrate learning from mistakes?",
                          "options": [
                            { "option_id": "a", "text": "It encourages openness to feedback", "answer_counts": 0 },
                            { "option_id": "b", "text": "It helps normalize feedback", "answer_counts": 0 },
                            { "option_id": "c", "text": "Both a and b", "answer_counts": 0 },
                            { "option_id": "d", "text": "It is not important", "answer_counts": 0 }
                          ]
                        }
                      ]
                    }
                  },
                  "assets": []
                }
              ]
            }
          ]
        }
      ]
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
  