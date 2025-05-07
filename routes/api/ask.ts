// routes/api/ask.ts
// AI Question Answering API for the interactive learning environment

// This represents our API handler for answering student questions about the lesson
export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await req.json();
    const { lessonId, stepIndex, question, context } = data;

    // Validate required fields
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // In a real implementation, this would call the Anthropic API
    // with function calling to generate specialized math content
    const answer = await generateAIResponse(
      lessonId,
      stepIndex,
      question,
      context,
    );

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing question:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process question" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

/**
 * Generate AI response using Anthropic API
 * This would interface with Anthropic's function calling capabilities
 * to create dynamic KaTeX and Chart.js content
 */
async function generateAIResponse(
  lessonId: string,
  stepIndex: number,
  question: string,
  context: string,
): Promise<string> {
  // This is a simplified mock implementation
  // In production, you would call Anthropic's API with function calling

  // Mock function calling implementation for demo purposes
  const functions = {
    // Generate KaTeX mathematical expressions
    renderMath: (latex: string, displayMode: boolean = false) => {
      const className = displayMode ? "math display-math" : "math";
      return `<div class="${className}">${latex}</div>`;
    },

    // Generate Chart.js chart
    createChart: (chartData: any) => {
      const chartId = `dynamic-chart-${
        Math.random().toString(36).substring(2, 9)
      }`;

      // We'd return a placeholder that would be processed client-side
      return `
        <div class="chart-container my-4">
          <canvas id="${chartId}" width="400" height="200"></canvas>
          <script>
            // This script would execute on the client
            document.addEventListener('DOMContentLoaded', () => {
              const ctx = document.getElementById('${chartId}').getContext('2d');
              new Chart(ctx, ${JSON.stringify(chartData)});
            });
          </script>
        </div>
      `;
    },
  };

  // For the demo, we'll mock some example responses based on the question
  if (question.toLowerCase().includes("limit")) {
    return `
      <p>Great question about limits! The key intuition behind limits is thinking about what value a function approaches as its input gets closer and closer to a specific point.</p>

      <p>Let's look at a slightly different example to build intuition:</p>

      ${functions.renderMath("\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}", true)}

      <p>If we try direct substitution by plugging in x = 3, we get:</p>

      ${functions.renderMath("\\frac{3^2 - 9}{3 - 3} = \\frac{0}{0}", true)}

      <p>This is an indeterminate form. But we can factor the numerator:</p>

      ${
      functions.renderMath(
        "\\frac{x^2 - 9}{x - 3} = \\frac{(x-3)(x+3)}{x-3} = x+3 \\quad \\text{for } x \\neq 3",
        true,
      )
    }

      <p>Now we can find the limit:</p>

      ${
      functions.renderMath(
        "\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = \\lim_{x \\to 3} (x+3) = 3+3 = 6",
        true,
      )
    }

      <p>This is a common technique for handling indeterminate forms in limits. When you see a situation where both the numerator and denominator approach zero, try factoring to see if you can cancel terms.</p>

      ${
      functions.createChart({
        type: "line",
        data: {
          labels: [
            "2.7",
            "2.8",
            "2.9",
            "2.95",
            "2.99",
            "3.01",
            "3.05",
            "3.1",
            "3.2",
            "3.3",
          ],
          datasets: [{
            label: "f(x) = (x² - 9)/(x - 3)",
            data: [5.7, 5.8, 5.9, 5.95, 5.99, 6.01, 6.05, 6.1, 6.2, 6.3],
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 2,
            pointRadius: 3,
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
              text: "Values of f(x) as x approaches 3",
            },
          },
        },
      })
    }

      <p>In the graph above, you can see that even though the function is undefined exactly at x = 3, the values approach 6 as x gets closer and closer to 3 from either direction.</p>
    `;
  } else if (question.toLowerCase().includes("derivative")) {
    return `
      <p>Let me clarify how derivatives work and provide a slightly different example.</p>

      <p>The derivative represents the rate of change or slope of a function at any given point. Here's how we can find the derivative of a different function:</p>

      <p>Let's find the derivative of f(x) = x³ - 4x² + 7</p>

      <p>Step 1: Apply the sum rule to separate the terms.</p>
      ${
      functions.renderMath(
        "\\frac{d}{dx}[x^3 - 4x^2 + 7] = \\frac{d}{dx}[x^3] - \\frac{d}{dx}[4x^2] + \\frac{d}{dx}[7]",
        true,
      )
    }

      <p>Step 2: Apply the power rule to each term.</p>
      ${
      functions.renderMath(
        "\\frac{d}{dx}[x^3] - \\frac{d}{dx}[4x^2] + \\frac{d}{dx}[7] = 3x^2 - 4 \\cdot 2x^1 + 0",
        true,
      )
    }

      <p>Step 3: Simplify to get the final answer.</p>
      ${functions.renderMath("f'(x) = 3x^2 - 8x", true)}

      <p>This derivative tells us the slope of the original function at any point. For example:</p>

      <ul>
        <li>At x = 0, the slope is f'(0) = 0</li>
        <li>At x = 1, the slope is f'(1) = 3 - 8 = -5</li>
        <li>At x = 2, the slope is f'(2) = 12 - 16 = -4</li>
      </ul>

      ${
      functions.createChart({
        type: "line",
        data: {
          labels: ["-2", "-1", "0", "1", "2", "3", "4"],
          datasets: [
            {
              label: "f(x) = x³ - 4x² + 7",
              data: [15, 10, 7, 4, 3, 10, 39],
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 2,
            },
            {
              label: "f'(x) = 3x² - 8x",
              data: [20, 11, 0, -5, -4, 3, 16],
              borderColor: "rgb(255, 99, 132)",
              borderWidth: 2,
            },
          ],
        },
      })
    }

      <p>Notice in the graph how the derivative (the red line) crosses the x-axis at points where the original function (blue) has a horizontal tangent (slope = 0).</p>
    `;
  } else {
    return `
      <p>Thank you for your question! Let me explain a bit more about calculus fundamentals.</p>

      <p>Calculus is built on two key concepts:</p>

      <ol>
        <li><strong>The derivative</strong> - which measures instantaneous rate of change</li>
        <li><strong>The integral</strong> - which measures accumulated total change</li>
      </ol>

      <p>These two operations are actually inverse operations of each other, as described by the Fundamental Theorem of Calculus:</p>

      ${functions.renderMath("\\int_{a}^{b} f'(x) \\, dx = f(b) - f(a)", true)}

      <p>This means if you have a function's derivative, you can find the net change in the original function over an interval by integrating the derivative.</p>

      <p>A helpful way to visualize this relationship is to think about:</p>
      <ul>
        <li>If position is given by s(t), then velocity is v(t) = s'(t)</li>
        <li>And acceleration is a(t) = v'(t) = s''(t)</li>
      </ul>

      <p>Going the other direction:</p>
      <ul>
        <li>If you know acceleration a(t), you can find velocity: v(t) = ∫a(t)dt</li>
        <li>And if you know velocity v(t), you can find position: s(t) = ∫v(t)dt</li>
      </ul>

      <p>Would you like me to explain any specific aspect of this relationship in more detail?</p>
    `;
  }
}

export default handler;
