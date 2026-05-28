import { useState, useEffect, useRef } from 'react';

/**
 * Hook that animates a number from 0 (or previous value) to the target
 * @param {number} target - Target number to count up to
 * @param {number} duration - Animation duration in ms (default 1200)
 * @returns {number} - Current animated value
 */
export function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const startValue = prevTarget.current;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (target - startValue) * eased);

      setCount(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return count;
}
