// Example lesson data for the interactive learning environment
// routes/api/lessons/[id].ts

import { Lesson } from "../../../types/lesson.ts";

// Sample lessons database
const lessons: Record<string, Lesson> = {
  "intro-calculus": {
    id: "intro-calculus",
    title: "Introduction to Calculus: Limits and Derivatives",
    description:
      "Learn the fundamental concepts of calculus, including limits and basic derivatives.",
    steps: [
      {
        id: "step-1",
        title: "What is Calculus?",
        content: `
          <p>Calculus is the mathematical study of continuous change. It has two major branches:</p>
          <ul>
            <li><strong>Differential calculus</strong> - concerned with rates of change and slopes of curves</li>
            <li><strong>Integral calculus</strong> - concerned with accumulation and areas under curves</li>
          </ul>
          <p>Today, we'll focus on the foundations of differential calculus.</p>
        `,
        duration: 8000,
      },
      {
        id: "step-2",
        title: "Understanding Limits",
        content: `
          <p>The concept of a limit is the fundamental building block of calculus.</p>
          <p>When we write:</p>
          <div class="math display-math">\\lim_{x \\to a} f(x) = L</div>
          <p>We mean that as x approaches the value a, the function f(x) approaches the value L.</p>
          <p>For example, consider:</p>
          <div class="math display-math">\\lim_{x \\to 2} x^2 = 4</div>
          <p>This means that as x gets closer and closer to 2, the value of x² gets closer and closer to 4.</p>
        `,
        duration: 15000,
      },
      {
        id: "step-3",
        title: "Limit Example: Special Cases",
        content: `
          <p>Sometimes, direct substitution doesn't work when evaluating limits.</p>
          <p>Consider the function:</p>
          <div class="math display-math">f(x) = \\frac{x^2 - 4}{x - 2}</div>
          <p>If we try to evaluate the limit as x approaches 2 by direct substitution, we get:</p>
          <div class="math display-math">\\frac{2^2 - 4}{2 - 2} = \\frac{0}{0}</div>
          <p>This is an indeterminate form. We need to simplify the function first:</p>
          <div class="math display-math">
            f(x) = \\frac{x^2 - 4}{x - 2} = \\frac{(x-2)(x+2)}{x-2} = x+2 \\quad \\text{for } x \\neq 2
          </div>
          <p>Now we can evaluate the limit:</p>
          <div class="math display-math">\\lim_{x \\to 2} f(x) = \\lim_{x \\to 2} (x+2) = 2+2 = 4</div>
        `,
        duration: 20000,
        charts: [
          {
            id: "limit-chart",
            type: "line",
            data: {
              labels: [
                "1.7",
                "1.8",
                "1.9",
                "1.95",
                "1.99",
                "2.01",
                "2.05",
                "2.1",
                "2.2",
                "2.3",
              ],
              datasets: [{
                label: "f(x) = (x² - 4)/(x - 2)",
                data: [3.7, 3.8, 3.9, 3.95, 3.99, 4.01, 4.05, 4.1, 4.2, 4.3],
                borderColor: "rgb(75, 192, 192)",
                borderWidth: 2,
                //                pointRadius: 3,
              }],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: false,
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Values of f(x) as x approaches 2",
                },
              },
            },
          },
        ],
      },
      {
        id: "step-4",
        title: "Introduction to Derivatives",
        content: `
          <p>A derivative represents the rate of change of a function at a particular point.</p>
          <p>The derivative of a function f(x) is denoted as f'(x) or as:</p>
          <div class="math display-math">\\frac{d}{dx}f(x)</div>
          <p>The formal definition of a derivative is:</p>
          <div class="math display-math">f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}</div>
          <p>Geometrically, the derivative at a point represents the slope of the tangent line to the function at that point.</p>
        `,
        duration: 15000,
      },
      {
        id: "step-5",
        title: "Basic Derivative Rules",
        content: `
          <p>Here are some fundamental derivative rules:</p>
          <ul>
            <li>
              Constant Rule:
              <div class="math">\\frac{d}{dx}[c] = 0</div>
              where c is a constant
            </li>
            <li>
              Power Rule:
              <div class="math">\\frac{d}{dx}[x^n] = nx^{n-1}</div>
            </li>
            <li>
              Sum Rule:
              <div class="math">\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)</div>
            </li>
            <li>
              Product Rule:
              <div class="math">\\frac{d}{dx}[f(x) \\cdot g(x)] = f'(x) \\cdot g(x) + f(x) \\cdot g'(x)</div>
            </li>
          </ul>
          <p>Let's see how these rules are applied in practice.</p>
        `,
        duration: 20000,
      },
      {
        id: "step-6",
        title: "Derivative Example",
        content: `
          <p>Let's find the derivative of f(x) = 3x² + 2x - 5</p>
          <p>Step 1: Apply the sum rule to break down the function.</p>
          <div class="math display-math">
            \\frac{d}{dx}[3x^2 + 2x - 5] = \\frac{d}{dx}[3x^2] + \\frac{d}{dx}[2x] + \\frac{d}{dx}[-5]
          </div>
          <p>Step 2: Apply the power rule and constant rule.</p>
          <div class="math display-math">
            \\frac{d}{dx}[3x^2] + \\frac{d}{dx}[2x] + \\frac{d}{dx}[-5] = 3 \\cdot 2x^{2-1} + 2 \\cdot 1x^{1-1} + 0
          </div>
          <p>Step 3: Simplify.</p>
          <div class="math display-math">
            3 \\cdot 2x^1 + 2 \\cdot 1 + 0 = 6x + 2
          </div>
          <p>Therefore, f'(x) = 6x + 2</p>
        `,
        duration: 18000,
        charts: [
          {
            id: "derivative-chart",
            type: "line",
            data: {
              labels: ["-3", "-2", "-1", "0", "1", "2", "3"],
              datasets: [
                {
                  label: "f(x) = 3x² + 2x - 5",
                  data: [22, 7, -2, -5, -2, 7, 22],
                  borderColor: "rgb(75, 192, 192)",
                  borderWidth: 2,
                },
                {
                  label: "f'(x) = 6x + 2",
                  data: [-16, -10, -4, 2, 8, 14, 20],
                  borderColor: "rgb(255, 99, 132)",
                  borderWidth: 2,
                },
              ],
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Function and its Derivative",
                },
              },
            },
          },
        ],
      },
      {
        id: "step-7",
        title: "Applications of Derivatives",
        content: `
          <p>Derivatives have numerous real-world applications:</p>
          <ul>
            <li><strong>Physics:</strong> Velocity (first derivative of position) and acceleration (second derivative of position)</li>
            <li><strong>Economics:</strong> Marginal cost, revenue, and profit</li>
            <li><strong>Engineering:</strong> Optimization problems and rate of change analysis</li>
            <li><strong>Biology:</strong> Population growth rates</li>
          </ul>
          <p>For example, if p(t) represents the position of an object at time t, then:</p>
          <div class="math display-math">v(t) = p'(t) \\quad \\text{(velocity)}</div>
          <div class="math display-math">a(t) = v'(t) = p''(t) \\quad \\text{(acceleration)}</div>
        `,
        duration: 15000,
      },
      {
        id: "step-8",
        title: "Summary and Next Steps",
        content: `
          <p>In this lesson, we covered:</p>
          <ul>
            <li>The concept of limits and how to evaluate them</li>
            <li>The definition of derivatives as rates of change</li>
            <li>Basic derivative rules (constant, power, sum, product)</li>
            <li>A practical example of finding a derivative</li>
            <li>Real-world applications of derivatives</li>
          </ul>
          <p>In our next lesson, we'll explore more advanced derivative techniques including the chain rule, implicit differentiation, and higher-order derivatives.</p>
        `,
        duration: 10000,
      },
    ],
  },
};

// Handler for lesson requests
export const handler = async (req: Request, ctx: any) => {
  const { id } = ctx.params;
  const lesson = lessons[id];

  if (!lesson) {
    return new Response(JSON.stringify({ error: "Lesson not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(lesson), {
    headers: { "Content-Type": "application/json" },
  });
};

export default handler;
