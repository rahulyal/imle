export interface Step {
  id: string;
  title: string;
  content: string;
  duration: number;
  charts?: Chart[];
  animations?: Animation[]; // New animation sequence property
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
  options?: any;
}
