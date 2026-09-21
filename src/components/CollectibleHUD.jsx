// src/components/CollectibleHUD.jsx
import { useCollectibles } from "./CollectibleContext";

export default function CollectibleHUD() {
  const { collectedCount, total } = useCollectibles();
  const complete = collectedCount >= total;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        color: complete ? "#ffd45e" : "rgba(255,255,255,0.9)",
        fontFamily: "monospace",
        fontSize: "14px",
        fontWeight: "bold",
        letterSpacing: "0.5px",
        pointerEvents: "none",
        zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        padding: "6px 14px",
        borderRadius: "999px",
        backdropFilter: "blur(6px)",
        border: complete
          ? "1px solid rgba(255, 212, 94, 0.6)"
          : "1px solid rgba(255,255,255,0.15)",
        transition: "color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {complete ? "✦ All crystals found!" : `✦ Crystals: ${collectedCount} / ${total}`}
    </div>
  );
}
