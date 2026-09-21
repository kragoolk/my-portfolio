import { useEffect, useState } from "react";

// Tracks which of the given section ids is currently most visible, so a
// status bar can highlight the matching "workspace" pill as you scroll.
export default function useActiveSection(ids, options = { rootMargin: "-45% 0px -50% 0px" }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    // None of the tracked sections exist on this page (e.g. /writeups) —
    // leave nothing highlighted rather than defaulting to the first id.
    if (!elements.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, options);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  return active;
}
