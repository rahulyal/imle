// hooks/useGSAPAnimation.ts
import { useEffect, useRef } from "preact/hooks";
import gsap from "gsap";

interface UseGSAPAnimationProps {
  isPlaying: boolean;
  currentStep:
    | {
      id: string;
      content: string;
      [key: string]: unknown;
    }
    | null
    | undefined;
  containerRef: { current: HTMLDivElement | null };
  onComplete?: () => void;
}

export function useGSAPAnimation({
  isPlaying,
  currentStep,
  containerRef,
  onComplete,
}: UseGSAPAnimationProps) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const initialized = useRef(false);

  const createManimScene = () => {
    if (!containerRef.current || !currentStep) return;

    // Kill existing timeline to prevent conflicts
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create a new timeline with safe defaults
    timelineRef.current = gsap.timeline({
      paused: true,
      onComplete,
      defaults: {
        ease: "power2.out",
        duration: 0.5,
      },
    });

    const container = containerRef.current;

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Cache all target elements before animation
      const elements = {
        title: container.querySelector("h2"),
        mathContent: Array.from(container.querySelectorAll(".math-content > *"))
          .filter((el) => el && el.isConnected),
        mathElems: Array.from(
          container.querySelectorAll(".katex-display, .katex, .math"),
        ).filter((el) => el && el.isConnected),
        charts: Array.from(container.querySelectorAll(".chart-container"))
          .filter((el) => el && el.isConnected),
        textContent: Array.from(
          container.querySelectorAll("p, li, h3, h4, h5, h6"),
        ).filter((el) => el && el.isConnected),
      };

      // Only proceed if we have valid elements to animate
      if (
        !Object.values(elements).some((arr) =>
          arr.length > 0 || arr instanceof Element
        )
      ) {
        return;
      }

      // Set initial states all at once for elements that exist
      gsap.set(
        [
          ...elements.mathContent,
          ...elements.mathElems,
          ...elements.charts,
        ].filter(Boolean),
        { opacity: 0, y: 20 },
      );

      try {
        // Title animation
        if (elements.title) {
          const text = elements.title.textContent || "";
          elements.title.innerHTML = text.split("").map((char) =>
            `<span class="title-char">${char}</span>`
          ).join("");

          const titleChars = elements.title.querySelectorAll(".title-char");
          if (titleChars.length) {
            timelineRef.current.from(titleChars, {
              opacity: 0,
              y: 20,
              duration: 0.03,
              stagger: 0.02,
              ease: "power1.out",
            });
          }
        }

        // Text content animation with improved batching
        if (elements.textContent.length) {
          timelineRef.current.fromTo(elements.textContent, {
            opacity: 0,
            y: 20,
          }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
          }, ">=0.2");
        }

        // Math expressions animation with batching
        if (elements.mathElems.length) {
          timelineRef.current.fromTo(elements.mathElems, {
            opacity: 0,
            y: 20,
            backgroundColor: "rgba(64, 124, 255, 0.15)",
          }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.3,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(elements.mathElems, {
                backgroundColor: "rgba(0, 0, 0, 0)",
                duration: 1.5,
                stagger: 0.2,
              });
            },
          }, ">=0.2");
        }

        // Chart animations with improved timing
        if (elements.charts.length) {
          timelineRef.current.to(elements.charts, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            stagger: 0.3,
            ease: "back.out(1.7)",
          }, ">=0.5");
        }
      } catch (e) {
        console.warn("Animation setup error:", e);
      }
    });
  };

  // Setup animations when step changes with debouncing
  useEffect(() => {
    if (!currentStep || !containerRef.current) return;

    let timeoutId: number;

    const setupAnimations = () => {
      initialized.current = false;
      createManimScene();

      if (isPlaying && timelineRef.current) {
        timelineRef.current.play(0);
        initialized.current = true;
      }
    };

    // Debounce the animation setup
    timeoutId = setTimeout(setupAnimations, 150);

    return () => {
      clearTimeout(timeoutId);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [currentStep]);

  // Control animations based on isPlaying with smoother transitions
  useEffect(() => {
    if (!timelineRef.current) return;

    if (isPlaying) {
      if (!initialized.current) {
        timelineRef.current.restart();
        initialized.current = true;
      } else {
        timelineRef.current.resume();
      }
    } else {
      timelineRef.current.pause();
    }
  }, [isPlaying]);

  return {
    seek: (time: number) => {
      if (timelineRef.current) {
        timelineRef.current.seek(time / 1000);
      }
    },
    restart: () => {
      if (timelineRef.current) {
        timelineRef.current.restart();
      }
    },
  };
}
