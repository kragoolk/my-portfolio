// src/App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Hub from "./features/hub/Hub";

// Lazy-loaded: keeps the heavy three.js/r3f/drei bundle, and the
// react-markdown/highlight.js bundle, off the hub's initial load. Only
// fetched when a visitor actually opens /gallery or a write-up.
const Gallery = lazy(() => import("./features/gallery/Gallery"));
const Desktop = lazy(() => import("./features/desktop/Desktop"));
const WriteupsIndex = lazy(() => import("./features/writeups/WriteupsIndex"));
const WriteupPage = lazy(() => import("./features/writeups/WriteupPage"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route
        path="/gallery"
        element={
          <Suspense fallback={null}>
            <Gallery />
          </Suspense>
        }
      />
      <Route
        path="/desktop"
        element={
          <Suspense fallback={null}>
            <Desktop />
          </Suspense>
        }
      />
      <Route
        path="/writeups"
        element={
          <Suspense fallback={null}>
            <WriteupsIndex />
          </Suspense>
        }
      />
      <Route
        path="/writeups/:slug"
        element={
          <Suspense fallback={null}>
            <WriteupPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
