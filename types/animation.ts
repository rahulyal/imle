// types/animation.ts
export interface AnimationTarget {
  target: string; // CSS selector or DOM element
  properties: Record<string, any>; // Animation properties (opacity, translateY, etc.)
  duration?: number; // Duration in milliseconds
  delay?: number; // Delay in milliseconds
  easing?: string; // Easing function
  begin?: () => void; // Callback when animation begins
  complete?: () => void; // Callback when animation completes
}

export interface AnimationSequence {
  id: string;
  targets: AnimationTarget[]; // Array of animation targets
  duration: number; // Total duration of this sequence
  startTime: number; // When to start this sequence relative to step start
}

// Import the Step interface
import { Chart, Step } from "./step.ts";

// Since Step now uses AnimationSequence already, EnhancedStep can just be a type alias
export type EnhancedStep = Step;
