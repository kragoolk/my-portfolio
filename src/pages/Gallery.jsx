import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Experience from "../Experience";
import LoadingScreen from "../components/LoadingScreen";
import { SelectionProvider } from "../components/SelectionContext";
import { CollectibleProvider } from "../components/CollectibleContext";

export default function Gallery() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    document.body.classList.add("gallery-mode");
    return () => document.body.classList.remove("gallery-mode");
  }, []);

  return (
    <>
      <SelectionProvider>
        <CollectibleProvider total={6}>
          <Experience />
        </CollectibleProvider>
      </SelectionProvider>
      <LoadingScreen entered={entered} onEnter={() => setEntered(true)} />
      {entered && (
        <Link
          to="/"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 50,
            padding: "8px 16px",
            borderRadius: 0,
            background: "rgba(10, 10, 10, 0.75)",
            color: "#f2f1ec",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: "0.85rem",
            fontWeight: 600,
            border: "1px solid rgba(255, 180, 84, 0.5)",
            backdropFilter: "blur(6px)",
          }}
        >
          ← Back to portfolio
        </Link>
      )}
    </>
  );
}
