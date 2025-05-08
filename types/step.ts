import { AnimationSequence as Animation } from "./animation.ts";

export interface Step {
  id: string;
  title: string;
  content: string;
  duration: number;
  charts?: Chart[];
  animations?: Animation[];
  [key: string]: unknown; // Add index signature to allow any string key
}

export interface Chart {
  id: string;
  type: "line" | "bar" | "pie" | "scatter" | "radar" | "doughnut";
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: Record<string, unknown>;
}
