export const temp2 = [
  {
    session_id: "823e1e53-a707-4345-b8fe-0dc6b69e4585",
    input_type: "path_creation",
    comet_creation_data: {
      "Basic Information": {
        "Comet Title": "iOS App Learning Outline",
        Description:
          "Include interactive quizzes, real-world coding exercises, and downloadable project templates",
      },
      "Audience & Objectives": {
        "Target Audience":
          "Aspiring iOS developers and beginners interested in app development",
        "Learning Objectives": [
          "Understand the fundamentals of iOS app development",
          "Learn to design and implement user interfaces using Swift and Xcode",
          "Gain skills to publish an app on the App Store",
        ],
      },
      "Experience Design": {
        Focus: "learning_new_content",
        "Source Alignment": "balanced",
        "Engagement Frequency": "",
        Duration:
          "10 Steps, to be completed over 2 weeks with daily short sessions.",
        "Special Instructions":
          "Include interactive quizzes, real-world coding exercises, and downloadable project templates",
      },
    },
    response_outline: [
      {
        chapter: "Chapter 1: Foundations of iOS Development",
        steps: [
          {
            step: 1,
            title: "Kickstart Your iOS Journey with C-sharp Basics",
            aha: "Mastering C-sharp syntax and core programming concepts is the essential first step to building any iOS app.",
            action:
              "Write a simple C-sharp program that prints 'Hello, iOS!' and experiment with variables and control flow.",
            tool: "Swift Playgrounds app for hands-on coding practice",
          },
          {
            step: 2,
            title: "Explore Xcode: Your iOS Development Playground",
            aha: "Xcode is the integrated environment where you design, code, and test your iOS apps, making it your primary tool.",
            action:
              "Create a new Xcode project and familiarize yourself with the interface, including the storyboard and code editor.",
            tool: "Xcode IDE with sample project templates",
          },
        ],
      },
      {
        chapter: "Chapter 2: Designing Engaging User Interfaces",
        steps: [
          {
            step: 3,
            title: "Building UI with Storyboards and C-sharpUI",
            aha: "Designing intuitive user interfaces is key to user engagement; Storyboards and C-sharpUI offer visual and code-driven approaches respectively.",
            action:
              "Design a simple login screen using Storyboard and replicate it using C-sharpUI to compare approaches.",
            tool: "Xcode Storyboard and SwiftUI preview canvas",
          },
          {
            step: 4,
            title: "Implementing User Interaction and Navigation",
            aha: "User interaction and smooth navigation flow are critical to app usability and retention.",
            action:
              "Add buttons and navigation controllers to your app and implement actions that respond to user taps.",
            tool: "Xcode Interface Builder and Swift event handling",
          },
        ],
      },
    ],
    response_path: {
      chapters: [
        {
          id: "#chapter_1",
          name: "Chapter 1: Foundations of iOS Development",
          position: 1,
          steps: [
            {
              position: 1,
              step: {
                id: "#step_1",
                title: "Kickstart Your iOS Journey with C-sharp Basics",
                description:
                  "Master C-sharp syntax and core programming concepts as the starting point for iOS app development.",
              },
              stepVersion: {
                id: "#step_version_1",
                versionNumber: 1,
                contentSummary:
                  "Introduces C-sharp basics, variables, and control flow.",
              },
              screens: [
                {
                  id: "#screen_1_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_1_1",
                    contentType: "content",
                    content: {
                      heading: "Introduction to C-sharp Basics",
                      body: "Learn the core syntax and structure of a simple C-sharp program that prints text to the console.",
                      media: {
                        type: "image",
                        url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                        alt: "Simple C-sharp hello world code sample.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_1_2",
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_1_2",
                    contentType: "mcq",
                    content: {
                      title: "Test Your C-sharp Knowledge",
                      question:
                        "Which of the following is the correct way to declare an integer variable in C-sharp?",
                      key_learning:
                        "Correct declaration syntax is essential to avoid compile-time errors.",
                      options: [
                        {
                          id: "#step1_q1_option_1",
                          text: "int number = 5;",
                        },
                        {
                          id: "#step1_q1_option_2",
                          text: "number int = 5;",
                        },
                        {
                          id: "#step1_q1_option_3",
                          text: "var number := 5",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_1_3",
                  screenType: "reflection",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_1_3",
                    contentType: "reflection",
                    content: {
                      title: "Reflect on Your First Program",
                      prompt:
                        "Describe a simple program you could write using C-sharp basics. What would it do and why?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_1_4",
                  screenType: "action",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_1_4",
                    contentType: "action",
                    content: {
                      title: "Action: Write Your First C-sharp Program",
                      text: "Write a C-sharp program that prints 'Hello, iOS!' and play with changing the message and adding variables.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link:
                        "Swift Playgrounds app for hands-on coding practice",
                      image_url: "",
                      reflection_prompt:
                        "What did you find easiest or hardest when writing your first program?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_1_5",
                  screenType: "assessment",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_1_5",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: C-sharp Basics Check",
                      questions: [
                        {
                          question_id: "#step1_assess_q1",
                          text: "Which keyword is used to define a whole number variable in C-sharp?",
                          options: [
                            {
                              option_id: "#step1_assess_q1_o1",
                              text: "int",
                            },
                            {
                              option_id: "#step1_assess_q1_o2",
                              text: "string",
                            },
                            {
                              option_id: "#step1_assess_q1_o3",
                              text: "float",
                            },
                          ],
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_1_6",
                  screenType: "content",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_1_6",
                    contentType: "content",
                    content: {
                      heading: "Key Takeaways from C-sharp Basics",
                      body: "You now know how to declare variables, print output, and structure a simple C-sharp program.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Checklist of C-sharp fundamentals learned.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
              ],
            },
            {
              position: 2,
              step: {
                id: "#step_2",
                title: "Explore Xcode: Your iOS Development Playground",
                description:
                  "Get familiar with the Xcode interface, project templates, and essential tools.",
              },
              stepVersion: {
                id: "#step_version_2",
                versionNumber: 1,
                contentSummary:
                  "Covers Xcode workspace layout and basic navigation.",
              },
              screens: [
                {
                  id: "#screen_2_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_2_1",
                    contentType: "content",
                    content: {
                      heading: "Getting Started with Xcode",
                      body: "Learn how to create a new Xcode project and explore the main panels: navigator, editor, and inspectors.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Xcode window showing project navigator and editor.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_2_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_2_2",
                    contentType: "action",
                    content: {
                      title: "Action: Create Your First Xcode Project",
                      text: "Create a new Xcode app project using a template and run it in the simulator.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "Xcode IDE with sample project templates",
                      image_url: "",
                      reflection_prompt:
                        "What did you notice about the default files Xcode created for you?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_2_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_2_3",
                    contentType: "mcq",
                    content: {
                      title: "Xcode Interface Quiz",
                      question:
                        "Which area of Xcode is used to visually design your UI?",
                      key_learning:
                        "The storyboard or SwiftUI canvas helps you design interfaces visually.",
                      options: [
                        {
                          id: "#step2_q1_o1",
                          text: "Project Navigator",
                        },
                        {
                          id: "#step2_q1_o2",
                          text: "Storyboard / Canvas",
                        },
                        {
                          id: "#step2_q1_o3",
                          text: "Debug Area",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_2_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_2_4",
                    contentType: "content",
                    content: {
                      heading: "Understanding Storyboard vs. Code",
                      body: "You can build interfaces using Storyboards, SwiftUI, or in code. Each approach has its strengths.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Storyboard and code side-by-side example.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_2_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_2_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflect on Your First Xcode Experience",
                      prompt:
                        "What part of the Xcode interface felt most intuitive? What felt confusing?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_2_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_2_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Xcode Basics",
                      questions: [
                        {
                          question_id: "#step2_assess_q1",
                          text: "Which menu would you use to add a new file to your project?",
                          options: [
                            {
                              option_id: "#step2_assess_q1_o1",
                              text: "File → New",
                            },
                            {
                              option_id: "#step2_assess_q1_o2",
                              text: "Run → New Target",
                            },
                            {
                              option_id: "#step2_assess_q1_o3",
                              text: "View → Editors",
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
            {
              position: 3,
              step: {
                id: "#step_3",
                title: "Understanding iOS Project Structure",
                description:
                  "Explore how files, folders, and targets fit together in an iOS project.",
              },
              stepVersion: {
                id: "#step_version_3",
                versionNumber: 1,
                contentSummary:
                  "Walks through the anatomy of an Xcode project.",
              },
              screens: [
                {
                  id: "#screen_3_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_3_1",
                    contentType: "content",
                    content: {
                      heading: "Inside an iOS Project",
                      body: "Learn what AppDelegate, SceneDelegate, Info.plist, and asset catalogs do.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Xcode file list highlighting key files.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_3_2",
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_3_2",
                    contentType: "mcq",
                    content: {
                      title: "Quick Check: Info.plist",
                      question: "What is Info.plist mainly used for?",
                      key_learning:
                        "Info.plist stores configuration about your app.",
                      options: [
                        {
                          id: "#step3_q1_o1",
                          text: "App configuration and metadata",
                        },
                        {
                          id: "#step3_q1_o2",
                          text: "User interface layout",
                        },
                        {
                          id: "#step3_q1_o3",
                          text: "Storing user data",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_3_3",
                  screenType: "reflection",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_3_3",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: File Roles",
                      prompt:
                        "Which file or folder in your project are you most curious about and why?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_3_4",
                  screenType: "action",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_3_4",
                    contentType: "action",
                    content: {
                      title: "Action: Label Key Files",
                      text: "Open your project and add comments at the top of key files summarizing their purpose.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "Did writing descriptions help you mentally organize the app structure?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_3_5",
                  screenType: "content",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_3_5",
                    contentType: "content",
                    content: {
                      heading: "Targets and Schemes",
                      body: "Understand how targets produce different app builds and how schemes control what runs.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Xcode target settings screenshot.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_3_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_3_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Project Structure",
                      questions: [
                        {
                          question_id: "#step3_assess_q1",
                          text: "Where do you typically manage app icons and images?",
                          options: [
                            {
                              option_id: "#step3_assess_q1_o1",
                              text: "Assets catalog",
                            },
                            {
                              option_id: "#step3_assess_q1_o2",
                              text: "Info.plist",
                            },
                            {
                              option_id: "#step3_assess_q1_o3",
                              text: "Main.swift",
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
            {
              position: 4,
              step: {
                id: "#step_4",
                title: "Debugging and Console Output",
                description:
                  "Use the debugger and console to diagnose issues and inspect values.",
              },
              stepVersion: {
                id: "#step_version_4",
                versionNumber: 1,
                contentSummary:
                  "Introduces breakpoints, stepping, and print debugging.",
              },
              screens: [
                {
                  id: "#screen_4_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_4_1",
                    contentType: "content",
                    content: {
                      heading: "Meet the Debugger",
                      body: "Learn how to set breakpoints, step through code, and view variable values.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Debugger panel in Xcode.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_4_2",
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_4_2",
                    contentType: "mcq",
                    content: {
                      title: "Debugging Check",
                      question:
                        "What happens when execution hits a breakpoint?",
                      key_learning:
                        "Execution pauses so you can inspect state.",
                      options: [
                        {
                          id: "#step4_q1_o1",
                          text: "The app quits",
                        },
                        {
                          id: "#step4_q1_o2",
                          text: "Execution pauses",
                        },
                        {
                          id: "#step4_q1_o3",
                          text: "Nothing changes",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_4_3",
                  screenType: "action",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_4_3",
                    contentType: "action",
                    content: {
                      title: "Action: Add a Breakpoint",
                      text: "Add a breakpoint inside a button tap handler and watch variables change.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "What did you learn about how your code runs step by step?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_4_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_4_4",
                    contentType: "content",
                    content: {
                      heading: "Using print for Quick Checks",
                      body: "Sometimes a simple print statement is the fastest way to see what’s happening in your app.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Console output of debug messages.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_4_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_4_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Debugging Style",
                      prompt:
                        "Do you prefer breakpoints or print statements? Why?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_4_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_4_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Debugging Concepts",
                      questions: [
                        {
                          question_id: "#step4_assess_q1",
                          text: "Which tool shows variable values during a paused debug session?",
                          options: [
                            {
                              option_id: "#step4_assess_q1_o1",
                              text: "Variables view in the debug area",
                            },
                            {
                              option_id: "#step4_assess_q1_o2",
                              text: "Assets catalog",
                            },
                            {
                              option_id: "#step4_assess_q1_o3",
                              text: "Info.plist",
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
            {
              position: 5,
              step: {
                id: "#step_5",
                title: "Working with the iOS Simulator",
                description:
                  "Use the simulator to quickly test your app on different devices.",
              },
              stepVersion: {
                id: "#step_version_5",
                versionNumber: 1,
                contentSummary:
                  "Shows how to run, reset, and switch simulator devices.",
              },
              screens: [
                {
                  id: "#screen_5_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_5_1",
                    contentType: "content",
                    content: {
                      heading: "Meet the iOS Simulator",
                      body: "The simulator lets you preview your app on virtual devices without physical hardware.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Simulator running an app.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_5_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_5_2",
                    contentType: "action",
                    content: {
                      title: "Action: Run on Two Devices",
                      text: "Run your app on an iPhone and an iPad simulator and note layout differences.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "How did the UI behave differently on each device?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_5_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_5_3",
                    contentType: "mcq",
                    content: {
                      title: "Simulator Capabilities",
                      question:
                        "Which is something you can do in the simulator?",
                      key_learning:
                        "The simulator supports many device behaviors but not all hardware.",
                      options: [
                        {
                          id: "#step5_q1_o1",
                          text: "Simulate rotating the device",
                        },
                        {
                          id: "#step5_q1_o2",
                          text: "Physically tap the real screen",
                        },
                        {
                          id: "#step5_q1_o3",
                          text: "Change Xcode’s source code",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_5_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_5_4",
                    contentType: "content",
                    content: {
                      heading: "Resetting and Troubleshooting",
                      body: "Learn how to reset content and settings in a simulator if something breaks.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Simulator menu with reset options.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_5_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_5_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Device Coverage",
                      prompt:
                        "Which devices and orientations will you prioritize testing and why?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_5_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_5_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Simulator Use",
                      questions: [
                        {
                          question_id: "#step5_assess_q1",
                          text: "How do you rotate the simulator device?",
                          options: [
                            {
                              option_id: "#step5_assess_q1_o1",
                              text: "Hardware → Rotate",
                            },
                            {
                              option_id: "#step5_assess_q1_o2",
                              text: "View → Canvas",
                            },
                            {
                              option_id: "#step5_assess_q1_o3",
                              text: "File → New",
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
            {
              position: 6,
              step: {
                id: "#step_6",
                title: "Handling User Input",
                description:
                  "Capture text and button input from users and respond in code.",
              },
              stepVersion: {
                id: "#step_version_6",
                versionNumber: 1,
                contentSummary:
                  "Covers text fields, buttons, and IBAction connections.",
              },
              screens: [
                {
                  id: "#screen_6_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_6_1",
                    contentType: "content",
                    content: {
                      heading: "Basic Input Controls",
                      body: "Learn how text fields and buttons allow users to interact with your app.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Login form with text fields and button.",
                      },
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_6_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_6_2",
                    contentType: "action",
                    content: {
                      title: "Action: Build a Greeting Screen",
                      text: "Create a screen where the user enters their name and taps a button to see a greeting label update.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "What did you learn about connecting outlets and actions?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "ready",
                },
                {
                  id: "#screen_6_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_6_3",
                    contentType: "mcq",
                    content: {
                      title: "IBOutlet vs IBAction",
                      question: "What is an IBOutlet typically used for?",
                      key_learning: "Outlets connect UI elements to code.",
                      options: [
                        {
                          id: "#step6_q1_o1",
                          text: "Connecting UI elements to code",
                        },
                        {
                          id: "#step6_q1_o2",
                          text: "Handling tap events",
                        },
                        {
                          id: "#step6_q1_o3",
                          text: "Storing entire screens",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_6_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_6_4",
                    contentType: "content",
                    content: {
                      heading: "Validating Input",
                      body: "A few lines of code can check if fields are empty and show helpful messages.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Example of validation message on form.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_6_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_6_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: User-Friendly Inputs",
                      prompt:
                        "Have you used apps where the input experience felt especially smooth or frustrating? Why?",
                    },
                  },
                  assets: [
                    {
                      type: "image",
                      url: "https://1st90-stage-kuiper-lambda-s3.s3.us-east-1.amazonaws.com/1386_0.png",
                      alt: "Simple C-sharp hello world code sample.",
                    },
                  ],
                  image_status: "pending",
                },
                {
                  id: "#screen_6_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_6_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Input Handling",
                      questions: [
                        {
                          question_id: "#step6_assess_q1",
                          text: "Which connection type handles a button being tapped?",
                          options: [
                            {
                              option_id: "#step6_assess_q1_o1",
                              text: "IBAction",
                            },
                            {
                              option_id: "#step6_assess_q1_o2",
                              text: "IBOutlet",
                            },
                            {
                              option_id: "#step6_assess_q1_o3",
                              text: "Segue",
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
            {
              position: 7,
              step: {
                id: "#step_7",
                title: "Understanding the App Lifecycle",
                description:
                  "Learn when your app loads, goes to background, and returns.",
              },
              stepVersion: {
                id: "#step_version_7",
                versionNumber: 1,
                contentSummary: "Explains key lifecycle methods and states.",
              },
              screens: [
                {
                  id: "#screen_7_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_7_1",
                    contentType: "content",
                    content: {
                      heading: "Lifecycle in iOS Apps",
                      body: "Understand viewDidLoad, viewWillAppear, and related lifecycle callbacks.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Lifecycle diagram for a view controller.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_7_2",
                  screenType: "poll",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_7_2",
                    contentType: "mcq",
                    content: {
                      title: "Quick Check: viewDidLoad",
                      question: "When is viewDidLoad typically called?",
                      key_learning:
                        "viewDidLoad runs after the view has been loaded into memory.",
                      options: [
                        {
                          id: "#step7_q1_o1",
                          text: "When the app is installed",
                        },
                        {
                          id: "#step7_q1_o2",
                          text: "After the view is loaded into memory",
                        },
                        {
                          id: "#step7_q1_o3",
                          text: "When the device is rotated",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_7_3",
                  screenType: "content",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_7_3",
                    contentType: "content",
                    content: {
                      heading: "Foreground and Background",
                      body: "Learn what happens when the app goes to the background and how to save state.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Diagram of foreground/background transitions.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_7_4",
                  screenType: "action",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_7_4",
                    contentType: "action",
                    content: {
                      title: "Action: Log Lifecycle Events",
                      text: "Add print statements to lifecycle methods and run your app, observing when each line appears.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "Did any lifecycle timing surprise you?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_7_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_7_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Lifecycle Bugs",
                      prompt:
                        "Have you seen apps behave strangely when returning from the background? What might they be doing wrong?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_7_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_7_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Lifecycle",
                      questions: [
                        {
                          question_id: "#step7_assess_q1",
                          text: "Which method is a good place to start animations when a view appears?",
                          options: [
                            {
                              option_id: "#step7_assess_q1_o1",
                              text: "viewWillAppear",
                            },
                            {
                              option_id: "#step7_assess_q1_o2",
                              text: "deinit",
                            },
                            {
                              option_id: "#step7_assess_q1_o3",
                              text: "application(_:didFinishLaunchingWithOptions:)",
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
            {
              position: 8,
              step: {
                id: "#step_8",
                title: "Your First Mini iOS App",
                description:
                  "Bring together everything from Chapter 1 into a simple working app.",
              },
              stepVersion: {
                id: "#step_version_8",
                versionNumber: 1,
                contentSummary:
                  "Guides learners through building a small, functional app.",
              },
              screens: [
                {
                  id: "#screen_8_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_8_1",
                    contentType: "content",
                    content: {
                      heading: "Designing Your Mini App",
                      body: "You’ll build a tiny app that combines input, feedback, and basic navigation.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Wireframe of a small multi-screen app.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_8_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_8_2",
                    contentType: "action",
                    content: {
                      title: "Action: Plan Your App",
                      text: "Sketch the screens and flows for your mini app on paper or digitally.",
                      can_scheduled: true,
                      can_complete_now: false,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "What is the core user problem your mini app solves?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_8_3",
                  screenType: "action",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_8_3",
                    contentType: "action",
                    content: {
                      title: "Action: Build and Run",
                      text: "Create the screens, connect inputs, and run the app in the simulator.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "Which part of building the app felt most natural? Which felt hardest?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_8_4",
                  screenType: "poll",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_8_4",
                    contentType: "mcq",
                    content: {
                      title: "Confidence Check",
                      question:
                        "How confident do you feel about recreating this app from scratch?",
                      key_learning:
                        "Confidence signals readiness for more advanced topics.",
                      options: [
                        {
                          id: "#step8_q1_o1",
                          text: "Very confident",
                        },
                        {
                          id: "#step8_q1_o2",
                          text: "Somewhat confident",
                        },
                        {
                          id: "#step8_q1_o3",
                          text: "Not yet confident",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_8_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_8_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Chapter 1 Wrap-Up",
                      prompt:
                        "What is one concept from Chapter 1 you want to practice again before moving on?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_8_6",
                  screenType: "content",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_8_6",
                    contentType: "content",
                    content: {
                      heading: "Chapter 1 Summary",
                      body: "You now understand basic programming, Xcode, project structure, debugging, input handling, lifecycle, and mini-app creation.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Summary graphic of Chapter 1 topics.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
              ],
            },
          ],
        },
        {
          id: "#chapter_2",
          name: "Chapter 2: Designing Engaging User Interfaces",
          position: 2,
          steps: [
            {
              position: 1,
              step: {
                id: "#step_9",
                title: "Building UI with Storyboards and C-sharpUI",
                description:
                  "Design interfaces using visual and code-based approaches.",
              },
              stepVersion: {
                id: "#step_version_9",
                versionNumber: 1,
                contentSummary: "Compares Storyboards and code-driven UI.",
              },
              screens: [
                {
                  id: "#screen_9_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_9_1",
                    contentType: "content",
                    content: {
                      heading: "Visual vs. Code-Driven UI",
                      body: "Learn how Storyboards and C-sharpUI each help you build interfaces.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Storyboard view next to code view.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_9_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_9_2",
                    contentType: "action",
                    content: {
                      title: "Action: Build a Login Screen Two Ways",
                      text: "Create the same login UI using Storyboard and C-sharpUI and compare the experience.",
                      can_scheduled: true,
                      can_complete_now: false,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "Xcode Storyboard and SwiftUI preview canvas",
                      image_url: "",
                      reflection_prompt:
                        "Which approach felt more intuitive for you and why?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_9_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_9_3",
                    contentType: "mcq",
                    content: {
                      title: "UI Approach Preference",
                      question:
                        "Which UI approach is more maintainable for large apps?",
                      key_learning:
                        "Code-driven UI often improves reusability and version control.",
                      options: [
                        {
                          id: "#step9_q1_o1",
                          text: "Storyboards only",
                        },
                        {
                          id: "#step9_q1_o2",
                          text: "C-sharpUI / SwiftUI only",
                        },
                        {
                          id: "#step9_q1_o3",
                          text: "Either, depending on team preference",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_9_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_9_4",
                    contentType: "content",
                    content: {
                      heading: "Reusability and Components",
                      body: "Think in reusable components, whether designing in Storyboard or in code.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Component-based UI blocks.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_9_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_9_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: UI Design Tradeoffs",
                      prompt:
                        "When might you choose visual design over code, and vice versa?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_9_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_9_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: UI Approaches",
                      questions: [
                        {
                          question_id: "#step9_assess_q1",
                          text: "Which of these is a key benefit of code-based UI?",
                          options: [
                            {
                              option_id: "#step9_assess_q1_o1",
                              text: "Fewer merge conflicts",
                            },
                            {
                              option_id: "#step9_assess_q1_o2",
                              text: "No need for any code",
                            },
                            {
                              option_id: "#step9_assess_q1_o3",
                              text: "Cannot be reused",
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
            {
              position: 2,
              step: {
                id: "#step_10",
                title: "Implementing User Interaction and Navigation",
                description:
                  "Link screens together and respond to taps and gestures.",
              },
              stepVersion: {
                id: "#step_version_10",
                versionNumber: 1,
                contentSummary:
                  "Uses segues, navigation controllers, and actions.",
              },
              screens: [
                {
                  id: "#screen_10_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_10_1",
                    contentType: "content",
                    content: {
                      heading: "Navigation Basics",
                      body: "Learn how navigation controllers manage a stack of screens.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Navigation stack diagram.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_10_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_10_2",
                    contentType: "action",
                    content: {
                      title: "Action: Add Navigation",
                      text: "Embed your main view controller in a navigation controller and push to a detail screen on button tap.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link:
                        "Xcode Interface Builder and Swift event handling",
                      image_url: "",
                      reflection_prompt:
                        "How does navigation feel different before and after using a nav controller?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_10_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_10_3",
                    contentType: "mcq",
                    content: {
                      title: "Segue Types",
                      question:
                        "Which segue type pushes a view controller onto the navigation stack?",
                      key_learning:
                        "Show (push) segues are typical for navigation stacks.",
                      options: [
                        {
                          id: "#step10_q1_o1",
                          text: "Show (e.g., push)",
                        },
                        {
                          id: "#step10_q1_o2",
                          text: "Present modally",
                        },
                        {
                          id: "#step10_q1_o3",
                          text: "Unwind",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_10_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_10_4",
                    contentType: "content",
                    content: {
                      heading: "Passing Data Between Screens",
                      body: "Use prepare(for:sender:) or initializers to send data to the next screen.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Passing data from list to detail screen.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_10_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_10_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Navigational Flow",
                      prompt:
                        "Think of an app you love. How does its navigation feel intuitive or confusing?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_10_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_10_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Navigation Concepts",
                      questions: [
                        {
                          question_id: "#step10_assess_q1",
                          text: "Which pattern best describes navigation controllers?",
                          options: [
                            {
                              option_id: "#step10_assess_q1_o1",
                              text: "Stack-based",
                            },
                            {
                              option_id: "#step10_assess_q1_o2",
                              text: "Grid-based",
                            },
                            {
                              option_id: "#step10_assess_q1_o3",
                              text: "Random access",
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
            {
              position: 3,
              step: {
                id: "#step_11",
                title: "Layouts with Auto Layout",
                description:
                  "Make your UI adapt to different device sizes using constraints.",
              },
              stepVersion: {
                id: "#step_version_11",
                versionNumber: 1,
                contentSummary:
                  "Teaches constraints, intrinsic content size, and basic responsiveness.",
              },
              screens: [
                {
                  id: "#screen_11_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_11_1",
                    contentType: "content",
                    content: {
                      heading: "Why Auto Layout?",
                      body: "Users run apps on many devices. Auto Layout keeps your UI usable everywhere.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Same UI on multiple device sizes.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_11_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_11_2",
                    contentType: "action",
                    content: {
                      title: "Action: Add Constraints",
                      text: "Pin labels and buttons so they stay aligned on different devices.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "How did constraints change when rotating or switching devices?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_11_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_11_3",
                    contentType: "mcq",
                    content: {
                      title: "Constraint Types",
                      question:
                        "Which constraint keeps an element centered horizontally?",
                      key_learning:
                        "Center X constraints align views horizontally.",
                      options: [
                        {
                          id: "#step11_q1_o1",
                          text: "Leading space",
                        },
                        {
                          id: "#step11_q1_o2",
                          text: "Trailing space",
                        },
                        {
                          id: "#step11_q1_o3",
                          text: "Center X",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_11_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_11_4",
                    contentType: "content",
                    content: {
                      heading: "Common Auto Layout Pitfalls",
                      body: "Missing or conflicting constraints can break your UI. Learn to read constraint warnings.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Xcode Auto Layout warning icons.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_11_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_11_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Layout Strategy",
                      prompt:
                        "Do you prefer pinning everything manually or using stack views? Why?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_11_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_11_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Auto Layout",
                      questions: [
                        {
                          question_id: "#step11_assess_q1",
                          text: "Which tool helps visualize constraints on a selected view?",
                          options: [
                            {
                              option_id: "#step11_assess_q1_o1",
                              text: "Size inspector",
                            },
                            {
                              option_id: "#step11_assess_q1_o2",
                              text: "Project navigator",
                            },
                            {
                              option_id: "#step11_assess_q1_o3",
                              text: "Debug area",
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
            {
              position: 4,
              step: {
                id: "#step_12",
                title: "Using Stack Views for Faster Layout",
                description:
                  "Create flexible layouts quickly using vertical and horizontal stack views.",
              },
              stepVersion: {
                id: "#step_version_12",
                versionNumber: 1,
                contentSummary:
                  "Explains stack views and distribution options.",
              },
              screens: [
                {
                  id: "#screen_12_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_12_1",
                    contentType: "content",
                    content: {
                      heading: "Meet Stack Views",
                      body: "Stack views simplify arranging rows and columns of content.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Vertical and horizontal stack view diagrams.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_12_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_12_2",
                    contentType: "action",
                    content: {
                      title: "Action: Build a Profile Card",
                      text: "Use stack views to layout an avatar, name, and details with minimal constraints.",
                      can_scheduled: true,
                      can_complete_now: true,
                      reply_count: 0,
                      votescount: 0,
                      tool_link: "",
                      image_url: "",
                      reflection_prompt:
                        "How many constraints did you need compared to manual layout?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_12_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_12_3",
                    contentType: "mcq",
                    content: {
                      title: "Stack View Distribution",
                      question:
                        "Which distribution setting ensures equal spacing between arranged subviews?",
                      key_learning:
                        "Understanding distribution helps create visually balanced layouts.",
                      options: [
                        {
                          id: "#step12_q1_o1",
                          text: "Fill",
                        },
                        {
                          id: "#step12_q1_o2",
                          text: "Equal Spacing",
                        },
                        {
                          id: "#step12_q1_o3",
                          text: "Fill Proportionally",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_12_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_12_4",
                    contentType: "content",
                    content: {
                      heading: "Common Stack View Mistakes",
                      body: "Over-nesting stack views or mismatching alignment/distribution settings can cause unexpected UI behavior.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Examples of problematic stack view layout.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_12_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_12_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Simplifying UI",
                      prompt:
                        "Did stack views reduce your layout complexity? Where will you apply them next?",
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_12_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_12_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Stack Views",
                      questions: [
                        {
                          question_id: "#step12_assess_q1",
                          text: "Which setting controls spacing between arranged subviews?",
                          options: [
                            {
                              option_id: "#step12_assess_q1_o1",
                              text: "Alignment",
                            },
                            {
                              option_id: "#step12_assess_q1_o2",
                              text: "Spacing",
                            },
                            {
                              option_id: "#step12_assess_q1_o3",
                              text: "Distribution",
                            },
                          ],
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_12_7",
                  screenType: "content",
                  position: 7,
                  screenContents: {
                    id: "#screen_content_12_7",
                    contentType: "content",
                    content: {
                      heading: "Stack Views Summary",
                      body: "Stack views are a powerful layout tool that reduce constraints and speed up UI design.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Stack views summary graphic.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
              ],
            },
            {
              position: 5,
              step: {
                id: "#step_13",
                title: "Color, Typography, and Adaptive UI",
                description:
                  "Design visually appealing and readable UIs using system colors and dynamic fonts.",
              },
              stepVersion: {
                id: "#step_version_13",
                versionNumber: 1,
                contentSummary:
                  "Uses SF Symbols, system colors, and dynamic type.",
              },
              screens: [
                {
                  id: "#screen_13_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_13_1",
                    contentType: "content",
                    content: {
                      heading: "Design for Readability",
                      body: "Use system fonts and adaptive colors to ensure accessibility for all users.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Example of dynamic type resizing.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_13_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_13_2",
                    contentType: "action",
                    content: {
                      title: "Action: Enable Dynamic Type",
                      text: "Update your labels to use preferredFont(forTextStyle:) and test in Accessiblity settings.",
                      can_scheduled: true,
                      can_complete_now: true,
                      tool_link: "",
                      reflection_prompt:
                        "Did your UI adjust gracefully to large text sizes?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_13_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_13_3",
                    contentType: "mcq",
                    content: {
                      title: "Color Scheme",
                      question:
                        "Which color option automatically adapts to Light and Dark mode?",
                      key_learning: "System colors offer automatic adaptation.",
                      options: [
                        {
                          id: "#step13_q1_o1",
                          text: "UIColor.white",
                        },
                        {
                          id: "#step13_q1_o2",
                          text: "UIColor.systemBackground",
                        },
                        {
                          id: "#step13_q1_o3",
                          text: "UIColor.black",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_13_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_13_4",
                    contentType: "content",
                    content: {
                      heading: "SF Symbols Overview",
                      body: "Apple’s icon library includes thousands of symbols that match system UI.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "SF Symbols examples.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_13_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_13_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Visual Style",
                      prompt:
                        "What UI detail do you personally notice most in apps?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_13_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_13_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Adaptive UI",
                      questions: [
                        {
                          question_id: "#step13_assess_q1",
                          text: "What API is used for dynamic type?",
                          options: [
                            {
                              option_id: "#step13_assess_q1_o1",
                              text: "UIFont.systemFont",
                            },
                            {
                              option_id: "#step13_assess_q1_o2",
                              text: "UIFont.preferredFont",
                            },
                            {
                              option_id: "#step13_assess_q1_o3",
                              text: "UIFont.fixed",
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
            {
              position: 6,
              step: {
                id: "#step_14",
                title: "Gestures and Touch Interactions",
                description:
                  "Use tap, swipe, and long-press gestures to enhance UX.",
              },
              stepVersion: {
                id: "#step_version_14",
                versionNumber: 1,
                contentSummary:
                  "Introduces gesture recognizers and event handling.",
              },
              screens: [
                {
                  id: "#screen_14_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_14_1",
                    contentType: "content",
                    content: {
                      heading: "Gesture Recognizers",
                      body: "iOS provides UITapGestureRecognizer, UIPanGestureRecognizer, and more.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "UI gesture examples.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_14_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_14_2",
                    contentType: "action",
                    content: {
                      title: "Action: Add a Tap Gesture",
                      text: "Make an image view respond to tap by changing its color or text.",
                      can_scheduled: true,
                      can_complete_now: true,
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_14_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_14_3",
                    contentType: "mcq",
                    content: {
                      title: "Gesture Basics",
                      question:
                        "Which gesture recognizer detects a long press?",
                      key_learning:
                        "Long press gestures enable additional interactions.",
                      options: [
                        {
                          id: "#step14_q1_o1",
                          text: "UILongPressGestureRecognizer",
                        },
                        {
                          id: "#step14_q1_o2",
                          text: "UISwipeGestureRecognizer",
                        },
                        {
                          id: "#step14_q1_o3",
                          text: "UITapGestureRecognizer",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_14_4",
                  screenType: "content",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_14_4",
                    contentType: "content",
                    content: {
                      heading: "Handling Multiple Gestures",
                      body: "Learn gesture recognizer delegates to manage simultaneous gestures.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Multiple gestures diagram.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_14_5",
                  screenType: "reflection",
                  position: 5,
                  screenContents: {
                    id: "#screen_content_14_5",
                    contentType: "reflection",
                    content: {
                      title: "Reflection: Interactivity",
                      prompt:
                        "What gesture do you personally use most on your phone?",
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_14_6",
                  screenType: "assessment",
                  position: 6,
                  screenContents: {
                    id: "#screen_content_14_6",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Gestures",
                      questions: [
                        {
                          question_id: "#step14_assess_q1",
                          text: "Which method connects a recognizer to a view?",
                          options: [
                            {
                              option_id: "#step14_assess_q1_o1",
                              text: "view.addGestureRecognizer()",
                            },
                            {
                              option_id: "#step14_assess_q1_o2",
                              text: "view.triggerGesture()",
                            },
                            {
                              option_id: "#step14_assess_q1_o3",
                              text: "gesture.enable()",
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
            {
              position: 7,
              step: {
                id: "#step_15",
                title: "Building Responsive Lists with UITableView",
                description: "Display dynamic lists of data using Table Views.",
              },
              stepVersion: {
                id: "#step_version_15",
                versionNumber: 1,
                contentSummary:
                  "Covers delegates, data sources, and cell reuse.",
              },
              screens: [
                {
                  id: "#screen_15_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_15_1",
                    contentType: "content",
                    content: {
                      heading: "UITableView Essentials",
                      body: "Use UITableView to build scrolling lists efficiently.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "UITableView list example.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_15_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_15_2",
                    contentType: "action",
                    content: {
                      title: "Action: Build a Simple List",
                      text: "Create a table of items like tasks, songs, or contacts.",
                      can_scheduled: true,
                      can_complete_now: true,
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_15_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_15_3",
                    contentType: "mcq",
                    content: {
                      title: "Reuse Identifiers",
                      question: "Why do we reuse table view cells?",
                      key_learning: "Reusing cells improves performance.",
                      options: [
                        {
                          id: "#step15_q1_o1",
                          text: "For speed and memory efficiency",
                        },
                        {
                          id: "#step15_q1_o2",
                          text: "To change color",
                        },
                        {
                          id: "#step15_q1_o3",
                          text: "To disable scrolling",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_15_4",
                  screenType: "assessment",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_15_4",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Table Views",
                      questions: [
                        {
                          question_id: "#step15_assess_q1",
                          text: "Which protocol provides numberOfRowsInSection?",
                          options: [
                            {
                              option_id: "#step15_assess_q1_o1",
                              text: "UITableViewDataSource",
                            },
                            {
                              option_id: "#step15_assess_q1_o2",
                              text: "UITableViewDelegate",
                            },
                            {
                              option_id: "#step15_assess_q1_o3",
                              text: "UITableViewHandler",
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
            {
              position: 8,
              step: {
                id: "#step_16",
                title: "Collection Views for Grid Layouts",
                description:
                  "Use UICollectionView to display items in flexible grid layouts.",
              },
              stepVersion: {
                id: "#step_version_16",
                versionNumber: 1,
                contentSummary:
                  "Build grid-based UIs using compositional layouts.",
              },
              screens: [
                {
                  id: "#screen_16_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_16_1",
                    contentType: "content",
                    content: {
                      heading: "UICollectionView Overview",
                      body: "Collection views allow highly customizable grids and layouts.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Grid UI layout example.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_16_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_16_2",
                    contentType: "action",
                    content: {
                      title: "Action: Build a Photo Grid",
                      text: "Use a collection view to display a 3-column photo gallery.",
                      can_scheduled: true,
                      can_complete_now: true,
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_16_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_16_3",
                    contentType: "mcq",
                    content: {
                      title: "Cell Reuse",
                      question:
                        "Which method dequeues a reusable collection view cell?",
                      options: [
                        {
                          id: "#step16_q1_o1",
                          text: "dequeueReusableCell",
                        },
                        {
                          id: "#step16_q1_o2",
                          text: "newCollectionCell",
                        },
                        {
                          id: "#step16_q1_o3",
                          text: "makeCell",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_16_4",
                  screenType: "assessment",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_16_4",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Collection Views",
                      questions: [
                        {
                          question_id: "#step16_assess_q1",
                          text: "Which layout API is most flexible for modern collection views?",
                          options: [
                            {
                              option_id: "#step16_assess_q1_o1",
                              text: "Compositional Layout",
                            },
                            {
                              option_id: "#step16_assess_q1_o2",
                              text: "Flow Layout",
                            },
                            {
                              option_id: "#step16_assess_q1_o3",
                              text: "Manual Constraints",
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
            {
              position: 9,
              step: {
                id: "#step_17",
                title: "Animating Your Interfaces",
                description:
                  "Use animations to guide user attention and improve interactions.",
              },
              stepVersion: {
                id: "#step_version_17",
                versionNumber: 1,
                contentSummary:
                  "Covers UIView animations and smooth transitions.",
              },
              screens: [
                {
                  id: "#screen_17_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_17_1",
                    contentType: "content",
                    content: {
                      heading: "Why Animate?",
                      body: "Animations can highlight changes, provide feedback, and create delight.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "UI animation examples.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_17_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_17_2",
                    contentType: "action",
                    content: {
                      title: "Action: Fade In a View",
                      text: "Use UIView.animate to fade a label or image into view.",
                      can_scheduled: true,
                      can_complete_now: true,
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_17_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_17_3",
                    contentType: "mcq",
                    content: {
                      title: "Animation Curves",
                      question:
                        "Which easing curve resembles natural movement?",
                      options: [
                        {
                          id: "#step17_q1_o1",
                          text: "Ease In-Out",
                        },
                        {
                          id: "#step17_q1_o2",
                          text: "Linear",
                        },
                        {
                          id: "#step17_q1_o3",
                          text: "Instant",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_17_4",
                  screenType: "assessment",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_17_4",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Animations",
                      questions: [
                        {
                          question_id: "#step17_assess_q1",
                          text: "Which framework is primarily used for basic animations?",
                          options: [
                            {
                              option_id: "#step17_assess_q1_o1",
                              text: "UIKit",
                            },
                            {
                              option_id: "#step17_assess_q1_o2",
                              text: "SwiftUI only",
                            },
                            {
                              option_id: "#step17_assess_q1_o3",
                              text: "MapKit",
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
            {
              position: 10,
              step: {
                id: "#step_18",
                title: "Accessibility and Inclusive Design",
                description:
                  "Make apps usable for everyone, including users with disabilities.",
              },
              stepVersion: {
                id: "#step_version_18",
                versionNumber: 1,
                contentSummary:
                  "Covers VoiceOver, labels, traits, and contrast.",
              },
              screens: [
                {
                  id: "#screen_18_1",
                  screenType: "content",
                  position: 1,
                  screenContents: {
                    id: "#screen_content_18_1",
                    contentType: "content",
                    content: {
                      heading: "Accessibility Basics",
                      body: "Apple provides robust tools to make apps inclusive through VoiceOver, dynamic type, and contrast.",
                      media: {
                        type: "image",
                        url: "",
                        alt: "Accessibility settings screenshot.",
                      },
                    },
                  },
                  assets: [],
                  image_status: "pending",
                },
                {
                  id: "#screen_18_2",
                  screenType: "action",
                  position: 2,
                  screenContents: {
                    id: "#screen_content_18_2",
                    contentType: "action",
                    content: {
                      title: "Action: Add Accessibility Labels",
                      text: "Set accessibilityLabel and accessibilityHint for your main UI elements.",
                      can_scheduled: true,
                      can_complete_now: true,
                    },
                  },
                  assets: [],
                  image_status: "ready",
                },
                {
                  id: "#screen_18_3",
                  screenType: "poll",
                  position: 3,
                  screenContents: {
                    id: "#screen_content_18_3",
                    contentType: "mcq",
                    content: {
                      title: "Accessibility Traits",
                      question:
                        "Which trait makes an element act like a button for VoiceOver?",
                      options: [
                        {
                          id: "#step18_q1_o1",
                          text: "button",
                        },
                        {
                          id: "#step18_q1_o2",
                          text: "header",
                        },
                        {
                          id: "#step18_q1_o3",
                          text: "image",
                        },
                      ],
                    },
                  },
                  assets: [],
                },
                {
                  id: "#screen_18_4",
                  screenType: "assessment",
                  position: 4,
                  screenContents: {
                    id: "#screen_content_18_4",
                    contentType: "assessment",
                    content: {
                      title: "Assessment: Accessibility",
                      questions: [
                        {
                          question_id: "#step18_assess_q1",
                          text: "Which tool simulates color blindness in Xcode?",
                          options: [
                            {
                              option_id: "#step18_assess_q1_o1",
                              text: "Accessibility Inspector",
                            },
                            {
                              option_id: "#step18_assess_q1_o2",
                              text: "Simulator Network Debugger",
                            },
                            {
                              option_id: "#step18_assess_q1_o3",
                              text: "File Inspector",
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
        user: "{ 'path': 'chapter-1-step-1-screen-1' ,'field': 'heading', 'value': 'Understanding Leadership Self-Awareness', 'instruction': 'please make it a bit descriptive' }",
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
    additional_data: {
      personalization_enabled: true,
      habit_enabled: true,
      habit_description: "description if habit enabled",
    },
  },
];
