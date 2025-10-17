import { useRef, useEffect, RefObject } from 'react';

export interface TiltOptions {
  max?: number; // Max tilt rotation (degrees)
  perspective?: number; // Transform perspective value
  scale?: number; // Scale on hover
  speed?: number; // Speed of enter/exit transition
  easing?: string; // Easing of enter/exit transition
  glare?: boolean; // Enable glare effect
  maxGlare?: number; // Max glare opacity
}

const defaultOptions: Required<TiltOptions> = {
  max: 15,
  perspective: 1000,
  scale: 1.05,
  speed: 400,
  easing: 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
  glare: true,
  maxGlare: 0.3,
};

export function useTilt<T extends HTMLElement>(
  options: TiltOptions = {}
): RefObject<T> {
  const ref = useRef<T>(null);
  const opts = { ...defaultOptions, ...options };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isHovering = false;

    const handleMouseEnter = () => {
      isHovering = true;
      element.style.transition = `transform ${opts.speed}ms ${opts.easing}`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = ((-mouseY / (rect.height / 2)) * opts.max).toFixed(2);
      const rotateY = ((mouseX / (rect.width / 2)) * opts.max).toFixed(2);

      element.style.transform = `
        perspective(${opts.perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${opts.scale}, ${opts.scale}, ${opts.scale})
      `;

      // Glare effect
      if (opts.glare) {
        const glareElement = element.querySelector(
          '.tilt-glare'
        ) as HTMLElement;
        if (glareElement) {
          const percentageX = (mouseX / (rect.width / 2)) * 50 + 50;
          const percentageY = (mouseY / (rect.height / 2)) * 50 + 50;
          
          glareElement.style.background = `
            radial-gradient(
              circle at ${percentageX}% ${percentageY}%,
              rgba(255, 255, 255, ${opts.maxGlare}) 0%,
              transparent 60%
            )
          `;
        }
      }
    };

    const handleMouseLeave = () => {
      isHovering = false;
      element.style.transition = `transform ${opts.speed}ms ${opts.easing}`;
      element.style.transform = `
        perspective(${opts.perspective}px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;

      // Reset glare
      if (opts.glare) {
        const glareElement = element.querySelector(
          '.tilt-glare'
        ) as HTMLElement;
        if (glareElement) {
          glareElement.style.background = 'transparent';
        }
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Set initial styles
    element.style.transformStyle = 'preserve-3d';

    // Add glare element if enabled
    if (opts.glare) {
      const glareElement = document.createElement('div');
      glareElement.className = 'tilt-glare';
      glareElement.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        transition: background ${opts.speed}ms ${opts.easing};
        z-index: 1;
      `;
      element.style.position = 'relative';
      element.appendChild(glareElement);
    }

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);

      // Remove glare element
      if (opts.glare) {
        const glareElement = element.querySelector('.tilt-glare');
        if (glareElement) {
          element.removeChild(glareElement);
        }
      }
    };
  }, [opts]);

  return ref;
}
