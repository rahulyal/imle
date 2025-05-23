// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_ask from "./routes/api/ask.ts";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_lessons_id_ from "./routes/api/lessons/[id].ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $Counter from "./islands/Counter.tsx";
import * as $EnhancedLessonPlayer from "./islands/EnhancedLessonPlayer.tsx";
import * as $LessonPlayer from "./islands/LessonPlayer.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/ask.ts": $api_ask,
    "./routes/api/joke.ts": $api_joke,
    "./routes/api/lessons/[id].ts": $api_lessons_id_,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/Counter.tsx": $Counter,
    "./islands/EnhancedLessonPlayer.tsx": $EnhancedLessonPlayer,
    "./islands/LessonPlayer.tsx": $LessonPlayer,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
