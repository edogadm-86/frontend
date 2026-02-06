import { useEffect, useState } from "react";

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const touch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    setIsTouch(touch);
  }, []);

  return isTouch;
}


export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}
