// islands/LessonPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { Lesson } from "../types/lesson.ts";

export default function LessonPlayer({
  initialLesson,
  lessonId,
}: {
  initialLesson?: Lesson;
  lessonId?: string;
}) {
  // State
  const [lesson, setLesson] = useState<Lesson | null>(initialLesson || null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<Map<string, any>>(new Map());
  const timeoutRef = useRef<number | null>(null);

  // Load lesson data if not provided
  useEffect(() => {
    if (!lesson && lessonId) {
      fetchLesson(lessonId);
    }
  }, [lessonId]);

  // Timer for auto-advancing steps when playing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isPlaying && lesson?.steps[currentStepIndex]) {
      timeoutRef.current = setTimeout(() => {
        if (currentStepIndex < (lesson?.steps.length || 0) - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, lesson.steps[currentStepIndex].duration || 5000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, currentStepIndex, lesson]);

  // Process math expressions and render charts when step changes
  useEffect(() => {
    if (!lesson || !containerRef.current) return;

    // Clean up old charts
    chartRefs.current.forEach((chart) => chart.destroy?.());
    chartRefs.current.clear();

    // Wait for DOM to update with the new content
    setTimeout(() => {
      if (!containerRef.current) return;

      // Process math expressions with KaTeX
      if (typeof window !== "undefined" && window.katex) {
        const mathElements = containerRef.current.querySelectorAll(".math");
        mathElements.forEach((elem) => {
          try {
            window.katex.render(elem.textContent || "", elem as HTMLElement, {
              throwOnError: false,
              displayMode: elem.classList.contains("display-math"),
            });
          } catch (e) {
            console.error("Math rendering error:", e);
          }
        });
      }

      // Process charts with Chart.js
      const currentStep = lesson.steps[currentStepIndex];
      if (
        currentStep?.charts && typeof window !== "undefined" && window.Chart
      ) {
        currentStep.charts.forEach((chart) => {
          const canvas = document.getElementById(chart.id) as HTMLCanvasElement;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const newChart = new window.Chart(ctx, {
                type: chart.type,
                data: chart.data,
                options: chart.options,
              });
              chartRefs.current.set(chart.id, newChart);
            }
          }
        });
      }

      // Add an "appearing" animation to the step content
      const contentElement = containerRef.current.querySelector(
        ".step-content",
      );
      if (contentElement) {
        contentElement.classList.add("animate-fade-in");
      }
    }, 0);
  }, [currentStepIndex, lesson]);

  // Fetch lesson data
  const fetchLesson = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${id}`);
      if (!response.ok) throw new Error("Failed to fetch lesson");
      const data = await response.json();
      setLesson(data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user question
  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || !lesson) return;

    setIsLoading(true);
    setIsAskingQuestion(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lessonId || lesson.id,
          stepIndex: currentStepIndex,
          question: userQuestion,
          context: lesson.steps[currentStepIndex].content,
        }),
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      setAiResponse(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      setAiResponse(
        "I'm sorry, I couldn't process your question. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing question UI
  const handleCloseQuestion = () => {
    setIsAskingQuestion(false);
    setUserQuestion("");
    setAiResponse("");
  };

  // Navigation controls
  const handlePlay = () => {
    setIsPlaying(true);

    // Add animation to indicate playback
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(
        ".animated-element",
      );
      elements.forEach((elem) => {
        elem.classList.add("playing");
      });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);

    // Remove animation when paused
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(
        ".animated-element",
      );
      elements.forEach((elem) => {
        elem.classList.remove("playing");
      });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Get current step content
  const currentStep = lesson?.steps[currentStepIndex];

  // Loading state
  if (isLoading && !lesson) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500">
        </div>
      </div>
    );
  }

  // No lesson data
  if (!lesson) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <p className="text-gray-600">No lesson data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Main content area */}
      <div
        ref={containerRef}
        className="relative bg-gray-50 overflow-hidden"
        style={{ height: isAskingQuestion ? "70vh" : "60vh" }}
      >
        {/* Current step content */}
        <div className="p-6 h-full overflow-auto">
          {currentStep && (
            <div className="step-content">
              <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />

              {/* Chart canvases */}
              {currentStep.charts?.map((chart) => (
                <div key={chart.id} className="my-4">
                  <canvas id={chart.id} width="400" height="200"></canvas>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question interface overlay */}
        {isAskingQuestion && (
          <div className="absolute inset-0 bg-white bg-opacity-95 p-6 overflow-auto">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Your Question</h3>
              <p className="bg-gray-100 p-3 rounded">{userQuestion}</p>
            </div>

            {aiResponse
              ? (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Answer</h3>
                  <div
                    className="bg-blue-50 p-4 rounded border border-blue-100"
                    dangerouslySetInnerHTML={{ __html: aiResponse }}
                  />
                </div>
              )
              : (
                <div className="flex justify-center my-8">
                  <div className="animate-pulse text-gray-500">
                    Generating answer...
                  </div>
                </div>
              )}

            <button
              className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              onClick={handleCloseQuestion}
            >
              Back to Lesson
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          {/* Playback controls */}
          <div className="flex items-center space-x-4">
            <button
              className="focus:outline-none"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>

            {isPlaying
              ? (
                <button className="focus:outline-none" onClick={handlePause}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                </button>
              )
              : (
                <button className="focus:outline-none" onClick={handlePlay}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              )}

            <button
              className="focus:outline-none"
              onClick={handleNext}
              disabled={!lesson || currentStepIndex === lesson.steps.length - 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>

            {/* Progress indicator */}
            <div className="text-sm ml-4">
              Step {currentStepIndex + 1} of {lesson.steps.length}
            </div>
          </div>

          {/* Ask question button */}
          {!isAskingQuestion && (
            <div className="flex items-center">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) =>
                  setUserQuestion((e.target as HTMLInputElement).value)}
                placeholder="Ask a question about this step..."
                className="bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim()}
              >
                Ask
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add this to global.d.ts
declare global {
  interface Window {
    katex: any;
    Chart: any;
  }
}
