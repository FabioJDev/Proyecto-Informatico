import { useEffect, useRef } from 'react';

/**
 * Adds the 'is-visible' class to an element when it enters the viewport,
 * which triggers the .animate-in / fadeUp CSS animation.
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <div ref={ref} className="animate-in">...</div>
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
