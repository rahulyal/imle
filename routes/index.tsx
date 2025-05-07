// routes/index.tsx
import { Head } from "$fresh/runtime.ts";
import LessonPlayer from "../islands/LessonPlayer.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Interactive Math Learning Environment</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
        />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js">
        </script>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-center mb-2">
            Math Learning Environment
          </h1>
          <p class="text-center text-gray-600">
            Interactive learning with AI assistance and dynamic visualizations
          </p>
        </header>

        <div class="mb-8">
          <LessonPlayer lessonId="intro-calculus" />
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-bold mb-4">How This Works</h2>
          <p class="mb-4">
            This interactive learning environment uses CSS animations, KaTeX for
            mathematical rendering, and Chart.js for data visualization to
            create a video-like experience without using actual video files.
          </p>

          <h3 class="text-xl font-semibold mb-2">Key Features:</h3>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Interactive Playback:</strong>{" "}
              Play, pause, and navigate through lessons like a video
            </li>
            <li>
              <strong>Mathematical Animations:</strong>{" "}
              Dynamically rendered equations using KaTeX
            </li>
            <li>
              <strong>Data Visualizations:</strong>{" "}
              Interactive charts using Chart.js
            </li>
            <li>
              <strong>AI Assistant:</strong>{" "}
              Ask questions about any point in the lesson
            </li>
            <li>
              <strong>Responsive Design:</strong> Works well on any device
            </li>
          </ul>

          <h3 class="text-xl font-semibold mb-2">Technical Overview:</h3>
          <p>
            Instead of streaming video, this system sequences CSS transitions
            and animations to create a fluid, engaging learning experience with
            much lower bandwidth requirements. All mathematical content is
            rendered using KaTeX, which produces beautiful, typeset equations
            directly in the browser.
          </p>
        </div>

        <footer class="text-center text-gray-500 text-sm">
          Built with Deno Fresh, TypeScript, Tailwind CSS, KaTeX, and Chart.js
        </footer>
      </div>
    </>
  );
}
