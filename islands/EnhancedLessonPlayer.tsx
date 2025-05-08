// islands/EnhancedLessonPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { EnhancedStep } from "../types/animation.ts";
import { useGSAPAnimation } from "../hooks/useGSAPAnimation.ts";
import { Lesson } from "../types/lesson.ts";
import { renderToString } from "katex";

// Extend the Lesson interface to use EnhancedStep
interface EnhancedLesson extends Lesson {
  steps: EnhancedStep[];
}

interface ChartInstance {
  destroy: () => void;
}

interface ChartContext {
  dataIndex: number;
}

interface GlobalChartType {
  Chart: new (
    ctx: CanvasRenderingContext2D,
    config: unknown,
  ) => ChartInstance;
}

// Add a helper to check if Chart.js is loaded
const isChartJsLoaded = () => {
  return typeof globalThis !== "undefined" && "Chart" in globalThis;
};

export default function EnhancedLessonPlayer({
  initialLesson,
  lessonId,
}: {
  initialLesson?: EnhancedLesson;
  lessonId?: string;
}) {
  // State
  const [lesson, setLesson] = useState<EnhancedLesson | null>(
    initialLesson || null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Add Manim-style dark mode state
  const [manimDarkMode, setManimDarkMode] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<Map<string, ChartInstance>>(new Map());
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const chartJsLoadedRef = useRef(false);

  // Current step
  const currentStep = lesson?.steps[currentStepIndex];

  // Load lesson data if not provided
  useEffect(() => {
    if (!lesson && lessonId) {
      fetchLesson(lessonId);
    }
  }, [lessonId]);

  // Use our GSAP animation hook
  const { seek, restart } = useGSAPAnimation({
    isPlaying,
    currentStep,
    containerRef,
    onComplete: () => {
      if (currentStepIndex < (lesson?.steps.length || 0) - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    },
  });

  // Timer for tracking progress and auto-advancing steps when playing
  useEffect(() => {
    // Clear any existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying && currentStep) {
      // Start interval to update progress
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 100;
          // Update animation progress
          seek(newTime);
          return newTime;
        });
      }, 100) as unknown as number;

      // Set timeout for auto-advancing to next step
      timeoutRef.current = setTimeout(() => {
        if (currentStepIndex < (lesson?.steps.length || 0) - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
          setTimeElapsed(0);
        } else {
          setIsPlaying(false);
        }
      }, currentStep.duration) as unknown as number;
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentStepIndex, lesson, seek]);

  // Process math expressions and render charts when step changes
  useEffect(() => {
    if (!lesson || !containerRef.current) return;

    // Clear previous animations to prevent interference
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Clean up old charts before updating DOM
    chartRefs.current.forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    chartRefs.current.clear();

    // Reset animation progress
    setTimeElapsed(0);

    // First render the content without animation
    if (containerRef.current) {
      // Process math expressions with KaTeX
      const mathElements = containerRef.current.querySelectorAll(".math");
      mathElements.forEach((elem) => {
        try {
          const mathContent = elem.textContent || "";
          const isDisplayMode = elem.classList.contains("display-math");
          const renderedMath = renderToString(mathContent, {
            throwOnError: false,
            displayMode: isDisplayMode,
            output: "html",
          });
          // Update the element with rendered math
          elem.innerHTML = renderedMath;
        } catch (e) {
          console.error("Math rendering error:", e);
        }
      });
    }

    // Function to create charts once Chart.js is loaded
    const createCharts = () => {
      if (!containerRef.current || !currentStep?.charts || !isChartJsLoaded()) {
        return;
      }

      currentStep.charts.forEach((chart) => {
        const canvas = containerRef.current?.querySelector(
          `#${chart.id}`,
        ) as HTMLCanvasElement;
        if (!canvas) return;

        // First clear any existing chart instance using this canvas
        chartRefs.current.forEach((oldChart, id) => {
          if (id === chart.id && oldChart?.destroy) {
            oldChart.destroy();
            chartRefs.current.delete(id);
          }
        });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        try {
          const chartObj = new globalThis.Chart(ctx, {
            type: chart.type,
            data: chart.data,
            options: {
              ...chart.options,
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 1500,
                easing: "easeOutQuart",
                delay: (context: ChartContext) => context.dataIndex * 150,
              },
              elements: {
                point: {
                  radius: 4,
                  hoverRadius: 6,
                  borderWidth: 2,
                },
                line: {
                  tension: 0.4,
                  borderWidth: 3,
                  fill: false,
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
                tooltip: {
                  enabled: true,
                },
              },
            },
          });
          chartRefs.current.set(chart.id, chartObj);
        } catch (e) {
          console.error("Error creating chart:", e);
        }
      });
    };

    // Check if Chart.js is already loaded
    if (isChartJsLoaded()) {
      createCharts();
      chartJsLoadedRef.current = true;
    } else {
      // Wait for Chart.js to load
      const checkChartJs = setInterval(() => {
        if (isChartJsLoaded()) {
          clearInterval(checkChartJs);
          createCharts();
          chartJsLoadedRef.current = true;
        }
      }, 100);

      // Clean up interval
      return () => clearInterval(checkChartJs);
    }

    // If we're playing, trigger GSAP animation AFTER content is fully rendered
    if (isPlaying) {
      restart();
    }
  }, [currentStepIndex, lesson]);

  // Fetch lesson data
  const fetchLesson = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${id}`);
      if (!response.ok) throw new Error("Failed to fetch lesson");
      const data = await response.json();
      setLesson(data as EnhancedLesson);
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
    setIsPlaying(false); // Pause playback while asking a question

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
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setTimeElapsed(0);
    }
  };

  const handleNext = () => {
    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setTimeElapsed(0);
    }
  };

  // Calculate progress percentage for the current step
  const progressPercentage = currentStep
    ? Math.min(100, (timeElapsed / currentStep.duration) * 100)
    : 0;

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
        <div className="p-6 h-full overflow-auto custom-scrollbar">
          {currentStep && (
            <div
              className={`step-content ${
                manimDarkMode ? "manim-dark-mode" : ""
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
              <div
                className="math-content"
                ref={(el) => {
                  if (el) {
                    // Use a DocumentFragment for better performance
                    const fragment = document.createDocumentFragment();
                    const temp = document.createElement("div");
                    temp.innerHTML = currentStep.content;
                    while (temp.firstChild) {
                      fragment.appendChild(temp.firstChild);
                    }
                    el.innerHTML = "";
                    el.appendChild(fragment);
                  }
                }}
              />

              {/* Chart canvases */}
              {currentStep.charts?.map((chart) => (
                <div
                  key={chart.id}
                  className="my-4 chart-container"
                  ref={(el) => {
                    if (el) {
                      // Add visible class after a brief delay for smooth animation
                      requestAnimationFrame(() => {
                        el.classList.add("visible");
                      });
                    }
                  }}
                >
                  <canvas id={chart.id} width="400" height="200"></canvas>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar with improved styling */}
        <div
          className="timeline-indicator"
          style={{ width: `${progressPercentage}%` }}
        />

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
                    ref={(el) => {
                      if (el) el.innerHTML = aiResponse;
                    }}
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
              type="button"
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
              type="button"
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
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={handlePause}
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
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                </button>
              )
              : (
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={handlePlay}
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
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              )}

            <button
              type="button"
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

            {/* Manim dark mode toggle */}
            <button
              type="button"
              className={`ml-4 px-2 py-1 text-xs rounded transition ${
                manimDarkMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
              onClick={() => setManimDarkMode(!manimDarkMode)}
              title="Toggle Manim-style dark mode"
            >
              Manim Mode
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
                type="button"
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
    katex: {
      render: (
        content: string,
        element: HTMLElement,
        options: { throwOnError: boolean; displayMode: boolean },
      ) => void;
    };
  }

  var Chart: {
    new (ctx: CanvasRenderingContext2D, config: unknown): ChartInstance;
  };
}
