// src/components/CollectibleContext.jsx
import { createContext, useCallback, useContext, useState } from "react";

const CollectibleContext = createContext();

export function CollectibleProvider({ total, children }) {
  const [collected, setCollected] = useState(() => new Set());

  const collect = useCallback((id) => {
    setCollected((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const isCollected = useCallback((id) => collected.has(id), [collected]);

  return (
    <CollectibleContext.Provider
      value={{ collectedCount: collected.size, total, collect, isCollected }}
    >
      {children}
    </CollectibleContext.Provider>
  );
}

export function useCollectibles() {
  const ctx = useContext(CollectibleContext);
  if (!ctx) {
    throw new Error("useCollectibles must be used within CollectibleProvider");
  }
  return ctx;
}
