// src/App.jsx
import React, { useState } from "react";
import Experience from "./Experience";
import LoadingScreen from "./components/LoadingScreen";
import { SelectionProvider } from './components/SelectionContext'
export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      {/* Always mount Experience so textures/models begin loading */}
      <SelectionProvider>
        <Experience />
      </SelectionProvider>
      {/* Overlay blocks interaction until visitor clicks Ready? */}
      <LoadingScreen entered={entered} onEnter={() => setEntered(true)} />
      {/* When user clicks Ready we simply stop rendering the overlay.
          (Experience remains mounted the whole time.) */}
    </>
  );
}

