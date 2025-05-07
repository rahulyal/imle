// types/lesson.ts
import { Step } from "./step.ts";
export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}
