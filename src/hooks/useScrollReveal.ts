import { useEffect, useRef, useState } from 'react';

const defaultOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.1,
};

/**
 * Returns a ref and whether the element is in view.
 * Use to trigger animations when section scrolls into view.
 */
export function useScrollReveal(options: Partial<IntersectionObserverInit> = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { ...defaultOptions, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return { ref, inView };
}
